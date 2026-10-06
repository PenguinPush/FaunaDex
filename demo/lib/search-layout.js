// The API returns unit-vector Euclidean distance: d² / 2 = 1 - cosine similarity.
export function cosineDistance(distance) {
  return Math.max(0, Math.min(2, (distance * distance) / 2));
}

// Inverse of log1p(99 * distance) / log(100), bounded to the 0–1 display scale.
export function inverseLogRadius(distance) {
  const value = Math.max(0, Math.min(1, distance));
  return value === 1 ? 1 : Math.expm1(Math.log(100) * value) / 99;
}

export function radialPositions(collection, query) {
  const points = new Map();
  let index = 0;
  for (const [id, position] of collection) {
    const distance = query.distances[id];
    if (!Number.isFinite(distance)) continue;
    const dx = position.x - query.x,
      dy = position.y - query.y;
    // Direction preserves the collection projection; radius alone encodes similarity.
    const angle =
      Math.hypot(dx, dy) < 1e-10
        ? index * 2.399963229728653
        : Math.atan2(dy, dx);
    const radius = inverseLogRadius(cosineDistance(distance));
    points.set(id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
    index++;
  }
  return points;
}

export function keepRadius(base, point) {
  const radius = Math.hypot(base.x, base.y),
    length = Math.hypot(point.x, point.y);
  if (!radius || !length) return { ...base };
  return { x: (point.x * radius) / length, y: (point.y * radius) / length };
}
