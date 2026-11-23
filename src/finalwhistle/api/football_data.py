import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = "https://api.football-data.org/v4"
MAX_API_ATTEMPTS = 3
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


class FootballDataClient:
    def __init__(self, api_token: str) -> None:
        self._api_token = api_token

    def _headers(self) -> dict[str, str]:
        return {"X-Auth-Token": self._api_token}

    def _get_json(self, url: str) -> dict[str, Any]:
        for attempt in range(1, MAX_API_ATTEMPTS + 1):
            request = Request(url, headers=self._headers())

            try:
                with urlopen(request, timeout=10) as response:
                    return json.load(response)
            except HTTPError as error:
                if error.code not in RETRYABLE_STATUS_CODES:
                    raise

                error_description = f"Football API returned {error.code}"
            except URLError as error:
                error_description = f"Football API connection failed: {error.reason}"

            if attempt < MAX_API_ATTEMPTS:
                delay_seconds = attempt * 2
                print(
                    f"{error_description}. Retrying in {delay_seconds} seconds "
                    f"({attempt}/{MAX_API_ATTEMPTS})."
                )
                time.sleep(delay_seconds)
                continue

            raise RuntimeError(
                f"{error_description} after {MAX_API_ATTEMPTS} attempts."
            )

        raise RuntimeError("Football API retry loop ended unexpectedly.")

    def get_competition(self, competition_code: str) -> dict[str, Any]:
        url = f"{BASE_URL}/competitions/{competition_code}"
        return self._get_json(url)

    def get_standings(self, competition_code: str) -> dict[str, Any]:
        url = f"{BASE_URL}/competitions/{competition_code}/standings"
        return self._get_json(url)

    def get_matches(self, competition_code: str) -> dict[str, Any]:
        url = f"{BASE_URL}/competitions/{competition_code}/matches"
        return self._get_json(url)
