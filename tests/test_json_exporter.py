import json
import pytest
from finalwhistle.exporters.json_exporter import export_standings
from finalwhistle.models.standing import StandingRow


def test_export_standings_writes_json_file(tmp_path):
    rows = [
        StandingRow(
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
    ]
    output_path = tmp_path / "PL.json"

    export_standings(rows, output_path)

    exported_data = json.loads(output_path.read_text(encoding="utf-8"))

    assert exported_data == [
        {
            "position": 1,
            "team_id": 65,
            "team_name": "Manchester City FC",
            "played_games": 3,
            "won": 3,
            "drawn": 0,
            "lost": 0,
            "points": 9,
            "goals_for": 7,
            "goals_against": 2,
            "goal_difference": 5,
        }
    ]
    assert not (tmp_path / "PL.tmp").exists()

def test_export_standings_rejects_empty_rows(tmp_path):
    output_path = tmp_path / "PL.json"

    with pytest.raises(ValueError, match="Cannot export empty standings."):
        export_standings([], output_path)

    assert not output_path.exists()