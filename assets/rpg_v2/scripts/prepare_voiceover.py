#!/usr/bin/env python3
"""Extract Act One voiceovers and remove the generated beep tail."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path


EXPECTED_FILES = {
    "vo_act1_001_narrator.mp3",
    "vo_act1_002_yi.mp3",
    "vo_act1_003_yi.mp3",
    "vo_act1_004_yi.mp3",
    "vo_act1_005_taipo.mp3",
    "vo_act1_006_yi.mp3",
    "vo_act1_007_mia.mp3",
    "vo_act1_008_yi.mp3",
    "vo_act1_009_mia.mp3",
    "vo_act1_010_yi.mp3",
    "vo_act1_011_mia.mp3",
    "vo_act1_012_yi.mp3",
    "vo_act1_013_yi.mp3",
    "vo_act1_014_yi.mp3",
    "vo_act1_015_narrator.mp3",
    "vo_act1_016_yi.mp3",
    "vo_act1_017_yi.mp3",
    "vo_act1_018_narrator.mp3",
    "vo_act1_019_narrator.mp3",
    "vo_act1_020_narrator.mp3",
    "vo_act1_021_narrator.mp3",
    "vo_act1_022_yi.mp3",
    "vo_act1_023_mia.mp3",
    "vo_act1_024_narrator.mp3",
}

SILENCE_START_RE = re.compile(r"silence_start:\s*([0-9.]+)")


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def duration_seconds(ffprobe: str, audio_path: Path) -> float:
    result = run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(audio_path),
        ]
    )
    return float(result.stdout.strip())


def final_silence_start(ffmpeg: str, audio_path: Path) -> float:
    result = subprocess.run(
        [
            ffmpeg,
            "-hide_banner",
            "-i",
            str(audio_path),
            "-af",
            "silencedetect=n=-45dB:d=0.05",
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    starts = [float(value) for value in SILENCE_START_RE.findall(result.stderr)]
    if not starts:
        raise RuntimeError(f"No silence boundary found in {audio_path.name}")
    return starts[-1]


def trim_file(
    ffmpeg: str,
    ffprobe: str,
    source: Path,
    destination: Path,
) -> dict[str, float | str]:
    original_duration = duration_seconds(ffprobe, source)
    trim_end = final_silence_start(ffmpeg, source)
    removed_duration = original_duration - trim_end
    if not 0.25 <= removed_duration <= 1.25:
        raise RuntimeError(
            f"Unsafe trim for {source.name}: would remove "
            f"{removed_duration:.3f}s from {original_duration:.3f}s"
        )

    fade_duration = min(0.04, trim_end / 2)
    fade_start = max(0.0, trim_end - fade_duration)
    destination.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-v",
            "error",
            "-i",
            str(source),
            "-af",
            (
                f"atrim=start=0:end={trim_end:.6f},"
                f"afade=t=out:st={fade_start:.6f}:d={fade_duration:.6f}"
            ),
            "-ar",
            "32000",
            "-ac",
            "1",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "48k",
            "-write_xing",
            "1",
            str(destination),
        ]
    )

    trimmed_duration = duration_seconds(ffprobe, destination)
    if abs(trimmed_duration - trim_end) > 0.08:
        raise RuntimeError(
            f"Unexpected output duration for {source.name}: "
            f"{trimmed_duration:.3f}s, expected about {trim_end:.3f}s"
        )

    return {
        "file": source.name,
        "original_seconds": round(original_duration, 3),
        "trimmed_seconds": round(trimmed_duration, 3),
        "removed_seconds": round(original_duration - trimmed_duration, 3),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if ffmpeg is None or ffprobe is None:
        raise RuntimeError("ffmpeg and ffprobe must be available on PATH")
    if not args.archive.is_file():
        raise FileNotFoundError(args.archive)

    with tempfile.TemporaryDirectory(prefix="gleanings-voiceover-") as temp_dir:
        extracted_root = Path(temp_dir)
        with zipfile.ZipFile(args.archive) as archive:
            archive.extractall(extracted_root)

        sources = {
            source.name: source
            for source in extracted_root.rglob("*.mp3")
            if source.is_file()
        }
        missing = sorted(EXPECTED_FILES - sources.keys())
        unexpected = sorted(sources.keys() - EXPECTED_FILES)
        if missing or unexpected:
            raise RuntimeError(
                "Voiceover archive mismatch: "
                f"missing={missing}, unexpected={unexpected}"
            )

        report = [
            trim_file(
                ffmpeg,
                ffprobe,
                sources[file_name],
                args.output_dir / file_name,
            )
            for file_name in sorted(EXPECTED_FILES)
        ]

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
