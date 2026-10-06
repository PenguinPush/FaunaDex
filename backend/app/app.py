import os
import posixpath
from datetime import datetime

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from backend.app.animal import Animal
from backend.app.cropper import crop_to_animal
from backend.app.mongodb import database_fetch, database_update

app = Flask(__name__, static_folder="../frontend/dist")
CORS(app)
UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/uploads/<filename>", methods=["GET"])
def get_image(filename):
    image_path = posixpath.join(UPLOAD_FOLDER, filename)

    if not posixpath.exists(image_path):
        return send_file("../../placeholder.png", mimetype="image/jpeg")

    return send_file(image_path, mimetype="image/jpeg")


@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        response = jsonify({"error": "No image part"}), 400

    image = request.files["image"]

    if image.filename == "":
        response = jsonify({"error": "No selected file"}), 400

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{image.filename}"
    save_path = posixpath.join(UPLOAD_FOLDER, filename)
    name, ext = posixpath.splitext(filename)
    filename_full = f"{name}_Full{ext}"

    image.save(save_path)
    save_path_full = crop_to_animal(save_path)
    print("a")
    print(save_path_full, filename_full)
    print("b")

    animal_instance = Animal(save_path)

    print(animal_instance.species)
    is_animal = animal_instance.species != "NOT AN ANIMAL"
    if is_animal:
        print(database_update(animal_instance, save_path))

    response = (
        jsonify(
            {
                "message": "Image received",
                "filename": filename,
                "name": animal_instance.species,
                "is_animal": is_animal,
            }
        ),
        200,
    )

    return response


@app.route("/get_dex", methods=["GET"])
def get_dex():
    return database_fetch()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5050))
    app.run(host="0.0.0.0", port=5050, debug=True)
