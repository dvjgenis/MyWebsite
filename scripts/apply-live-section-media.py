#!/usr/bin/env python3
"""Download live-section images and place youtube/images under matching markdown headings."""

from __future__ import annotations

import hashlib
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path("/Users/dvgenis/Desktop/Big_Projects/MyWebsite")
IMG_DIR = ROOT / "public" / "images"
PAGES = ROOT / "src" / "content" / "pages"
DATA = json.loads((ROOT / ".tmp-live-section-media.json").read_text())

FILE_MAP = {
    "projects": PAGES / "initiatives/projects/index.md",
    "work": PAGES / "initiatives/work/index.md",
    "speaking": PAGES / "initiatives/speaking/index.md",
    "education": PAGES / "about/education/index.md",
    "citl": PAGES / "initiatives/speaking/citl/index.md",
    "awards": PAGES / "initiatives/awards/index.md",
}

SKIP_IMG = re.compile(r"i\.ytimg\.com|ytimg\.com|googleusercontent\.com/a-/")


def norm(s: str) -> str:
    s = s.lower()
    s = s.replace("–", "-").replace("—", "-").replace("’", "'")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def headings_match(live: str, md: str) -> bool:
    a, b = norm(live), norm(md)
    if a == b:
        return True
    a40, b40 = a[:48], b[:48]
    if a.startswith(b40) or b.startswith(a40):
        return True
    # Costa Rica heading has a stray space in export; live is clean
    a_tok = a.split(":")[0].split("|")[0].strip()
    b_tok = b.split(":")[0].split("|")[0].strip()
    if len(a_tok) > 18 and (a_tok in b or b_tok in a):
        return True
    return False


def download(url: str) -> str | None:
    if SKIP_IMG.search(url):
        return None
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh) Chrome/126"})
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            data = resp.read()
            ctype = resp.headers.get("Content-Type", "")
    except Exception as e:
        print("  FAIL download", e, url[:80])
        return None
    if len(data) < 10000:
        return None
    ext = ".jpg"
    if "png" in ctype or url.lower().endswith(".png"):
        ext = ".png"
    elif "webp" in ctype:
        ext = ".webp"
    digest = hashlib.md5(data).hexdigest()
    dest = IMG_DIR / f"{digest}{ext}"
    if not dest.exists():
        dest.write_bytes(data)
    return f"/images/{digest}{ext}"


def strip_leading_media(body: str) -> str:
    lines = body.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == "":
            i += 1
            continue
        if re.match(r"^youtube:[A-Za-z0-9_-]{11}\s*$", line):
            i += 1
            continue
        if re.match(r"^!\[.*\]\(/images/[^)]+\)\s*$", line):
            i += 1
            continue
        break
    return "\n".join(lines[i:]).lstrip("\n")


def split_sections(md: str) -> tuple[str, list[tuple[str, str, str]]]:
    """Return (preamble, [(full_heading_line, heading_text, body), ...])."""
    parts = re.split(r"(^## .+)$", md, flags=re.M)
    preamble = parts[0]
    sections = []
    for i in range(1, len(parts), 2):
        heading_line = parts[i]
        heading_text = heading_line[3:].strip()
        body = parts[i + 1] if i + 1 < len(parts) else ""
        sections.append((heading_line, heading_text, body))
    return preamble, sections


def apply_page(key: str) -> None:
    path = FILE_MAP[key]
    live_sections = DATA[key]
    text = path.read_text()

    if key == "projects":
        cut = text.find("\n## Technical Projects\n")
        if cut != -1:
            text = text[:cut].rstrip() + "\n"

    # Cache downloads per URL
    url_files: dict[str, str | None] = {}
    live_by_heading = []
    for s in live_sections:
        files = []
        for url in s.get("images") or []:
            if url not in url_files:
                url_files[url] = download(url)
            if url_files[url]:
                files.append(url_files[url])
        # de-dupe preserve order
        seen = set()
        uniq = []
        for f in files:
            if f not in seen:
                seen.add(f)
                uniq.append(f)
        live_by_heading.append({"heading": s["heading"], "yt": list(dict.fromkeys(s.get("yt") or [])), "files": uniq})

    preamble, sections = split_sections(text)
    used_live = set()
    out_sections = []
    for heading_line, heading_text, body in sections:
        body = strip_leading_media(body)
        match = None
        match_i = None
        for i, live in enumerate(live_by_heading):
            if i in used_live:
                continue
            if headings_match(live["heading"], heading_text):
                match = live
                match_i = i
                break
        media_lines = []
        if match:
            used_live.add(match_i)
            for yt in match["yt"]:
                media_lines.append(f"youtube:{yt}")
            for f in match["files"]:
                media_lines.append(f"![]({f})")
        if media_lines:
            new_body = "\n\n" + "\n\n".join(media_lines) + "\n\n" + body.lstrip("\n")
        else:
            new_body = "\n\n" + body.lstrip("\n") if body.strip() else "\n\n"
        out_sections.append(heading_line + new_body)

    # CITL: also drop youtube under Episode 6 if Summer of AI has it
    new_text = preamble.rstrip() + "\n\n" + "".join(out_sections)
    new_text = re.sub(r"\n{3,}", "\n\n", new_text).rstrip() + "\n"
    path.write_text(new_text)
    unmatched = [live["heading"] for i, live in enumerate(live_by_heading) if i not in used_live]
    print(f"{key}: wrote {path.relative_to(ROOT)}; unmatched live headings: {unmatched}")


def patch_background_and_abroad() -> None:
    bg = PAGES / "about/background/index.md"
    text = bg.read_text()
    text = text.replace("\nyoutube:qUDG06BvWxc\n", "\n")
    bg.write_text(text)
    print("background: removed Data Gardener youtube qUDG06BvWxc")

    abroad = PAGES / "initiatives/abroad/index.md"
    text = abroad.read_text()
    text = text.replace("youtube:10cS7xFHpaU\n\n", "")
    # insert under Bonus Piece
    if "youtube:10cS7xFHpaU" not in text:
        text = text.replace("## Bonus Piece!", "## Bonus Piece!\n\nyoutube:10cS7xFHpaU")
    abroad.write_text(text)
    print("abroad: moved 10cS7xFHpaU to Bonus Piece")


def main() -> None:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    for key in FILE_MAP:
        print("==", key)
        apply_page(key)
    patch_background_and_abroad()


if __name__ == "__main__":
    main()
