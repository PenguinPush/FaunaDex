import openai
import numpy as np
import pandas as pd
from datasets import load_dataset
from annoy import AnnoyIndex
import warnings
from dotenv import load_dotenv
import os

# Import the image recognizer class
from image_recognizer import ImageRecognizer

load_dotenv()

openai.api_key = os.environ.get("OPENAI_API_KEY")
openai.organization = os.environ.get("OPENAI_ORG")

# Suppress warnings and set pandas display options
warnings.filterwarnings('ignore')
pd.set_option('display.max_colwidth', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)


class Semantic_Search:
    def __init__(self, dataset_name="PenguinPush/animals-large", split="train",
                 dataset_limit=3159, annoy_index_path='embeds/embeds-openai-large-gen3.ann'):
        """
        Initializes the classifier by loading the dataset, building the Annoy index,
        and setting up the image recognizer.
        """
        # Load the dataset and convert to a DataFrame
        dataset = load_dataset(dataset_name, split=split)
        self.df = pd.DataFrame(dataset)[:dataset_limit]

        # Load the Annoy index for similarity search
        self.index = AnnoyIndex(3072, 'angular')
        self.index.load(annoy_index_path)

        # Initialize the ImageRecognizer instance
        self.recognizer = ImageRecognizer()

    def get_embedding(self, query: str):
        """
        Get the OpenAI embedding for a given query.
        """
        openai_output = openai.embeddings.create(
            input=query,
            model="text-embedding-3-large"
        )
        return openai_output.data[0].embedding

    def classify_image(self, image_path: str, n_neighbors: int = 10):
        """
        Process the image, get the image labels, convert them into an embedding,
        and return the closest animal results from the dataset.

        Args:
            image_path (str): The path to the input image.
            n_neighbors (int): Number of closest results to retrieve.

        Returns:
            tuple: (query, results_df, similar_item_ids)
                - query: the string used for generating embeddings.
                - results_df: a DataFrame containing animals and their distances.
                - similar_item_ids: tuple containing the list of indices and distances.
        """
        # Use the image recognizer to get labels from the image
        labels = self.recognizer.get_labels(image_path)

        # Use all labels to form the query
        query = ' '.join(labels) if labels else "Not an animal"
        print(f"Using image-derived query: '{query}'")

        # Generate the query embedding
        query_embed = self.get_embedding(query)

        # Retrieve the nearest neighbors from the Annoy index
        similar_item_ids = self.index.get_nns_by_vector(query_embed, n_neighbors, include_distances=True)

        # Format the results into a DataFrame
        results = pd.DataFrame({
            'animals': self.df.iloc[similar_item_ids[0]]['animals'],
            'distance': similar_item_ids[1]
        })

        return query, results, similar_item_ids

    def select_result(self, similar_item_ids, selection: int):
        """
        Given a selection index, return the corresponding animal from the dataset.

        Args:
            similar_item_ids (tuple): Tuple containing the list of indices and distances.
            selection (int): The selected result number (1-indexed).

        Returns:
            str: The animal corresponding to the selection.
        """
        selected_id = similar_item_ids[0][selection - 1]  # adjusting for zero-based indexing
        return self.df.iloc[selected_id]['animals']


if __name__ == '__main__':
    # Example usage:
    classifier = Semantic_Search()
    image_path = 'C:/Users/icyzm/Downloads/Bird-2-scaled.jpeg'  # Update this path as needed
    query, results, similar_item_ids = classifier.classify_image(image_path)

    print(f"\nQuery: '{query}'\nNearest neighbors:")
    print(results)

    # Optionally allow user to select a result
    selection = int(input("Select a result (enter a number from 1 to 10): "))
    selected_animal = classifier.select_result(similar_item_ids, selection)
    print("Selected: " + selected_animal)
