from dataclasses import dataclass


@dataclass
class UpcomingMatch:
    match_id: int
    utc_date: str
    status: str
    matchday: int | None
    home_team_id: int
    home_team_name: str
    away_team_id: int
    away_team_name: str
