import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const teamsPath = path.join(rootDir, "data", "source", "world_cup_2026_teams.json");
const outputDir = path.join(rootDir, "public", "flags");
const sourceUrl = "https://nucleoapp.com/svg-flag-icons";

const tagByCode = {
  ALG: "Algeria",
  ARG: "Argentina",
  AUS: "Australia",
  AUT: "Austria",
  BEL: "Belgium",
  BIH: "Bosnia Herzegovina",
  BRA: "Brazil",
  CAN: "Canada",
  CIV: "Ivory Coast",
  COD: "Democratic Republic Congo",
  COL: "Colombia",
  CPV: "Cape Verde",
  CRO: "Croatia",
  ECU: "Ecuador",
  EGY: "Egypt",
  ENG: "England",
  ESP: "Spain",
  FRA: "France",
  GER: "Germany",
  GHA: "Ghana",
  JPN: "Japan",
  MAR: "Morocco",
  MEX: "Mexico",
  NED: "Netherlands",
  NOR: "Norway",
  PAR: "Paraguay",
  POR: "Portugal",
  RSA: "South Africa",
  SEN: "Senegal",
  SUI: "Switzerland",
  SWE: "Sweden",
  USA: "United States USA"
};

function fail(message) {
  throw new Error(message);
}

function parseFlagSvgs(html) {
  const items = [...html.matchAll(/<li class="col-1 js-list-filter__item" data-filter-tags="([^"]+)">([\s\S]*?)<\/li>/g)];
  const flagSvgByTag = new Map();

  for (const [, tag, block] of items) {
    const svgMatch = block.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      flagSvgByTag.set(tag, svgMatch[0]);
    }
  }

  return flagSvgByTag;
}

async function fetchHtml(url) {
  const response = await fetch(url);

  if (!response.ok) {
    fail(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function main() {
  const teams = JSON.parse(await readFile(teamsPath, "utf8"));
  const html = await fetchHtml(sourceUrl);
  const flagSvgByTag = parseFlagSvgs(html);

  await mkdir(outputDir, { recursive: true });

  for (const team of teams) {
    const expectedTag = tagByCode[team.code];

    if (!expectedTag) {
      fail(`Missing source tag mapping for ${team.code}.`);
    }

    const svg = flagSvgByTag.get(expectedTag);

    if (!svg) {
      fail(`Could not find SVG for ${team.code} (${expectedTag}).`);
    }

    const fileName = `${team.code.toLowerCase()}.svg`;
    const filePath = path.join(outputDir, fileName);
    await writeFile(filePath, `${svg}\n`, "utf8");
  }

  console.log(`Downloaded ${teams.length} flags to public/flags`);
}

await main();
