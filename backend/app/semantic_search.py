import logging
import warnings
from contextlib import closing
from threading import Lock
from time import perf_counter

import numpy as np
import pandas as pd
from dotenv import load_dotenv

from backend.app.embedding_store import (
    DEFAULT_STORE_PATH,
    AnimalEmbeddingStore,
    create_embedding_client,
)
from backend.app.image_recognizer import ImageRecognizer

load_dotenv()
logger = logging.getLogger(__name__)


DISTANCE_CUTOFF = 1.1

warnings.filterwarnings("ignore")
pd.set_option("display.max_colwidth", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)


def normalized_snapshot(store, limit=None):
    ids, names, embeddings = store.snapshot(limit)
    # Normalize in place and avoid a matrix-sized temporary for the norms.
    norms = np.sqrt(np.einsum("ij,ij->i", embeddings, embeddings))
    embeddings /= norms[:, None]
    embeddings.setflags(write=False)
    return tuple(ids), tuple(names), embeddings


class EmbeddingSnapshotCache:
    """One latest snapshot per app; existing requests can finish on the old one.

    The store is append-only. Count and maximum ID detect committed additions.
    Loading is serialized so concurrent requests never build duplicate snapshots.
    """

    def __init__(self):
        self._lock = Lock()
        self._key = None
        self._snapshot = None

    def get(self, store, limit=None):
        with self._lock:
            with closing(store._connect()) as db:
                version = tuple(
                    db.execute("SELECT COUNT(*), MAX(id) FROM animals").fetchone()
                )
            key = (store.path.resolve(), store.model, store.dimensions, limit, version)
            if key != self._key:
                snapshot = normalized_snapshot(store, limit)
                self._snapshot = snapshot
                self._key = key
            return self._snapshot


class SemanticSearch:
    def __init__(
        self,
        store_path=DEFAULT_STORE_PATH,
        dataset_limit=None,
        recognizer=None,
        snapshot_cache=None,
    ):
        self.store = AnimalEmbeddingStore(store_path)
        self.dataset_limit = dataset_limit
        self.snapshot_cache = snapshot_cache
        self.reload_embeddings()
        self.recognizer = recognizer
        self.last_query_vector = None

    def reload_embeddings(self):
        """Load committed additions without restarting this search instance."""
        started = perf_counter()
        loader = self.snapshot_cache.get if self.snapshot_cache else normalized_snapshot
        ids, names, normalized = loader(self.store, self.dataset_limit)
        self.df = pd.DataFrame({"animals": names}, index=ids)
        self.embeddings = normalized
        logger.info(
            "Loaded %s animal vectors in %.3fs", len(names), perf_counter() - started
        )

    def get_embedding(self, query: str):
        started = perf_counter()
        logger.info("OpenAI embedding request starting")
        try:
            with create_embedding_client() as client:
                output = client.embeddings.create(
                    input=query,
                    model=self.store.model,
                    dimensions=self.store.dimensions,
                )
            return output.data[0].embedding
        finally:
            logger.info(
                "OpenAI embedding stage finished in %.3fs", perf_counter() - started
            )

    def classify_image(self, image_path: str, n_neighbors: int = 10):
        if n_neighbors < 1:
            raise ValueError("n_neighbors must be positive.")
        if self.recognizer is None:
            self.recognizer = ImageRecognizer()
        labels = self.recognizer.get_labels(image_path)
        if not labels:
            return (
                "Not an animal",
                pd.DataFrame(columns=["animals", "distance"]),
                ([], []),
            )

        query = "; ".join(labels)
        print(f"Using image-derived query: '{query}'")

        return self.search_text(query, n_neighbors)

    def search_text(self, query: str, n_neighbors: int = 10):
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Enter a nonempty text description.")
        if n_neighbors < 1:
            raise ValueError("n_neighbors must be positive.")
        query = query.strip()
        query_embed = self.get_embedding(query)
        return self.search_embedding(query_embed, query, n_neighbors)

    def search_embedding(self, query_embed, query="", n_neighbors=10):
        """Rank a saved query vector against the current collection without API calls."""
        if n_neighbors < 1:
            raise ValueError("n_neighbors must be positive.")
        started = perf_counter()
        query_vector = np.asarray(query_embed, dtype=np.float32)
        query_norm = np.linalg.norm(query_vector)
        if (
            query_vector.shape != (self.embeddings.shape[1],)
            or not np.isfinite(query_vector).all()
            or query_norm == 0
        ):
            raise ValueError(
                "The query embedding must be a finite, nonzero vector of matching dimensions."
            )
        self.last_query_vector = query_vector / query_norm
        similarities = self.embeddings @ self.last_query_vector
        ids = np.argsort(-similarities)[:n_neighbors]
        distances = np.sqrt(np.maximum(0, 2 - 2 * np.clip(similarities[ids], -1, 1)))
        similar_item_ids = (ids.tolist(), distances.tolist())

        results = pd.DataFrame(
            {
                "animals": self.df.iloc[similar_item_ids[0]]["animals"],
                "distance": similar_item_ids[1],
            }
        )

        logger.info("Local ranking finished in %.3fs", perf_counter() - started)
        return query, results, similar_item_ids

    def select_result(self, similar_item_ids, selection: int):
        selected_id = similar_item_ids[0][selection - 1]
        return self.df.iloc[selected_id]["animals"]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    classifier = SemanticSearch()
    image_path = "/Users/andrewdai/Downloads/scarlet-tanager.jpeg"
    query, results, similar_item_ids = classifier.classify_image(image_path)

    print(f"\nQuery: '{query}'\nNearest neighbors:")
    print(results)

    selection = int(input("Select a result (enter a number from 1 to 10): "))
    selected_animal = classifier.select_result(similar_item_ids, selection)
    print("Selected: " + selected_animal)
