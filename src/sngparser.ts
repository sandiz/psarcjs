import { Parser } from 'binary-parser';
import {
    SNGFORMAT, BEATS, PHRASES, CHORDTEMPLATES,
    CHORDNOTES, BENDS, BEND,
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
    .skip(1)
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
