"""Transactional animal names and embeddings shared by training and search."""

import os
import re
import sqlite3
from contextlib import ExitStack, closing
from pathlib import Path

import httpx2
import numpy as np
from openai import OpenAI

DEFAULT_STORE_PATH = Path(__file__).resolve().parents[1] / "embeds" / "animals.sqlite3"
MODEL = "text-embedding-3-large"
DIMENSIONS = 3072


def create_embedding_client():
    """Use bounded requests and opt-in IPv4 for networks with broken IPv6."""
    options = {}
    if os.getenv("OPENAI_FORCE_IPV4", "").lower() in ("1", "true", "yes"):
        options["http_client"] = httpx2.Client(
            transport=httpx2.HTTPTransport(local_address="0.0.0.0")
        )
    return OpenAI(
        organization=os.getenv("OPENAI_ORG") or None,
        timeout=httpx2.Timeout(30, connect=3.05),
        max_retries=0,
        **options,
    )


class AnimalEmbeddingStore:
    def __init__(self, path=DEFAULT_STORE_PATH, *, model=MODEL, dimensions=DIMENSIONS):
        self.path = Path(path)
        self.model = model
        self.dimensions = dimensions
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as db, db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
            )
            db.execute("""CREATE TABLE IF NOT EXISTS animals
                          (
                              id
                              INTEGER
                              PRIMARY
                              KEY,
                              name
                              TEXT
                              NOT
                              NULL,
                              name_key
                              TEXT
                              NOT
                              NULL
                              UNIQUE,
                              embedding
                              BLOB
                              NOT
                              NULL
                          )""")
            for key, value in [("model", model), ("dimensions", str(dimensions))]:
                db.execute("INSERT OR IGNORE INTO metadata VALUES (?, ?)", (key, value))
                if (
                        db.execute(
                            "SELECT value FROM metadata WHERE key = ?", (key,)
                        ).fetchone()[0]
                        != value
                ):
                    raise ValueError(f"Embedding store {key} does not match {value}.")

    def _connect(self):
        return sqlite3.connect(self.path, timeout=30)

    @staticmethod
    def _name(name):
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Animal names must be nonempty strings.")
        return " ".join(name.split())

    @classmethod
    def normalize_name(cls, name):
        """Title-case common names without capitalizing after possessive apostrophes."""
        return re.sub(
            r"[^\W\d_]+(?:['’][^\W\d_]+)*",
            lambda match: match.group().capitalize(),
            cls._name(name),
        )

    def _vectors(self, vectors, count):
        vectors = np.asarray(vectors, dtype="<f4")
        if (
                vectors.shape != (count, self.dimensions)
                or not np.isfinite(vectors).all()
                or np.any(np.linalg.norm(vectors, axis=1) == 0)
        ):
            raise ValueError(
                "Embeddings must be finite, nonzero vectors of matching dimensions."
            )
        return vectors

    def snapshot(self, limit=None):
        if limit is not None and (not isinstance(limit, int) or limit < 1):
            raise ValueError("dataset_limit must be positive.")
        with closing(self._connect()) as db:
            rows = db.execute(
                "SELECT id, name, embedding FROM animals ORDER BY id LIMIT ?",
                (-1 if limit is None else limit,),
            ).fetchall()
        if not rows:
            raise ValueError(
                "The embedding store is empty. Run python -m backend.app.embed_trainer first."
            )
        vectors = np.stack([np.frombuffer(row[2], dtype="<f4") for row in rows])
        return (
            [row[0] for row in rows],
            [row[1] for row in rows],
            self._vectors(vectors, len(rows)),
        )

    def import_vectors(self, names, vectors):
        """Import aligned legacy names/vectors atomically without API requests."""
        names = [self._name(name) for name in names]
        vectors = self._vectors(vectors, len(names))
        with closing(self._connect()) as db, db:
            before = db.total_changes
            db.executemany(
                "INSERT OR IGNORE INTO animals (name, name_key, embedding) VALUES (?, ?, ?)",
                [
                    (name, name.casefold(), vector.tobytes())
                    for name, vector in zip(names, vectors)
                ],
            )
            return db.total_changes - before

    def add_animals(self, names, *, client=None, batch_size=256):
        """Embed only missing names; commit each successful batch for resumable imports."""
        if isinstance(names, str):
            raise ValueError("Pass a list of animal names, not a single string.")
        if batch_size < 1:
            raise ValueError("batch_size must be positive.")
        unique = {}
        for name in names:
            name = self.normalize_name(name)
            unique.setdefault(name.casefold(), name)
        with closing(self._connect()) as db:
            existing = {row[0] for row in db.execute("SELECT name_key FROM animals")}
        pending = [name for key, name in unique.items() if key not in existing]
        if not pending:
            return 0
        with ExitStack() as stack:
            if client is None:
                client = create_embedding_client()
                stack.callback(client.close)
            added = 0
            for start in range(0, len(pending), batch_size):
                batch = pending[start: start + batch_size]
                response = client.embeddings.create(
                    input=batch, model=self.model, dimensions=self.dimensions
                )
                items = sorted(response.data, key=lambda item: item.index)
                if [item.index for item in items] != list(range(len(batch))):
                    raise ValueError(
                        "Embedding response did not match the requested batch."
                    )
                added += self.import_vectors(batch, [item.embedding for item in items])
            return added
