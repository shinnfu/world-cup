import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sourceDir = path.join(rootDir, "data", "source");
const outputDir = path.join(rootDir, "firebase");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function toLoginEmail(userId) {
  return `${userId}@worldcup2026.local`;
}

function toSeed({ users, matches }) {
  const allowedUsers = Object.fromEntries(
    users.map((user) => [
      user.id,
      {
        email: toLoginEmail(user.id),
        displayName: user.displayName
      }
    ])
  );

  const matchMeta = Object.fromEntries(
    matches.map((match) => [
      match.id,
      {
        kickoffAtMs: new Date(match.kickoffAt).getTime(),
        team1Code: match.team1Code,
        team2Code: match.team2Code,
        stage: match.stage
      }
    ])
  );

  return {
    allowedUsers,
    matchMeta
  };
}

async function main() {
  const [users, matches] = await Promise.all([
    readJson(path.join(sourceDir, "world_cup_2026_users.json")),
    readJson(path.join(sourceDir, "world_cup_2026_matches.json"))
  ]);

  const seed = toSeed({ users, matches });

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outputDir, "firebase-database-seed.json"),
      `${JSON.stringify(seed, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(outputDir, "firebase-allowed-users.json"),
      `${JSON.stringify(seed.allowedUsers, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(outputDir, "firebase-match-meta.json"),
      `${JSON.stringify(seed.matchMeta, null, 2)}\n`,
      "utf8"
    )
  ]);

  console.log("Built firebase/firebase-database-seed.json");
  console.log("Built firebase/firebase-allowed-users.json");
  console.log("Built firebase/firebase-match-meta.json");
}

await main();
