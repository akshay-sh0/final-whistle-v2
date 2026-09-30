import time
from typing import Any

import requests

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
            response = requests.get(
                url,
                headers=self._headers(),
                timeout=10,
            )

            should_retry = (
                response.status_code in RETRYABLE_STATUS_CODES
                and attempt < MAX_API_ATTEMPTS
            )

            if should_retry:
                delay_seconds = attempt * 2
                print(
                    f"Football API returned {response.status_code}. "
                    f"Retrying in {delay_seconds} seconds "
                    f"({attempt}/{MAX_API_ATTEMPTS})."
                )
                time.sleep(delay_seconds)
                continue

            response.raise_for_status()
            return response.json()

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
