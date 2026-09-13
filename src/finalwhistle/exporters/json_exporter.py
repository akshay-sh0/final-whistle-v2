import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from finalwhistle.models.standing import StandingRow


def export_standings(rows: list[StandingRow], output_path: Path) -> None:
    if not rows:
        raise ValueError("Cannot export empty standings.")

    data = [asdict(row) for row in rows]
    _write_json(data, output_path)


def export_update_metadata(updated_at: datetime, output_path: Path) -> None:
    if updated_at.tzinfo is None:
        raise ValueError("The update timestamp must include a timezone.")

    timestamp = (
        updated_at.astimezone(timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z")
    )
    _write_json({"updated_at": timestamp}, output_path)


def _write_json(data: object, output_path: Path) -> None:
    content = json.dumps(data, indent=2) + "\n"

    output_path.parent.mkdir(parents=True, exist_ok=True)

    temporary_path = output_path.with_suffix(".tmp")
    temporary_path.write_text(content, encoding="utf-8")
    temporary_path.replace(output_path)
