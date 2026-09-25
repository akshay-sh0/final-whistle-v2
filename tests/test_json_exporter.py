import json
from datetime import datetime, timezone

import pytest

from finalwhistle.exporters.json_exporter import (
    export_match_insights,
    export_standings,
    export_update_metadata,
)
from finalwhistle.models.match import UpcomingMatch
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


def test_export_update_metadata_writes_utc_timestamp(tmp_path):
    output_path = tmp_path / "metadata.json"
    updated_at = datetime(2026, 9, 13, 13, 5, tzinfo=timezone.utc)

    export_update_metadata(updated_at, output_path)

    exported_data = json.loads(output_path.read_text(encoding="utf-8"))

    assert exported_data == {"updated_at": "2026-09-13T13:05:00Z"}
    assert not (tmp_path / "metadata.tmp").exists()


def test_export_update_metadata_rejects_timestamp_without_timezone(tmp_path):
    output_path = tmp_path / "metadata.json"

    with pytest.raises(ValueError, match="must include a timezone"):
        export_update_metadata(datetime(2026, 9, 13, 13, 5), output_path)

    assert not output_path.exists()


def test_export_match_insights_writes_compact_json(tmp_path):
    output_path = tmp_path / "PL.json"
    upcoming = [
        UpcomingMatch(
            match_id=2,
            utc_date="2026-09-27T15:30:00Z",
            status="TIMED",
            matchday=6,
            home_team_id=61,
            home_team_name="Chelsea FC",
            away_team_id=57,
            away_team_name="Arsenal FC",
        )
    ]

    export_match_insights(
        upcoming,
        {"57": ["W"], "61": ["L"]},
        datetime(2026, 9, 25, 9, 0, tzinfo=timezone.utc),
        output_path,
    )

    exported_data = json.loads(output_path.read_text(encoding="utf-8"))

    assert exported_data["upcoming"][0]["match_id"] == 2
    assert exported_data["recent_form"] == {"57": ["W"], "61": ["L"]}
    assert exported_data["updated_at"] == "2026-09-25T09:00:00Z"
