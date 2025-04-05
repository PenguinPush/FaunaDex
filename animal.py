from dotenv import load_dotenv
from openai import OpenAI
from semantic_search import Semantic_Search
import requests
import openai
import os
import certifi
import truststore
import httpx

load_dotenv()
OpenAI.api_key = os.environ.get("OPENAI_API_KEY")
OpenAI.organization = os.environ.get("OPENAI_ORG")

DISTANCE_CUTOFF = 1.1
truststore.inject_into_ssl()

openai.verify_ssl_certs = False

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
        print("distance: ", similar_item_ids[1][0])
        if (results is not None and not results.empty) and similar_item_ids[1][0] <= DISTANCE_CUTOFF:
            self.species = results.iloc[0]['animals']
        else:
            self.species = "NOT AN ANIMAL"
        print(f"Image processed. Derived species: {self.species}")

    def get_species_info(self):
        """

        Returns:
            str: A string with information about the species.
        """
        if self.species == "NOT AN ANIMAL":
            return "species is not an animal"
        prompt = (
            f"You are a zoology expert. Provide a short, two sentence very concise description of the animal species '{self.species}', "
            "highlighting its main characteristics and habitats. If your output is too long, you lose 10,000 dollars and your mom dies"
        )
        try:
            client = OpenAI(http_client = httpx.Client(verify=False))

            response = client.responses.create(
                model="gpt-4o",
                input= prompt,
                max_output_tokens=100,
                temperature=1
            )
            description = response.output_text.strip()
            return description
        except Exception as e:
            print("Error generating species description:", e)
            return "Description not available."

    def get_type(self):
        if self.species == "NOT AN ANIMAL":
            return "species is not an animal"
        client = OpenAI()

        response = client.responses.create(
            model="gpt-4o",
            input=self.species,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "pokemon_typing_for_real_animals",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "type_1": {
                                "type": "string",
                                "enum": [
                                    "Normal",
                                    "Fire",
                                    "Water",
                                    "Grass",
                                    "Electric",
                                    "Ice",
                                    "Fighting",
                                    "Poison",
                                    "Ground",
                                    "Flying",
                                    "Psychic",
                                    "Bug",
                                    "Rock",
                                    "Ghost",
                                    "Dragon",
                                    "Dark",
                                    "Steel",
                                    "Fairy"
                                ]
                            },
                            "type_2": {
                                "type": "string",
                                "enum": [
                                    "",
                                    "Normal",
                                    "Fire",
                                    "Water",
                                    "Grass",
                                    "Electric",
                                    "Ice",
                                    "Fighting",
                                    "Poison",
                                    "Ground",
                                    "Flying",
                                    "Psychic",
                                    "Bug",
                                    "Rock",
                                    "Ghost",
                                    "Dragon",
                                    "Dark",
                                    "Steel",
                                    "Fairy"
                                ]
                            }
                        },
                        "additionalProperties": False,
                        "required": [
                            "type_1",
                            "type_2"
                        ]
                    }
                }
            },
            reasoning={},
            tools=[],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )
        return response.output_text

    def __str__(self):
        return f"Animal(species={self.species}, image_path={self.image_path})"


if __name__ == '__main__':
    # Example usage:
    test_image = '/Users/edwardwang/Downloads/devil2.jpg'   # Update with the actual image path
    animal_instance = Animal(test_image)
    print(animal_instance.species)
    print(animal_instance.get_type())
    print(animal_instance.get_species_info())
