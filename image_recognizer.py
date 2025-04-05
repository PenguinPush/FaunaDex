# image_recognizer.py
from googleapiclient import discovery
import base64
from dotenv import load_dotenv
import os

# Load environment variables from .env file.
load_dotenv()


class ImageRecognizer:
    def __init__(self):
        """Initializes the Vision API service using an API key from the environment."""
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        self.service = discovery.build('vision', 'v1', developerKey=self.api_key)

    def get_labels(self, image_path):
        """
        Recognizes labels in the provided image using Google Cloud Vision API.

        Args:
            image_path (str): The local file path to the image.

        Returns:
            list: A list of label descriptions returned by the API.
        """
        with open(image_path, 'rb') as image_file:
            # Read and encode the image to base64.
            image_content = base64.b64encode(image_file.read()).decode('UTF-8')

        # Prepare the request body for the Vision API.
        request_body = {
            'requests': [{
                'image': {'content': image_content},
                'features': [{'type': 'LABEL_DETECTION'}]
            }]
        }

        # Call the Vision API.
        response = self.service.images().annotate(body=request_body).execute()
        labels = [annotation['description']
                  for annotation in response['responses'][0].get('labelAnnotations', [])]
        return labels


if __name__ == '__main__':
    # Example usage if running this file directly.
    recognizer = ImageRecognizer()
    image_path = '/Users/edwardwang/Downloads/man.png'
    labels = recognizer.get_labels(image_path)
    print('Labels:')
    for label in labels:
        print(label)
