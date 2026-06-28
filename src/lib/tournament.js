const STATUS_META = {
  team_pending: {
    key: "team_pending",
    label: "対戦国未確定",
    chipClassName: "chip chip-pending"
  },
  open: {
    key: "open",
    label: "投票受付中",
    chipClassName: "chip chip-open"
  },
  closed: {
    key: "closed",
    label: "受付終了",
    chipClassName: "chip chip-closed"
  },
  final: {
    key: "final",
    label: "結果確定",
    chipClassName: "chip chip-final"
  }
};

export function getBaseAssetUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (!assetPath.startsWith("/")) {
    return assetPath;
  }

  return `${import.meta.env.BASE_URL}${assetPath.slice(1)}`;
}

export function formatKickoff(value) {
  if (!value) {
    return "未定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

export function formatGeneratedAt(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

export function getMatchStatus(match, now = Date.now()) {
  if (match.result?.winnerCode) {
    return STATUS_META.final;
  }

  if (!match.team1Code || !match.team2Code) {
    return STATUS_META.team_pending;
  }

  const kickoffTime = new Date(match.kickoffAt).getTime();
  if (Number.isNaN(kickoffTime)) {
    return STATUS_META.team_pending;
  }

  return now < kickoffTime ? STATUS_META.open : STATUS_META.closed;
}

export function getStatusCounts(matches, now = Date.now()) {
  const counts = {
    team_pending: 0,
    open: 0,
    closed: 0,
    final: 0
  };

  for (const match of matches) {
    const status = getMatchStatus(match, now);
    counts[status.key] += 1;
  }

  return counts;
}

export function getSourceLabel(source) {
  if (!source) {
    return "未定";
  }

  return `${source.matchId} ${source.type === "winner" ? "勝者" : "敗者"}`;
}

export function getTeamSlotLabel(match, side) {
  const team = side === "team1" ? match.team1 : match.team2;
  const source = side === "team1" ? match.team1Source : match.team2Source;

  if (team) {
    return team.shortName || team.name;
  }

  return getSourceLabel(source);
}

export function getVoteEntriesForMatch(votesByMatch, matchId) {
  return votesByMatch[matchId] || {};
}

export function getVoteTallies(match, votesByMatch) {
  const entries = Object.values(getVoteEntriesForMatch(votesByMatch, match.id));
  const tallies = {};

  if (match.team1Code) {
    tallies[match.team1Code] = 0;
  }

  if (match.team2Code) {
    tallies[match.team2Code] = 0;
  }

  for (const vote of entries) {
    if (vote?.predictedWinnerCode) {
      tallies[vote.predictedWinnerCode] = (tallies[vote.predictedWinnerCode] || 0) + 1;
    }
  }

  return tallies;
}

export function getVoteShare(match, votesByMatch) {
  const tallies = getVoteTallies(match, votesByMatch);
  const left = match.team1Code ? tallies[match.team1Code] || 0 : 0;
  const right = match.team2Code ? tallies[match.team2Code] || 0 : 0;
  const total = left + right;

  return {
    left,
    right,
    total,
    leftRatio: total > 0 ? left / total : 0,
    rightRatio: total > 0 ? right / total : 0
  };
}

export function getTeamVoteTone(side, ratio) {
  if (!ratio) {
    return "transparent";
  }

  const alpha = 0.12 + ratio * 0.34;

  if (side === "left") {
    return `rgba(224, 86, 71, ${alpha.toFixed(3)})`;
  }

  return `rgba(55, 108, 227, ${alpha.toFixed(3)})`;
}

export function getVotesForUsers(users, votesByMatch, matchId) {
  const voteMap = getVoteEntriesForMatch(votesByMatch, matchId);

  return users.map((user) => ({
    user,
    vote: voteMap[user.id] || null
  }));
}

export function getRankings(users, matches, votesByMatch) {
  const rows = users.map((user) => ({
    user,
    totalPoints: 0,
    correctCount: 0,
    votedCount: 0
  }));

  const rowByUserId = Object.fromEntries(rows.map((row) => [row.user.id, row]));

  for (const match of matches) {
    const votes = getVoteEntriesForMatch(votesByMatch, match.id);

    for (const vote of Object.values(votes)) {
      const row = rowByUserId[vote.userId];
      if (row) {
        row.votedCount += 1;
      }
    }

    if (!match.result?.winnerCode) {
      continue;
    }

    const correctUserIds = Object.values(votes)
      .filter((vote) => vote.predictedWinnerCode === match.result.winnerCode)
      .map((vote) => vote.userId);

    if (correctUserIds.length === 0) {
      continue;
    }

    const share = match.points / correctUserIds.length;

    for (const userId of correctUserIds) {
      const row = rowByUserId[userId];
      if (!row) {
        continue;
      }
      row.totalPoints += share;
      row.correctCount += 1;
    }
  }

  rows.sort((left, right) => {
    return right.totalPoints - left.totalPoints || right.correctCount - left.correctCount || left.user.displayName.localeCompare(right.user.displayName, "ja");
  });

  let previousPoints = null;
  let previousRank = 0;

  for (const [index, row] of rows.entries()) {
    if (previousPoints !== null && row.totalPoints === previousPoints) {
      row.rank = previousRank;
    } else {
      row.rank = index + 1;
      previousRank = row.rank;
      previousPoints = row.totalPoints;
    }

    row.isFirst = row.rank === 1;
    row.isSecond = row.rank === 2;
  }

  return rows;
}

export function getUserPointHistory(userId, matches, votesByMatch) {
  const rows = [];

  for (const match of matches) {
    if (!match.result?.winnerCode) {
      continue;
    }

    const votes = getVoteEntriesForMatch(votesByMatch, match.id);
    const userVote = votes[userId] || null;
    const correctUserIds = Object.values(votes)
      .filter((vote) => vote.predictedWinnerCode === match.result.winnerCode)
      .map((vote) => vote.userId);

    const earnedPoints =
      userVote && userVote.predictedWinnerCode === match.result.winnerCode && correctUserIds.length > 0
        ? match.points / correctUserIds.length
        : 0;

    rows.push({
      matchId: match.id,
      stageLabel: match.stageLabel,
      kickoffAt: match.kickoffAt,
      team1: match.team1,
      team2: match.team2,
      pickedCode: userVote?.predictedWinnerCode || null,
      winnerCode: match.result.winnerCode,
      earnedPoints
    });
  }

  return rows.sort((left, right) => new Date(right.kickoffAt).getTime() - new Date(left.kickoffAt).getTime());
}

export function getStageColumns(stages, matchesById) {
  return stages.map((stage) => ({
    ...stage,
    matches: stage.matchIds.map((matchId) => matchesById[matchId]).filter(Boolean)
  }));
}

export function getUpcomingMatches(matches, now = Date.now(), limit = 3) {
  return matches
    .filter((match) => !match.result?.winnerCode)
    .filter((match) => match.kickoffAt && new Date(match.kickoffAt).getTime() >= now)
    .sort((left, right) => new Date(left.kickoffAt).getTime() - new Date(right.kickoffAt).getTime())
    .slice(0, limit);
}

export function getFinishedMatches(matches, limit = 5) {
  return matches
    .filter((match) => Boolean(match.result?.winnerCode))
    .sort((left, right) => new Date(right.kickoffAt).getTime() - new Date(left.kickoffAt).getTime())
    .slice(0, limit);
}

export function getOpenMatches(matches, now = Date.now()) {
  return matches.filter((match) => getMatchStatus(match, now).key === "open");
}

export function getStagePointSummary(tournament) {
  return [
    { label: "R32", value: tournament.pointsByStage.roundOf32 },
    { label: "R16", value: tournament.pointsByStage.roundOf16 },
    { label: "QF/SF/3P/F", value: tournament.pointsByStage.final }
  ];
}
