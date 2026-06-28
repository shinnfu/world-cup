import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "data", "source");
const outputDir = path.join(rootDir, "public", "data");

const SOURCE_FILES = {
  tournament: path.join(sourceDir, "world_cup_2026_tournament.json"),
  teams: path.join(sourceDir, "world_cup_2026_teams.json"),
  users: path.join(sourceDir, "world_cup_2026_users.json"),
  matches: path.join(sourceDir, "world_cup_2026_matches.json")
};

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function fail(message) {
  throw new Error(message);
}

function expectArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
  }
}

function ensureUnique(items, selector, label) {
  const seen = new Set();

  for (const item of items) {
    const key = selector(item);
    if (seen.has(key)) {
      fail(`Duplicate ${label}: ${key}`);
    }
    seen.add(key);
  }
}

function validateUsers(users) {
  expectArray(users, "users");
  ensureUnique(users, (user) => user.id, "user id");

  for (const user of users) {
    if (!user.id || !user.displayName) {
      fail("Each user must have id and displayName.");
    }
  }
}

function validateTeams(teams) {
  expectArray(teams, "teams");
  ensureUnique(teams, (team) => team.code, "team code");

  for (const team of teams) {
    if (!team.code || !team.name || !team.shortName || !team.flagAsset) {
      fail("Each team must have code, name, shortName, and flagAsset.");
    }
  }
}

function validateStages(tournament) {
  expectArray(tournament.stages, "tournament.stages");
  ensureUnique(tournament.stages, (stage) => stage.id, "stage id");
  ensureUnique(tournament.stages, (stage) => stage.order, "stage order");

  if (!tournament.pointsByStage || typeof tournament.pointsByStage !== "object") {
    fail("tournament.pointsByStage must be an object.");
  }

  for (const stage of tournament.stages) {
    if (!stage.id || !stage.label || !stage.shortLabel) {
      fail("Each stage must have id, label, and shortLabel.");
    }

    if (typeof tournament.pointsByStage[stage.id] !== "number") {
      fail(`Missing numeric pointsByStage value for stage ${stage.id}.`);
    }
  }
}

function validateMatches(matches, tournament, teams) {
  expectArray(matches, "matches");
  ensureUnique(matches, (match) => match.id, "match id");

  const stageIds = new Set(tournament.stages.map((stage) => stage.id));
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const teamCodes = new Set(teams.map((team) => team.code));

  for (const match of matches) {
    if (!stageIds.has(match.stage)) {
      fail(`Unknown stage "${match.stage}" on match ${match.id}.`);
    }

    if (typeof match.matchNumber !== "number") {
      fail(`matchNumber must be a number on match ${match.id}.`);
    }

    if (typeof match.kickoffAt !== "string") {
      fail(`kickoffAt must be a string on match ${match.id}.`);
    }

    if (match.team1Code !== null && match.team1Code !== "" && !teamCodes.has(match.team1Code)) {
      fail(`Unknown team1Code "${match.team1Code}" on ${match.id}.`);
    }

    if (match.team2Code !== null && match.team2Code !== "" && !teamCodes.has(match.team2Code)) {
      fail(`Unknown team2Code "${match.team2Code}" on ${match.id}.`);
    }

    if ((match.team1Code === null || match.team1Code === "") && match.team1Source === null) {
      fail(`team1Code or team1Source is required on ${match.id}.`);
    }

    if ((match.team2Code === null || match.team2Code === "") && match.team2Source === null) {
      fail(`team2Code or team2Source is required on ${match.id}.`);
    }

    if (match.nextMatchId && !matchMap.has(match.nextMatchId)) {
      fail(`nextMatchId "${match.nextMatchId}" on ${match.id} does not exist.`);
    }

    for (const [side, source] of [
      ["team1Source", match.team1Source],
      ["team2Source", match.team2Source]
    ]) {
      if (source === null) {
        continue;
      }

      if (!["winner", "loser"].includes(source.type)) {
        fail(`${side}.type on ${match.id} must be "winner" or "loser".`);
      }

      if (!matchMap.has(source.matchId)) {
        fail(`${side}.matchId "${source.matchId}" on ${match.id} does not exist.`);
      }
    }

    if (match.result?.winnerCode) {
      const validCodes = [match.team1Code, match.team2Code].filter(Boolean);

      if (!validCodes.includes(match.result.winnerCode)) {
        fail(`result.winnerCode on ${match.id} must match one of the team codes.`);
      }
    }
  }
}

function resolveSourceTeamCode(source, matchMap) {
  if (!source) {
    return null;
  }

  const sourceMatch = matchMap.get(source.matchId);
  if (!sourceMatch || !sourceMatch.result?.winnerCode) {
    return null;
  }

  const winnerCode = sourceMatch.result.winnerCode;
  if (source.type === "winner") {
    return winnerCode;
  }

  if (source.type === "loser") {
    const { team1Code, team2Code } = sourceMatch;
    if (!team1Code || !team2Code) {
      return null;
    }
    if (winnerCode === team1Code) {
      return team2Code;
    }
    if (winnerCode === team2Code) {
      return team1Code;
    }
    return null;
  }

  return null;
}

function inferMatchTeamCodes(matches, tournament) {
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const stageMap = new Map(tournament.stages.map((stage) => [stage.id, stage]));
  const sortedMatches = [...matches].sort((left, right) => {
    const leftStage = stageMap.get(left.stage);
    const rightStage = stageMap.get(right.stage);
    return leftStage.order - rightStage.order || left.matchNumber - right.matchNumber;
  });

  let changed = false;

  for (const match of sortedMatches) {
    const resolvedTeam1Code = match.team1Code || resolveSourceTeamCode(match.team1Source, matchMap);
    const resolvedTeam2Code = match.team2Code || resolveSourceTeamCode(match.team2Source, matchMap);

    if (resolvedTeam1Code && match.team1Code && resolvedTeam1Code !== match.team1Code) {
      fail(`Resolved team1Code for ${match.id} does not match explicit team1Code.`);
    }

    if (resolvedTeam2Code && match.team2Code && resolvedTeam2Code !== match.team2Code) {
      fail(`Resolved team2Code for ${match.id} does not match explicit team2Code.`);
    }

    if (!match.team1Code && resolvedTeam1Code) {
      match.team1Code = resolvedTeam1Code;
      changed = true;
    }

    if (!match.team2Code && resolvedTeam2Code) {
      match.team2Code = resolvedTeam2Code;
      changed = true;
    }

    if (match.result?.winnerCode) {
      const validCodes = [match.team1Code, match.team2Code].filter(Boolean);
      if (validCodes.length < 2) {
        fail(`Unable to resolve team codes for ${match.id} while result.winnerCode is set.`);
      }
      if (!validCodes.includes(match.result.winnerCode)) {
        fail(`result.winnerCode on ${match.id} must match resolved team codes.`);
      }
    }
  }

  return changed;
}

async function writeMatchCodesIfNeeded(matches) {
  const existingRaw = await readFile(SOURCE_FILES.matches, "utf8");
  const existing = JSON.parse(existingRaw);

  const wasDifferent = JSON.stringify(existing, null, 2) !== JSON.stringify(matches, null, 2);
  if (!wasDifferent) {
    return false;
  }

  await writeFile(SOURCE_FILES.matches, `${JSON.stringify(matches, null, 2)}\n`, "utf8");
  return true;
}

function inferNextSlot(match, matchMap) {
  if (!match.nextMatchId) {
    return null;
  }

  const nextMatch = matchMap.get(match.nextMatchId);

  if (nextMatch.team1Source?.matchId === match.id) {
    return "team1";
  }

  if (nextMatch.team2Source?.matchId === match.id) {
    return "team2";
  }

  return null;
}

function buildCompiledData({ tournament, teams, users, matches }) {
  const stageMap = new Map(tournament.stages.map((stage) => [stage.id, stage]));
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const teamMap = new Map(teams.map((team) => [team.code, team]));

  const sortedMatches = [...matches].sort((left, right) => {
    const leftStage = stageMap.get(left.stage);
    const rightStage = stageMap.get(right.stage);
    return leftStage.order - rightStage.order || left.matchNumber - right.matchNumber;
  });

  const previousMatchIdsById = new Map(matches.map((match) => [match.id, []]));

  for (const match of matches) {
    if (match.team1Source?.matchId) {
      previousMatchIdsById.get(match.id).push(match.team1Source.matchId);
    }

    if (match.team2Source?.matchId) {
      previousMatchIdsById.get(match.id).push(match.team2Source.matchId);
    }
  }

  const compiledMatches = sortedMatches.map((match) => {
    const stage = stageMap.get(match.stage);

    return {
      id: match.id,
      stage: match.stage,
      stageLabel: stage.label,
      stageOrder: stage.order,
      points: tournament.pointsByStage[match.stage],
      matchNumber: match.matchNumber,
      kickoffAt: match.kickoffAt,
      team1Code: match.team1Code,
      team2Code: match.team2Code,
      team1: match.team1Code ? teamMap.get(match.team1Code) : null,
      team2: match.team2Code ? teamMap.get(match.team2Code) : null,
      team1Source: match.team1Source,
      team2Source: match.team2Source,
      previousMatchIds: previousMatchIdsById.get(match.id),
      nextMatch: match.nextMatchId
        ? {
            matchId: match.nextMatchId,
            slot: inferNextSlot(match, matchMap)
          }
        : null,
      result: match.result
    };
  });

  const matchesById = Object.fromEntries(compiledMatches.map((match) => [match.id, match]));
  const stages = [...tournament.stages]
    .sort((left, right) => left.order - right.order)
    .map((stage) => ({
      ...stage,
      matchIds: compiledMatches.filter((match) => match.stage === stage.id).map((match) => match.id)
    }));

  const bracket = Object.fromEntries(stages.map((stage) => [stage.id, stage.matchIds]));

  return {
    generatedAt: new Date().toISOString(),
    tournament: {
      id: tournament.id,
      title: tournament.title,
      timezone: tournament.timezone,
      pointsByStage: tournament.pointsByStage
    },
    teams: Object.fromEntries(teams.map((team) => [team.code, team])),
    users,
    stages,
    bracket,
    matches: compiledMatches,
    matchesById
  };
}

async function main() {
  try {
    const [tournament, teams, users, matches] = await Promise.all([
      readJson(SOURCE_FILES.tournament),
      readJson(SOURCE_FILES.teams),
      readJson(SOURCE_FILES.users),
      readJson(SOURCE_FILES.matches)
    ]);

    validateStages(tournament);
    validateTeams(teams);
    validateUsers(users);
    validateMatches(matches, tournament, teams);

    const teamCodesChanged = inferMatchTeamCodes(matches, tournament);
    if (teamCodesChanged) {
      const updated = await writeMatchCodesIfNeeded(matches);
      if (updated) {
        console.log("Updated data/source/world_cup_2026_matches.json with inferred team codes.");
      }
    }

    validateMatches(matches, tournament, teams);

    const compiled = buildCompiledData({ tournament, teams, users, matches });

    await mkdir(outputDir, { recursive: true });
    await writeFile(
      path.join(outputDir, "tournament.json"),
      `${JSON.stringify(compiled, null, 2)}\n`,
      "utf8"
    );

    console.log("Built public/data/tournament.json");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Source data files were not found.");
      console.error("Create these files first:");
      console.error("- data/source/world_cup_2026_tournament.json");
      console.error("- data/source/world_cup_2026_teams.json");
      console.error("- data/source/world_cup_2026_users.json");
      console.error("- data/source/world_cup_2026_matches.json");
      console.error("You can start by copying the *.template.json files.");
      process.exitCode = 1;
      return;
    }

    console.error(error.message);
    process.exitCode = 1;
  }
}

await main();
