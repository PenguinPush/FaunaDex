import openai
import numpy
import pandas as pd
from datasets import load_dataset
from annoy import AnnoyIndex
import warnings

warnings.filterwarnings('ignore')
pd.set_option('display.max_colwidth', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)

openai.organization = "org-1sk7NL1ZuYWVNvkPd7cW6jDJ"
openai.api_key = "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"

dataset = load_dataset("PenguinPush/animals-large", split="train")

df = pd.DataFrame(dataset)[:2706]

embeds = numpy.load("embeds/embeds-openai-large-gen3.npy")

search_index = AnnoyIndex(embeds.shape[1], 'angular')
search_index.load('embeds/embeds-openai-large-gen3.ann')

query = input("Input: ")

# Get the query's embedding
openai_output = openai.Embedding.create(
    input=query,
    model="text-embedding-3-small"
)

query_embed = openai_output["data"][0]["embedding"]

# Retrieve the nearest neighbors
similar_item_ids = search_index.get_nns_by_vector(query_embed, 10,
                                                  include_distances=True)
# Format the results
results = pd.DataFrame(data={'animals': df.iloc[similar_item_ids[0]]['animals'],
                             'distance': similar_item_ids[1]})

print(f"Query: '{query}'\nNearest neighbors:")
print(results)

# Select a result

results_selection = int(input("Select a result: "))
results_selection_animal = df.iloc[search_index.get_nns_by_vector(query_embed, 10)[results_selection - 1]][
    'animals']
print("Selected: " + results_selection_animal)

