#!/usr/bin/env python3
"""Find and download logos and product images from Wikimedia Commons, with their licenses.

usage:
  fetch_assets.py search "Meta Quest logo" ["Claude AI symbol" ...]       list matching Commons files
  fetch_assets.py get "File:Meta Platforms Inc. logo.svg" out_dir/meta_logo [--width 1600] [--white-text]

`get` saves a PNG (Commons renders SVGs to PNG at --width) and prints the license; keep the license for the post
caption when it asks for credit (CC BY, CC BY-SA). --white-text recolours dark wordmark text to white for dark
backgrounds and saves <name>_white.png next to it (needs ImageMagick).
Commons rate-limits bursts, so requests are spaced out and retried.
"""
import json, os, re, shutil, subprocess, sys, time, urllib.parse, urllib.request

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "reel-studio/1.0 (asset fetch for video editing)"}


def call(params, tries=5):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    for i in range(tries):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30))
        except Exception as e:  # 429s and timeouts: back off and retry
            if i == tries - 1:
                sys.exit(f"Commons request failed after {tries} tries: {e}")
            time.sleep(3 * (i + 1))


def search(queries):
    for q in queries:
        res = call({"action": "query", "list": "search", "srnamespace": 6, "srlimit": 10, "srsearch": q})
        print(f"== {q}")
        for r in res["query"]["search"]:
            print("  ", r["title"])
        time.sleep(1.5)


def get(title, out_base, width, white):
    info = call({"action": "query", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": width, "titles": title})
    page = next(iter(info["query"]["pages"].values()))
    if "imageinfo" not in page:
        sys.exit(f"No file named {title} on Commons")
    ii = page["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    url = ii.get("thumburl") or ii["url"]
    time.sleep(1.5)
    for i in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60).read()
            break
        except Exception as e:
            if i == 4:
                sys.exit(f"Download failed for {title}: {e}")
            time.sleep(3 * (i + 1))
    ext = ".png" if data[:8] == b"\x89PNG\r\n\x1a\n" else ".jpg" if data[:3] == b"\xff\xd8\xff" else os.path.splitext(url)[1]
    out = out_base + ext
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "wb").write(data)
    lic = meta.get("LicenseShortName", {}).get("value", "unknown")
    artist = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip()
    print(f"saved {out}  ({len(data) // 1024} KB, license: {lic}{', author: ' + artist if artist else ''})")
    print(f"source https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}")
    if white:
        if not shutil.which("magick"):
            sys.exit("--white-text needs ImageMagick (magick)")
        wout = out_base + "_white.png"
        subprocess.run(["magick", out, "-channel", "RGB", "-fuzz", "22%", "-fill", "white", "-opaque", "#1C2B33", "-fuzz", "30%", "-opaque", "#000000", "+channel", wout], check=True)
        print(f"saved {wout} (dark text recoloured to white)")


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in ("search", "get"):
        sys.exit(__doc__)
    if sys.argv[1] == "search":
        search(sys.argv[2:])
    else:
        args = sys.argv[2:]
        width = int(args[args.index("--width") + 1]) if "--width" in args else 1600
        get(args[0], args[1], width, "--white-text" in args)


if __name__ == "__main__":
    main()
