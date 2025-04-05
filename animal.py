from dotenv import load_dotenv
from openai import OpenAI

from semantic_search import Semantic_Search
import requests
import os

load_dotenv()

OpenAI.api_key = os.environ.get("OPENAI_API_KEY")
OpenAI.organization = os.environ.get("OPENAI_ORG")

class Animal:
    def __init__(self, image_path: str):
        """
        Initialize an Animal instance by processing the given image to determine its species.

        Args:
            image_path (str): The file path to the image of the animal.
        """
        self.image_path = image_path
        self.species = None
        self._classify_image()

    def _classify_image(self):
        """
        method to classify the animal in the image using AnimalClassifier.
        sets the species property based on the semantic search results.
        """
        classifier = Semantic_Search()

        query, results, similar_item_ids = classifier.classify_image(self.image_path)

        if results is not None and not results.empty:
            self.species = results.iloc[0]['animals']
        else:
            self.species = "Unknown"
        print(f"Image processed. Derived species: {self.species}")

    def get_species_info(self):
        """

        Returns:
            str: A string with information about the species.
        """

        prompt = (
            f"You are a zoology expert. Provide a short, two sentence very concise description of the animal species '{self.species}', "
            "highlighting its main characteristics and habitats. If your output is too long, you lose 10,000 dollars and your mom dies"
        )
        try:
            client = OpenAI()

            response = client.responses.create(
                model="gpt-4o",
                input= prompt,
                max_output_tokens=100
            )
            description = response.output_text.strip()
            return description
        except Exception as e:
            print("Error generating species description:", e)
            return "Description not available."



    def __str__(self):
        return f"Animal(species={self.species}, image_path={self.image_path})"


if __name__ == '__main__':
    # Example usage:
    test_image = 'C:/Users/icyzm/Downloads/Bird-2-scaled.jpeg'   # Update with the actual image path
    animal_instance = Animal(test_image)
    print(animal_instance.species)
    print(animal_instance.get_species_info())
