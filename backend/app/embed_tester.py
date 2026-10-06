import os

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

from backend.app.embedding_store import AnimalEmbeddingStore


def main():
    load_dotenv()
    store = AnimalEmbeddingStore()
    _, names, embeddings = store.snapshot()
    df = pd.DataFrame({"animals": names})

    query = input("Input: ").strip()
    if not query:
        raise ValueError("Enter a nonempty search query.")
    client = OpenAI(organization=os.getenv("OPENAI_ORG") or None)
    response = client.embeddings.create(
        input=query, model=store.model, dimensions=store.dimensions
    )
    query_embed = response.data[0].embedding
    ids, distances = find_neighbors(embeddings, query_embed)
    results = pd.DataFrame(
        {
            "animals": df.iloc[ids]["animals"].tolist(),
            "distance": distances,
        },
        index=range(1, len(ids) + 1),
    )
    print(f"Query: '{query}'\nNearest neighbors:")
    print(results.to_string())

    selection = int(input(f"Select a result (1-{len(ids)}): "))
    if not 1 <= selection <= len(ids):
        raise ValueError("Selection is outside the displayed results.")
    print("Selected: " + df.iloc[ids[selection - 1]]["animals"])


def find_neighbors(embeddings, query_embedding, count=10):
    """Search all saved vectors using the same angular distance as Annoy."""
    query = np.asarray(query_embedding, dtype=np.float32)
    norms = np.linalg.norm(embeddings, axis=1)
    query_norm = np.linalg.norm(query)
    if (
            not np.isfinite(embeddings).all()
            or not np.isfinite(query).all()
            or np.any(norms == 0)
            or query_norm == 0
    ):
        raise ValueError("Embeddings must be finite, nonzero vectors.")
    similarities = (embeddings @ query) / (norms * query_norm)
    ids = np.argsort(-similarities)[:count]
    distances = np.sqrt(np.maximum(0, 2 - 2 * np.clip(similarities[ids], -1, 1)))
    return ids, distances


if __name__ == "__main__":
    main()
