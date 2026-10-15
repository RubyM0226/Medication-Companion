from backend.supabase_client import supabase

# contains functions behind the routes for CRUD a medication

# make a medication with the dta and their id 
def create_medication(user_id, data):

    medication = {
        "user_id": user_id, # uuid 
        "name": data["name"], # text
        "dosage": data["dosage"], # numeric
        "dosage_unit": data["dosage_unit"], # text
        "effect": data["effect"], # text
        "instructions": data["instructions"],
        "side_effect": data["side_effect"] # json
    }

    response = (
        supabase.table("medications").insert(medication).execute()
    )
    return response.data[0]

# get all medications for a user by their uuid 
def get_medications(user_id):

    response = (
        supabase.table("medications").select("*").eq("user_id", user_id).execute()
    )
    return response.data


# get a medication by its id
def get_medication(user_id, medication_id):

    response = (
        supabase.table("medications").select("*").eq("id", medication_id).eq("user_id", user_id).single().execute()
    )
    return response.data

# update the attributes of a medication by its id 
def update_medication(user_id, medication_id, data):

    response = (
        supabase.table("medications").update(data).eq("id", medication_id).eq("user_id", user_id).execute()
    )
    return response.data[0]

# delete a medication by its id
def delete_medication(user_id, medication_id):

    (
        supabase.table("medications").delete().eq("id", medication_id).eq("user_id", user_id).execute()
    )