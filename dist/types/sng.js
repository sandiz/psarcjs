"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CRC32 = require('js-crc32'); // uncomment this line if in node
var song2014_1 = require("../song2014");
var constants_1 = require("./constants");
var common_1 = require("./common");
var sngparser_1 = require("../sngparser");
var BEND = /** @class */ (function () {
    function BEND() {
        this.time = 0;
        this.step = 0;
        this.UNK = 0;
    }
    return BEND;
}());
exports.BEND = BEND;
var BENDS = /** @class */ (function () {
    function BENDS() {
        this.count = 0;
        this.bendValues = [];
    }
    return BENDS;
}());
exports.BENDS = BENDS;
var BEATS = /** @class */ (function () {
    function BEATS() {
        this.time = 0;
        this.measure = 0;
        this.beat = 0;
        this.phraseIteration = 0;
        this.mask = 0;
    }
    BEATS.fromSongEBeat = function (beats, pi) {
        var measure = 0;
        var beat = 0;
        return beats.map(function (item) {
            var time = item.time;
            if (item.measure && item.measure >= 0) {
                measure = item.measure;
                beat = 0;
            }
            else {
                beat++;
            }
            var bpmPhraseIteration = getPhraseIterationId(pi, time, true);
            var mask = 0;
            if (beat == 0) {
                mask |= 1;
                if (measure % 2 == 0)
                    mask |= 2;
            }
            return {
                time: time,
                measure: measure,
                beat: beat,
                phraseIteration: bpmPhraseIteration,
                mask: mask
            };
        });
    };
    return BEATS;
}());
exports.BEATS = BEATS;
var PHRASES = /** @class */ (function () {
    function PHRASES() {
        this.solo = 0;
        this.disparity = 0;
        this.ignore = 0;
        this.padding = 0;
        this.maxDifficulty = 0;
        this.phraseIterationLinks = 9;
        this.name = '';
    }
    PHRASES.fromSongPhrase = function (phrases, pi) {
        if (phrases.length === 0)
            return [];
        return phrases.map(function (item, index) {
            return {
                solo: item.solo,
                disparity: item.disparity,
                ignore: item.ignore,
                padding: 0,
                maxDifficulty: item.maxDifficulty,
                phraseIterationLinks: pi.filter(function (item) { return item.phraseId === index; }).length,
                name: item.name.slice(0, 32),
            };
        });
    };
    return PHRASES;
}());
exports.PHRASES = PHRASES;
var CHORDTEMPLATES = /** @class */ (function () {
    function CHORDTEMPLATES() {
        this.mask = 0;
        this.frets = [];
        this.fingers = [];
        this.notes = [];
        this.name = '';
    }
    CHORDTEMPLATES.fromSongChordTemplate = function (ct, tuning, arrangement, capo) {
        if (ct.length === 0)
            return [];
        return ct.map(function (item, index) {
            var mask = 0;
            var frets = [0, 0, 0, 0, 0, 0];
            var fingers = [0, 0, 0, 0, 0, 0];
            var notes = [0, 0, 0, 0, 0, 0];
            if (item.displayName.endsWith("arp"))
                mask = (mask | constants_1.SNGConstants.CHORD_MASK_ARPEGGIO) >>> 0;
            else if (item.displayName.endsWith("nop"))
                mask = (mask | constants_1.SNGConstants.CHORD_MASK_NOP) >>> 0;
            frets[0] = item.fret0;
            frets[1] = item.fret1;
            frets[2] = item.fret2;
            frets[3] = item.fret3;
            frets[4] = item.fret4;
            frets[5] = item.fret5;
            fingers[0] = item.finger0;
            fingers[1] = item.finger1;
            fingers[2] = item.finger2;
            fingers[3] = item.finger3;
            fingers[4] = item.finger4;
            fingers[5] = item.finger5;
            for (var i = 0; i < 6; i++) {
                notes[i] = getMidiNote(Object.values(tuning), i, frets[i], arrangement == common_1.ArrangmentType.BASS, capo, true);
            }
            return {
                mask: mask,
                frets: frets,
                fingers: fingers,
                notes: notes,
                name: item.chordName.slice(0, 32),
            };
        });
    };
    return CHORDTEMPLATES;
}());
exports.CHORDTEMPLATES = CHORDTEMPLATES;
var CHORDNOTES = /** @class */ (function () {
    function CHORDNOTES() {
        this.mask = [];
        this.bends = [];
        this.slideTo = [];
        this.slideUnpitchTo = [];
        this.vibrato = [];
    }
    return CHORDNOTES;
}());
exports.CHORDNOTES = CHORDNOTES;
var PHRASEITERATIONS = /** @class */ (function () {
    function PHRASEITERATIONS() {
        this.phraseId = 0;
        this.startTime = 0;
        this.nextPhraseTime = 0;
        this.difficulty = [];
    }
    PHRASEITERATIONS.fromPhraseIterations = function (pt, sp, songLength) {
        if (pt.length === 0)
            return [];
        return pt.map(function (item, index) {
            var diff = [0, 0, 0];
            diff[2] = sp[item.phraseId].maxDifficulty;
            if (item.heroLevels.length !== 0) {
                for (var i = 0; i < item.heroLevels.length; i += 1) {
                    var h = item.heroLevels[i];
                    diff[h.hero - 1] = h.difficulty;
                }
            }
            return {
                phraseId: item.phraseId,
                startTime: item.time,
                nextPhraseTime: (index + 1 < pt.length) ? pt[index + 1].time : songLength,
                difficulty: diff,
            };
        });
    };
    return PHRASEITERATIONS;
}());
exports.PHRASEITERATIONS = PHRASEITERATIONS;
var NEWLINKEDDIFFS = /** @class */ (function () {
    function NEWLINKEDDIFFS() {
        this.levelBreak = 0;
        this.nld_phrase_length = 0;
        this.nld_phrase = [];
    }
    NEWLINKEDDIFFS.fromNewLinkedDiffs = function (nld) {
        if (nld.length === 0)
            return [];
        return nld.map(function (item, index) {
            var nld2 = new Array(item.phraseCount);
            for (var i = 0; i < item.phraseCount; i += 1) {
                nld2[i] = item.nld_phrase[i].id;
            }
            return {
                levelBreak: item.levelBreak,
                nld_phrase_length: item.phraseCount,
                nld_phrase: nld2,
            };
        });
        return [];
    };
    return NEWLINKEDDIFFS;
}());
exports.NEWLINKEDDIFFS = NEWLINKEDDIFFS;
var EVENTS = /** @class */ (function () {
    function EVENTS() {
        this.time = 0;
        this.name = '';
    }
    EVENTS.fromEvents = function (evs) {
        if (evs.length === 0)
            return [];
        return evs.map(function (item, index) {
            return {
                time: item.time,
                name: item.code.slice(0, 32),
            };
        });
    };
    return EVENTS;
}());
exports.EVENTS = EVENTS;
var TONE = /** @class */ (function () {
    function TONE() {
        this.time = 0;
        this.id = 0;
    }
    TONE.fromTone = function (tones, toneObj) {
        if (tones.length === 0)
            return [];
        return tones.map(function (item, index) {
            var toneid = 0;
            if (toneObj.tonebase.toLowerCase() === item.name.toLowerCase())
                toneid = 0;
            else if (toneObj.tonea.toLowerCase() === item.name.toLowerCase())
                toneid = 0;
            else if (toneObj.toneb.toLowerCase() === item.name.toLowerCase())
                toneid = 1;
            else if (toneObj.tonec.toLowerCase() === item.name.toLowerCase())
                toneid = 2;
            else if (toneObj.toned.toLowerCase() === item.name.toLowerCase())
                toneid = 3;
            return {
                time: item.time,
                id: toneid,
            };
        });
    };
    return TONE;
}());
exports.TONE = TONE;
var DNA = /** @class */ (function () {
    function DNA() {
        this.time = 0;
        this.id = 0;
    }
    DNA.fromDNA = function (events) {
        if (events.length === 0)
            return [];
        var dnas = [];
        for (var i = 0; i < events.length; i += 1) {
            var item = events[i];
            if (item.code.includes("dna_")) {
                var ider = -1;
                switch (item.code) {
                    case "dna_none":
                        ider = 0;
                        break;
                    case "dna_solo":
                        ider = 1;
                        break;
                    case "dna_riff":
                        ider = 2;
                        break;
                    case "dna_chord":
                        ider = 3;
                        break;
                }
                if (ider != -1) {
                    dnas.push({
                        time: item.time,
                        id: ider,
                    });
                }
            }
        }
        return dnas;
    };
    return DNA;
}());
exports.DNA = DNA;
var SECTIONS = /** @class */ (function () {
    function SECTIONS() {
        this.name = '';
        this.number = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.startPhraseIterationId = 0;
        this.endPhraseIterationId = 0;
        this.stringMask = new Array(36);
    }
    SECTIONS.fromSections = function (sections, pi, ph, levels, ct, songLength) {
        if (sections.length == 0)
            return [];
        return sections.map(function (item, index) {
            var endTime = 0;
            if (index + 1 < sections.length)
                endTime = sections[index + 1].startTime;
            else
                endTime = songLength;
            ;
            var startPhraseIterationId = getPhraseIterationId(pi, item.startTime, false);
            var endPhraseIterationId = getPhraseIterationId(pi, endTime, true);
            var sm = new Array(36);
            for (var j = getMaxDifficulty(ph); j >= 0; j -= 1) {
                var mask = 0;
                for (var i = 0; i < levels[j].notes.length; i += 1) {
                    var note = levels[j].notes[i];
                    if (note.time >= item.startTime && note.time < endTime) {
                        mask |= (1 << note.string);
                    }
                }
                for (var i = 0; i < levels[j].chords.length; i += 1) {
                    var chord = levels[j].chords[i];
                    if (chord.time >= item.startTime && chord.time < endTime) {
                        var ch = ct[chord.chordId];
                        if (ch.fret0 != -1)
                            mask |= (1 << 0);
                        if (ch.fret1 != -1)
                            mask |= (1 << 1);
                        if (ch.fret2 != -1)
                            mask |= (1 << 2);
                        if (ch.fret3 != -1)
                            mask |= (1 << 3);
                        if (ch.fret4 != -1)
                            mask |= (1 << 4);
                        if (ch.fret5 != -1)
                            mask |= (1 << 5);
                        if (mask == 0x3F)
                            break;
                    }
                }
                if (mask == 0 && j < getMaxDifficulty(ph))
                    mask = sm[j + 1];
                sm[j] = mask;
            }
            return {
                name: item.name.slice(0, 32),
                number: item.number,
                startTime: item.startTime,
                endTime: endTime,
                startPhraseIterationId: startPhraseIterationId,
                endPhraseIterationId: endPhraseIterationId,
                stringMask: sm,
            };
        });
    };
    return SECTIONS;
}());
exports.SECTIONS = SECTIONS;
var METADATA = /** @class */ (function () {
    function METADATA() {
        this.maxScores = 0;
        this.maxNotesAndChords = 0;
        this.maxNotesAndChords_Real = 0;
        this.pointsPerNote = 0;
        this.firstBeatLength = 0;
        this.startTime = 0;
        this.capo = 0;
        this.lastConversionDateTime = '';
        this.part = 0;
        this.songLength = 0;
        this.tuningLength = 6;
        this.tuning = [0, 0, 0, 0, 0, 0];
        this.firstNoteTime = 0;
        this.firstNoteTime2 = 0;
        this.maxDifficulty = 0;
    }
    METADATA.fromSong2014 = function (song, PH, levels) {
        var nc = new Array(3);
        nc[0] = getNoteCount(PH, levels, 0);
        nc[1] = getNoteCount(PH, levels, 1);
        var ig = 0;
        nc[2] = getNoteCount(PH, levels, 2);
        var ms = 100000;
        return {
            maxScores: ms,
            maxNotesAndChords: nc[2],
            maxNotesAndChords_Real: nc[2] - ig,
            pointsPerNote: nc[2] ? ms / nc[2] : 0,
            firstBeatLength: song.ebeats[1].time - song.ebeats[0].time,
            startTime: song.offset * -1,
            capo: song.capo == 0 ? -1 : song.capo,
            lastConversionDateTime: song.lastConversionDateTime.slice(0, 32),
            part: song.part,
            songLength: song.songLength,
            tuningLength: 6,
            tuning: [song.tuning.string0, song.tuning.string1, song.tuning.string2,
                song.tuning.string3, song.tuning.string4, song.tuning.string5],
            firstNoteTime: first_note_time,
            firstNoteTime2: first_note_time,
            maxDifficulty: getMaxDifficulty(song.phrases),
        };
    };
    return METADATA;
}());
exports.METADATA = METADATA;
var NOTES = /** @class */ (function () {
    function NOTES() {
        this.mask = 0;
        this.flags = 0;
        this.hash = 0;
        this.time = 0;
        this.string = -1;
        this.fret = -1;
        this.anchorFret = -1;
        this.anchorWidth = -1;
        this.chordId = 0;
        this.chordNoteId = 0;
        this.phraseId = 0;
        this.phraseIterationId = 0;
        this.fingerPrintId = [];
        this.nextIterNote = 0;
        this.prevIterNote = 0;
        this.parentPrevNote = 0;
        this.slideTo = -1;
        this.slideUnpitchTo = -1;
        this.leftHand = -1;
        this.tap = -1;
        this.pickDirection = -1;
        this.slap = -1;
        this.pluck = -1;
        this.vibrato = 0;
        this.sustain = 0;
        this.maxBend = 0;
        this.bend_length = 0;
        this.bends = [];
    }
    return NOTES;
}());
exports.NOTES = NOTES;
var FPW = /** @class */ (function () {
    function FPW() {
        this.item0_length = 0;
        this.I0 = [];
    }
    return FPW;
}());
exports.FPW = FPW;
var first_note_time = 0;
var LEVELS = /** @class */ (function () {
    function LEVELS() {
        this.difficulty = 0;
        this.anchors_length = 0;
        this.anchors = [];
        this.anchor_ext_length = 0;
        this.anchor_extensions = [];
        this.fingerprints = [new FPW(), new FPW()];
        this.notes_length = 0;
        this.notes = [];
        this.anpi_length = 0;
        this.averageNotesPerIter = [];
        this.niicni_length = 0;
        this.notesInIterCountNoIgnored = [];
        this.niic_length = 0;
        this.notesInIterCount = [];
    }
    LEVELS.fromLevels = function (sl, pi, CT, PH, phrases) {
        var levels = [];
        var note_id = {};
        first_note_time = 0;
        cns = [];
        cnsId = {};
        var _loop_1 = function (i) {
            var songLevel = sl[i];
            var difficulty = songLevel.difficulty;
            var ank = [];
            for (var j = 0; j < songLevel.anchors.length; j += 1) {
                ank.push({
                    time: songLevel.anchors[j].time,
                    endTime: j + 1 < songLevel.anchors.length ? songLevel.anchors[j + 1].time : pi[pi.length - 1].time,
                    UNK_time: 3.4028234663852886e+38,
                    UNK_time2: 1.1754943508222875e-38,
                    fret: songLevel.anchors[j].fret,
                    width: songLevel.anchors[j].width,
                    phraseIterationId: getPhraseIterationId(pi, songLevel.anchors[j].time, false),
                });
            }
            ;
            var anchorExts = [];
            var anchorExtLength = 0;
            songLevel.notes.forEach(function (note) {
                if (note.slideTo && note.slideTo != -1)
                    ++anchorExtLength;
            });
            var fingerprints1 = new FPW();
            var fingerprints2 = new FPW();
            var fp1 = [];
            var fp2 = [];
            songLevel.handShapes.forEach(function (h) {
                if (h.chordId < 0)
                    return;
                var fp = {
                    chordId: h.chordId,
                    startTime: h.startTime,
                    endTime: h.endTime,
                    UNK_startTime: -1,
                    UNK_endTime: -1,
                };
                if (CT[fp.chordId].name.endsWith("arp"))
                    fp2.push(fp);
                else
                    fp1.push(fp);
            });
            fingerprints1.item0_length = fp1.length;
            fingerprints1.I0 = fp1;
            fingerprints2.item0_length = fp2.length;
            fingerprints2.I0 = fp2;
            var notes = [];
            var notesInIteration1 = new Array(pi.length).fill(0);
            var notesInIteration2 = new Array(pi.length).fill(0);
            var acent = 0;
            songLevel.notes.forEach(function (note) {
                var _a, _b;
                var n = new NOTES();
                var prev = new NOTES();
                if (songLevel.notes.length > 0)
                    prev = notes[notes.length - 1];
                parseNote(pi, note, n, prev);
                notes.push(n);
                for (var j = 0; j < pi.length; j += 1) {
                    var piter = pi[j];
                    // fix for 100% bug issue and improve mastery
                    if (piter.time > note.time && j > 0) {
                        if (note.ignore == undefined || note.ignore == 0)
                            ++notesInIteration1[j - 1];
                        ++notesInIteration2[j - 1];
                        break;
                    }
                }
                if (note.slideTo && note.slideTo != -1) {
                    var ae = {
                        fret: (_a = note.slideTo, (_a !== null && _a !== void 0 ? _a : 0)),
                        time: note.time + (_b = note.sustain, (_b !== null && _b !== void 0 ? _b : 0)),
                    };
                    anchorExts[acent++] = ae;
                }
            });
            songLevel.chords.forEach(function (chord) {
                var cn = new NOTES();
                var id = INT32_MAX;
                if (chord.chordNote && chord.chordNote.length > 0)
                    id = addChordNotes(chord);
                parseChord(pi, chord, cn, id, CT);
                notes.push(cn);
                for (var j = 0; j < pi.length; j++) {
                    var piter = pi[j];
                    // fix for 100% bug issue and improve mastery
                    if (piter.time > chord.time && j > 0) {
                        if (chord.ignore == 0)
                            ++notesInIteration1[j - 1];
                        ++notesInIteration2[j - 1];
                        break;
                    }
                }
            });
            notes.sort(function (a, b) { return a.time - b.time; });
            if (first_note_time == 0 || first_note_time > notes[0].time)
                first_note_time = notes[0].time;
            var chordInHandshape = {};
            var chordInArpeggio = {};
            notes.forEach(function (n) {
                for (var id = 0; id < fp1.length; id++) { // FingerPrints 1st level (common handshapes)
                    if (n.time >= fp1[id].startTime && n.time < fp1[id].endTime) {
                        // Handshapes can be inside other handshapes
                        if (n.fingerPrintId[0] == INT16_MAX)
                            n.fingerPrintId[0] = id;
                        // Add STRUM to first chord in the handshape (The chord will be rendered as a full chord panel)
                        // In later DLC, frethand muted chords that start a handshape may not have STRUM
                        if (n.chordId != INT32_MAX) {
                            // There may be single notes before the first chord so can't use fp1[id].StartTime == n.Time
                            if (!((Object.keys(chordInHandshape)).includes(id.toString()))) {
                                n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_STRUM) >>> 0;
                                chordInHandshape[id] = n.chordId;
                            }
                            else if (chordInHandshape[id] != n.chordId) {
                                // This should not be necessary for official songs
                                //console.log("b", n.mask);
                                n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_STRUM) >>> 0;
                                chordInHandshape[id] = n.chordId;
                            }
                        }
                        if (fp1[id].UNK_startTime == -1)
                            fp1[id].UNK_startTime = n.time;
                        var noteEnd = n.time + n.sustain;
                        if (noteEnd >= fp1[id].endTime) {
                            // Not entirely accurate, sometimes Unk4 is -1 even though there is a chord in the handshape...
                            if (n.time == fp1[id].startTime) {
                                fp1[id].UNK_endTime = fp1[id].endTime;
                            }
                        }
                        else {
                            fp1[id].UNK_endTime = noteEnd;
                        }
                    }
                    else {
                        if (fp1[id].UNK_startTime == -1)
                            fp1[id].UNK_startTime = fp1[id].startTime;
                        if (fp1[id].UNK_endTime == -1)
                            fp1[id].UNK_endTime = fp1[id].endTime;
                    }
                }
                for (var id = 0; id < fp2.length; id++) { // FingerPrints 2nd level (used for -arp(eggio) handshapes)
                    if (n.time >= fp2[id].startTime && n.time < fp2[id].endTime) {
                        n.fingerPrintId[1] = id;
                        // Add STRUM to first chord in the arpeggio handshape
                        if (n.chordId != -1) {
                            if (!Object.keys(chordInArpeggio).includes(id.toString())) {
                                n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_STRUM) >>> 0;
                                chordInArpeggio[id] = n.chordId;
                            }
                            else if (chordInArpeggio[id] != n.chordId) {
                                // This should not be necessary for official songs
                                n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_STRUM) >>> 0;
                                chordInArpeggio[id] = n.chordId;
                            }
                        }
                        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_ARPEGGIO) >>> 0;
                        if (fp2[id].UNK_startTime == -1)
                            fp2[id].UNK_startTime = n.time;
                        var sustain = 0;
                        if (n.time + n.sustain < fp2[id].endTime)
                            sustain = n.sustain;
                        fp2[id].UNK_endTime = n.time + sustain;
                        break;
                    }
                    else {
                        if (fp2[id].UNK_startTime == -1)
                            fp2[id].UNK_startTime = fp2[id].startTime;
                        if (fp2[id].UNK_endTime == -1)
                            fp2[id].UNK_endTime = fp2[id].endTime;
                    }
                }
                for (var j = 0; j < ank.length; j++) {
                    if (n.time >= ank[j].time && n.time < ank[j].endTime) {
                        n.anchorWidth = ank[j].width;
                        // anchor fret
                        n.anchorFret = ank[j].fret;
                        if (ank[j].UNK_time == 3.4028234663852886e+38)
                            ank[j].UNK_time = n.time;
                        var sustain = 0;
                        if (n.time + n.sustain < ank[j].endTime - 0.1)
                            sustain = n.sustain;
                        ank[j].UNK_time2 = n.time + sustain;
                        break;
                    }
                }
            });
            PH.forEach(function (piter) {
                var count = 0;
                var j = 0;
                for (; j < notes.length; j++) {
                    // skip notes outside of a phraseiteration
                    if (notes[j].time < piter.startTime)
                        continue;
                    if (notes[j].time >= piter.nextPhraseTime) {
                        break;
                    }
                    // set to next arrangement note
                    notes[j].nextIterNote = (j + 1);
                    // set all but first note to previous note
                    if (count > 0)
                        notes[j].prevIterNote = (j - 1);
                    ++count;
                }
                // fix last phrase note
                if (count > 0)
                    notes[j - 1].nextIterNote = INT16_MAX;
            });
            for (var j = 0; j < notes.length; j++) {
                // Look for notes with PARENT mask (linkNext=1)
                n = notes[j];
                if ((n.mask & constants_1.SNGConstants.NOTE_MASK_PARENT) != 0) {
                    if (n.chordId == INT32_MAX) // Single note
                     {
                        // Find the next note on the same string
                        var x = j + 1;
                        while (x < notes.length) {
                            nextnote = notes[x];
                            if (nextnote.string == n.string) {
                                nextnote.parentPrevNote = n.nextIterNote - 1;
                                nextnote.mask = (nextnote.mask | constants_1.SNGConstants.NOTE_MASK_CHILD) >>> 0;
                                break;
                            }
                            x++;
                        }
                        if (x == notes.length) {
                            // Ran out of notes in the difficulty level without finding a child note
                            // Possible to end up here due to poorly placed phrase or due to DDC moving phrases
                            // Doesn't crash the game or anything so do nothing for now
                        }
                    }
                    else // Chord
                     {
                        // Chordnotes should always be present
                        if (n.chordNoteId != INT32_MAX) {
                            chordnotes = cns[n.chordNoteId];
                            // Check which chordNotes have linknext
                            for (var cnString = 0; cnString < 6; cnString++) {
                                if ((chordnotes.mask[cnString] & constants_1.SNGConstants.NOTE_MASK_PARENT) != 0) {
                                    // Find the next note on the same string
                                    var x = j + 1;
                                    while (x < notes.length) {
                                        nextnote = notes[x];
                                        if (nextnote.string == cnString) {
                                            // HACK for XML files that do not match official usage re linkNext (allow 1ms margin of error)
                                            if (nextnote.time - (n.time + n.sustain) > 0.001)
                                                break;
                                            nextnote.parentPrevNote = n.nextIterNote - 1;
                                            nextnote.mask = (nextnote.mask | constants_1.SNGConstants.NOTE_MASK_CHILD) >>> 0;
                                            break;
                                        }
                                        x++;
                                    }
                                    if (x == notes.length) {
                                        // Ran out of notes in the difficulty level without finding a child note
                                        // Possible to end up here due to poorly placed phrase or due to DDC moving phrases
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var averageNotesPerIter = new Array(phrases.length).fill(0);
            var iter_count = new Array(phrases.length).fill(0);
            for (var j = 0; j < pi.length; j++) {
                piter = pi[j];
                // using NotesInIteration2 to calculate
                averageNotesPerIter[piter.phraseId] += notesInIteration2[j];
                ++iter_count[piter.phraseId];
            }
            for (var j = 0; j < iter_count.length; j++) {
                if (iter_count[j] > 0)
                    averageNotesPerIter[j] /= iter_count[j];
            }
            notes.forEach(function (n) {
                var buf = sngparser_1.NOTESDATA.encode(n);
                var ncopy = sngparser_1.NOTESDATA.parse(buf);
                ncopy.nextIterNote = INT16_MAX;
                ncopy.prevIterNote = INT16_MAX;
                ncopy.parentPrevNote = INT16_MAX;
                var crc = CRC32.buf(sngparser_1.NOTESDATA.encode(ncopy));
                if (!Object.keys(note_id).includes(crc.toString())) {
                    note_id[crc] = Object.values(note_id).length;
                }
                n.hash = note_id[crc];
            });
            numberNotes(PH, notes);
            var level = {
                difficulty: difficulty,
                anchors_length: ank.length,
                anchors: ank,
                anchor_ext_length: anchorExtLength,
                anchor_extensions: anchorExts,
                fingerprints: [fingerprints1, fingerprints2],
                notes_length: notes.length,
                notes: notes,
                anpi_length: phrases.length,
                averageNotesPerIter: averageNotesPerIter,
                niicni_length: notesInIteration1.length,
                notesInIterCountNoIgnored: notesInIteration1,
                niic_length: notesInIteration2.length,
                notesInIterCount: notesInIteration2,
            };
            levels.push(level);
        };
        var n, nextnote, chordnotes, nextnote, piter;
        for (var i = 0; i < sl.length; i += 1) {
            _loop_1(i);
        }
        return levels;
    };
    return LEVELS;
}());
exports.LEVELS = LEVELS;
function getPhraseIterationId(pi, time, end) {
    var id = 0;
    while (id + 1 < pi.length) {
        if (!end && pi[id + 1].time > time)
            break;
        if (end && pi[id + 1].time >= time)
            break;
        ++id;
    }
    return id;
}
var StandardMidiNotes = [40, 45, 50, 55, 59, 64];
function getMidiNote(tuning, idx, fret, bass, capo, template) {
    if (template === void 0) { template = false; }
    if (fret == (-1))
        return -1;
    // catch unaccessible frets with capo (sometimes there is unused templates, so let them be)
    if (capo > 0 && fret != 0 && (!template && fret < capo)) {
        throw new Error("Invalid XML data: Frets below capo fret are not playable");
    }
    // catch wrong capo template values
    if (capo > 0 && fret == capo && !template) {
        throw new Error("Invalid XML data: Capo frets should be defined as open strings");
    }
    // get note value
    var note = StandardMidiNotes[idx] + tuning[idx] + fret - (bass ? 12 : 0);
    // adjust note value for open strings with capo
    if (capo > 0 && fret == 0) {
        note += capo;
    }
    return note;
}
function getMaxDifficulty(ph) {
    var max = 0;
    for (var i = 0; i < ph.length; i += 1) {
        var phrase = ph[i];
        if (max < phrase.maxDifficulty)
            max = phrase.maxDifficulty;
    }
    return max;
}
var INT16_MAX = 65535;
var INT32_MAX = 4294967295;
function parseNote(pi, note, n, prev) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    n.mask = parseNoteMask(note, true);
    // numbering (NoteFlags) will be set later
    n.time = note.time;
    n.string = note.string;
    // actual fret number
    n.fret = note.fret;
    // anchor fret will be set later
    n.anchorFret = -1;
    // will be overwritten
    n.anchorWidth = -1;
    n.chordId = INT32_MAX;
    n.chordNoteId = INT32_MAX;
    n.phraseIterationId = getPhraseIterationId(pi, n.time, false);
    n.phraseId = pi[n.phraseIterationId] ? pi[n.phraseIterationId].phraseId : 0;
    // these will be overwritten
    n.fingerPrintId[0] = INT16_MAX;
    n.fingerPrintId[1] = INT16_MAX;
    // these will be overwritten
    n.nextIterNote = INT16_MAX;
    n.prevIterNote = INT16_MAX;
    n.parentPrevNote = INT16_MAX;
    n.slideTo = (_a = note.slideTo, (_a !== null && _a !== void 0 ? _a : -1));
    n.slideUnpitchTo = (_b = note.slideUnpitchTo, (_b !== null && _b !== void 0 ? _b : -1));
    n.leftHand = (_c = note.leftHand, (_c !== null && _c !== void 0 ? _c : -1));
    // 'bvibrato' and 'rchords8' are using 0 value but without TAP mask
    if (note.tap != 0)
        n.tap = (_d = note.tap, (_d !== null && _d !== void 0 ? _d : -1));
    else
        n.tap = -1;
    n.pickDirection = (_e = note.pickDirection, (_e !== null && _e !== void 0 ? _e : 0));
    n.slap = (_f = note.slap, (_f !== null && _f !== void 0 ? _f : -1));
    n.pluck = (_g = note.pluck, (_g !== null && _g !== void 0 ? _g : -1));
    n.vibrato = (_h = note.vibrato, (_h !== null && _h !== void 0 ? _h : 0));
    n.sustain = (_j = note.sustain, (_j !== null && _j !== void 0 ? _j : 0));
    n.maxBend = (_k = note.bend, (_k !== null && _k !== void 0 ? _k : 0));
    var b = parseBendData(note, true);
    n.bend_length = b.count;
    n.bends = b.bendValues;
}
function parseNoteMask(note, single) {
    if (note == null)
        return constants_1.SNGConstants.NOTE_MASK_UNDEFINED;
    // single note
    var mask = 0;
    if (single)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_SINGLE) >>> 0;
    if (note.fret == 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_OPEN) >>> 0;
    if (note.linkNext && note.linkNext != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_PARENT) >>> 0;
    if (note.accent && note.accent != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_ACCENT) >>> 0;
    if (note.bend && note.bend != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_BEND) >>> 0;
    if (note.hammerOn && note.hammerOn != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_HAMMERON) >>> 0;
    if (note.harmonic && note.harmonic != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_HARMONIC) >>> 0;
    if (single && note.ignore && note.ignore != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_IGNORE) >>> 0;
    if (single && note.leftHand && note.leftHand != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_LEFTHAND) >>> 0;
    if (note.mute && note.mute != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_MUTE) >>> 0;
    if (note.palmMute && note.palmMute != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_PALMMUTE) >>> 0;
    if (note.pluck && note.pluck != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_PLUCK) >>> 0;
    if (note.pullOff && note.pullOff != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_PULLOFF) >>> 0;
    if (note.slap && note.slap != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_SLAP) >>> 0;
    if (note.slideTo && note.slideTo != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_SLIDE) >>> 0;
    if (note.sustain && note.sustain != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_SUSTAIN) >>> 0;
    if (note.tremolo && note.tremolo != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_TREMOLO) >>> 0;
    if (note.harmonicPinch && note.harmonicPinch != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_PINCHHARMONIC) >>> 0;
    if (note.rightHand && note.rightHand != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_RIGHTHAND) >>> 0;
    if (note.slideUnpitchTo && note.slideUnpitchTo != -1)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_SLIDEUNPITCHEDTO) >>> 0;
    if (note.tap && note.tap != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_TAP) >>> 0;
    if (note.vibrato && note.vibrato != 0)
        mask = (mask | constants_1.SNGConstants.NOTE_MASK_VIBRATO) >>> 0;
    return mask;
}
function parseBendData(note, single) {
    // single can be any size, otherwise 32x BendData32 are allocated
    var count = 32;
    // count of available values
    var bend_values = 0;
    if (note && note.bendValues)
        bend_values = note.bendValues.length;
    if (single) {
        count = bend_values;
    }
    var bends = new BENDS();
    bends.bendValues = new Array(count);
    for (var i = 0; i < count; i += 1)
        bends.bendValues[i] = new BEND();
    // intentionally not using "count"
    var usedCount = 0;
    for (var i = 0; i < bend_values; i++) {
        var b = bends.bendValues[i];
        b.time = note.bendValues ? note.bendValues[i].time : 0;
        b.step = note.bendValues ? note.bendValues[i].step : 0;
        b.UNK = note.bendValues ? note.bendValues[i].unk5 : 0;
        if (b.time > 0 || b.step > 0)
            usedCount++;
    }
    bends.count = usedCount;
    return bends;
}
var cns = [];
var cnsId = {};
function getChordNotes() { return cns; }
exports.getChordNotes = getChordNotes;
function getChordNotesDict() { return cnsId; }
exports.getChordNotesDict = getChordNotesDict;
function addChordNotes(chord) {
    var _a, _b, _c;
    var c = new CHORDNOTES();
    for (var i = 0; i < 6; i++) {
        var n = new song2014_1.SongNote();
        for (var k = 0; k < chord.chordNote.length; k += 1) {
            var cn = chord.chordNote[k];
            if (cn.string == i) {
                n = cn;
                break;
            }
        }
        c.mask[i] = parseNoteMask(n, false);
        c.bends[i] = new BENDS();
        var bd = parseBendData(n, false);
        c.bends[i].bendValues = bd.bendValues;
        c.bends[i].count = bd.count;
        //if (n != null && n.bendValues != null)
        //    c.bends[i].bendValues[i].usedCount = n.bendValues.length;
        if (n != null) {
            c.slideTo[i] = (_a = n.slideTo, (_a !== null && _a !== void 0 ? _a : -1));
            c.slideUnpitchTo[i] = (_b = n.slideUnpitchTo, (_b !== null && _b !== void 0 ? _b : -1));
        }
        else {
            c.slideTo[i] = -1;
            c.slideUnpitchTo[i] = -1;
        }
        if (n != null)
            c.vibrato[i] = (_c = n.vibrato, (_c !== null && _c !== void 0 ? _c : 0));
    }
    var buf = sngparser_1.CHORDNOTESDATA.encode(c);
    var crc = CRC32.buf(buf);
    //if (c.mask[4] == 12288 && c.mask[5] == 12288)
    //    console.log(c.mask, chord.chordNote[0]);
    if (Object.keys(cnsId).includes(crc.toString()))
        return cnsId[crc];
    // don't export chordnotes if there are no techniques
    var noTechniques = c.mask.filter(function (m) { return m == 0; }).length === 6;
    if (noTechniques)
        return INT32_MAX;
    // add new ChordNotes instance
    var id = cns.length;
    cnsId[crc] = id;
    cns.push(c);
    return cnsId[crc];
}
function parseChord(pi, chord, n, chordNotesId, chordTemplates) {
    n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_CHORD) >>> 0;
    if (chordNotesId != INT32_MAX) {
        // there should always be a STRUM too => handshape at chord time
        // probably even for chordNotes which are not exported to SNG
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_CHORDNOTES) >>> 0;
    }
    if (chord.linkNext != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_PARENT) >>> 0;
    if (chord.accent != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_ACCENT) >>> 0;
    if (chord.fretHandMute != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_FRETHANDMUTE) >>> 0;
    if (chord.highDensity != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_HIGHDENSITY) >>> 0;
    if (chord.ignore != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_IGNORE) >>> 0;
    if (chord.palmMute != 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_PALMMUTE) >>> 0;
    n.time = chord.time;
    n.string = -1;
    // always -1
    n.fret = -1;
    // anchor fret will be set later
    n.anchorFret = -1;
    // will be overwritten
    n.anchorWidth = -1;
    n.chordId = chord.chordId;
    n.chordNoteId = chordNotesId;
    n.phraseIterationId = getPhraseIterationId(pi, n.time, false);
    n.phraseId = pi[n.phraseIterationId] ? pi[n.phraseIterationId].phraseId : 0;
    // these will be overwritten
    n.fingerPrintId[0] = INT16_MAX;
    n.fingerPrintId[1] = INT16_MAX;
    // these will be overwritten
    n.nextIterNote = INT16_MAX;
    n.prevIterNote = INT16_MAX;
    // seems to be unused for chords
    n.parentPrevNote = INT16_MAX;
    n.slideTo = -1;
    n.slideUnpitchTo = -1;
    n.leftHand = -1;
    n.tap = -1;
    n.pickDirection = -1;
    n.slap = -1;
    n.pluck = -1;
    if (chord.chordNote != null) {
        chord.chordNote.forEach(function (cn) {
            if (cn.sustain) {
                if (cn.sustain > n.sustain)
                    n.sustain = cn.sustain;
            }
        });
    }
    if (n.sustain > 0)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_SUSTAIN) >>> 0;
    var cnt = 0;
    for (var str = 0; str < 6; str++) {
        if (chordTemplates[chord.chordId].frets[str] != -1)
            ++cnt;
    }
    if (cnt == 2)
        n.mask = (n.mask | constants_1.SNGConstants.NOTE_MASK_DOUBLESTOP) >>> 0;
    // there are only zeros for all chords in lessons
    //n.Vibrato = 0;
    //n.MaxBend = 0;
    n.bend_length = 0;
    n.bends = [];
}
function numberNotes(PI, notes) {
    // current phrase iteration
    var p = 0;
    for (var o = 0; o < notes.length; o++) {
        var current = notes[o];
        // skip open strings
        if (current.fret == 0) {
            continue;
        }
        try {
            // are we past phrase iteration boundary?
            if (current.time > PI[p].nextPhraseTime) {
                // advance and re-run
                // will be repeated through empty iterations
                ++p;
                o = o - 1;
                continue;
            }
        }
        catch (_a) {
            // workaround for rare conversion exception 'Index was outside the bounds of the array' 
            continue;
        }
        var repeat = false;
        var start = o - 8;
        if (start < 0)
            start = 0;
        // search last 8 notes
        for (var i = o - 1; i >= start; i--) {
            // ignore notes which are too far away
            if (notes[i].time + 2.0 < current.time)
                continue;
            // ignore notes outside of iteration
            if (notes[i].time < PI[p].startTime)
                continue;
            // count as repeat if this fret/chord was numbered recently
            if ((current.chordId == INT32_MAX && notes[i].fret == current.fret) ||
                (current.chordId != INT32_MAX && notes[i].chordId == current.chordId)) {
                if ((notes[i].flags & constants_1.SNGConstants.NOTE_FLAGS_NUMBERED) != 0) {
                    repeat = true;
                    break;
                }
            }
        }
        // change
        if (!repeat)
            current.flags = (current.flags | constants_1.SNGConstants.NOTE_FLAGS_NUMBERED) >>> 0;
    }
}
var ignoreCount = 0;
function getNoteCount(PH, levels, Level) {
    // time => note count
    var notes = {};
    var level = {};
    var _loop_2 = function (i) {
        a = levels[i];
        a.notes.forEach(function (n) {
            var _a;
            if (i != ((_a = PH[n.phraseIterationId]) === null || _a === void 0 ? void 0 : _a.difficulty[Level]))
                // This note is above or below requested level
                return;
            if (!Object.keys(notes).includes(n.time.toString())) {
                if (Level == 2 && (n.mask & constants_1.SNGConstants.NOTE_MASK_IGNORE) != 0)
                    ignoreCount++;
                // 1 note at difficulty i
                notes[n.time] = 1;
                level[n.time] = i;
            }
            else if (i == level[n.time]) {
                if (Level == 2 && (n.mask & constants_1.SNGConstants.NOTE_MASK_IGNORE) != 0)
                    ignoreCount++;
                // we can add notes while still in the same difficulty
                notes[n.time] += 1;
            }
        });
    };
    var a;
    for (var i = levels.length - 1; i >= 0; i--) {
        _loop_2(i);
    }
    var count = 0;
    Object.values(notes).forEach(function (time_count) {
        count += time_count;
    });
    return count;
}
