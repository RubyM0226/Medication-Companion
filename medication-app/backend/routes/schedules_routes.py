from flask import Blueprint, request, jsonify
from services.schedules_service import (
    create_schedule,
    get_schedule,
    update_schedule,
    delete_schedule
)

# CRUD routes for schedule 

schedule_bp = Blueprint("schedules", __name__)

# create a schedule for medication
@schedule_bp.route(
    "/medications/<medication_id>/schedules",
    methods=["POST"]
)
def add_schedule(medication_id):

    data = request.json

    schedule = create_schedule(
        medication_id,
        data
    )

    return jsonify(schedule), 201


# get the schedule for a medication
@schedule_bp.route(
    "/medications/<medication_id>/schedules",
    methods=["GET"]
)
def get_medication_schedule(medication_id):

    schedules = get_schedule(medication_id)

    return jsonify(schedules), 200

# update the schedule for a medication
@schedule_bp.route(
    "/schedules/<schedule_id>",
    methods=["PUT"]
)
def edit_schedule(schedule_id):

    data = request.json

    schedule = update_schedule(
        schedule_id,
        data
    )

    return jsonify(schedule), 200

# should you even be able to delete schedule since each medication only has one? 
# delete schedule 
@schedule_bp.route(
    "/schedules/<schedule_id>",
    methods=["DELETE"]
)
def remove_schedule(schedule_id):

    delete_schedule(schedule_id)

    return jsonify({
        "message": "Schedule deleted"
    }), 200