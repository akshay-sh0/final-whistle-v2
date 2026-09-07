from dataclasses import dataclass

@dataclass
class StandingRow:
    position: int
    team_id: int
    team_name: str
    points: int