from openai import OpenAI
import numpy as np
import pandas as pd
from datasets import load_dataset
from annoy import AnnoyIndex
import warnings
from dotenv import load_dotenv
import os
import truststore
import httpx

# Import the image recognizer class
from image_recognizer import ImageRecognizer

load_dotenv()

OpenAI.api_key = os.environ.get("OPENAI_API_KEY")
OpenAI.organization = os.environ.get("OPENAI_ORG")

DISTANCE_CUTOFF = 1.1
OpenAI.verify_ssl_certs = False

warnings.filterwarnings('ignore')
pd.set_option('display.max_colwidth', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)


class Semantic_Search:
    def __init__(self, dataset_name="PenguinPush/animals-large", split="train",
                 dataset_limit=3159, annoy_index_path='embeds/embeds-openai-large-gen3.ann'):

        dataset = load_dataset(dataset_name, split=split)
        self.df = pd.DataFrame(dataset)[:dataset_limit]

        self.index = AnnoyIndex(3072, 'angular')
        self.index.load(annoy_index_path)

        self.recognizer = ImageRecognizer()

    def get_embedding(self, query: str):
        truststore.inject_into_ssl()
        client = OpenAI(http_client=httpx.Client(verify=False))

        openai_output = client.embeddings.create(
            input=query,
            model="text-embedding-3-large"
        )
        return openai_output.data[0].embedding

    def classify_image(self, image_path: str, n_neighbors: int = 10):
        labels = self.recognizer.get_labels(image_path)

        query = ' '.join(labels) if labels else "Not an animal"
        print(f"Using image-derived query: '{query}'")

        query_embed = self.get_embedding(query)

        similar_item_ids = self.index.get_nns_by_vector(query_embed, n_neighbors, include_distances=True)

        results = pd.DataFrame({
            'animals': self.df.iloc[similar_item_ids[0]]['animals'],
            'distance': similar_item_ids[1]
        })

        return query, results, similar_item_ids

    def select_result(self, similar_item_ids, selection: int):
        selected_id = similar_item_ids[0][selection - 1]  # adjusting for zero-based indexing
        return self.df.iloc[selected_id]['animals']


if __name__ == '__main__':
    classifier = Semantic_Search()
    image_path = 'C:/Users/icyzm/Downloads/testbird.jpeg'  # Update this path as needed
    query, results, similar_item_ids = classifier.classify_image(image_path)

    print(f"\nQuery: '{query}'\nNearest neighbors:")
    print(results)

    selection = int(input("Select a result (enter a number from 1 to 10): "))
    selected_animal = classifier.select_result(similar_item_ids, selection)
    print("Selected: " + selected_animal)
