from dataclasses import dataclass

@dataclass
class StandingRow:
    position: int
    team_id: int
    team_name: str
    played_games: int
    won: int
    drawn: int
    lost: int
    points: int
    goals_for: int
    goals_against: int
    goal_difference: int