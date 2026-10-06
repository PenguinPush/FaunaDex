"""Frozen identifier descriptions and query vectors for the six bundled photos."""

import hashlib
import json
from pathlib import Path

from backend.app.image_recognizer import AnimalFeatures

CACHE_PATH = Path(__file__).parent / "cache" / "demo_images.json"


def image_digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def cached_demo(filename, image_path, store):
    try:
        data = json.loads(CACHE_PATH.read_text())
        item = data["images"][filename]
    except (FileNotFoundError, KeyError, json.JSONDecodeError):
        raise ValueError(
            "Demo cache is missing. Run python -m backend.demo.prepare_cache."
        ) from None
    if (
        item["image_sha256"] != image_digest(image_path)
        or item["embedding_model"] != store.model
        or item["dimensions"] != store.dimensions
    ):
        raise ValueError(
            "Demo cache is outdated. Run python -m backend.demo.prepare_cache."
        )
    features = AnimalFeatures.model_validate(item["features"])
    return features, item["embedding"]
