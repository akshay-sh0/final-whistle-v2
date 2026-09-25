const competitions = {
  PL: {
    name: "Premier League",
    historyPath: "data/history/premier-league.json",
    standingsPath: "data/standings/PL.json",
    matchesPath: "data/matches/PL.json",
  },
  PD: {
    name: "La Liga",
    historyPath: "data/history/la-liga.json",
    standingsPath: "data/standings/PD.json",
    matchesPath: "data/matches/PD.json",
  },
};

const currentTeamAliases = {
  PD: {
    "Atlético Madrid": "Club Atlético de Madrid",
    "CD Alavés": "Deportivo Alavés",
    "Deportivo La Coruña": "RC Deportivo La Coruña",
    "Espanyol Barcelona": "RCD Espanyol de Barcelona",
    Levante: "Levante UD",
    Málaga: "Málaga CF",
    "Racing Santander": "Real Racing Club de Santander",
    "Rayo Vallecano": "Rayo Vallecano de Madrid",
    "RC Celta": "RC Celta de Vigo",
    "Real Betis": "Real Betis Balompié",
    "Real Sociedad": "Real Sociedad de Fútbol",
  },
};

const standingsMetadataPath = "data/standings/metadata.json";

const state = {
  history: {},
  standings: {},
  matchInsights: {},
  standingsMetadata: null,
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const viewOrder = [
  "on-this-day",
  "current-table",
  "upcoming",
  "head-to-head",
  "clubs",
];

const elements = {
  historyCompetition: document.querySelector("#history-competition"),
  historyDate: document.querySelector("#history-date"),
  onThisDayResults: document.querySelector("#on-this-day-results"),

  standingsCompetition: document.querySelector("#standings-competition"),
  standingsBody: document.querySelector("#standings-body"),
  standingsLastUpdated: document.querySelector("#standings-last-updated"),

  upcomingCompetition: document.querySelector("#upcoming-competition"),
  upcomingResults: document.querySelector("#upcoming-results"),

  headToHeadCompetition: document.querySelector("#head-to-head-competition"),
  firstClub: document.querySelector("#first-club"),
  secondClub: document.querySelector("#second-club"),
  headToHeadSummary: document.querySelector("#head-to-head-summary"),
  headToHeadOutcomes: document.querySelector("#head-to-head-outcomes"),
  headToHeadRivalry: document.querySelector("#head-to-head-rivalry"),
  headToHeadResults: document.querySelector("#head-to-head-results"),

  clubCompetition: document.querySelector("#club-competition"),
  clubSelect: document.querySelector("#club-select"),
  clubDataRange: document.querySelector("#club-data-range"),
  clubSummary: document.querySelector("#club-summary"),
  clubOutcomes: document.querySelector("#club-outcomes"),
  clubRecords: document.querySelector("#club-records"),
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDayAndMonth(month, day) {
  return `${monthNames[month - 1]} ${day}`;
}

function historyDateRange(history) {
  const dates = history.matches.map((match) => match.date).sort();

  return `${formatShortDate(dates[0])} – ${formatShortDate(dates[dates.length - 1])}`;
}

function normaliseCurrentTeamName(name) {
  return name.replace(/\s+(AFC|FC|CF)$/i, "").trim();
}

function findCurrentTeam(code, historicalName, standings) {
  const currentName = currentTeamAliases[code]?.[historicalName] || historicalName;
  const normalisedName = normaliseCurrentTeamName(currentName);

  return standings.find(
    (row) => normaliseCurrentTeamName(row.team_name) === normalisedName,
  );
}

function decodeHistoryPayload(payload) {
  return {
    ...payload,
    matches: payload.matches.map((row) => {
      const [
        seasonIndex,
        date,
        homeIndex,
        awayIndex,
        homeGoals,
        awayGoals,
        homeHalfTime,
        awayHalfTime,
      ] = row;

      return {
        season: payload.seasons[seasonIndex],
        date,
        home: payload.clubs[homeIndex],
        away: payload.clubs[awayIndex],
        homeGoals,
        awayGoals,
        homeHalfTime,
        awayHalfTime,
      };
    }),
  };
}

async function loadHistory(code) {
  if (state.history[code]) {
    return state.history[code];
  }

  const response = await fetch(competitions[code].historyPath);

  if (!response.ok) {
    throw new Error(`Could not load ${competitions[code].name} history.`);
  }

  const payload = await response.json();
  state.history[code] = decodeHistoryPayload(payload);

  return state.history[code];
}

async function loadStandings(code) {
  if (state.standings[code]) {
    return state.standings[code];
  }

  const response = await fetch(competitions[code].standingsPath);

  if (!response.ok) {
    throw new Error(`Could not load ${competitions[code].name} standings.`);
  }

  state.standings[code] = await response.json();

  return state.standings[code];
}

async function loadMatchInsights(code) {
  if (state.matchInsights[code]) {
    return state.matchInsights[code];
  }

  const response = await fetch(competitions[code].matchesPath);

  if (!response.ok) {
    throw new Error(`Could not load ${competitions[code].name} match data.`);
  }

  state.matchInsights[code] = await response.json();

  return state.matchInsights[code];
}

async function loadStandingsMetadata() {
  if (state.standingsMetadata) {
    return state.standingsMetadata;
  }

  const response = await fetch(standingsMetadataPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load the latest update time.");
  }

  state.standingsMetadata = await response.json();

  return state.standingsMetadata;
}

function formatUpdateTime(timestamp) {
  const updatedAt = new Date(timestamp);

  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error("The latest update time is invalid.");
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(updatedAt);
}

async function renderStandingsStatus() {
  try {
    const metadata = await loadStandingsMetadata();
    const formattedTime = formatUpdateTime(metadata.updated_at);

    elements.standingsLastUpdated.textContent = `Last updated ${formattedTime}`;
    elements.standingsLastUpdated.title = metadata.updated_at;
  } catch {
    elements.standingsLastUpdated.textContent = "Latest update time unavailable";
  }
}

function dateKey(month, day) {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function populateDateOptions() {
  elements.historyDate.replaceChildren();

  monthNames.forEach((monthName, monthIndex) => {
    const maximumDay = new Date(2024, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= maximumDay; day += 1) {
      const option = document.createElement("option");
      option.value = dateKey(monthIndex + 1, day);
      option.textContent = `${day} ${monthName}`;
      elements.historyDate.append(option);
    }
  });
}

function setDateToToday() {
  const today = new Date();
  elements.historyDate.value = dateKey(today.getMonth() + 1, today.getDate());
}

function shiftHistoryDate(offset) {
  const [month, day] = elements.historyDate.value.split("-").map(Number);
  const date = new Date(2024, month - 1, day + offset);
  elements.historyDate.value = dateKey(date.getMonth() + 1, date.getDate());
  renderOnThisDay();
}

function createMatchRow(match) {
  const row = createElement("article", "match-row");

  const date = createElement("span", "match-date", formatDate(match.date));
  const teams = createElement("span", "match-teams");
  const homeTeam = createElement("span", "match-team", match.home);
  const awayTeam = createElement("span", "match-team", match.away);
  teams.append(homeTeam, awayTeam);

  const score = createElement("span", "match-score");
  score.append(
    createElement("span", "match-score-line", String(match.homeGoals)),
    createElement("span", "match-score-line", String(match.awayGoals)),
  );

  row.append(date, teams, score);

  return row;
}

function renderOnThisDay() {
  const code = elements.historyCompetition.value;
  const history = state.history[code];
  const [month, day] = elements.historyDate.value.split("-").map(Number);
  const selectedDate = formatDayAndMonth(month, day);

  const matches = history.matches.filter((match) => {
    const [, matchMonth, matchDay] = match.date.split("-").map(Number);

    return matchMonth === month && matchDay === day;
  });

  elements.onThisDayResults.replaceChildren();

  const heading = createElement(
    "h2",
    "results-heading",
    `${matches.length} ${matches.length === 1 ? "match" : "matches"} played on ${selectedDate}`,
  );

  elements.onThisDayResults.append(heading);

  if (matches.length === 0) {
    const emptyState = createElement(
      "p",
      "empty-state",
      `No historical ${competitions[code].name} matches were played on this date.`,
    );

    elements.onThisDayResults.append(emptyState);
    return;
  }

  const matchesBySeason = new Map();

  matches.forEach((match) => {
    if (!matchesBySeason.has(match.season)) {
      matchesBySeason.set(match.season, []);
    }

    matchesBySeason.get(match.season).push(match);
  });

  const seasons = [...matchesBySeason.keys()].sort().reverse();

  seasons.forEach((season) => {
    const seasonHeading = createElement("h3", "history-season", season);
    elements.onThisDayResults.append(seasonHeading);

    matchesBySeason.get(season).forEach((match) => {
      elements.onThisDayResults.append(createMatchRow(match));
    });
  });
}

function populateClubOptions(selectElement, clubs, preferredClub) {
  selectElement.replaceChildren();

  clubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club;
    option.textContent = club;
    selectElement.append(option);
  });

  if (clubs.includes(preferredClub)) {
    selectElement.value = preferredClub;
  }
}

function updateHeadToHeadClubs() {
  const code = elements.headToHeadCompetition.value;
  const clubs = state.history[code].clubs;
  const oldFirstClub = elements.firstClub.value;
  const oldSecondClub = elements.secondClub.value;

  populateClubOptions(elements.firstClub, clubs, oldFirstClub);
  populateClubOptions(elements.secondClub, clubs, oldSecondClub);

  if (!elements.firstClub.value) {
    elements.firstClub.value = clubs[0];
  }

  if (!elements.secondClub.value || elements.secondClub.value === elements.firstClub.value) {
    elements.secondClub.value = clubs.find(
      (club) => club !== elements.firstClub.value,
    );
  }
}

function createMetric(className, value, label) {
  const metric = createElement("div", `metric ${className}`);
  const metricValue = createElement("div", "metric-value", value);
  const metricLabel = createElement("div", "metric-label", label);

  metric.append(metricValue, metricLabel);

  return metric;
}

function createOutcomeBreakdown(items) {
  const wrapper = createElement("div", "outcome-wrapper");
  const bar = createElement("div", "outcome-bar");
  const legend = createElement("div", "outcome-legend");
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return wrapper;
  }

  items.forEach((item) => {
    const percentage = (item.value / total) * 100;
    const segment = createElement("span", `outcome-segment ${item.className}`);
    segment.style.width = `${percentage}%`;
    segment.title = `${item.label}: ${item.value}`;

    const legendItem = createElement("span", "outcome-legend-item");
    const dot = createElement("i", `outcome-dot ${item.className}`);
    legendItem.append(dot, document.createTextNode(`${item.label} ${item.value}`));

    bar.append(segment);
    legend.append(legendItem);
  });

  wrapper.append(bar, legend);
  return wrapper;
}

function createFormStrip(
  results,
  label = "Recent form, newest result first",
  emptyMessage = "Current form unavailable",
) {
  const strip = createElement("span", "form-strip");
  strip.setAttribute("aria-label", label);

  if (!results || results.length === 0) {
    strip.append(createElement("span", "form-empty", emptyMessage));
    return strip;
  }

  results.forEach((result) => {
    const marker = createElement(
      "span",
      `form-marker form-${result.toLowerCase()}`,
      result,
    );
    marker.setAttribute(
      "title",
      result === "W" ? "Win" : result === "D" ? "Draw" : "Loss",
    );
    strip.append(marker);
  });

  return strip;
}

function renderHeadToHead() {
  const code = elements.headToHeadCompetition.value;
  const firstClub = elements.firstClub.value;
  const secondClub = elements.secondClub.value;
  const history = state.history[code];

  const matches = history.matches
    .filter((match) => {
      const clubsInMatch = [match.home, match.away];

      return clubsInMatch.includes(firstClub) && clubsInMatch.includes(secondClub);
    })
    .sort((firstMatch, secondMatch) =>
      secondMatch.date.localeCompare(firstMatch.date),
    );

  let firstWins = 0;
  let draws = 0;
  let secondWins = 0;
  let firstGoals = 0;
  let secondGoals = 0;

  matches.forEach((match) => {
    const firstClubIsHome = match.home === firstClub;
    const firstScore = firstClubIsHome ? match.homeGoals : match.awayGoals;
    const secondScore = firstClubIsHome ? match.awayGoals : match.homeGoals;

    firstGoals += firstScore;
    secondGoals += secondScore;

    if (firstScore > secondScore) {
      firstWins += 1;
    } else if (firstScore < secondScore) {
      secondWins += 1;
    } else {
      draws += 1;
    }
  });

  elements.headToHeadSummary.replaceChildren(
    createMetric("metric-win", String(firstWins), `${firstClub} wins`),
    createMetric("metric-draw", String(draws), "Draws"),
    createMetric("metric-loss", String(secondWins), `${secondClub} wins`),
    createMetric("metric-goals", `${firstGoals}-${secondGoals}`, "Goals"),
  );

  elements.headToHeadOutcomes.replaceChildren(
    createOutcomeBreakdown([
      { label: firstClub, value: firstWins, className: "outcome-win" },
      { label: "Draws", value: draws, className: "outcome-draw" },
      { label: secondClub, value: secondWins, className: "outcome-loss" },
    ]),
  );

  if (matches.length === 0) {
    elements.headToHeadRivalry.textContent =
      "No rivalry record is available for these clubs.";
  } else if (firstWins > secondWins) {
    elements.headToHeadRivalry.textContent = `${firstClub} lead the rivalry ${firstWins}–${secondWins}, with ${draws} ${draws === 1 ? "draw" : "draws"}.`;
  } else if (secondWins > firstWins) {
    elements.headToHeadRivalry.textContent = `${secondClub} lead the rivalry ${secondWins}–${firstWins}, with ${draws} ${draws === 1 ? "draw" : "draws"}.`;
  } else {
    elements.headToHeadRivalry.textContent = `The rivalry is level at ${firstWins}–${secondWins}, with ${draws} ${draws === 1 ? "draw" : "draws"}.`;
  }

  elements.headToHeadResults.replaceChildren();

  if (matches.length === 0) {
    elements.headToHeadResults.append(
      createElement(
        "p",
        "empty-state",
        `No historical meetings between ${firstClub} and ${secondClub} were found.`,
      ),
    );
    return;
  }

  const heading = createElement(
    "h2",
    "results-heading",
    `${matches.length} historical meetings`,
  );

  elements.headToHeadResults.append(heading);

  matches.forEach((match) => {
    elements.headToHeadResults.append(createMatchRow(match));
  });
}

function updateClubOptions() {
  const code = elements.clubCompetition.value;
  const clubs = state.history[code].clubs;
  const previousClub = elements.clubSelect.value;

  populateClubOptions(elements.clubSelect, clubs, previousClub);

  if (!elements.clubSelect.value) {
    elements.clubSelect.value = clubs[0];
  }
}

function clubScoreForMatch(match, club) {
  const clubIsHome = match.home === club;

  return {
    goalsFor: clubIsHome ? match.homeGoals : match.awayGoals,
    goalsAgainst: clubIsHome ? match.awayGoals : match.homeGoals,
  };
}

function fixtureText(match) {
  return `${match.home} ${match.homeGoals}-${match.awayGoals} ${match.away} on ${formatDate(match.date)}.`;
}

function createRecordLine(emoji, title, text) {
  const line = createElement("p", "record-line");
  const emojiElement = createElement("span", "record-emoji", emoji);
  const content = document.createElement("span");
  const titleElement = createElement("strong", "", `${title} `);

  content.append(titleElement, document.createTextNode(text));
  line.append(emojiElement, content);

  return line;
}

async function renderClub() {
  const code = elements.clubCompetition.value;
  const club = elements.clubSelect.value;
  const history = state.history[code];

  elements.clubDataRange.textContent =
    `Archive coverage: ${historyDateRange(history)} · ` +
    "Current form: live league results";

  const matches = history.matches
    .filter((match) => match.home === club || match.away === club)
    .sort((firstMatch, secondMatch) =>
      secondMatch.date.localeCompare(firstMatch.date),
    );

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  matches.forEach((match) => {
    const score = clubScoreForMatch(match, club);

    goalsFor += score.goalsFor;
    goalsAgainst += score.goalsAgainst;

    if (score.goalsFor > score.goalsAgainst) {
      wins += 1;
    } else if (score.goalsFor < score.goalsAgainst) {
      losses += 1;
    } else {
      draws += 1;
    }
  });

  elements.clubSummary.replaceChildren(
    createMetric("metric-goals", String(matches.length), "Matches"),
    createMetric(
      "metric-win",
      matches.length ? `${Math.round((wins / matches.length) * 100)}%` : "0%",
      "Win rate",
    ),
    createMetric(
      "metric-draw",
      matches.length ? (goalsFor / matches.length).toFixed(2) : "0.00",
      "Goals per match",
    ),
    createMetric(
      "metric-loss",
      String(goalsFor - goalsAgainst),
      "Goal difference",
    ),
  );

  elements.clubOutcomes.replaceChildren(
    createOutcomeBreakdown([
      { label: "Wins", value: wins, className: "outcome-win" },
      { label: "Draws", value: draws, className: "outcome-draw" },
      { label: "Losses", value: losses, className: "outcome-loss" },
    ]),
  );

  const biggestWin = matches
    .filter((match) => {
      const score = clubScoreForMatch(match, club);
      return score.goalsFor > score.goalsAgainst;
    })
    .sort((firstMatch, secondMatch) => {
      const firstScore = clubScoreForMatch(firstMatch, club);
      const secondScore = clubScoreForMatch(secondMatch, club);

      return (
        secondScore.goalsFor - secondScore.goalsAgainst -
        (firstScore.goalsFor - firstScore.goalsAgainst)
      );
    })[0];

  const heaviestLoss = matches
    .filter((match) => {
      const score = clubScoreForMatch(match, club);
      return score.goalsFor < score.goalsAgainst;
    })
    .sort((firstMatch, secondMatch) => {
      const firstScore = clubScoreForMatch(firstMatch, club);
      const secondScore = clubScoreForMatch(secondMatch, club);

      return (
        secondScore.goalsAgainst - secondScore.goalsFor -
        (firstScore.goalsAgainst - firstScore.goalsFor)
      );
    })[0];

  elements.clubRecords.replaceChildren();

  if (biggestWin) {
    elements.clubRecords.append(
      createRecordLine("🏆", "Biggest recorded win:", fixtureText(biggestWin)),
    );
  } else {
    elements.clubRecords.append(
      createRecordLine(
        "🏆",
        "Biggest recorded win:",
        "No winning result is available in this archive.",
      ),
    );
  }

  if (heaviestLoss) {
    elements.clubRecords.append(
      createRecordLine(
        "📉",
        "Heaviest recorded loss:",
        fixtureText(heaviestLoss),
      ),
    );
  } else {
    elements.clubRecords.append(
      createRecordLine(
        "📉",
        "Heaviest recorded loss:",
        "No losing result is available in this archive.",
      ),
    );
  }

  const goalLine = createRecordLine(
    "⚽",
    "Goals:",
    `${goalsFor} scored and ${goalsAgainst} conceded.`,
  );

  const formLine = createElement("div", "club-form-line");
  formLine.append(
    createElement("strong", "", "Current form"),
    createFormStrip([], undefined, "Loading..."),
  );

  elements.clubRecords.append(goalLine, formLine);

  try {
    const [standings, insights] = await Promise.all([
      loadStandings(code),
      loadMatchInsights(code),
    ]);
    const currentTeam = findCurrentTeam(code, club, standings);
    const recentResults = currentTeam
      ? insights.recent_form?.[String(currentTeam.team_id)]
      : [];

    if (
      elements.clubCompetition.value !== code ||
      elements.clubSelect.value !== club
    ) {
      return;
    }

    formLine.replaceChildren(
      createElement("strong", "", "Current form"),
      createFormStrip(
        recentResults,
        "Current form, newest result first",
        currentTeam ? "No completed matches yet" : "Not in the current league",
      ),
    );
  } catch (error) {
    formLine.replaceChildren(
      createElement("strong", "", "Current form"),
      createElement("span", "form-empty", "Live form could not be loaded"),
    );
  }
}

function formatFixtureDay(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

function formatFixtureTime(match) {
  if (match.status === "POSTPONED") {
    return "Postponed";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.utc_date));
}

function createFixtureCard(match) {
  const card = createElement("article", "fixture-card");
  const teams = createElement("div", "fixture-teams");
  teams.append(
    createElement("span", "fixture-team", match.home_team_name),
    createElement("span", "fixture-team", match.away_team_name),
  );

  const details = createElement("div", "fixture-details");
  details.append(
    createElement("strong", "fixture-time", formatFixtureTime(match)),
    createElement(
      "span",
      "fixture-matchday",
      match.matchday ? `Matchday ${match.matchday}` : "League fixture",
    ),
  );

  card.append(teams, details);
  return card;
}

async function renderUpcoming() {
  const code = elements.upcomingCompetition.value;
  elements.upcomingResults.textContent = "Loading upcoming matches...";

  try {
    const insights = await loadMatchInsights(code);
    const fixtures = insights.upcoming || [];
    elements.upcomingResults.replaceChildren();

    if (fixtures.length === 0) {
      elements.upcomingResults.append(
        createElement(
          "p",
          "empty-state",
          `No upcoming ${competitions[code].name} fixtures are currently available.`,
        ),
      );
      return;
    }

    let currentDay = "";

    fixtures.forEach((match) => {
      const day = formatFixtureDay(match.utc_date);

      if (day !== currentDay) {
        currentDay = day;
        elements.upcomingResults.append(
          createElement("h2", "fixture-day", day),
        );
      }

      elements.upcomingResults.append(createFixtureCard(match));
    });
  } catch (error) {
    elements.upcomingResults.replaceChildren(
      createElement("p", "error-state", error.message),
    );
  }
}

async function renderStandings() {
  const code = elements.standingsCompetition.value;

  elements.standingsBody.replaceChildren(
    createTableMessage("Loading current table..."),
  );

  try {
    const [rows, insights] = await Promise.all([
      loadStandings(code),
      loadMatchInsights(code),
    ]);

    elements.standingsBody.replaceChildren();

    rows.forEach((row) => {
      const tableRow = document.createElement("tr");
      const position = Number(row.position);

      if (position <= 4) {
        tableRow.classList.add("position-top");
      } else if (position <= 6) {
        tableRow.classList.add("position-europe");
      } else if (position >= rows.length - 2) {
        tableRow.classList.add("position-relegation");
      }

      const positionCell = createElement("td", "position-cell", String(row.position));
      const clubCell = createElement("td", "club-cell");
      const clubLine = createElement("span", "club-line");
      const clubName = createElement("span", "club-name", row.team_name);
      const form = createFormStrip(insights.recent_form?.[String(row.team_id)]);
      clubLine.append(clubName, form);
      const details = createElement(
        "span",
        "standing-details",
        `Played ${row.played_games} · Won ${row.won} · Drawn ${row.drawn} · Lost ${row.lost}`,
      );
      const detailsButton = createElement("button", "table-details-toggle", "Show record");
      detailsButton.type = "button";
      detailsButton.setAttribute("aria-expanded", "false");
      detailsButton.addEventListener("click", () => {
        const expanded = tableRow.classList.toggle("is-expanded");
        detailsButton.textContent = expanded ? "Hide record" : "Show record";
        detailsButton.setAttribute("aria-expanded", String(expanded));
      });
      clubCell.append(clubLine, details, detailsButton);

      [
        positionCell,
        clubCell,
        createElement("td", "played-cell", String(row.played_games)),
        createElement("td", "won-cell", String(row.won)),
        createElement("td", "drawn-cell", String(row.drawn)),
        createElement("td", "lost-cell", String(row.lost)),
        createElement("td", "goal-difference-cell", String(row.goal_difference)),
        createElement("td", "points-cell", String(row.points)),
      ].forEach((cell) => tableRow.append(cell));

      elements.standingsBody.append(tableRow);
    });
  } catch (error) {
    elements.standingsBody.replaceChildren(
      createTableMessage(error.message),
    );
  }
}

function createTableMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 8;
  cell.textContent = message;
  row.append(cell);

  return row;
}

function showView(viewName, direction = 0) {
  const selectedPanel = document.querySelector(`[data-panel="${viewName}"]`);

  if (viewOrder.includes(viewName)) {
    window.history.replaceState(null, "", `#${viewName}`);
  }

  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const isSelected = panel.dataset.panel === viewName;

    panel.hidden = !isSelected;
    panel.classList.toggle("is-active", isSelected);
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });

  if (
    direction !== 0 &&
    selectedPanel &&
    window.matchMedia("(max-width: 700px)").matches &&
    typeof selectedPanel.animate === "function"
  ) {
    const startOffset = direction > 0 ? "100%" : "-100%";

    selectedPanel.animate(
      [
        { transform: `translateX(${startOffset})`, opacity: 0.7 },
        { transform: "translateX(0)", opacity: 1 },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  }
}

function addSwipeNavigation() {
  const main = document.querySelector("main");
  let touchStart = null;

  main.addEventListener(
    "touchstart",
    (event) => {
      if (
        !window.matchMedia("(max-width: 700px)").matches ||
        event.touches.length !== 1 ||
        event.target.closest("select, button, a")
      ) {
        touchStart = null;
        return;
      }

      const [touch] = event.touches;
      touchStart = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );

  main.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) {
        return;
      }

      const [touch] = event.changedTouches;
      const horizontalDistance = touch.clientX - touchStart.x;
      const verticalDistance = touch.clientY - touchStart.y;
      touchStart = null;

      if (
        Math.abs(horizontalDistance) < 55 ||
        Math.abs(horizontalDistance) <= Math.abs(verticalDistance) ||
        event.target.closest("select, button, a")
      ) {
        return;
      }

      const currentView = document.querySelector(".view-panel.is-active")?.dataset
        .panel;
      const currentIndex = viewOrder.indexOf(currentView);
      const nextIndex =
        horizontalDistance < 0 ? currentIndex + 1 : currentIndex - 1;

      if (currentIndex === -1 || nextIndex < 0 || nextIndex >= viewOrder.length) {
        return;
      }

      showView(viewOrder[nextIndex], nextIndex > currentIndex ? 1 : -1);
    },
    { passive: true },
  );
}

function addEventListeners() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  elements.historyCompetition.addEventListener("change", renderOnThisDay);
  elements.historyDate.addEventListener("change", renderOnThisDay);
  document.querySelectorAll("[data-date-offset]").forEach((button) => {
    button.addEventListener("click", () => {
      shiftHistoryDate(Number(button.dataset.dateOffset));
    });
  });

  elements.standingsCompetition.addEventListener("change", renderStandings);
  elements.upcomingCompetition.addEventListener("change", renderUpcoming);

  elements.headToHeadCompetition.addEventListener("change", () => {
    updateHeadToHeadClubs();
    renderHeadToHead();
  });

  elements.firstClub.addEventListener("change", () => {
    if (elements.firstClub.value === elements.secondClub.value) {
      elements.secondClub.value = state.history[
        elements.headToHeadCompetition.value
      ].clubs.find((club) => club !== elements.firstClub.value);
    }

    renderHeadToHead();
  });

  elements.secondClub.addEventListener("change", () => {
    if (elements.firstClub.value === elements.secondClub.value) {
      elements.firstClub.value = state.history[
        elements.headToHeadCompetition.value
      ].clubs.find((club) => club !== elements.secondClub.value);
    }

    renderHeadToHead();
  });

  elements.clubCompetition.addEventListener("change", () => {
    updateClubOptions();
    renderClub();
  });

  elements.clubSelect.addEventListener("change", renderClub);
}

async function initialise() {
  populateDateOptions();
  setDateToToday();

  try {
    await Promise.all([loadHistory("PL"), loadHistory("PD")]);
  } catch (error) {
    elements.onThisDayResults.replaceChildren(
      createElement("p", "error-state", error.message),
    );
    return;
  }

  updateHeadToHeadClubs();
  updateClubOptions();

  renderOnThisDay();
  renderHeadToHead();
  renderClub();
  renderStandings();
  renderUpcoming();
  renderStandingsStatus();

  addEventListeners();
  addSwipeNavigation();

  const initialView = window.location.hash.slice(1);
  if (viewOrder.includes(initialView)) {
    showView(initialView);
  }
}

initialise();
