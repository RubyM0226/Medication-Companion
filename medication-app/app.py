import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from supabase import create_client, Client
from datetime import timedelta
import re
import string

from supabase_auth.errors import AuthApiError

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

if not app.secret_key:
    raise ValueError("missing flask environment variable")


app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=(
        os.environ.get("SESSION_COOKIE_SECURE", "false").lower() == "true"
    ),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=12),
)

# importing the medication route blueprints
from backend.routes.medication_routes import medication_bp
from backend.routes.logs_routes import log_bp
from backend.routes.schedules_routes import schedule_bp

app.register_blueprint(medication_bp)
app.register_blueprint(log_bp)
app.register_blueprint(schedule_bp)


allowed_origins = {
    origin.strip()
    for origin in os.environ.get(
        "FRONTEND_ORIGINS",
        "http://localhost:8081,http://127.0.0.1:8081",
    ).split(",")
    if origin.strip()
}


@app.before_request
def check_origin():
    origin = request.headers.get("Origin")

    if (
        origin
        and origin not in allowed_origins
        and origin != request.host_url.rstrip("/")
        and request.method not in ("GET", "HEAD")
    ):
        return jsonify(error="Origin not allowed."), 403


@app.after_request
def add_response_headers(response):
    origin = request.headers.get("Origin")

    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        response.vary.add("Origin")

    response.headers["Cache-Control"] = "no-store"
    return response


def get_auth_client():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_KEY"],
    )


def read_credentials():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None, "Send your email and password as JSON."

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not email.strip():
        return None, "Enter your email address."

    email = email.strip()

    # Basic format check; Supabase also validates the email.
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return None, "Enter a valid email address."

    if not isinstance(password, str) or not password:
        return None, "Enter your password."

    return {
        "email": email,
        "password": password,
    }, None


def password_errors(password):
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    if not re.search(r"[A-Z]", password):
        errors.append(
            "Password must include at least one capital letter."
        )

    if not any(character in string.punctuation for character in password):
        errors.append(
            "Password must include at least one special character, "
            "such as !, @, #, or $."
        )

    return errors


def auth_error_response(error):
    code = getattr(error, "code", None)

    messages = {
        "email_exists": (
            "This email is already registered. Please sign in.",
            409,
        ),
        "user_already_exists": (
            "This email is already registered. Please sign in.",
            409,
        ),
        "invalid_credentials": (
            "Incorrect email or password.",
            401,
        ),
        "email_not_confirmed": (
            "Confirm your email before signing in. Check your inbox.",
            403,
        ),
        "email_address_invalid": (
            "This email address is not accepted. Use a valid email address.",
            400,
        ),
        "email_address_not_authorized": (
            "Email delivery is not enabled for this address. "
            "Contact the app team.",
            403,
        ),
        "over_email_send_rate_limit": (
            "The email sending limit has been reached. "
            "Please wait before requesting another email.",
            429,
        ),
        "over_request_rate_limit": (
            "Too many attempts. Please wait a few minutes and try again.",
            429,
        ),
        "weak_password": (
            "This password does not meet the server's security requirements. "
            "Choose a stronger password.",
            400,
        ),
        "signup_disabled": (
            "New account registration is currently disabled.",
            403,
        ),
        "email_provider_disabled": (
            "Email and password authentication is currently disabled.",
            403,
        ),
        "user_banned": (
            "This account is currently disabled. Contact the app team.",
            403,
        ),
        "request_timeout": (
            "The authentication service took too long to respond. "
            "Please try again.",
            503,
        ),
    }

    if code in messages:
        message, status = messages[code]
        return jsonify(error=message, code=code), status

    app.logger.exception("Unhandled Supabase authentication error")

    return jsonify(
        error="Authentication is temporarily unavailable. "
              "Please try again later."
    ), 503


def start_session(user):
    session.clear()
    session.permanent = True
    session["user"] = str(user.id)
    session["email"] = user.email

    return {
        "id": session["user"],
        "email": session["email"],
    }


@app.route('/register', methods=['POST'])
def register():
    credentials, error = read_credentials()

    if error:
        return jsonify(error=error), 400

    errors = password_errors(credentials["password"])

    if errors:
        return jsonify(
            error="\n".join(errors),
            errors=errors,
        ), 400

    redirect_url = os.environ.get("AUTH_REDIRECT_URL")

    if not redirect_url:
        app.logger.error("AUTH_REDIRECT_URL is not configured")
        return jsonify(
            error="Registration is temporarily unavailable."
        ), 500

    try:
        result = get_auth_client().auth.sign_up({
            **credentials,
            "options": {
                "email_redirect_to": redirect_url,
            },
        })
    except AuthApiError as error:
        return auth_error_response(error)
    except Exception:
        app.logger.exception("Unexpected registration failure")
        return jsonify(
            error="Registration is temporarily unavailable. "
                  "Please try again later."
        ), 503

    if result.user and result.session:
        return jsonify(
            user=start_session(result.user),
            requiresConfirmation=False,
        ), 201

    # Supabase may hide whether an account already exists.
    # This response does not guarantee a new account or email was created.
    return jsonify(
        user=None,
        requiresConfirmation=True,
        message=(
            "Check your inbox for a confirmation email. "
            "If you already have a confirmed account, sign in instead."
        ),
    ), 200


@app.route('/login', methods=['POST'])
def login():
    credentials, error = read_credentials()

    if error:
        return jsonify(error=error), 400

    # New signup password rules must not block existing users' passwords.
    try:
        result = get_auth_client().auth.sign_in_with_password(credentials)
    except AuthApiError as error:
        return auth_error_response(error)
    except Exception:
        app.logger.exception("Unexpected login failure")
        return jsonify(
            error="Login is temporarily unavailable. Please try again later."
        ), 503

    if result.user and result.session:
        return jsonify(user=start_session(result.user)), 200

    return jsonify(error="Incorrect email or password."), 401


@app.route('/session', methods=['GET'])
def current_session():
    if "user" not in session:
        return jsonify(error="Unauthorized"), 401

    return jsonify(
        user={
            "id": session["user"],
            "email": session.get("email"),
        }
    ), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(user=None), 200


@app.route('/auth/confirmed', methods=['GET'])
def confirmation_page():
    return render_template('confirmed.html')


@app.route('/auth/confirmation-status', methods=['POST'])
def confirmation_status():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(confirmed=False), 400

    token = data.get("access_token")

    if not isinstance(token, str) or not token:
        return jsonify(confirmed=False), 400

    try:
        result = get_auth_client().auth.get_user(token)
    except Exception:
        return jsonify(confirmed=False), 401

    confirmed = bool(
        result.user and result.user.email_confirmed_at
    )

    return jsonify(confirmed=confirmed), 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)