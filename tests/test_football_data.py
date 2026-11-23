from io import BytesIO
from unittest.mock import Mock, call
from urllib.error import HTTPError

import pytest

from finalwhistle.api.football_data import FootballDataClient


def response_with_json(value: bytes) -> Mock:
    response = Mock()
    response.__enter__ = Mock(return_value=BytesIO(value))
    response.__exit__ = Mock(return_value=False)
    return response


def temporary_server_error() -> HTTPError:
    return HTTPError(
        "https://api.football-data.org/v4/competitions/PL/standings",
        500,
        "Server Error",
        None,
        None,
    )


def test_headers_contains_token():
    client = FootballDataClient("test-token")

    assert client._headers() == {"X-Auth-Token": "test-token"}


def test_get_competition_sends_expected_request(monkeypatch):
    urlopen = Mock(return_value=response_with_json(b'{"name": "Premier League"}'))
    monkeypatch.setattr(
        "finalwhistle.api.football_data.urlopen",
        urlopen,
    )

    client = FootballDataClient("test-token")
    competition = client.get_competition("PL")

    assert competition == {"name": "Premier League"}
    request = urlopen.call_args.args[0]
    assert request.full_url == "https://api.football-data.org/v4/competitions/PL"
    assert request.get_header("X-auth-token") == "test-token"
    assert urlopen.call_args.kwargs == {"timeout": 10}


def test_get_standings_sends_expected_request(monkeypatch):
    urlopen = Mock(return_value=response_with_json(b'{"standings": []}'))
    monkeypatch.setattr(
        "finalwhistle.api.football_data.urlopen",
        urlopen,
    )

    client = FootballDataClient("test-token")
    standings = client.get_standings("PL")

    assert standings == {"standings": []}
    request = urlopen.call_args.args[0]
    assert request.full_url == (
        "https://api.football-data.org/v4/competitions/PL/standings"
    )


def test_get_matches_sends_expected_request(monkeypatch):
    urlopen = Mock(return_value=response_with_json(b'{"matches": []}'))
    monkeypatch.setattr(
        "finalwhistle.api.football_data.urlopen",
        urlopen,
    )

    client = FootballDataClient("test-token")
    matches = client.get_matches("PD")

    assert matches == {"matches": []}
    request = urlopen.call_args.args[0]
    assert request.full_url == (
        "https://api.football-data.org/v4/competitions/PD/matches"
    )


def test_get_standings_retries_temporary_server_error(monkeypatch):
    urlopen = Mock(
        side_effect=[
            temporary_server_error(),
            response_with_json(b'{"standings": []}'),
        ]
    )
    sleep = Mock()
    monkeypatch.setattr(
        "finalwhistle.api.football_data.urlopen",
        urlopen,
    )
    monkeypatch.setattr(
        "finalwhistle.api.football_data.time.sleep",
        sleep,
    )

    client = FootballDataClient("test-token")
    standings = client.get_standings("PL")

    assert standings == {"standings": []}
    assert urlopen.call_count == 2
    sleep.assert_called_once_with(2)


def test_get_standings_fails_after_retry_limit(monkeypatch):
    urlopen = Mock(side_effect=[temporary_server_error() for _ in range(3)])
    sleep = Mock()
    monkeypatch.setattr(
        "finalwhistle.api.football_data.urlopen",
        urlopen,
    )
    monkeypatch.setattr(
        "finalwhistle.api.football_data.time.sleep",
        sleep,
    )

    client = FootballDataClient("test-token")

    with pytest.raises(RuntimeError, match="500 after 3 attempts"):
        client.get_standings("PL")

    assert urlopen.call_count == 3
    assert sleep.call_args_list == [call(2), call(4)]
