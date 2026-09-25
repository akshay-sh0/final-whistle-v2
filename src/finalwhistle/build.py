from datetime import datetime
from pathlib import Path

from finalwhistle.api.football_data import FootballDataClient
from finalwhistle.exporters.json_exporter import (
    export_match_insights,
    export_standings,
)
from finalwhistle.services.matches import normalise_match_insights
from finalwhistle.services.standings import normalise_standings


def build_standings_file(
    client: FootballDataClient,
    competition_code: str,
    output_path: Path,
) -> None:
    payload = client.get_standings(competition_code)
    rows = normalise_standings(payload)
    export_standings(rows, output_path)


def build_match_insights_file(
    client: FootballDataClient,
    competition_code: str,
    updated_at: datetime,
    output_path: Path,
) -> None:
    payload = client.get_matches(competition_code)
    upcoming, recent_form = normalise_match_insights(payload)
    export_match_insights(upcoming, recent_form, updated_at, output_path)
