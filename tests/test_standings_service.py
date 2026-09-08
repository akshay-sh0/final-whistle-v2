from finalwhistle.models.standing import StandingRow
from finalwhistle.services.standings import normalise_table_row


def test_normalise_table_row_converts_provider_data():
    raw_entry = {
        "position": 1,
        "team": {
            "id": 65,
            "name": "Manchester City FC",
        },
        "playedGames": 3,
        "won": 3,
        "draw": 0,
        "lost": 0,
        "points": 9,
        "goalsFor": 7,
        "goalsAgainst": 2,
        "goalDifference": 5,
    }

    row = normalise_table_row(raw_entry)

    expected = StandingRow(
        position=1,
        team_id=65,
        team_name="Manchester City FC",
        played_games=3,
        won=3,
        drawn=0,
        lost=0,
        points=9,
        goals_for=7,
        goals_against=2,
        goal_difference=5,
    )

    assert row == expected