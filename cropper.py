import os
import base64
from googleapiclient.discovery import build
from PIL import Image
from dotenv import load_dotenv

load_dotenv()


def is_animal(name):
    """
    A simple heuristic to determine if the object name likely refers to an animal.
    """
    animal_keywords  = [
    "cat", "dog", "bird", "horse", "cow", "lion", "tiger", "bear", "shark",
    "wolf", "fish", "squirrel", "monkey", "zebra", "giraffe", "elephant", "animal",
    "deer", "rabbit", "fox", "goat", "pig", "sheep", "chicken", "duck", "frog",
    "mouse", "rat", "camel", "kangaroo", "panda", "leopard", "dolphin", "seal"
]

    lower_name = name.lower()
    return any(keyword in lower_name for keyword in animal_keywords)


def crop_to_animal(image_path, margin_ratio=0.1):
    """
    Detects objects in the image using the REST-based Google Vision API,
    filters for objects that appear to be animals using a simple heuristic,
    crops the image to the bounding box of the highest scoring animal with extra margin,
    saves the uncropped image as "imagename_Full.ext", and replaces the original image
    with the cropped version.

    Args:
        image_path (str): Path to the input image.
        margin_ratio (float): Ratio of the bounding box dimensions to use as margin.
    """
    # Parse the file name and directory.
    directory = os.path.dirname(image_path)
    base_name = os.path.basename(image_path)
    name, ext = os.path.splitext(base_name)

    # Save the original image as the full version.
    full_version_path = os.path.join(directory, f"{name}_Full{ext}")
    original_image = Image.open(image_path)
    original_image.save(full_version_path)
    print(f"Saved full image as {full_version_path}")

    # Use the original file for processing.
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
        return full_version_path

    # Filter objects to only those that are likely animals.
    animal_objects = [obj for obj in objects if is_animal(obj.get('name', ''))]
    if not animal_objects:
        print("No animal detected in the image.")
        return full_version_path

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
    print(f"Original cropping coordinates: left={left}, top={top}, right={right}, bottom={bottom}")

    # Calculate margin in pixels.
    bbox_width = right - left
    bbox_height = bottom - top
    margin_x = int(bbox_width * margin_ratio)
    margin_y = int(bbox_height * margin_ratio)

    # Expand the bounding box by the margin, ensuring not to exceed image boundaries.
    new_left = max(0, left - margin_x)
    new_top = max(0, top - margin_y)
    new_right = min(width, right + margin_x)
    new_bottom = min(height, bottom + margin_y)
    print(
        f"Adjusted cropping coordinates with margin: left={new_left}, top={new_top}, right={new_right}, bottom={new_bottom}")

    # Crop the image to the new bounding box.
    cropped_image = pil_image.crop((new_left, new_top, new_right, new_bottom))

    # Replace the original file with the cropped image.
    cropped_image.save(image_path)
    print(f"Cropped image replaced at {image_path}")

    return full_version_path


if __name__ == '__main__':
    # Update with the path to your image.
    input_image_path = "/Users/edwardwang/Downloads/gura.jpg"
    crop_to_animal(input_image_path)
