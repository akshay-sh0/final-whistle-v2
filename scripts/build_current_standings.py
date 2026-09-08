from pathlib import Path

from finalwhistle.api.football_data import FootballDataClient
from finalwhistle.build import build_standings_file
from finalwhistle.config import get_api_token


OUTPUT_DIRECTORY = Path("site/data/standings")


def main() -> None:
    api_token = get_api_token()
    client = FootballDataClient(api_token)

    for competition_code in ("PL", "PD"):
        output_path = OUTPUT_DIRECTORY / f"{competition_code}.json"
        build_standings_file(client, competition_code, output_path)
        print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()