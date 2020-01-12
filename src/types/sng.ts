const CRC32 = require('js-crc32');             // uncomment this line if in node

import {
    SongEbeat, SongPhraseIteration, SongPhrase,
    SongChordTemplate, Tuning, SongNewLinkedDiff,
    SongEvent, SongTone, SongSection, SongLevel,
    ISong2014, SongNote, SongChord
} from "../song2014";
import { SNGConstants } from './constants'
import { ArrangmentType } from "./common";
import { CHORDNOTESDATA, NOTESDATA } from "../sngparser";

export class BEND {
    time: number = 0;
    step: number = 0;
    UNK: number = 0;
}

export class BENDS {
    count: number = 0;
    bendValues: Array<BEND> = [];
}

export interface RECT {
    y0: number;
    x0: number;
    y1: number;
    x1: number;
}

export class BEATS {
    time: number = 0;
    measure: number = 0;
    beat: number = 0;
    phraseIteration: number = 0;
    mask: number = 0;

    static fromSongEBeat(beats: SongEbeat[], pi: SongPhraseIteration[]): BEATS[] {
        let measure = 0;
        let beat = 0;
        return beats.map(item => {
            const time = item.time;
            if (item.measure && item.measure >= 0) {
                measure = item.measure;
                beat = 0;
            }
            else {
                beat++;
            }
            const bpmPhraseIteration = getPhraseIterationId(pi, time, true);
            let mask = 0;
            if (beat == 0) {
                mask |= 1;
                if (measure % 2 == 0)
                    mask |= 2;
            }
            return {
                time,
                measure,
                beat,
                phraseIteration: bpmPhraseIteration,
                mask

            }
        })
    }
}

export class PHRASES {
    solo: number = 0;
    disparity: number = 0;
    ignore: number = 0;
    padding: number = 0;
    maxDifficulty: number = 0;
    phraseIterationLinks: number = 9;
    name: string[32] = '';

    static fromSongPhrase(phrases: SongPhrase[], pi: SongPhraseIteration[]): PHRASES[] {
        if (phrases.length === 0) return [];
        return phrases.map((item, index) => {
            return {
                solo: item.solo,
                disparity: item.disparity,
                ignore: item.ignore,
                padding: 0,
                maxDifficulty: item.maxDifficulty,
                phraseIterationLinks: pi.filter(item => item.phraseId === index).length,
                name: item.name.slice(0, 32),
            } as PHRASES;
        })
    }
}

export class CHORDTEMPLATES {
    mask: number = 0;
    frets: Array<number> = [];
    fingers: Array<number> = [];
    notes: Array<number> = [];
    name: string[32] = '';

    static fromSongChordTemplate(ct: SongChordTemplate[], tuning: Tuning, arrangement: string, capo: number): CHORDTEMPLATES[] {
        if (ct.length === 0) return [];
        return ct.map((item, index) => {
            let mask = 0;
            let frets: number[] = [0, 0, 0, 0, 0, 0]
            let fingers: number[] = [0, 0, 0, 0, 0, 0]
            let notes: number[] = [0, 0, 0, 0, 0, 0];

            if (item.displayName.endsWith("arp"))
                mask |= SNGConstants.CHORD_MASK_ARPEGGIO;
            else if (item.displayName.endsWith("nop"))
                mask |= SNGConstants.CHORD_MASK_NOP;

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

            for (let i = 0; i < 6; i++) {
                notes[i] = getMidiNote(Object.values(tuning), i, frets[i], arrangement == ArrangmentType.BASS, capo, true)
            }

            return {
                mask,
                frets,
                fingers,
                notes,
                name: item.chordName.slice(0, 32),
            }
        })
    }

}

export interface TEXTURE {
    fontpath: string[128];
    fontpathLength: number;
    width: number;
    height: number;
}

export interface DEFINITION {
    name: string[12];
    outerRect: RECT;
    innerRect: RECT;
}

export interface SYMBOLARR {
    item: Array<number>;
}
export interface SYMBOLS {
    header: Array<SYMBOLARR>;
    texture: Array<TEXTURE>;
    definition: Array<DEFINITION>;
}

export interface VOCALS {
    time: number;
    note: number;
    length: number;
    lyrics: string[48];
}

export class CHORDNOTES {
    mask: Array<number> = [];
    bends: Array<BENDS> = [];
    slideTo: Array<number> = [];
    slideUnpitchTo: Array<number> = [];
    vibrato: Array<number> = [];
}

export class PHRASEITERATIONS {
    phraseId: number = 0;
    startTime: number = 0;
    nextPhraseTime: number = 0;
    difficulty: Array<number> = [];

    static fromPhraseIterations(pt: SongPhraseIteration[], sp: SongPhrase[], songLength: number): PHRASEITERATIONS[] {
        if (pt.length === 0) return [];

        return pt.map((item, index) => {
            const diff: number[] = [0, 0, 0];

            diff[2] = sp[item.phraseId].maxDifficulty;
            if (item.heroLevels.length !== 0) {
                for (let i = 0; i < item.heroLevels.length; i += 1) {
                    const h = item.heroLevels[i];
                    diff[h.hero - 1] = h.difficulty;
                }
            }
            return {
                phraseId: item.phraseId,
                startTime: item.time,
                nextPhraseTime: (index + 1 < pt.length) ? pt[index + 1].time : songLength,
                difficulty: diff,

            } as PHRASEITERATIONS
        })
    }
}

export interface PHRASEEXTRAINFOS {
    phraseId: number;
    difficulty: number;
    empty: number;
    levelJump: number;
    redundant: number;
}

export class NEWLINKEDDIFFS {
    levelBreak: number = 0;
    nld_phrase_length: number = 0;
    nld_phrase: number[] = [];

    static fromNewLinkedDiffs(nld: SongNewLinkedDiff[]): NEWLINKEDDIFFS[] {
        if (nld.length === 0) return [];

        return nld.map((item, index) => {
            const nld2: number[] = new Array(item.phraseCount);
            for (let i = 0; i < item.phraseCount; i += 1) {
                nld2[i] = item.nld_phrase[i].id;
            }

            return {
                levelBreak: item.levelBreak,
                nld_phrase_length: item.phraseCount,
                nld_phrase: nld2,
            }
        })
        return [];
    }
}

export interface ACTIONS {
    time: number;
    name: string[256];
}

export class EVENTS {
    time: number = 0;
    name: string[256] = '';

    static fromEvents(evs: SongEvent[]): EVENTS[] {
        if (evs.length === 0) return [];

        return evs.map((item, index) => {
            return {
                time: item.time,
                name: item.code.slice(0, 32),
            }
        })
    }
}

export class TONE {
    time: number = 0;
    id: number = 0;

    static fromTone(tones: SongTone[], toneObj: { tonebase: string, tonea: string, toneb: string, tonec: string, toned: string }): TONE[] {
        if (tones.length === 0) return [];


        return tones.map((item, index) => {
            let toneid = 0;
            if (toneObj.tonebase.toLowerCase() === item.name.toLowerCase()) toneid = 0;
            else if (toneObj.tonea.toLowerCase() === item.name.toLowerCase()) toneid = 0;
            else if (toneObj.toneb.toLowerCase() === item.name.toLowerCase()) toneid = 1;
            else if (toneObj.tonec.toLowerCase() === item.name.toLowerCase()) toneid = 2;
            else if (toneObj.toned.toLowerCase() === item.name.toLowerCase()) toneid = 3;

            return {
                time: item.time,
                id: toneid,
            };
        });
    }
}

export class DNA {
    time: number = 0;
    id: number = 0;

    static fromDNA(events: SongEvent[]): DNA[] {
        if (events.length === 0) return [];
        const dnas: DNA[] = [];

        for (let i = 0; i < events.length; i += 1) {
            const item = events[i];
            if (item.code.includes("dna_")) {
                let ider = -1;
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
    }
}

export class SECTIONS {
    name: string[32] = '';
    number: number = 0;
    startTime: number = 0;
    endTime: number = 0;
    startPhraseIterationId: number = 0;
    endPhraseIterationId: number = 0;
    stringMask: number[] = new Array(36);


    static fromSections(sections: SongSection[], pi: SongPhraseIteration[], ph: SongPhrase[], levels: SongLevel[], ct: SongChordTemplate[], songLength: number): SECTIONS[] {
        if (sections.length == 0) return [];

        return sections.map((item, index) => {
            let endTime = 0;
            if (index + 1 < sections.length)
                endTime = sections[index + 1].startTime;
            else
                endTime = songLength;;

            let startPhraseIterationId = getPhraseIterationId(pi, item.startTime, false);
            let endPhraseIterationId = getPhraseIterationId(pi, endTime, true);

            let sm: number[] = new Array(36);
            for (let j = getMaxDifficulty(ph); j >= 0; j -= 1) {
                let mask = 0;
                for (let i = 0; i < levels[j].notes.length; i += 1) {
                    const note = levels[j].notes[i];
                    if (note.time >= item.startTime && note.time < endTime) {
                        mask |= (1 << note.string);
                    }
                }

                for (let i = 0; i < levels[j].chords.length; i += 1) {
                    const chord = levels[j].chords[i];
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
                endTime,
                startPhraseIterationId,
                endPhraseIterationId,
                stringMask: sm,
            }
        })
    }
}

export class METADATA {
    maxScores: number = 0;
    maxNotesAndChords: number = 0;
    maxNotesAndChords_Real: number = 0;
    pointsPerNote: number = 0;
    firstBeatLength: number = 0;
    startTime: number = 0;
    capo: number = 0;
    lastConversionDateTime: string[32] = '';
    part: number = 0;
    songLength: number = 0;
    tuningLength: number = 6;
    tuning: number[] = [0, 0, 0, 0, 0, 0];
    firstNoteTime: number = 0;
    firstNoteTime2: number = 0;
    maxDifficulty: number = 0;

    static fromSong2014(song: ISong2014, PH: PHRASEITERATIONS[], levels: LEVELS[]): METADATA {

        let nc: number[] = new Array(3);
        nc[0] = getNoteCount(PH, levels, 0);
        nc[1] = getNoteCount(PH, levels, 1);

        let ig = 0;
        nc[2] = getNoteCount(PH, levels, 2);

        const ms = 100000;
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
        }

    }
}

export interface ANCHORS {
    time: number;
    endTime: number;
    UNK_time: number;
    UNK_time2: number;
    fret: number;
    width: number;
    phraseIterationId: number;
}

export interface ANCHOREXTENSIONS {
    time: number;
    fret: number;
}

export interface FINGERPRINTS {
    chordId: number;
    startTime: number;
    endTime: number;
    UNK_startTime: number;
    UNK_endTime: number;
}

export class NOTES {
    mask: number = 0;
    flags: number = 0;
    hash: number = 0;
    time: number = 0;
    string: number = -1;
    fret: number = -1;
    anchorFret: number = -1;
    anchorWidth: number = -1;
    chordId: number = 0;
    chordNoteId: number = 0;
    phraseId: number = 0;
    phraseIterationId: number = 0;
    fingerPrintId: Array<number> = [];
    nextIterNote: number = 0;
    prevIterNote: number = 0;
    parentPrevNote: number = 0;
    slideTo: number = -1;
    slideUnpitchTo: number = -1;
    leftHand: number = -1;
    tap: number = -1;
    pickDirection: number = -1;
    slap: number = -1;
    pluck: number = -1;
    vibrato: number = -1;
    sustain: number = 0;
    maxBend: number = -1;
    bend_length: number = 0;
    bends: Array<BEND> = [];
}

export class FPW {
    item0_length: number = 0;
    I0: FINGERPRINTS[] = [];
}

let first_note_time: number = 0;
export class LEVELS {
    difficulty: number = 0;
    anchors_length: number = 0;
    anchors: ANCHORS[] = [];
    anchor_ext_length = 0;
    anchor_extensions: ANCHOREXTENSIONS[] = [];
    fingerprints: [FPW, FPW] = [new FPW(), new FPW()];
    notes_length = 0;
    notes: NOTES[] = [];
    anpi_length = 0;
    averageNotesPerIter: number[] = [];
    niicni_length = 0;
    notesInIterCountNoIgnored: number[] = [];
    niic_length = 0;
    notesInIterCount: number[] = [];

    static fromLevels(sl: SongLevel[], pi: SongPhraseIteration[], CT: CHORDTEMPLATES[], PH: PHRASEITERATIONS[], phrases: SongPhrase[]): LEVELS[] {
        const levels: LEVELS[] = [];
        const note_id: { [key: number]: number } = {}
        for (let i = 0; i < sl.length; i += 1) {
            const songLevel = sl[i];

            const difficulty = songLevel.difficulty;
            const ank: ANCHORS[] = [];
            for (let j = 0; j < songLevel.anchors.length; j += 1) {
                ank.push({
                    time: songLevel.anchors[j].time,
                    endTime: j + 1 < songLevel.anchors.length ? songLevel.anchors[j + 1].time : pi[pi.length - 1].time,
                    UNK_time: songLevel.anchors[j].time,//3.4028234663852886e+38,
                    UNK_time2: songLevel.anchors[j].time,//1.1754943508222875e-38,
                    fret: songLevel.anchors[j].fret,
                    width: songLevel.anchors[j].width,
                    phraseIterationId: getPhraseIterationId(pi, songLevel.anchors[j].time, false),
                })
            };

            const anchorExts: ANCHOREXTENSIONS[] = [];
            let anchorExtLength = 0;
            songLevel.notes.forEach(note => {
                if (note.slideTo && note.slideTo != -1)
                    ++anchorExtLength;
            });

            let fingerprints1: FPW = new FPW();
            let fingerprints2: FPW = new FPW();
            let fp1: FINGERPRINTS[] = [];
            let fp2: FINGERPRINTS[] = [];

            songLevel.handShapes.forEach(h => {
                if (h.chordId < 0) return;

                var fp: FINGERPRINTS = {
                    chordId: h.chordId,
                    startTime: h.startTime,
                    endTime: h.endTime,
                    UNK_startTime: -1,
                    UNK_endTime: -1,
                }
                if (CT[fp.chordId].name.endsWith("arp"))
                    fp2.push(fp);
                else
                    fp1.push(fp);
            });

            fingerprints1.item0_length = fp1.length;
            fingerprints1.I0 = fp1;

            fingerprints2.item0_length = fp2.length;
            fingerprints2.I0 = fp2;

            const notes: NOTES[] = [];
            const notesInIteration1: number[] = new Array<number>(pi.length).fill(0);
            const notesInIteration2: number[] = new Array<number>(pi.length).fill(0);
            let acent: number = 0;

            songLevel.notes.forEach(note => {
                let n: NOTES = new NOTES();
                let prev: NOTES = new NOTES();
                if (songLevel.notes.length > 0)
                    prev = notes[notes.length - 1];
                parseNote(pi, note, n, prev);
                notes.push(n);

                for (let j = 0; j < pi.length; j += 1) {
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
                    var ae: ANCHOREXTENSIONS = {
                        fret: note.slideTo ?? 0,
                        time: note.time + (note.sustain ?? 0),
                    }
                    anchorExts[acent++] = ae;
                }
            });

            songLevel.chords.forEach(chord => {
                let cn = new NOTES();
                let id = -1;
                if (chord.chordNote && chord.chordNote.length > 0)
                    id = addChordNotes(chord);
                if (id == -1) return;
                parseChord(pi, chord, cn, id, CT);
                notes.push(cn);

                for (let j = 0; j < pi.length; j++) {
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

            notes.sort((a, b) => a.time - b.time);
            if (first_note_time == 0 || first_note_time > notes[0].time)
                first_note_time = notes[0].time;

            let chordInHandshape: { [key: number]: number } = {}
            let chordInArpeggio: { [key: number]: number } = {}

            notes.forEach(n => {
                for (let id = 0; id < fp1.length; id++) { // FingerPrints 1st level (common handshapes)
                    if (n.time >= fp1[id].startTime && n.time < fp1[id].endTime) {
                        // Handshapes can be inside other handshapes
                        if (n.fingerPrintId[0] == INT16_MAX)
                            n.fingerPrintId[0] = id;

                        // Add STRUM to first chord in the handshape (The chord will be rendered as a full chord panel)
                        // In later DLC, frethand muted chords that start a handshape may not have STRUM
                        if (n.chordId != INT32_MAX) {
                            // There may be single notes before the first chord so can't use fp1[id].StartTime == n.Time
                            if (!((Object.keys(chordInHandshape)).includes(id.toString()))) {
                                //TODO:check if this is required
                                //n.mask |= SNGConstants.NOTE_MASK_STRUM;
                                chordInHandshape[id] = n.chordId;
                            }
                            else if (chordInHandshape[id] != n.chordId) {
                                // This should not be necessary for official songs
                                //TODO:check if this is required
                                //n.mask |= SNGConstants.NOTE_MASK_STRUM;
                                chordInHandshape[id] = n.chordId;
                            }
                        }
                        if (fp1[id].UNK_startTime == -1)
                            fp1[id].UNK_startTime = n.time;

                        let noteEnd = n.time + n.sustain;
                        if (noteEnd >= fp1[id].endTime) {
                            // Not entirely accurate, sometimes Unk4 is -1 even though there is a chord in the handshape...
                            if (n.time == fp1[id].startTime) {
                                fp1[id].UNK_endTime = fp1[id].startTime;
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
                            fp1[id].UNK_endTime = fp1[id].startTime;
                    }
                }
                for (let id = 0; id < fp2.length; id++) { // FingerPrints 2nd level (used for -arp(eggio) handshapes)
                    if (n.time >= fp2[id].startTime && n.time < fp2[id].endTime) {
                        n.fingerPrintId[1] = id;

                        // Add STRUM to first chord in the arpeggio handshape
                        if (n.chordId != -1) {
                            if (!Object.keys(chordInArpeggio).includes(id.toString())) {
                                n.mask |= SNGConstants.NOTE_MASK_STRUM;
                                chordInArpeggio[id] = n.chordId;
                            }
                            else if (chordInArpeggio[id] != n.chordId) {
                                // This should not be necessary for official songs
                                n.mask |= SNGConstants.NOTE_MASK_STRUM;
                                chordInArpeggio[id] = n.chordId;
                            }
                        }
                        n.mask |= SNGConstants.NOTE_MASK_ARPEGGIO;
                        if (fp2[id].UNK_startTime == -1)
                            fp2[id].UNK_startTime = n.time;

                        let sustain = 0;
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
                for (let j = 0; j < ank.length; j++) {
                    if (n.time >= ank[j].time && n.time < ank[j].endTime) {
                        n.anchorWidth = ank[j].width;
                        // anchor fret
                        n.anchorFret = ank[j].fret;
                        //if (ank[j].UNK_time == 3.4028234663852886e+38)
                        ank[j].UNK_time = n.time;

                        let sustain = 0;
                        if (n.time + n.sustain < ank[j].endTime - 0.1)
                            sustain = n.sustain;
                        ank[j].UNK_time2 = n.time + sustain;
                        //if (ank[j].phraseIterationId == 17)
                        //console.log(ank[j], n.sustain)
                        break;
                    }
                }
            });

            PH.forEach(piter => {
                let count = 0;
                let j = 0;
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

            for (let j = 0; j < notes.length; j++) {
                // Look for notes with PARENT mask (linkNext=1)
                var n = notes[j];
                if ((n.mask & SNGConstants.NOTE_MASK_PARENT) != 0) {
                    if (n.chordId == INT32_MAX) // Single note
                    {
                        // Find the next note on the same string
                        let x = j + 1;
                        while (x < notes.length) {
                            var nextnote = notes[x];
                            if (nextnote.string == n.string) {
                                nextnote.parentPrevNote = n.nextIterNote == INT16_MAX ? INT16_MAX : n.nextIterNote - 1;
                                nextnote.mask |= SNGConstants.NOTE_MASK_CHILD;

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
                            var chordnotes = cns[n.chordNoteId];
                            // Check which chordNotes have linknext
                            for (let cnString = 0; cnString < 6; cnString++) {
                                if ((chordnotes.mask[cnString] & SNGConstants.NOTE_MASK_PARENT) != 0) {
                                    // Find the next note on the same string
                                    let x = j + 1;
                                    while (x < notes.length) {
                                        var nextnote = notes[x];
                                        if (nextnote.string == cnString) {
                                            // HACK for XML files that do not match official usage re linkNext (allow 1ms margin of error)
                                            if (nextnote.time - (n.time + n.sustain) > 0.001)
                                                break;

                                            nextnote.parentPrevNote = (n.nextIterNote - 1);
                                            nextnote.mask |= SNGConstants.NOTE_MASK_CHILD;

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

            let averageNotesPerIter: number[] = new Array(phrases.length).fill(0);
            let iter_count: number[] = new Array(phrases.length).fill(0);

            for (let j = 0; j < pi.length; j++) {
                var piter = pi[j];
                // using NotesInIteration2 to calculate
                averageNotesPerIter[piter.phraseId] += notesInIteration2[j];
                ++iter_count[piter.phraseId];
            }

            for (let j = 0; j < iter_count.length; j++) {
                if (iter_count[j] > 0)
                    averageNotesPerIter[j] /= iter_count[j];
            }

            notes.forEach(n => {
                const buf = (NOTESDATA as any).encode(n);
                const ncopy = NOTESDATA.parse(buf);
                ncopy.nextIterNote = INT16_MAX;
                ncopy.prevIterNote = INT16_MAX;
                ncopy.parentPrevNote = INT16_MAX;
                let crc: number = CRC32.buf((NOTESDATA as any).encode(ncopy));
                if (!Object.keys(note_id).includes(crc.toString())) {
                    note_id[crc] = Object.values(note_id).length;
                }
                n.hash = note_id[crc];
            });

            numberNotes(PH, notes);

            const level: LEVELS = {
                difficulty,
                anchors_length: ank.length,
                anchors: ank,
                anchor_ext_length: anchorExtLength,
                anchor_extensions: anchorExts,
                fingerprints: [fingerprints1, fingerprints2],
                notes_length: notes.length,
                notes,
                anpi_length: phrases.length,
                averageNotesPerIter,
                niicni_length: notesInIteration1.length,
                notesInIterCountNoIgnored: notesInIteration1,
                niic_length: notesInIteration2.length,
                notesInIterCount: notesInIteration2,
            };
            levels.push(level);
        }
        return levels;
    }
}

export interface SNGFORMAT {
    beats_length: number;
    beats: BEATS[];

    phrases_length: number;
    phrases: PHRASES[];

    chord_templates_length: number;
    chordTemplates: CHORDTEMPLATES[];

    chord_notes_length: number;
    chordNotes: CHORDNOTES[];

    vocals_length: number;
    vocals: VOCALS[];

    symbols_length: number;
    symbols: SYMBOLS;

    phrase_iter_length: number;
    phraseIterations: PHRASEITERATIONS[];

    phrase_extra_info_length: number;
    phraseExtraInfos: PHRASEEXTRAINFOS[];

    new_linked_diffs_length: number;
    newLinkedDiffs: NEWLINKEDDIFFS[];

    actions_length: number;
    actions: ACTIONS[];

    events_length: number;
    events: EVENTS[];

    tone_length: number;
    tone: TONE[];

    dna_length: number;
    dna: DNA[];

    sections_length: number;
    sections: SECTIONS[];

    levels_length: number;
    levels: LEVELS[];

    metadata: METADATA;
}

function getPhraseIterationId(pi: SongPhraseIteration[], time: number, end: boolean): number {
    let id = 0;
    while (id + 1 < pi.length) {
        if (!end && pi[id + 1].time > time)
            break;
        if (end && pi[id + 1].time >= time)
            break;
        ++id;
    }
    return id;
}

const StandardMidiNotes = [40, 45, 50, 55, 59, 64];

function getMidiNote(tuning: number[], idx: number, fret: number, bass: boolean, capo: number, template = false) {
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
    let note = StandardMidiNotes[idx] + tuning[idx] + fret - (bass ? 12 : 0);
    // adjust note value for open strings with capo
    if (capo > 0 && fret == 0) {
        note += capo;
    }
    return note;
}

function getMaxDifficulty(ph: SongPhrase[]) {
    var max = 0;
    for (let i = 0; i < ph.length; i += 1) {
        const phrase = ph[i];
        if (max < phrase.maxDifficulty)
            max = phrase.maxDifficulty;
    }
    return max;
}

const INT16_MAX = 65535;
const INT32_MAX = 4294967295;
function parseNote(pi: SongPhraseIteration[], note: SongNote, n: NOTES, prev: NOTES) {
    n.mask = parseNoteMask(note, true);
    // numbering (NoteFlags) will be set later
    n.time = note.time;
    n.string = note.string;
    // actual fret number
    n.fret = note.fret;
    // anchor fret will be set later
    n.anchorFret = -1;
    // will be overwritten
    n.anchorWidth = -1
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
    n.slideTo = note.slideTo ?? -1;
    n.slideUnpitchTo = note.slideUnpitchTo ?? -1;
    n.leftHand = note.leftHand ?? -1;
    // 'bvibrato' and 'rchords8' are using 0 value but without TAP mask
    if (note.tap != 0)
        n.tap = note.tap ?? -1;
    else
        n.tap = -1;

    n.pickDirection = note.pickDirection ?? 0;
    n.slap = note.slap ?? -1;
    n.pluck = note.pluck ?? -1;
    n.vibrato = note.vibrato ?? 0;
    n.sustain = note.sustain ?? 0;
    n.maxBend = note.bend ?? 0;

    var b = parseBendData(note, true);
    n.bend_length = b.count;
    n.bends = b.bendValues;
}

function parseNoteMask(note: SongNote, single: boolean): number {
    if (note == null)
        return SNGConstants.NOTE_MASK_UNDEFINED;

    // single note
    let mask = 0;
    if (single)
        mask |= SNGConstants.NOTE_MASK_SINGLE;
    if (note.fret == 0)
        mask |= SNGConstants.NOTE_MASK_OPEN;
    if (note.linkNext && note.linkNext != 0)
        mask |= SNGConstants.NOTE_MASK_PARENT;
    if (note.accent && note.accent != 0)
        mask |= SNGConstants.NOTE_MASK_ACCENT;
    if (note.bend && note.bend != 0)
        mask |= SNGConstants.NOTE_MASK_BEND;
    if (note.hammerOn && note.hammerOn != 0)
        mask |= SNGConstants.NOTE_MASK_HAMMERON;
    if (note.harmonic && note.harmonic != 0)
        mask |= SNGConstants.NOTE_MASK_HARMONIC;

    if (single && note.ignore && note.ignore != 0)
        mask |= SNGConstants.NOTE_MASK_IGNORE;
    if (single && note.leftHand && note.leftHand != -1)
        mask |= SNGConstants.NOTE_MASK_LEFTHAND;
    if (note.mute && note.mute != 0)
        mask |= SNGConstants.NOTE_MASK_MUTE;
    if (note.palmMute && note.palmMute != 0)
        mask |= SNGConstants.NOTE_MASK_PALMMUTE;
    if (note.pluck && note.pluck != -1)
        mask |= SNGConstants.NOTE_MASK_PLUCK;
    if (note.pullOff && note.pullOff != 0)
        mask |= SNGConstants.NOTE_MASK_PULLOFF;
    if (note.slap && note.slap != -1)
        mask |= SNGConstants.NOTE_MASK_SLAP;
    if (note.slideTo && note.slideTo != -1)
        mask |= SNGConstants.NOTE_MASK_SLIDE;
    if (note.sustain && note.sustain != 0)
        mask |= SNGConstants.NOTE_MASK_SUSTAIN;
    if (note.tremolo && note.tremolo != 0)
        mask |= SNGConstants.NOTE_MASK_TREMOLO;
    if (note.harmonicPinch && note.harmonicPinch != 0)
        mask |= SNGConstants.NOTE_MASK_PINCHHARMONIC;

    if (note.rightHand && note.rightHand != -1)
        mask |= SNGConstants.NOTE_MASK_RIGHTHAND;
    if (note.slideUnpitchTo && note.slideUnpitchTo != -1)
        mask |= SNGConstants.NOTE_MASK_SLIDEUNPITCHEDTO;
    if (note.tap && note.tap != 0)
        mask |= SNGConstants.NOTE_MASK_TAP;
    if (note.vibrato && note.vibrato != 0)
        mask |= SNGConstants.NOTE_MASK_VIBRATO;

    return mask;
}

function parseBendData(note: SongNote, single: boolean): BENDS {
    // single can be any size, otherwise 32x BendData32 are allocated
    let count = 32;

    // count of available values
    let bend_values = 0;
    if (note && note.bendValues)
        bend_values = note.bendValues.length;

    if (single) {
        count = bend_values;
    }
    var bends = new BENDS();
    bends.bendValues = new Array<BEND>(count);

    for (let i = 0; i < count; i += 1)
        bends.bendValues[i] = new BEND();

    // intentionally not using "count"
    let usedCount = 0;
    for (let i = 0; i < bend_values; i++) {
        var b = bends.bendValues[i];
        b.time = note.bendValues ? note.bendValues[i].time : 0;
        b.step = note.bendValues ? note.bendValues[i].step : 0;
        b.UNK = note.bendValues ? note.bendValues[i].unk5 : 0;

        if (b.time > 0 || b.step > 0) usedCount++;
    }

    bends.count = usedCount;
    return bends;
}
const cns: CHORDNOTES[] = [];
const cnsId: { [key: number]: number } = {};

export function getChordNotes() { return cns; }
export function getChordNotesDict() { return cnsId; }
function addChordNotes(chord: SongChord) {
    var c = new CHORDNOTES();
    for (let i = 0; i < 6; i++) {
        let n: SongNote = new SongNote();
        for (let k = 0; k < chord.chordNote.length; k += 1) {
            let cn = chord.chordNote[k];
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
            c.slideTo[i] = n.slideTo ?? -1;
            c.slideUnpitchTo[i] = n.slideUnpitchTo ?? -1
        }
        else {
            c.slideTo[i] = -1;
            c.slideUnpitchTo[i] = -1;
        }
        if (n != null)
            c.vibrato[i] = n.vibrato ?? 0;
    }
    const buf = (CHORDNOTESDATA as any).encode(c);
    let crc = CRC32.buf(buf);

    //if (c.mask[4] == 12288 && c.mask[5] == 12288)
    //    console.log(c.mask, chord.chordNote[0]);

    if (Object.keys(cnsId).includes(crc.toString()))
        return cnsId[crc];

    // don't export chordnotes if there are no techniques
    let noTechniques = c.mask.filter(m => m == 0).length === 6;
    if (noTechniques)
        return -1;

    // add new ChordNotes instance
    let id = cns.length;
    cnsId[crc] = id;
    cns.push(c);
    return cnsId[crc];
}

function parseChord(pi: SongPhraseIteration[], chord: SongChord, n: NOTES, chordNotesId: number, chordTemplates: CHORDTEMPLATES[]) {
    n.mask |= SNGConstants.NOTE_MASK_CHORD;
    if (chordNotesId != INT32_MAX) {
        // there should always be a STRUM too => handshape at chord time
        // probably even for chordNotes which are not exported to SNG
        n.mask |= SNGConstants.NOTE_MASK_CHORDNOTES;
    }

    if (chord.linkNext != 0)
        n.mask |= SNGConstants.NOTE_MASK_PARENT;

    if (chord.accent != 0)
        n.mask |= SNGConstants.NOTE_MASK_ACCENT;
    if (chord.fretHandMute != 0)
        n.mask |= SNGConstants.NOTE_MASK_FRETHANDMUTE;
    if (chord.highDensity != 0)
        n.mask |= SNGConstants.NOTE_MASK_HIGHDENSITY;
    if (chord.ignore != 0)
        n.mask |= SNGConstants.NOTE_MASK_IGNORE;
    if (chord.palmMute != 0)
        n.mask |= SNGConstants.NOTE_MASK_PALMMUTE;

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
        chord.chordNote.forEach(cn => {
            if (cn.sustain) {
                if (cn.sustain > n.sustain)
                    n.sustain = cn.sustain;
            }
        })
    }

    if (n.sustain > 0)
        n.mask |= SNGConstants.NOTE_MASK_SUSTAIN;

    let cnt = 0;
    for (let str = 0; str < 6; str++) {
        if (chordTemplates[chord.chordId].frets[str] != 255)
            ++cnt;
    }
    if (cnt == 2)
        n.mask |= SNGConstants.NOTE_MASK_DOUBLESTOP;

    // there are only zeros for all chords in lessons
    //n.Vibrato = 0;
    //n.MaxBend = 0;
    n.bend_length = 0;
    n.bends = [];
}

function numberNotes(PI: PHRASEITERATIONS[], notes: NOTES[]) {
    // current phrase iteration
    let p = 0;
    for (let o = 0; o < notes.length; o++) {
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
        catch
        {
            // workaround for rare conversion exception 'Index was outside the bounds of the array' 
            continue;
        }

        let repeat = false;
        let start = o - 8;
        if (start < 0)
            start = 0;
        // search last 8 notes
        for (let i = o - 1; i >= start; i--) {
            // ignore notes which are too far away
            if (notes[i].time + 2.0 < current.time)
                continue;
            // ignore notes outside of iteration
            if (notes[i].time < PI[p].startTime)
                continue;

            // count as repeat if this fret/chord was numbered recently
            if ((current.chordId == INT32_MAX && notes[i].fret == current.fret) ||
                (current.chordId != INT32_MAX && notes[i].chordId == current.chordId)) {
                if ((notes[i].flags & SNGConstants.NOTE_FLAGS_NUMBERED) != 0) {
                    repeat = true;
                    break;
                }
            }
        }

        // change
        if (!repeat)
            current.flags |= SNGConstants.NOTE_FLAGS_NUMBERED;
    }
}

let ignoreCount = 0;
function getNoteCount(PH: PHRASEITERATIONS[], levels: LEVELS[], Level: number) {
    // time => note count
    var notes: { [key: number]: number } = {}
    var level: { [key: number]: number } = {}

    for (let i = levels.length - 1; i >= 0; i--) {
        var a = levels[i];
        a.notes.forEach(n => {
            if (i != PH[n.phraseIterationId]?.difficulty[Level])
                // This note is above or below requested level
                return;

            if (!Object.keys(notes).includes(n.time.toString())) {
                if (Level == 2 && (n.mask & SNGConstants.NOTE_MASK_IGNORE) != 0)
                    ignoreCount++;

                // 1 note at difficulty i
                notes[n.time] = 1;
                level[n.time] = i;
            }
            else if (i == level[n.time]) {
                if (Level == 2 && (n.mask & SNGConstants.NOTE_MASK_IGNORE) != 0)
                    ignoreCount++;

                // we can add notes while still in the same difficulty
                notes[n.time] += 1;
            }
        })
    }

    let count = 0;
    Object.values(notes).forEach(time_count => {
        count += time_count;
    })
    return count;
}
