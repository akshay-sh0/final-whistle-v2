import os

def get_api_token() -> str:
    token = os.environ.get("FOOTBALL_DATA_API_TOKEN")

    if not token:
        raise RuntimeError("FOOTBALL_DATA_API_TOKEN is not set.")

    return token