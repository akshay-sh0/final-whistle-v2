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