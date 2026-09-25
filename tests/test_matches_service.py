import pytest

from finalwhistle.services.matches import normalise_match_insights


def test_normalise_match_insights_sorts_fixtures_and_builds_recent_form():
    payload = {
        "matches": [
            {
                "id": 3,
                "utcDate": "2026-10-04T15:30:00Z",
                "status": "TIMED",
                "matchday": 7,
                "homeTeam": {"id": 57, "name": "Arsenal FC"},
                "awayTeam": {"id": 61, "name": "Chelsea FC"},
                "score": {"fullTime": {"home": None, "away": None}},
            },
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
                "status": "SCHEDULED",
                "matchday": 6,
                "homeTeam": {"id": 61, "name": "Chelsea FC"},
                "awayTeam": {"id": 57, "name": "Arsenal FC"},
                "score": {"fullTime": {"home": None, "away": None}},
            },
        ]
    }

    upcoming, recent_form = normalise_match_insights(payload)

    assert [match.match_id for match in upcoming] == [2, 3]
    assert recent_form == {"57": ["W"], "61": ["L"]}


def test_normalise_match_insights_rejects_missing_matches_list():
    with pytest.raises(ValueError, match="does not contain a matches list"):
        normalise_match_insights({})


def test_normalise_match_insights_rejects_empty_matches_list():
    with pytest.raises(ValueError, match="contains no matches"):
        normalise_match_insights({"matches": []})
