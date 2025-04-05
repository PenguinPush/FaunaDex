from googleapiclient import discovery
import base64
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Build the service object.
service = discovery.build('vision', 'v1', developerKey=GOOGLE_API_KEY)

# Path to your image.
image_path = '/Users/edwardwang/Downloads/husky.webp'
with open(image_path, 'rb') as image_file:
    # Read and encode image to base64.
    image_content = base64.b64encode(image_file.read()).decode('UTF-8')

# Prepare the request body.
request_body = {
    'requests': [{
        'image': {'content': image_content},
        'features': [{'type': 'LABEL_DETECTION'}]
    }]
}

# Call the Vision API.
response = service.images().annotate(body=request_body).execute()

# Process and print the labels.
print('Labels:')
for annotation in response['responses'][0].get('labelAnnotations', []):
    print(annotation['description'])
