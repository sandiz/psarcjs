from construct import *
from rocksmith import SNG
from os import listdir
from os.path import isfile, join, exists
import json

path = "test/sng"
onlyfiles = [f for f in listdir(path) if isfile(join(path, f)) and f.endswith(".sng")]

for sng in onlyfiles:
    file = f"{path}/{sng}"
    file2 = f"{file}.json"
    if(exists(file2)):
        print(f"Skipping json generation for {sng}")
        continue
    print(f"Generating .sng.json for {sng}")
    f = open(file, "rb")
    c = SNG.parse_stream(f)
    s = json.dumps(c, indent=4, default=lambda _: None)
    g = '\n'.join(l for l in s.splitlines() if '"_io"' not in l)
    f2 = open(file2, "w")
    f2.write(g)
    f2.close()
