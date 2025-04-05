from flask import Flask, request, jsonify, send_file
import os
from datetime import datetime
from flask_cors import CORS
from animal import Animal
from mongodb import database_update, database_fetch

app = Flask(__name__)
CORS(app)

# Ensure the uploads folder exists
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/image/<filename>', methods=['GET'])
def get_image(filename):
    image_path = os.path.join('uploads', filename)  # adjust path as needed

    if not os.path.exists(image_path):
        return {"error": "File not found"}, 404

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
    app.run(debug=True, port=5050)
