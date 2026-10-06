"""Export a consistent SQLite snapshot for uploading to the Railway volume."""

import argparse
import sqlite3
from contextlib import closing
from pathlib import Path


def export_database(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if destination.exists():
        raise FileExistsError(f"Refusing to overwrite {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Read-only mode avoids silently creating an empty source database.
    with closing(sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)) as src:
        with closing(sqlite3.connect(destination)) as dst:
            src.backup(dst)
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument(
        "--source", type=Path,
        default=Path(__file__).resolve().parents[1] / "backend/embeds/animals.sqlite3",
    )
    args = parser.parse_args()
    print(export_database(args.source, args.destination))
