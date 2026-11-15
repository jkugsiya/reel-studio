#!/usr/bin/env python3
"""List and download free music and sound effects from Mixkit (Mixkit License: free for social videos, no credit needed).

usage:
  fetch_audio.py list music trap|electronica|mood/energetic|tag/technology|...    tracks: title, id, length
  fetch_audio.py list sfx whoosh|transition|cinematic|interface|game|camera|...  sound effects: title, id
  fetch_audio.py get music 132 out_dir/track.mp3
  fetch_audio.py get sfx 166 out_dir/s166.mp3

Titles on listing pages are best-effort; judge a file by measuring it (beats.py for music) or by its known role in
references/sound.md. Never redistribute the files on their own: they belong inside the finished video.
"""
import html, os, re, sys, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def listing(kind, category):
    base = "free-stock-music" if kind == "music" else "free-sound-effects"
    page = fetch(f"https://mixkit.co/{base}/{category.strip('/')}/").decode("utf-8", "ignore")
    pattern = r"https://assets\.mixkit\.co/music/(\d+)/\d+\.mp3" if kind == "music" else r"https://assets\.mixkit\.co/active_storage/sfx/(\d+)/\d+-preview\.mp3"
    seen = set()
    for card in page.split("item-grid-card__title")[1:]:
        title = re.match(r'[^>]*>\s*(.*?)\s*<', card, re.S)
        audio = re.search(pattern, card)
        length = re.search(r">\s*(\d+:\d\d)\s*<", card)
        if audio and audio.group(1) not in seen:
            seen.add(audio.group(1))
            print(f"{audio.group(1):>6}  {html.unescape(title.group(1)) if title else '?':40s} {length.group(1) if length else ''}")
    if not seen:
        print(f"No items found on mixkit.co/{base}/{category}/ (check the category name on the site)")


def get(kind, item_id, out):
    url = f"https://assets.mixkit.co/music/{item_id}/{item_id}.mp3" if kind == "music" else f"https://assets.mixkit.co/active_storage/sfx/{item_id}/{item_id}-preview.mp3"
    data = fetch(url)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "wb").write(data)
    print(f"saved {out} ({len(data) // 1024} KB) from {url}")


def main():
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "list" and a[1] in ("music", "sfx"):
        listing(a[1], a[2])
    elif len(a) == 4 and a[0] == "get" and a[1] in ("music", "sfx"):
        get(a[1], a[2], a[3])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
