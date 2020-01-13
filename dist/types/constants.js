"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function maskPrinter(n) {
    var validMasks = [];
    var keys = Object.keys(exports.SNGConstants);
    for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (n & exports.SNGConstants[key])
            validMasks.push(key.toString());
    }
    return validMasks.join(",");
}
exports.maskPrinter = maskPrinter;
exports.SNGConstants = {
    NOTE_TURNING_BPM_TEMPO: 0x00000004,
    // chord template Mask (displayName ends with "arp" or "nop")
    CHORD_MASK_ARPEGGIO: 0x00000001,
    CHORD_MASK_NOP: 0x00000002,
    // NoteFlags:
    NOTE_FLAGS_NUMBERED: 0x00000001,
    // NoteMask:
    NOTE_MASK_UNDEFINED: 0x0,
    // missing - not used in lessons/songs            0x01
    NOTE_MASK_CHORD: 0x02,
    NOTE_MASK_OPEN: 0x04,
    NOTE_MASK_FRETHANDMUTE: 0x08,
    NOTE_MASK_TREMOLO: 0x10,
    NOTE_MASK_HARMONIC: 0x20,
    NOTE_MASK_PALMMUTE: 0x40,
    NOTE_MASK_SLAP: 0x80,
    NOTE_MASK_PLUCK: 0x0100,
    NOTE_MASK_POP: 0x0100,
    NOTE_MASK_HAMMERON: 0x0200,
    NOTE_MASK_PULLOFF: 0x0400,
    NOTE_MASK_SLIDE: 0x0800,
    NOTE_MASK_BEND: 0x1000,
    NOTE_MASK_SUSTAIN: 0x2000,
    NOTE_MASK_TAP: 0x4000,
    NOTE_MASK_PINCHHARMONIC: 0x8000,
    NOTE_MASK_VIBRATO: 0x010000,
    NOTE_MASK_MUTE: 0x020000,
    NOTE_MASK_IGNORE: 0x040000,
    NOTE_MASK_LEFTHAND: 0x00080000,
    NOTE_MASK_RIGHTHAND: 0x00100000,
    NOTE_MASK_HIGHDENSITY: 0x200000,
    NOTE_MASK_SLIDEUNPITCHEDTO: 0x400000,
    NOTE_MASK_SINGLE: 0x00800000,
    NOTE_MASK_CHORDNOTES: 0x01000000,
    NOTE_MASK_DOUBLESTOP: 0x02000000,
    NOTE_MASK_ACCENT: 0x04000000,
    NOTE_MASK_PARENT: 0x08000000,
    NOTE_MASK_CHILD: 0x10000000,
    NOTE_MASK_ARPEGGIO: 0x20000000,
    // missing - not used in lessons/songs            0x40000000
    NOTE_MASK_STRUM: 0x80000000,
    NOTE_MASK_ARTICULATIONS_RH: 0x0000C1C0,
    NOTE_MASK_ARTICULATIONS_LH: 0x00020628,
    NOTE_MASK_ARTICULATIONS: 0x0002FFF8,
    NOTE_MASK_ROTATION_DISABLED: 0x0000C1E0,
};
