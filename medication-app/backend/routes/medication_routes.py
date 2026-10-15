from flask import Blueprint, request, jsonify, session
from services.medication_service import (
    create_medication,
    get_medications,
    get_medication,
    update_medication,
    delete_medication
)

# medication routes  POST  GET  PUT  DELETE

medication_bp = Blueprint("medications", __name__)


# add a new medication
@medication_bp.route("/medications", methods=["POST"])
def add_medication():

    # check if user is logged in
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    data = request.json
    medication = create_medication(user_id, data)
    return jsonify(medication), 201


# get all medications
@medication_bp.route("/medications", methods=["GET"])
def get_all_medications():

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    medications = get_medications(user_id)
    return jsonify(medications), 200


# get a single medication by ID
@medication_bp.route("/medications/<medication_id>", methods=["GET"])
def get_one_medication(medication_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    medication = get_medication(user_id, medication_id)
    return jsonify(medication), 200

# update a medication 
@medication_bp.route("/medications/<medication_id>", methods=["PUT"])
def edit_medication(medication_id):

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    data = request.json
    medication = update_medication(user_id, medication_id, data)
    return jsonify(medication), 200

# delete medicaiton 
@medication_bp.route("/medications/<medication_id>", methods=["DELETE"])
def remove_medication(medication_id):
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session["user"]

    delete_medication(user_id, medication_id)
    return jsonify({"message": "Medication deleted"}), 200