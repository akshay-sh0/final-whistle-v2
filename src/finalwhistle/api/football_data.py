from typing import Any
import requests 

BASE_URL = "https://api.football-data.org/v4"

class FootballDataClient:
    def __init__(self, api_token: str) -> None:
        self._api_token = api_token

    def _headers(self) -> dict[str, str]:
        return {"X-Auth-Token": self._api_token}

    def get_competition(self, competition_code: str) -> dict [str, Any]:
        url = f"{BASE_URL}/competitions/{competition_code}"

        response = requests.get(
            url,
            headers=self._headers(),
            timeout=10,
        )

        response.raise_for_status()

        return response.json()
