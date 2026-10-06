"""Small local embedding neighborhoods, projected with classical MDS."""

import numpy as np


def neighbor_graph(engine, results, center_name="Your input", center_id=None):
    if results.empty:
        return {"nodes": [], "edges": [], "distances": [], "total": len(engine.df)}
    positions = engine.df.index.get_indexer(results.index)
    vectors = engine.embeddings[positions].astype(np.float64)
    size = len(results) + 1
    squared = np.zeros((size, size))
    squared[1:, 1:] = np.maximum(0, 2 - 2 * np.clip(vectors @ vectors.T, -1, 1))
    squared[0, 1:] = squared[1:, 0] = results["distance"].to_numpy() ** 2
    np.fill_diagonal(squared, 0)
    # Double centering recovers a Gram matrix from the full-vector distances.
    gram = -0.5 * (
        squared
        - squared.mean(axis=0)[None, :]
        - squared.mean(axis=1)[:, None]
        + squared.mean()
    )
    values, axes = np.linalg.eigh(gram)
    order = np.argsort(values)[::-1][:2]
    points = axes[:, order] * np.sqrt(np.maximum(values[order], 0))
    # Stabilize axis signs for a repeatable layout.
    for column in range(2):
        if points[np.argmax(np.abs(points[:, column])), column] < 0:
            points[:, column] *= -1
    extent = max(float(np.abs(points).max()), 1e-9)
    points = 0.5 + points / (2 * extent)
    nodes = [{"name": center_name, "animal_id": center_id, "is_center": True}]
    nodes.extend(
        {"name": str(row.animals), "animal_id": int(index), "is_center": False}
        for index, row in results.iterrows()
    )
    for node, point in zip(nodes, points):
        node.update(x=float(point[0]), y=float(point[1]))
    distances = np.sqrt(squared)
    pairs = set()
    for i in range(size):
        nearest = [int(j) for j in np.argsort(distances[i], kind="stable") if j != i][
            :3
        ]
        pairs.update(tuple(sorted((i, j))) for j in nearest)
    return {
        "nodes": nodes,
        "edges": [dict(source=i, target=j) for i, j in sorted(pairs)],
        "distances": distances.tolist(),
        "total": len(engine.df),
    }
