"""Generate and freeze the six demo descriptions and embeddings: python -m backend.demo.prepare_cache."""

import json
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

from backend.app.image_recognizer import ImageRecognizer
from backend.app.semantic_search import SemanticSearch
from backend.demo.app import DEMO_IMAGES, demo_image_bytes
from backend.demo.demo_cache import CACHE_PATH, cached_demo, image_digest
from backend.demo.paths import DEMO_IMAGE_DIR


def main():
    engine = SemanticSearch()
    data = json.loads(CACHE_PATH.read_text()) if CACHE_PATH.exists() else {"images": {}}

    def generate(filename):
        path = DEMO_IMAGE_DIR / filename
        try:
            cached_demo(filename, path, engine.store)
            return filename, None
        except ValueError:
            pass
        recognizer = ImageRecognizer()
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory) / "photo.jpg"
            image.write_bytes(demo_image_bytes(path, path.stat().st_mtime_ns))
            features = recognizer.analyze(image)
        if not features.animal_present:
            raise ValueError("Identifier did not detect an animal.")
        query = "; ".join(features.search_labels())
        return filename, dict(
            image_sha256=image_digest(path),
            identifier_model=recognizer.model,
            generated_at=datetime.now(timezone.utc).isoformat(),
            embedding_model=engine.store.model,
            dimensions=engine.store.dimensions,
            features=features.model_dump(),
            embedding=engine.get_embedding(query),
        )

    failures = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {
            pool.submit(generate, filename): filename
            for filename in sorted(DEMO_IMAGES)
        }
        for future in as_completed(futures):
            filename = futures[future]
            try:
                _, item = future.result()
                if item is not None:
                    data["images"][filename] = item
                    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
                    temporary = CACHE_PATH.with_suffix(".tmp")
                    temporary.write_text(json.dumps(data, indent=2) + "\n")
                    temporary.replace(CACHE_PATH)
                print(f"{filename}: cached", flush=True)
            except Exception as error:
                # Provider exceptions may contain sensitive URLs; report only the type.
                print(f"{filename}: failed ({type(error).__name__})", flush=True)
                failures.append(filename)
    if failures:
        raise SystemExit("Some demo entries could not be generated; rerun to resume.")


if __name__ == "__main__":
    main()
