import pytest
from finalwhistle.config import get_api_token

def test_get_api_token_returns_environment_value(monkeypatch):
    monkeypatch.setenv("FOOTBALL_DATA_API_TOKEN", "test-token")

    assert get_api_token() == "test-token"

def test_get_api_token_raises_clear_error_when_missing(monkeypatch):
    monkeypatch.delenv("FOOTBALL_DATA_API_TOKEN", raising=False)

    with pytest.raises(RuntimeError, match="FOOTBALL_DATA_API_TOKEN is not set."):
        get_api_token()