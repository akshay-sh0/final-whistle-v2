from pathlib import Path

from finalwhistle.api.football_data import FootballDataClient
from finalwhistle.exporters.json_exporter import export_standings
from finalwhistle.services.standings import normalise_standings


def build_standings_file(
    client: FootballDataClient,
    competition_code: str,
    output_path: Path,
) -> None:
    payload = client.get_standings(competition_code)
    rows = normalise_standings(payload)
    export_standings(rows, output_path)