from finalwhistle.models.standing import StandingRow

def test_standing_row_stores_values():
    row = StandingRow(
        position=1,
        team_id=65,
        team_name="Manchester City FC",
        points=9,
    )

    assert row.position == 1
    assert row.team_id == 65
    assert row.team_name == "Manchester City FC"
    assert row.points == 9