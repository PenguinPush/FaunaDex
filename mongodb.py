from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from json import loads

load_dotenv()

db_password = os.environ.get("MONGODB_PASSWORD")
mongo_url = "mongodb+srv://mongoauth:" + db_password + "@cluster0.6lsnmgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(mongo_url)
db = client["fauna"]
collection = db["fauna_data"]


def database_update(animal_instance, image_path):
    try:
        existing_animal = collection.find_one({"name": animal_instance.species})
        is_new = False
        type_data = loads(animal_instance.get_type())

        if existing_animal:
            collection.update_one(
                {"_id": existing_animal["_id"]},
                {"$inc": {"times_caught": 1},
                 "$set": {"image_path": image_path, "image_path_nobg": image_path}}
            )
        else:
            is_new = True
            new_animal = {
                "name": animal_instance.species,
                "description": animal_instance.get_species_info(),
                "times_caught": 1,
                "image_path": image_path,
                "image_path_nobg": image_path,
                "first_caught_time": int(datetime.utcnow().timestamp()),
                "first_caught_city": "Oakville",
                "type_1": type_data["type_1"],
                "type_2": type_data["type_2"]
            }
            collection.insert_one(new_animal)

        if is_new:
            return {"status": "success", "new": is_new, "animal": new_animal}
        else:
            return {"status": "success", "new": is_new, "animal": existing_animal}

    except Exception as e:
        return {"status": "error", "message": str(e)}


def database_fetch():
    try:
        fauna_data = list(collection.find({}))
        for animal in fauna_data:
            animal["_id"] = str(animal["_id"])
        return {"status": "success", "data": fauna_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

