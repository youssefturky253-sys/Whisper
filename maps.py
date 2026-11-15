
import base64, os
 
maps = [("moon", "moon.jpg.jfif"), ("mars", "mars.jpg.jfif")]
out = "const MAPS = {\n"
for world, fname in maps:
    if not os.path.exists(fname):
        print("مش لاقي الملف:", fname)
        continue
    with open(fname, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    out += f'  {world}: "data:image/jpeg;base64,{b64}",\n'
    print("تم:", fname, round(len(b64) / 1024 / 1024, 1), "MB")
out += "};\n"
with open("maps.js", "w") as f:
    f.write(out)
print("اتعمل maps.js")
# لازم تثبّت الأداة مرة واحدة:  pip install yt-dlp
VIDEOS = {
  "Apollo 11 Eagle": "nOcDftgR5UQ",
  "Surveyor 1": "FOWNrvvTIZM",
  "Surveyor 3": "Qhgq19u28Fk",
  "Apollo 14 science station (ALSEP)": "l7MMTm1-DAA",
  "Moon Buggy (Apollo 15)": "1Mqsd0ru_pc",
  "Moon Buggy (Apollo 16)": "az9nFrnCK60",
  "Moon Buggy (Apollo 17)": "MvVxtFyTE0M",
  "Sojourner": "4czjS9h4Fpg",
  "Spirit": "uB8CpstmAus",
  "Opportunity": "iMnt6PWYscg",
  "Viking 1": "zeApJ2nuYmY",
  "Viking 2": "__gPs6OPCHY",
  "Phoenix": "xCLg485_xcg",
  "InSight": "RVzzgwVyH4Y",
  "Ingenuity": "qMbHE_VXI-8",
  "Dawn": "IROF86ZTwpI",
  "NEAR Shoemaker": "mcMmDfABKlI",
  "Pioneer 10": "apuQh1Vve3I",
  "Pioneer 11": "UOxgOG_ahxQ",
  "Kepler": "3yij1rJOefM",
}

def slug(n):
    return re.sub(r"[^a-z0-9]+", "_", n.lower()).strip("_")

os.makedirs("videos", exist_ok=True)

for name, vid in VIDEOS.items():
    out = os.path.join("videos", slug(name) + ".mp4")
    if os.path.exists(out):
        print("موجود:", out)
        continue
    print("بنزّل:", name)
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "-f", "18/best[height<=480][ext=mp4]/best[ext=mp4]",
        "--max-filesize", "150M",
        "-o", out,
        "https://www.youtube.com/watch?v=" + vid,
    ]
    r = subprocess.run(cmd)
    if r.returncode != 0 or not os.path.exists(out):
        print("  فشل:", name, "(هيتفتح على يوتيوب بدله)")

print("خلصنا. فولدر videos جاهز.")