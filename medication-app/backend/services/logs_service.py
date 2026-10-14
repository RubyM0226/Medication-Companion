from supabase_client import supabase

# contains functions behind the routes for CRUD a log for a medication

# create a log for a medication
def create_log(user_id, medication_id, data):

    log = {
        "user_id": user_id,
        "medication_id": medication_id,
        "time": data["time"],
        "notes": data.get("notes")
    }

    response = (
        supabase.table("medication_logs").insert(log).execute()
    )

    return response.data[0]

# get all logs for a medication by user_id and medication_id
def get_logs(user_id, medication_id):

    response = (
        supabase.table("medication_logs").select("*").eq("medication_id", medication_id).eq("user_id", user_id).order("time", desc=True).execute()
    )

    return response.data

# update a log for a medication by user_id and log_id
def update_log(user_id, log_id, data):

    response = (
        supabase.table("medication_logs").update(data).eq("id", log_id).eq("user_id", user_id).execute()
    )

    return response.data[0]


# delete a log for a medication by user_id and log_id
def delete_log(user_id, log_id):

    (
        supabase.table("medication_logs").delete().eq("id", log_id).eq("user_id", user_id).execute()
    )