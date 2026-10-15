from backend.supabase_client import supabase


# contains functions behind the routes for CRUD a schedule for a medication

# create a schedule for a medication 
def create_schedule(user_id, medication_id, data):

    schedule = {
        "user_id": user_id,
        "medication_id": medication_id,
        "frequency_type": data["frequency_type"],
        "days_of_week": data.get("days_of_week"),
        "reminder_times": data["reminder_times"],
        "start_date": data["start_date"],
        "end_date": data.get("end_date")
    }

    response = (
        supabase.table("medication_schedules").insert(schedule).execute()
    )
    return response.data[0]

# get the schedule for a specific user and medication
def get_schedule(user_id, medication_id):

    response = (
        supabase.table("medication_schedules").select("*").eq("medication_id", medication_id).eq("user_id", user_id).single().execute()
    )

    return response.data


# update a schedule by its id
def update_schedule(user_id, schedule_id, data):

    response = (
        supabase.table("medication_schedules").update(data).eq("id", schedule_id).eq("user_id", user_id).execute()
    )
    return response.data[0]


# delete a schedule by its id
def delete_schedule(user_id, schedule_id):

    (
        supabase.table("medication_schedules").delete().eq("id", schedule_id).eq("user_id", user_id).execute()
    )