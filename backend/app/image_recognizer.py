from googleapiclient import discovery
import base64
from dotenv import load_dotenv
import os

load_dotenv()


class ImageRecognizer:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("api key not found!")
        self.service = discovery.build('vision', 'v1', developerKey=self.api_key)

    def get_labels(self, image_path):
        with open(image_path, 'rb') as image_file:
            image_content = base64.b64encode(image_file.read()).decode('UTF-8')

        request_body = {
            'requests': [{
                'image': {'content': image_content},
                'features': [{'type': 'LABEL_DETECTION'}]
            }]
        }

        response = self.service.images().annotate(body=request_body).execute()
        labels = [annotation['description']
                  for annotation in response['responses'][0].get('labelAnnotations', [])]
        return labels


if __name__ == '__main__':
    recognizer = ImageRecognizer()
    image_path = '/Users/edwardwang/Downloads/man.png'
    labels = recognizer.get_labels(image_path)
    print('Labels:')
    for label in labels:
        print(label)
