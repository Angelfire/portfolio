import { writeFile } from "node:fs/promises";

const username = process.env.GITHUB_USERNAME || "angelfire";
const endpoint = `https://github-contributions-api.jogruber.de/v4/${username}`;

const response = await fetch(endpoint);
if (!response.ok) {
  throw new Error(
    `Failed to fetch contributions: ${response.status} ${response.statusText}`,
  );
}

const data = await response.json();
const output = {
  username,
  fetchedAt: new Date().toISOString(),
  data,
};

await writeFile(
  new URL("../contributions-cache.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

console.log("Updated contributions-cache.json");
