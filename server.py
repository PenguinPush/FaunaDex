from flask import Flask, request, jsonify, send_file
import os
from datetime import datetime
from flask_cors import CORS
from animal import Animal
from mongodb import database_update, database_fetch
from cloud_storage import upload_image, fetch_image
from cropper import crop_to_animal


app = Flask(__name__)
CORS(app)

# Ensure the uploads folder exists
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/uploads/<filename>', methods=['GET'])
def get_image(filename):
    image_path = os.path.join('uploads', filename)  # adjust path as needed

    if not os.path.exists(image_path):
        return {"error": "File not found"}, 404

    if not os.path.exists(image_path):
        fetch_image(filename)  # Fetch the image from cloud storage

    return send_file(image_path, mimetype='image/jpeg')  # adjust mimetype if needed


@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        response = jsonify({'error': 'No image part'}), 400

    image = request.files['image']

    if image.filename == '':
        response = jsonify({'error': 'No selected file'}), 400

    # Optional: create a unique filename
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    filename = f"{timestamp}_{image.filename}"
    save_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        image.save(save_path)
        crop_to_animal(save_path)
        name, ext = os.path.splitext(save_path)
        full_version_path = os.path.join(save_path, f"{name}_Full{ext}")
        upload_image(save_path, filename)
        upload_image(full_version_path, filename)

        animal_instance = Animal(save_path)

        print(animal_instance.species)
        is_animal = animal_instance.species != "NOT AN ANIMAL"
        if is_animal:
            print(database_update(animal_instance, save_path))

        response = jsonify({'message': 'Image received', 'filename': filename,
                            'name':animal_instance.species, 'is_animal':is_animal}), 200
    except Exception as e:
        response = jsonify({'error': str(e)}), 500

    return response

@app.route('/get_dex', methods=['GET'])
def get_dex():
    return database_fetch()


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5050))
    app.run(host='0.0.0.0', port=port, debug=True)
