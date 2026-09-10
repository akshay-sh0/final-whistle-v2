const competitions = {
  PL: {
    name: "Premier League",
    historyPath: "data/history/premier-league.json",
    standingsPath: "data/standings/PL.json",
  },
  PD: {
    name: "La Liga",
    historyPath: "data/history/la-liga.json",
    standingsPath: "data/standings/PD.json",
  },
};

const state = {
  history: {},
  standings: {},
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

const viewOrder = ["on-this-day", "current-table", "head-to-head", "clubs"];

const elements = {
  historyCompetition: document.querySelector("#history-competition"),
  historyMonth: document.querySelector("#history-month"),
  historyDay: document.querySelector("#history-day"),
  onThisDayResults: document.querySelector("#on-this-day-results"),

  standingsCompetition: document.querySelector("#standings-competition"),
  standingsBody: document.querySelector("#standings-body"),

  headToHeadCompetition: document.querySelector("#head-to-head-competition"),
  firstClub: document.querySelector("#first-club"),
  secondClub: document.querySelector("#second-club"),
  headToHeadSummary: document.querySelector("#head-to-head-summary"),
  headToHeadResults: document.querySelector("#head-to-head-results"),

  clubCompetition: document.querySelector("#club-competition"),
  clubSelect: document.querySelector("#club-select"),
  clubSummary: document.querySelector("#club-summary"),
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

function formatDayAndMonth(month, day) {
  return `${monthNames[month - 1]} ${day}`;
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

function populateMonthOptions() {
  elements.historyMonth.replaceChildren();

  monthNames.forEach((monthName, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = monthName;
    elements.historyMonth.append(option);
  });
}

function daysInMonth(month) {
  return new Date(2024, month, 0).getDate();
}

function populateDayOptions(month, selectedDay) {
  const maximumDay = daysInMonth(month);

  elements.historyDay.replaceChildren();

  for (let day = 1; day <= maximumDay; day += 1) {
    const option = document.createElement("option");
    option.value = String(day);
    option.textContent = String(day);
    elements.historyDay.append(option);
  }

  const safeDay = Math.min(selectedDay, maximumDay);
  elements.historyDay.value = String(safeDay);
}

function setDateToToday() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  elements.historyMonth.value = String(currentMonth);
  populateDayOptions(currentMonth, currentDay);
}

function createMatchRow(match) {
  const row = createElement("article", "match-row");

  const date = createElement("span", "match-date", formatDate(match.date));
  const teams = createElement(
    "span",
    "match-teams",
    `${match.home} vs ${match.away}`,
  );
  const score = createElement(
    "span",
    "match-score",
    `${match.homeGoals}-${match.awayGoals}`,
  );

  row.append(date, teams, score);

  return row;
}

function renderOnThisDay() {
  const code = elements.historyCompetition.value;
  const history = state.history[code];
  const month = Number(elements.historyMonth.value);
  const day = Number(elements.historyDay.value);
  const selectedDate = formatDayAndMonth(month, day);

  const matches = history.matches.filter((match) => {
    const [, matchMonth, matchDay] = match.date.split("-").map(Number);

    return matchMonth === month && matchDay === day;
  });

  elements.onThisDayResults.replaceChildren();

  const heading = createElement(
    "h2",
    "results-heading",
    `Matches played on ${selectedDate}`,
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

function renderClub() {
  const code = elements.clubCompetition.value;
  const club = elements.clubSelect.value;
  const history = state.history[code];

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
    createMetric("metric-win", String(wins), "Wins"),
    createMetric("metric-draw", String(draws), "Draws"),
    createMetric("metric-loss", String(losses), "Losses"),
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

  elements.clubRecords.append(goalLine);
}

async function renderStandings() {
  const code = elements.standingsCompetition.value;

  elements.standingsBody.replaceChildren(
    createTableMessage("Loading current table..."),
  );

  try {
    const rows = await loadStandings(code);

    elements.standingsBody.replaceChildren();

    rows.forEach((row) => {
      const tableRow = document.createElement("tr");

      [
        row.position,
        row.team_name,
        row.played_games,
        row.won,
        row.drawn,
        row.lost,
        row.goal_difference,
        row.points,
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        tableRow.append(cell);
      });

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

  elements.historyMonth.addEventListener("change", () => {
    const previousDay = Number(elements.historyDay.value);

    populateDayOptions(Number(elements.historyMonth.value), previousDay);
    renderOnThisDay();
  });

  elements.historyDay.addEventListener("change", renderOnThisDay);

  elements.standingsCompetition.addEventListener("change", renderStandings);

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
  populateMonthOptions();
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

  addEventListeners();
  addSwipeNavigation();
}

initialise();
