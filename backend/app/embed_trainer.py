"""Import a dataset once, then embed new animals incrementally."""

import argparse
import os
from pathlib import Path

import numpy as np
from datasets import load_dataset
from dotenv import load_dotenv

from backend.app.embedding_store import DEFAULT_STORE_PATH, AnimalEmbeddingStore

LEGACY_PATH = (
        Path(__file__).resolve().parents[1] / "embeds" / "embeds-openai-large-gen3.npy"
)


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--store", type=Path, default=DEFAULT_STORE_PATH)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument(
        "--add", nargs="+", metavar="ANIMAL", help="Embed only these new animals"
    )
    modes.add_argument(
        "--import-legacy",
        type=Path,
        nargs="?",
        const=LEGACY_PATH,
        help="Import existing .npy vectors; dataset must match their original row order",
    )
    parser.add_argument("--dataset", default="PenguinPush/animals-massive")
    parser.add_argument("--split", default="train")
    args = parser.parse_args()
    store = AnimalEmbeddingStore(args.store)
    if args.add is not None:
        added = store.add_animals(args.add)
    else:
        dataset = load_dataset(
            args.dataset, split=args.split, token=os.getenv("HF_TOKEN") or None
        )
        if not dataset.column_names:
            raise ValueError("The dataset must contain at least one column of animal names.")
        names = list(dataset[dataset.column_names[0]])
        if args.import_legacy is not None:
            added = store.import_vectors(
                names, np.load(args.import_legacy, allow_pickle=False)
            )
        else:
            added = store.add_animals(names)
    print(f"Added {added} animals to {store.path}")


if __name__ == "__main__":
    main()
