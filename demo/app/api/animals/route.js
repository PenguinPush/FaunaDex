import { Profanity } from "@2toad/profanity";

export const runtime = "nodejs";

const profanity = new Profanity({
  languages: ["en"],
  wholeWord: true,
  unicodeWordBoundaries: true,
});

// Exact species names only: these exceptions must not allow arbitrary profane phrases.
const animalNames = new Set([
  "great tit",
  "blue tit",
  "eurasian blue tit",
  "coal tit",
  "crested tit",
  "marsh tit",
  "willow tit",
  "long-tailed tit",
  "wild ass",
  "african wild ass",
  "asiatic wild ass",
  "somali wild ass",
  "tibetan wild ass",
]);

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json(
      { error: "Enter a valid animal name." },
      { status: 400 },
    );
  }
  if (
    typeof data?.name !== "string" ||
    !data.name.trim() ||
    data.name.length > 200
  ) {
    return Response.json(
      { error: "Enter an animal name between 1 and 200 characters." },
      { status: 400 },
    );
  }
  const name = data.name
    .normalize("NFKC")
    .replace(/\p{Cf}/gu, "")
    .trim()
    .replace(/\s+/g, " ");
  if (!name || name.length > 200) {
    return Response.json(
      { error: "Enter a valid animal name." },
      { status: 400 },
    );
  }
  if (!animalNames.has(name.toLowerCase()) && profanity.exists(name)) {
    return Response.json(
      { error: "Please enter an animal name without profanity." },
      { status: 400 },
    );
  }
  const backend = (process.env.BACKEND_URL || "http://127.0.0.1:5050").replace(
    /\/$/,
    "",
  );
  try {
    const response = await fetch(`${backend}/api/animals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(35000),
    });
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json(
      { error: "Could not add the animal. Please try again." },
      { status: 502 },
    );
  }
}
