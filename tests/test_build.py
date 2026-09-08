import json
from unittest.mock import Mock

from finalwhistle.build import build_standings_file


def test_build_standings_file_writes_normalised_json(tmp_path):
    client = Mock()
    client.get_standings.return_value = {
        "standings": [
            {
                "type": "TOTAL",
                "table": [
                    {
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
                ],
            }
        ]
    }
    output_path = tmp_path / "PL.json"

    build_standings_file(client, "PL", output_path)

    client.get_standings.assert_called_once_with("PL")

    exported_data = json.loads(output_path.read_text(encoding="utf-8"))

    assert exported_data[0]["team_name"] == "Manchester City FC"
    assert exported_data[0]["points"] == 9