import os
import secrets
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, session
from supabase import create_client, Client
load_dotenv()
print("Supabase URL:", os.getenv("SUPABASE_URL"))
print("Supabase key loaded:", bool(os.getenv("SUPABASE_KEY")))
url = os.getenv("SUPABASE_URL")
db_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, db_key)
app = Flask(__name__)
@app.route('/')
def home():
    if "user" in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = supabase.auth.sign_up({
            "email": email,
            "password": password
            })
            if user.session:
                session['user'] = user.user.id
                return redirect(url_for('dashboard'))
            return "Registration successful! Check your email to confirm your account."
        except Exception as e:
            return f"Registration failed: {e}"
    return render_template('register.html')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if user.session:
                session['user'] = user.user.id
                return redirect(url_for('dashboard'))

            return "Login failed. Wrong email or password."
        except Exception as e:
            return f"Login failed: {e}"  
    return render_template('login.html')      
@app.route('/dashboard')
def dashboard():
    if "user" not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('login'))
if __name__ == '__main__':
    app.secret_key = secrets.token_hex(16)
    app.run(debug=True)
