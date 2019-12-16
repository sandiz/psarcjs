from construct import *
from rocksmith import SNG

#f = open("3dooletm_m/songs/bin/macos/3dooletm_lead.sng", "rb")
#OLD_SNG = SNG.parse_stream(f)

NEW_SNG = Struct(
    "beats_length" / Int32ul
)
f = open("3dooletm_m/songs/bin/macos/3dooletm_lead.sng", "rb")
sng = NEW_SNG.parse_stream(f)
print(sng)
