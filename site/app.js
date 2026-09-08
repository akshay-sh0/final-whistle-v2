const competitionSelect = document.querySelector("#competition-select");
const standingsBody = document.querySelector("#standings-body");
const statusMessage = document.querySelector("#status-message");

function createCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = String(value);

  if (className) {
    cell.classList.add(className);
  }

  return cell;
}

function renderStandings(rows) {
  standingsBody.replaceChildren();

  const tableRows = document.createDocumentFragment();

  for (const row of rows) {
    const tableRow = document.createElement("tr");

    tableRow.append(
      createCell(row.position),
      createCell(row.team_name, "club-name"),
      createCell(row.played_games),
      createCell(row.won),
      createCell(row.drawn),
      createCell(row.lost),
      createCell(row.goal_difference),
      createCell(row.points, "points-cell"),
    );

    tableRows.append(tableRow);
  }

  standingsBody.append(tableRows);
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function loadStandings() {
  const competitionCode = competitionSelect.value;

  showStatus("Loading latest published standings...");
  standingsBody.replaceChildren();

  try {
    const response = await fetch(`data/standings/${competitionCode}.json`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Could not load ${competitionCode} standings.`);
    }

    const rows = await response.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("The standings file contains no teams.");
    }

    renderStandings(rows);
    showStatus(`${rows.length} clubs loaded.`);
  } catch (error) {
    console.error(error);
    showStatus(
      "Standings are temporarily unavailable. Please try again later.",
      true,
    );
  }
}

competitionSelect.addEventListener("change", loadStandings);

loadStandings();