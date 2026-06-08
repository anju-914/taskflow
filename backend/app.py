from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.tasks import tasks_bp
from routes.users import users_bp
from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            os.getenv("FRONTEND_URL", "http://localhost:3000"),
        ],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

app.register_blueprint(auth_bp,  url_prefix="/api/auth")
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
app.register_blueprint(users_bp, url_prefix="/api/users")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "TaskFlow API"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)