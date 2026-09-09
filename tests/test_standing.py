from finalwhistle.models.standing import StandingRow

def test_standing_row_stores_values():
    row = StandingRow(
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

    assert row.position == 0
    assert row.team_id == 65
    assert row.team_name == "Manchester City FC"
    assert row.played_games == 3
    assert row.won == 3
    assert row.drawn == 0
    assert row.lost == 0
    assert row.points == 9
    assert row.goals_for == 7
    assert row.goals_against == 2
    assert row.goal_difference == 5