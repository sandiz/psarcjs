import { Parser } from 'binary-parser';
import {
    SNGFORMAT, BEATS, PHRASES, CHORDTEMPLATES,
    CHORDNOTES, BENDS, BEND, VOCALS, SYMBOLS, TEXTURE, DEFINITION, RECT, PHRASEITERATIONS, PHRASEEXTRAINFOS, NEWLINKEDDIFFS, ACTIONS, TONE, SECTIONS, LEVELS, NOTES, FINGERPRINTS, ANCHOREXTENSIONS, ANCHORS, METADATA,
} from './types/sng';

export const BEATSDATA: Parser<BEATS> = new Parser()
    .endianess("little")
    .floatle("time")
    .uint16("measure")
    .uint16("beat")
    .uint32("phraseIteration")
    .uint32("mask");

export const PHRASEDATA: Parser<PHRASES> = new Parser()
    .endianess("little")
    .int8("solo")
    .int8("disparity")
    .int8("ignore")
    .int8("padding")
    .uint32("maxDifficulty")
    .uint32("phraseIterationLinks")
    .string("name", {
        encoding: 'utf-8',
        length: 32,
        stripNull: true,
    })

export const CHORDTEMPLATESDATA: Parser<CHORDTEMPLATES> = new Parser()
    .endianess("little")
    .uint32("mask")
    .array("frets", {
        length: 6,
        type: 'int8',
    })
    .array("fingers", {
        length: 6,
        type: 'int8',
    })
    .array("notes", {
        length: 6,
        type: 'int32le',
    })
    .string("name", {
        encoding: 'utf-8',
        length: 32,
        stripNull: true,
    })

export const BENDDATA: Parser<BEND> = new Parser()
    .endianess("little")
    .floatle("time")
    .floatle("step")
    .skip(3)
    .int8("UNK")

export const BENDSDATA: Parser<BENDS> = new Parser()
    .endianess("little")
    .array("bendValues", {
        length: 32,
        type: BENDDATA,
    })
    .uint32("count")

export const CHORDNOTESDATA: Parser<CHORDNOTES> = new Parser()
    .endianess("little")
    .array("mask", {
        length: 6,
        type: "int32le"
    })
    .array("bends", {
        length: 6,
        type: BENDSDATA,
    })
    .array("slideTo", {
        length: 6,
        type: "int8"
    })
    .array("slideUnpitchTo", {
        length: 6,
        type: "int8"
    })
    .array("vibrato", {
        length: 6,
        type: "int16le"
    })

export const VOCALSDATA: Parser<VOCALS> = new Parser()
    .endianess("little")
    .floatle("time")
    .int32("note")
    .floatle("length")
    .string("lyrics", {
        encoding: 'utf-8',
        length: 48,
        stripNull: true,
    })

export const HEADERARRAYDATA = new Parser()
    .endianess("little")
    .array("item", {
        type: "int32le",
        length: 8,
    })

export const TEXTUREDATA: Parser<TEXTURE> = new Parser()
    .endianess("little")
    .string("fontpath", {
        encoding: 'ascii',
        length: 128,
        stripNull: true,
    })
    .int32("fontpathLength")
    .skip(4)
    .int32("width")
    .int32("height");

export const RECTDATA: Parser<RECT> = new Parser()
    .endianess("little")
    .floatle("y0")
    .floatle("x0")
    .floatle("y1")
    .floatle("x1")

export const DEFINITIONDATA: Parser<DEFINITION> = new Parser()
    .endianess("little")
    .string("name", {
        encoding: 'utf-8',
        length: 12,
        stripNull: true,
    })
    .nest("outerRect", {
        type: RECTDATA
    })
    .nest("innerRect", {
        type: RECTDATA,
    })

export const SYMBOLSDATA: Parser<SYMBOLS> = new Parser()
    .endianess("little")
    .uint32("ha_length")
    .array("header", {
        type: HEADERARRAYDATA,
        length: "ha_length"
    })
    .uint32("texture_length")
    .array("texture", {
        type: TEXTUREDATA,
        length: "texture_length"
    })
    .uint32("def_length")
    .array("definition", {
        type: DEFINITIONDATA,
        length: "def_length"
    })

export const PHRASEITERATIONSDATA: Parser<PHRASEITERATIONS> = new Parser()
    .endianess("little")
    .uint32("phraseId")
    .floatle("startTime")
    .floatle("nextPhraseTime")
    .array("difficulty", {
        type: "uint32le",
        length: 3
    })

export const PHRASEEXTRAINFOSDATA: Parser<PHRASEEXTRAINFOS> = new Parser()
    .endianess("little")
    .uint32("phraseId")
    .uint32("difficulty")
    .uint32("empty")
    .int8("levelJump")
    .int16le("redundant")
    .skip(1)

export const NEWLINKEDDIFFSDATA: Parser<NEWLINKEDDIFFS> = new Parser()
    .endianess("little")
    .int32le("levelBreak")
    .uint32("nld_phrase_length")
    .array("nld_phrase", {
        type: "int32le",
        length: "nld_phrase_length"
    })
export const ACTIONSDATA: Parser<ACTIONS> = new Parser()
    .endianess("little")
    .floatle("time")
    .string("name", {
        encoding: 'ascii',
        length: 256,
        stripNull: true,
    })
export const TONEDATA: Parser<TONE> = new Parser()
    .endianess("little")
    .floatle("time")
    .uint32("id")

export const SECTIONDATA: Parser<SECTIONS> = new Parser()
    .endianess("little")
    .string("name", {
        encoding: 'utf-8',
        length: 32,
        stripNull: true,
    })
    .uint32("number")
    .floatle("startTime")
    .floatle("endTime")
    .uint32("startPhraseIterationId")
    .uint32("endPhraseIterationId")
    .array("stringMask", {
        type: "int8",
        length: 36,
    })
export const NOTESDATA: Parser<NOTES> = new Parser()
    .endianess("little")
    .uint32("mask")
    .uint32("flags")
    .uint32("hash")
    .floatle("time")
    .int8("string")
    .int8("fret")
    .int8("anchorFret")
    .int8("anchorWidth")
    .uint32("chordId")
    .uint32("chordNoteId")
    .uint32("phraseId")
    .uint32("phraseIterationId")
    .array("fingerPrintId", {
        type: "uint16le",
        length: 2
    })
    .uint16le("nextIterNote")
    .uint16le("prevIterNote")
    .uint16le("parentPrevNote")
    .int8("slideTo")
    .int8("slideUnpitchTo")
    .int8("leftHand")
    .int8("tap")
    .int8("pickDirection")
    .int8("slap")
    .int8("pluck")
    .int16le("vibrato")
    .floatle("sustain")
    .floatle("maxBend")
    .uint32("bend_length")
    .array("bends", {
        type: BENDDATA,
        length: "bend_length"
    })
export const FINGERPRINTDATA: Parser<FINGERPRINTS> = new Parser()
    .endianess("little")
    .uint32("chordId")
    .floatle("startTime")
    .floatle("endTime")
    .floatle("UNK_startTime")
    .floatle("UNK_endTime")

export const FINGERPRINTARRDATA = new Parser()
    .endianess("little")
    .uint32("item0_length")
    .array("I0", {
        type: FINGERPRINTDATA,
        length: "item0_length"
    })
export const ANCHOREXTENSIONSDATA: Parser<ANCHOREXTENSIONS> = new Parser()
    .endianess("little")
    .floatle("time")
    .int8("fret")
    .skip(7)

export const ANCHORSDATA: Parser<ANCHORS> = new Parser()
    .endianess("little")
    .floatle("time")
    .floatle("endTime")
    .floatle("UNK_time")
    .floatle("UNK_time2")
    .int32("fret")
    .int32("width")
    .int32("phraseIterationId")


export const LEVELSDATA: Parser<Partial<LEVELS>> = new Parser()
    .endianess("little")
    .uint32("difficulty")
    .uint32("anchors_length")
    .array("anchors", {
        type: ANCHORSDATA,
        length: "anchors_length"
    })
    .uint32("anchor_ext_length")
    .array("anchor_extensions", {
        type: ANCHOREXTENSIONSDATA,
        length: "anchor_ext_length"
    })
    .array("fingerprints", {
        type: FINGERPRINTARRDATA,
        length: 2,
    })
    .uint32("notes_length")
    .array("notes", {
        type: NOTESDATA,
        length: "notes_length"
    })
    .uint32("anpi_length")
    .array("averageNotesPerIter", {
        type: "floatle",
        length: "anpi_length"
    })
    .uint32("niicni_length")
    .array("notesInIterCountNoIgnored", {
        type: "int32le",
        length: "niicni_length"
    })
    .uint32("niic_length")
    .array("notesInIterCount", {
        type: "int32le",
        length: "niic_length"
    })

export const METADATADATA: Parser<METADATA> = new Parser()
    .endianess("little")
    .doublele("maxScores")
    .doublele("maxNotesAndChords")
    .doublele("maxNotesAndChords_Real")
    .doublele("pointsPerNote")
    .floatle("firstBeatLength")
    .floatle("startTime")
    .int8("capo")
    .string("lastConversionDateTime", {
        encoding: 'ascii',
        length: 32,
        stripNull: true,
    })
    .int16le("part")
    .floatle("songLength")
    .uint32("tuningLength")
    .array("tuning", {
        type: "int16le",
        length: "tuningLength"
    })
    .floatle("firstNoteTime")
    .floatle("firstNoteTime2")
    .int32le("maxDifficulty")

export const SNGDATA: Parser<Partial<SNGFORMAT>> = new Parser()
    .endianess("little")
    .uint32("beats_length")
    .array("beats", {
        type: BEATSDATA,
        length: "beats_length"
    })
    .uint32("phrases_length")
    .array("phrases", {
        type: PHRASEDATA,
        length: "phrases_length"
    })
    .uint32("chord_templates_length")
    .array("chordTemplates", {
        type: CHORDTEMPLATESDATA,
        length: "chord_templates_length"
    })
    .uint32("chord_notes_length")
    .array("chordNotes", {
        type: CHORDNOTESDATA,
        length: "chord_notes_length"
    })
    .uint32("vocals_length")
    .array("vocals", {
        type: VOCALSDATA,
        length: "vocals_length"
    })
    .choice("symbols", {
        tag: "vocals_length",
        choices: {
            0: new Parser().skip(0),
        },
        defaultChoice: SYMBOLSDATA
    })
    .uint32("phrase_iter_length")
    .array("phraseIterations", {
        type: PHRASEITERATIONSDATA,
        length: "phrase_iter_length"
    })
    .uint32("phrase_extra_info_length")
    .array("phraseExtraInfos", {
        type: PHRASEEXTRAINFOSDATA,
        length: "phrase_extra_info_length"
    })
    .uint32("new_linked_diffs_length")
    .array("newLinkedDiffs", {
        type: NEWLINKEDDIFFSDATA,
        length: "new_linked_diffs_length"
    })
    .uint32("actions_length")
    .array("actions", {
        type: ACTIONSDATA,
        length: "actions_length"
    })
    .uint32("events_length")
    .array("events", {
        type: ACTIONSDATA,
        length: "events_length"
    })
    .uint32("tone_length")
    .array("tone", {
        type: TONEDATA,
        length: "tone_length"
    })
    .uint32("dna_length")
    .array("dna", {
        type: TONEDATA,
        length: "dna_length"
    })
    .uint32("sections_length")
    .array("sections", {
        type: SECTIONDATA,
        length: "sections_length"
    })
    .uint32("levels_length")
    .array("levels", {
        type: LEVELSDATA,
        length: "levels_length"
    })
    .nest("metadata", {
        type: METADATADATA,
    })

