import os
import base64
from googleapiclient.discovery import build
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

def is_animal(name):

    # Keywords that indicate the object is an animal.
    animal_keywords = ["cat", "dog", "bird", "horse", "cow", "lion", "tiger", "bear",
                       "wolf", "squirrel", "monkey", "zebra", "giraffe", "elephant", "animal"]
    lower_name = name.lower()
    return any(keyword in lower_name for keyword in animal_keywords)

def crop_to_animal(image_path):
    """
    Detects objects in the image using the REST-based Google Vision API,
    filters for objects that appear to be animals using a simple heuristic,
    crops the image to the bounding box of the highest scoring animal,
    and saves the cropped image.

    Args:
        image_path (str): Path to the input image.
        output_path (str): Path to save the cropped image.

    Returns:
        PIL.Image.Image: The cropped image object, or None if no animal is detected.
    """
    output_path = f"CroppedPhotos/{os.path.basename(image_path)}"
    # Retrieve your API key from environment variables.
    API_KEY = os.environ.get("GOOGLE_API_KEY")
    if not API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")

    # Build the Vision API service using the REST client.
    service = build('vision', 'v1', developerKey=API_KEY)

    # Read and encode the image to base64.
    with open(image_path, "rb") as image_file:
        content = image_file.read()
    encoded_image = base64.b64encode(content).decode("UTF-8")

    # Prepare the request body for object localization.
    request_body = {
        "requests": [
            {
                "image": {"content": encoded_image},
                "features": [{"type": "OBJECT_LOCALIZATION"}]
            }
        ]
    }

    # Call the Vision API.
    response = service.images().annotate(body=request_body).execute()

    # Retrieve the localized object annotations from the response.
    objects = response.get('responses', [{}])[0].get('localizedObjectAnnotations', [])
    if not objects:
        print("No objects detected in the image.")
        return None

    # Filter objects to only those that are likely animals.
    animal_objects = [obj for obj in objects if is_animal(obj.get('name', ''))]

    if not animal_objects:
        print("No animal detected in the image.")
        return None

    # Select the animal object with the highest confidence score.
    primary_animal = max(animal_objects, key=lambda obj: obj.get('score', 0))
    print(f"Detected animal: {primary_animal.get('name')} with score: {primary_animal.get('score'):.2f}")

    # Retrieve normalized vertices from the bounding polygon.
    vertices = primary_animal['boundingPoly']['normalizedVertices']

    # Open the image with Pillow to obtain its dimensions.
    pil_image = Image.open(image_path)
    width, height = pil_image.size

    # Convert normalized vertices to pixel coordinates.
    xs = [v.get('x', 0) * width for v in vertices]
    ys = [v.get('y', 0) * height for v in vertices]
    left = int(min(xs))
    top = int(min(ys))
    right = int(max(xs))
    bottom = int(max(ys))
    print(f"Cropping coordinates: left={left}, top={top}, right={right}, bottom={bottom}")

    # Crop the image to the bounding box.
    cropped_image = pil_image.crop((left, top, right, bottom))
    cropped_image.save(output_path)
    print(f"Cropped image saved to {output_path}")

    return cropped_image

if __name__ == '__main__':
    # Update with the path to your image.
    input_image_path = "/Users/edwardwang/Downloads/husky.webp"
    crop_to_animal(input_image_path)
