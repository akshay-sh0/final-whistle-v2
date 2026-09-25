from typing import Any

from finalwhistle.models.match import UpcomingMatch


UPCOMING_STATUSES = {"SCHEDULED", "TIMED", "POSTPONED"}


def normalise_match_insights(
    payload: dict[str, Any],
    upcoming_limit: int = 12,
    form_limit: int = 5,
) -> tuple[list[UpcomingMatch], dict[str, list[str]]]:
    matches = payload.get("matches")

    if not isinstance(matches, list):
        raise ValueError("Match response does not contain a matches list.")

    if not matches:
        raise ValueError("Match response contains no matches.")

    upcoming = [
        _normalise_upcoming_match(match)
        for match in sorted(matches, key=lambda item: item["utcDate"])
        if match.get("status") in UPCOMING_STATUSES
    ][:upcoming_limit]

    recent_form: dict[str, list[str]] = {}
    finished_matches = sorted(
        (match for match in matches if match.get("status") == "FINISHED"),
        key=lambda item: item["utcDate"],
        reverse=True,
    )

    for match in finished_matches:
        home_score = match.get("score", {}).get("fullTime", {}).get("home")
        away_score = match.get("score", {}).get("fullTime", {}).get("away")

        if home_score is None or away_score is None:
            continue

        home_id = str(match["homeTeam"]["id"])
        away_id = str(match["awayTeam"]["id"])

        if home_score > away_score:
            home_result, away_result = "W", "L"
        elif home_score < away_score:
            home_result, away_result = "L", "W"
        else:
            home_result = away_result = "D"

        _append_result(recent_form, home_id, home_result, form_limit)
        _append_result(recent_form, away_id, away_result, form_limit)

    return upcoming, recent_form


def _normalise_upcoming_match(match: dict[str, Any]) -> UpcomingMatch:
    return UpcomingMatch(
        match_id=int(match["id"]),
        utc_date=str(match["utcDate"]),
        status=str(match["status"]),
        matchday=match.get("matchday"),
        home_team_id=int(match["homeTeam"]["id"]),
        home_team_name=str(match["homeTeam"]["name"]),
        away_team_id=int(match["awayTeam"]["id"]),
        away_team_name=str(match["awayTeam"]["name"]),
    )


def _append_result(
    recent_form: dict[str, list[str]],
    team_id: str,
    result: str,
    form_limit: int,
) -> None:
    results = recent_form.setdefault(team_id, [])

    if len(results) < form_limit:
        results.append(result)
