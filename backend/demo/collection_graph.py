"""Cached full-collection projection and sparse, exact nearest-neighbor edges."""

import numpy as np


class CollectionGraph:
    def __init__(self, engine):
        self.ids = [int(i) for i in engine.df.index]
        self.vectors = engine.embeddings
        self.mean = self.vectors.mean(axis=0)
        centered = self.vectors - self.mean
        # Deterministic randomized PCA: work with a small subspace, not an N×N eigensystem.
        width = min(10, *centered.shape)
        rng = np.random.default_rng(42)
        q, _ = np.linalg.qr(centered @ rng.standard_normal((centered.shape[1], width)))
        for _ in range(5):
            q, _ = np.linalg.qr(centered @ (centered.T @ q))
        _, _, axes = np.linalg.svd(q.T @ centered, full_matrices=False)
        self.axes = np.zeros((centered.shape[1], 2))
        self.axes[:, : min(2, len(axes))] = axes[:2].T
        points = centered @ self.axes
        edges = set()
        k = min(3, len(self.ids) - 1)
        if k:
            for start in range(0, len(self.ids), 128):
                similarities = self.vectors[start : start + 128] @ self.vectors.T
                for offset, scores in enumerate(similarities):
                    i = start + offset
                    scores[i] = -np.inf
                    for j in np.argpartition(-scores, k - 1)[:k]:
                        edges.add(tuple(sorted((i, int(j)))))
        self.data = {
            "nodes": [
                dict(
                    animal_id=animal_id,
                    name=str(name),
                    x=float(point[0]),
                    y=float(point[1]),
                )
                for animal_id, name, point in zip(self.ids, engine.df.animals, points)
            ],
            "edges": [
                dict(source=self.ids[i], target=self.ids[j]) for i, j in sorted(edges)
            ],
            "total": len(self.ids),
        }

    def project_query(self, vector):
        point = (vector - self.mean) @ self.axes
        distances = np.sqrt(
            np.maximum(0, 2 - 2 * np.clip(self.vectors @ vector, -1, 1))
        )
        return dict(
            x=float(point[0]),
            y=float(point[1]),
            distances={str(i): float(d) for i, d in zip(self.ids, distances)},
        )
