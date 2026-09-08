from typing import Any

from finalwhistle.models.standing import StandingRow

def normalise_table_row(entry: dict[str, Any]) -> StandingRow:
    team = entry["team"]

    return StandingRow(
        position=entry["position"],
        team_id=team["id"],
        team_name=team["name"],
        played_games=entry["playedGames"],
        won=entry["won"],
        drawn=entry["draw"],
        lost=entry["lost"],
        points=entry["points"],
        goals_for=entry["goalsFor"],
        goals_against=entry["goalsAgainst"],
        goal_difference=entry["goalDifference"],
    )

def normalise_standings(payload: dict[str, Any]) -> list[StandingRow]:
    for standings_group in payload["standings"]:
        if standings_group["type"] == "TOTAL":
            return [
                normalise_table_row(entry)
                for entry in standings_group["table"]
            ]

    raise ValueError("No TOTAL standings table found.")