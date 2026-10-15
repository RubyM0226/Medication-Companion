from flask import Blueprint, request, jsonify, session
from services.logs_service import (
    create_log,
    get_logs,
    update_log,
    delete_log
)

# log routes,  POST  GET  PUT  DELETE

log_bp = Blueprint("logs", __name__)

#record one medication take event
@log_bp.route("/medications/<medication_id>/logs", methods=["POST"])
def add_log(medication_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    data = request.json
    log = create_log(
        user_id,
        medication_id,
        data
    )
    return jsonify(log), 201

# get history for a medication
@log_bp.route("/medications/<medication_id>/logs", methods=["GET"])
def get_medication_logs(medication_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    logs = get_logs(user_id, medication_id)
    return jsonify(logs), 200

# update a log for a medication
@log_bp.route("/logs/<log_id>", methods=["PUT"])
def edit_log(log_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    data = request.json
    log = update_log(user_id, log_id, data)
    return jsonify(log), 200

# delete a log for a medication
@log_bp.route("/logs/<log_id>",methods=["DELETE"])
def remove_log(log_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    delete_log(user_id,log_id)
    return jsonify({
        "message": "Log deleted"
    }), 200