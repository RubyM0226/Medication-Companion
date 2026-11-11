import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from supabase import create_client, Client
from datetime import timedelta
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
        return None

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return None

    if not email.strip() or not password:
        return None

    return {
        "email": email.strip(),
        "password": password,
    }


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
        credentials = read_credentials()
        if credentials is None:
            return jsonify(error="Invalid credentials."), 400
        try:
            result = get_auth_client().auth.sign_up(credentials)
        except Exception:
            app.logger.exception("Registration failed.")
            return jsonify(error="Registration failed."), 400
        if result.user and result.session:
            return jsonify(user=start_session(result.user), requiresConfirmation=False),201
        return jsonify(user = None, requiresConfirmation=True, message = "Check the confirmation sent to your email to confirm your account"), 201
@app.route('/login', methods=['POST'])
def login():
    credentials = read_credentials()
    if credentials is None:
        return jsonify(error="Invalid credentials."), 400
    try:
        result = get_auth_client().auth.sign_in_with_password(credentials)
    except Exception:
        return jsonify(error="Login failed."), 400
    if result.user and result.session:
        return jsonify(user=start_session(result.user)), 200
    return jsonify(error="Login failed. Wrong email or password."), 401
@app.route('/session', methods=['GET'])
def current_session():
    if "user" not in session:
        return jsonify(error = "Unauthorized"), 401
    return jsonify(user = {"id": session["user"], "email": session.get("email")}), 200
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(user =None), 200
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
