import json
from datetime import datetime, timezone
from unittest.mock import Mock

from finalwhistle.build import build_match_insights_file, build_standings_file


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


def test_build_match_insights_file_writes_upcoming_and_form(tmp_path):
    client = Mock()
    client.get_matches.return_value = {
        "matches": [
            {
                "id": 1,
                "utcDate": "2026-09-20T14:00:00Z",
                "status": "FINISHED",
                "matchday": 5,
                "homeTeam": {"id": 57, "name": "Arsenal FC"},
                "awayTeam": {"id": 61, "name": "Chelsea FC"},
                "score": {"fullTime": {"home": 2, "away": 1}},
            },
            {
                "id": 2,
                "utcDate": "2026-09-27T15:30:00Z",
                "status": "TIMED",
                "matchday": 6,
                "homeTeam": {"id": 61, "name": "Chelsea FC"},
                "awayTeam": {"id": 57, "name": "Arsenal FC"},
                "score": {"fullTime": {"home": None, "away": None}},
            },
        ]
    }
    output_path = tmp_path / "PL.json"

    build_match_insights_file(
        client,
        "PL",
        datetime(2026, 9, 25, 9, 0, tzinfo=timezone.utc),
        output_path,
    )

    client.get_matches.assert_called_once_with("PL")
    exported_data = json.loads(output_path.read_text(encoding="utf-8"))

    assert exported_data["upcoming"][0]["home_team_name"] == "Chelsea FC"
    assert exported_data["recent_form"] == {"57": ["W"], "61": ["L"]}
    assert exported_data["updated_at"] == "2026-09-25T09:00:00Z"
