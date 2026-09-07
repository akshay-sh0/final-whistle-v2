from finalwhistle.api.football_data import FootballDataClient
from unittest.mock import Mock

def test_headers_contains_token():
    client = FootballDataClient("test-token")

    assert client._headers() == {"X-Auth-Token": "test-token"}

def test_get_competition_sends_expected_request(monkeypatch):
    response = Mock()
    response.json.return_value = {"name": "Premier League"}

    get = Mock(return_value=response)
    monkeypatch.setattr(
        "finalwhistle.api.football_data.requests.get",
        get,
    )

    client = FootballDataClient("test-token")

    competition = client.get_competition("PL")

    assert competition == {"name": "Premier League"}
    get.assert_called_once_with(
        "https://api.football-data.org/v4/competitions/PL",
        headers={"X-Auth-Token": "test-token"},
        timeout=10,
    )
    response.raise_for_status.assert_called_once_with()   

def test_get_standings_sends_expected_request(monkeypatch):
    response = Mock()
    response.json.return_value = {"standings": []}

    get = Mock(return_value=response)
    monkeypatch.setattr(
        "finalwhistle.api.football_data.requests.get",
        get,
    )

    client = FootballDataClient("test-token")

    standings = client.get_standings("PL")

    assert standings == {"standings": []}
    get.assert_called_once_with(
        "https://api.football-data.org/v4/competitions/PL/standings",
        headers={"X-Auth-Token": "test-token"},
        timeout=10,
    )
    response.raise_for_status.assert_called_once_with()     