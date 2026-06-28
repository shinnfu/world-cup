import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function parseEnvFile(filePath) {
  const contents = readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadLocalEnv() {
  const envFiles = [".env", ".env.local"];

  for (const envFile of envFiles) {
    const filePath = path.join(rootDir, envFile);
    if (!existsSync(filePath)) continue;

    const entries = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(entries)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

function printUsage() {
  console.log("Usage:");
  console.log("  node scripts/firebase-import.mjs <database-path> <json-file>");
  console.log("Example:");
  console.log("  node scripts/firebase-import.mjs /matchMeta firebase/firebase-match-meta.json");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [databasePath, jsonFile] = process.argv.slice(2);

if (!databasePath || !jsonFile) {
  printUsage();
  process.exit(1);
}

const absoluteJsonPath = path.resolve(rootDir, jsonFile);

if (!existsSync(absoluteJsonPath)) {
  fail(`JSON file not found: ${jsonFile}`);
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  fail("Set FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID before running this command.");
}

const firebaseBin = path.join(rootDir, "node_modules", "firebase-tools", "lib", "bin", "firebase.js");
let command;
let args;

if (existsSync(firebaseBin)) {
  command = process.execPath;
  args = [firebaseBin, "database:set", databasePath, absoluteJsonPath, "--project", projectId];
  console.log(`Running: ${process.execPath} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`);
} else {
  command = "npx";
  args = ["--yes", "-p", "firebase-tools", "firebase", "database:set", databasePath, absoluteJsonPath, "--project", projectId];
  console.log(`Running: npx ${args.join(" ")}`);
}

const result = spawnSync(command, args, {
  cwd: rootDir,
  stdio: "inherit",
  shell: false
});

if (result.error) {
  fail(result.error.message);
}

process.exit(result.status ?? 1);
