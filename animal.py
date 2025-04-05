from semantic_search import Semantic_Search  # Adjust the import as necessary


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
        Template method to retrieve additional information about the species.

        You can extend this method to connect to an external API or a database to fetch
        more detailed information on the species.

        Returns:
            str: A string with information about the species.
        """
        return f"Information on species '{self.species}' is not yet implemented."

    def __str__(self):
        return f"Animal(species={self.species}, image_path={self.image_path})"


if __name__ == '__main__':
    # Example usage:
    test_image = 'C:/Users/icyzm/Downloads/Bird-2-scaled.jpeg'   # Update with the actual image path
    animal_instance = Animal(test_image)
    print(animal_instance.species)
    print(animal_instance.get_species_info())
