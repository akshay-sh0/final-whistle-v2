import json
from dataclasses import asdict
from pathlib import Path

from finalwhistle.models.standing import StandingRow


def export_standings(rows: list[StandingRow], output_path: Path) -> None:
    if not rows:
        raise ValueError("Cannot export empty standings.")

    data = [asdict(row) for row in rows]
    content = json.dumps(data, indent=2) + "\n"

    output_path.parent.mkdir(parents=True, exist_ok=True)

    temporary_path = output_path.with_suffix(".tmp")
    temporary_path.write_text(content, encoding="utf-8")
    temporary_path.replace(output_path)