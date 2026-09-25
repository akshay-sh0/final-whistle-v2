from datetime import datetime, timezone
from pathlib import Path

from finalwhistle.api.football_data import FootballDataClient
from finalwhistle.build import build_match_insights_file, build_standings_file
from finalwhistle.config import get_api_token
from finalwhistle.exporters.json_exporter import export_update_metadata


OUTPUT_DIRECTORY = Path("site/data/standings")
MATCHES_DIRECTORY = Path("site/data/matches")


def main() -> None:
    api_token = get_api_token()
    client = FootballDataClient(api_token)
    updated_at = datetime.now(timezone.utc)

    for competition_code in ("PL", "PD"):
        output_path = OUTPUT_DIRECTORY / f"{competition_code}.json"
        build_standings_file(client, competition_code, output_path)
        print(f"Wrote {output_path}")

        matches_path = MATCHES_DIRECTORY / f"{competition_code}.json"
        build_match_insights_file(
            client,
            competition_code,
            updated_at,
            matches_path,
        )
        print(f"Wrote {matches_path}")

    metadata_path = OUTPUT_DIRECTORY / "metadata.json"
    export_update_metadata(updated_at, metadata_path)
    print(f"Wrote {metadata_path}")


if __name__ == "__main__":
    main()
