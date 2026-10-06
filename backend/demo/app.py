"""Run from the repository root: .venv/bin/python -m backend.demo.app"""

import logging
import os
import tempfile
from contextlib import closing
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from threading import Lock

import numpy as np
import pandas as pd
from flask import Flask, abort, jsonify, redirect, request, send_file
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.exceptions import HTTPException

from backend.app.embedding_store import DEFAULT_STORE_PATH, AnimalEmbeddingStore
from backend.app.image_recognizer import GeminiBillingError
from backend.app.semantic_search import DISTANCE_CUTOFF, SemanticSearch
from backend.demo.collection_graph import CollectionGraph
from backend.demo.demo_cache import cached_demo
from backend.demo.neighbor_graph import neighbor_graph
from backend.demo.paths import DEMO_IMAGE_DIR

DEMO_IMAGES = frozenset(
    {
        "scarlet-tanager.jpg",
        "american-paddlefish.jpg",
        "british-shorthair.jpg",
        "amano-shrimp.jpg",
        "adelie-penguin.jpg",
        "american-shorthair.jpg",
    }
)


@lru_cache(maxsize=6)
def demo_image_bytes(path, modified_ns):
    """Make bounded upload/display copies without altering the source photos."""
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((1600, 1600))
        output = BytesIO()
        image.save(output, format="JPEG", quality=88, optimize=True)
        return output.getvalue()


def create_app(store_path=None):
    store_path = Path(store_path or os.getenv("EMBEDDING_STORE_PATH") or DEFAULT_STORE_PATH)
    app = Flask(__name__, static_folder=None)
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
    lock = Lock()
    graph_lock = Lock()
    graph_cache = {}

    @app.get("/healthz")
    def health():
        # Liveness stays available while the initial database is uploaded.
        # /api/status reports the imported collection count separately.
        return jsonify(status="ok")

    def collection():
        with graph_lock:
            store = AnimalEmbeddingStore(store_path)
            with closing(store._connect()) as db:
                version = tuple(
                    db.execute("SELECT COUNT(*), MAX(id) FROM animals").fetchone()
                )
            if graph_cache.get("version") != version:
                graph_cache["graph"] = CollectionGraph(
                    SemanticSearch(store_path=store_path)
                )
                graph_cache["version"] = version
            return graph_cache["graph"]

    @app.get("/api/graph")
    def full_graph():
        return jsonify(collection().data)

    @app.get("/")
    def index():
        return redirect(os.getenv("DEMO_URL", "http://localhost:3000"))

    @app.get("/demo-images/<filename>")
    def demo_image(filename):
        if filename not in DEMO_IMAGES:
            abort(404)
        path = DEMO_IMAGE_DIR / filename
        if not path.is_file():
            abort(404)
        data = demo_image_bytes(path, path.stat().st_mtime_ns)
        return send_file(BytesIO(data), mimetype="image/jpeg", max_age=3600)

    @app.get("/api/status")
    def status():
        store = AnimalEmbeddingStore(store_path)
        with closing(store._connect()) as db:
            count = db.execute("SELECT COUNT(*) FROM animals").fetchone()[0]
        return jsonify(count=count)

    @app.post("/api/search")
    def search():
        try:
            count = int(request.form.get("count", "10"))
        except ValueError:
            return jsonify(error="Choose a match count between 1 and 20."), 400
        if not 1 <= count <= 20:
            return jsonify(error="Choose a match count between 1 and 20."), 400
        engine = SemanticSearch(store_path=store_path)
        upload = request.files.get("image")
        demo = request.form.get("demo")
        if demo:
            if demo not in DEMO_IMAGES or upload or request.form.get("text"):
                raise ValueError("Choose one valid demo image.")
            features, embedding = cached_demo(demo, DEMO_IMAGE_DIR / demo, engine.store)
            query = features.display_description()
            _, results, _ = engine.search_embedding(embedding, query, count)
        elif upload:
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "image"
                upload.save(path)
                try:
                    with Image.open(path) as image:
                        if image.format not in ("JPEG", "PNG", "WEBP"):
                            raise ValueError("Use a JPEG, PNG, or WebP image.")
                        image.verify()
                except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
                    raise ValueError(
                        "Upload a valid JPEG, PNG, or WebP image."
                    ) from None
                query, results, _ = engine.classify_image(str(path), count)
                # Retrieval still uses the species hypothesis; display observations only.
                features = engine.recognizer.last_features
                query = (
                    features.display_description()
                    if features is not None
                    else "No animal visible"
                )
        else:
            text = request.form.get("text", "").strip()
            if len(text) > 4000:
                raise ValueError("Keep the description under 4,000 characters.")
            query, results, _ = engine.search_text(text, count)
        matches = [
            {
                "name": row.animals,
                "distance": float(row.distance),
                "similarity": float(1 - row.distance**2 / 2),
            }
            for row in results.itertuples()
        ]
        return jsonify(
            query=query,
            matches=matches,
            total=len(engine.df),
            cutoff=DISTANCE_CUTOFF,
            cached=bool(demo),
            graph=neighbor_graph(engine, results),
            map_query=collection().project_query(engine.last_query_vector)
            if engine.last_query_vector is not None
            else None,
        )

    @app.get("/api/neighbors/<int:animal_id>")
    def neighbors(animal_id):
        # Explore an existing vector directly: no provider requests or re-embedding.
        engine = SemanticSearch(store_path=store_path)
        if animal_id not in engine.df.index:
            abort(404)
        try:
            count = int(request.args.get("count", "10"))
        except ValueError:
            raise ValueError("Choose a match count between 1 and 20.") from None
        if not 1 <= count <= 20:
            raise ValueError("Choose a match count between 1 and 20.")
        position = engine.df.index.get_loc(animal_id)
        similarities = engine.embeddings @ engine.embeddings[position]
        positions = [int(i) for i in np.argsort(-similarities) if i != position][:count]
        distances = np.sqrt(
            np.maximum(0, 2 - 2 * np.clip(similarities[positions], -1, 1))
        )
        results = pd.DataFrame(
            {"animals": engine.df.iloc[positions]["animals"], "distance": distances}
        )
        extra = {}
        if request.args.get("map") == "1":
            point = collection().project_query(engine.embeddings[position])
            point.update(
                animal_id=animal_id, name=str(engine.df.loc[animal_id, "animals"])
            )
            point["distances"][str(animal_id)] = 0.0
            extra["map_query"] = point
        if results.empty:
            return jsonify(
                graph={
                    "nodes": [
                        dict(
                            name=str(engine.df.loc[animal_id, "animals"]),
                            animal_id=animal_id,
                            is_center=True,
                            x=0.5,
                            y=0.5,
                        )
                    ],
                    "edges": [],
                    "distances": [[0]],
                    "total": len(engine.df),
                },
                **extra,
            )
        return jsonify(
            graph=neighbor_graph(
                engine, results, str(engine.df.loc[animal_id, "animals"]), animal_id
            ),
            **extra,
        )

    @app.post("/api/animals")
    def add_animal():
        data = request.get_json(silent=True)
        name = data.get("name") if isinstance(data, dict) else None
        if not isinstance(name, str) or not name.strip() or len(name) > 200:
            raise ValueError("Enter an animal name between 1 and 200 characters.")
        # Serialize local additions so simultaneous duplicate submissions don't embed twice.
        with lock:
            store = AnimalEmbeddingStore(store_path)
            name = store.normalize_name(name)
            added = store.add_animals([name])
            with closing(store._connect()) as db:
                animal_id, saved_name = db.execute(
                    "SELECT id, name FROM animals WHERE name_key = ?",
                    (" ".join(name.split()).casefold(),),
                ).fetchone()
        return jsonify(added=added, name=saved_name, animal_id=animal_id)

    @app.errorhandler(GeminiBillingError)
    def billing_required(error):
        return jsonify(error=str(error)), 402

    @app.errorhandler(ValueError)
    def invalid_input(error):
        return jsonify(error=str(error)), 400

    @app.errorhandler(Exception)
    def failed_request(error):
        if isinstance(error, HTTPException):
            return jsonify(error=error.description), error.code
        # Provider exceptions may contain credentials in URLs. Never send them to the browser.
        return jsonify(
            error="The request failed. Check your API keys, provider access, and embedding database."
        ), 502

    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_app().run(host="127.0.0.1", port=5050, debug=False)
