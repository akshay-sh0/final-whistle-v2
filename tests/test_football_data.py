from unittest.mock import Mock, call

import pytest
import requests

from finalwhistle.api.football_data import FootballDataClient


def test_headers_contains_token():
    client = FootballDataClient("test-token")

    assert client._headers() == {"X-Auth-Token": "test-token"}


def test_get_competition_sends_expected_request(monkeypatch):
    response = Mock(status_code=200)
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
    response = Mock(status_code=200)
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


def test_get_matches_sends_expected_request(monkeypatch):
    response = Mock(status_code=200)
    response.json.return_value = {"matches": []}

    get = Mock(return_value=response)
    monkeypatch.setattr(
        "finalwhistle.api.football_data.requests.get",
        get,
    )

    client = FootballDataClient("test-token")

    matches = client.get_matches("PD")

    assert matches == {"matches": []}
    get.assert_called_once_with(
        "https://api.football-data.org/v4/competitions/PD/matches",
        headers={"X-Auth-Token": "test-token"},
        timeout=10,
    )
    response.raise_for_status.assert_called_once_with()


def test_get_standings_retries_temporary_server_error(monkeypatch):
    failed_response = Mock(status_code=500)
    successful_response = Mock(status_code=200)
    successful_response.json.return_value = {"standings": []}

    get = Mock(side_effect=[failed_response, successful_response])
    sleep = Mock()
    monkeypatch.setattr(
        "finalwhistle.api.football_data.requests.get",
        get,
    )
    monkeypatch.setattr(
        "finalwhistle.api.football_data.time.sleep",
        sleep,
    )

    client = FootballDataClient("test-token")
    standings = client.get_standings("PL")

    assert standings == {"standings": []}
    assert get.call_count == 2
    sleep.assert_called_once_with(2)
    failed_response.raise_for_status.assert_not_called()
    successful_response.raise_for_status.assert_called_once_with()


def test_get_standings_fails_after_retry_limit(monkeypatch):
    responses = [Mock(status_code=500) for _ in range(3)]
    responses[-1].raise_for_status.side_effect = requests.HTTPError(
        "500 Server Error"
    )

    get = Mock(side_effect=responses)
    sleep = Mock()
    monkeypatch.setattr(
        "finalwhistle.api.football_data.requests.get",
        get,
    )
    monkeypatch.setattr(
        "finalwhistle.api.football_data.time.sleep",
        sleep,
    )

    client = FootballDataClient("test-token")

    with pytest.raises(requests.HTTPError, match="500 Server Error"):
        client.get_standings("PL")

    assert get.call_count == 3
    assert sleep.call_args_list == [call(2), call(4)]
    responses[0].raise_for_status.assert_not_called()
    responses[1].raise_for_status.assert_not_called()
    responses[2].raise_for_status.assert_called_once_with()
