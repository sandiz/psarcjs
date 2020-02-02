import { promises } from "fs";
import * as xml2js from 'xml2js';
import { join } from "path";
import { ToolkitInfo } from "./types/common";
import * as SNGTypes from './types/sng';
import * as SNGParser from './sngparser';
import { SNG } from "./sng";

const pkgInfo = require("../package.json");

export class Song2014 {
    song: ISong2014;

    constructor(song: ISong2014) {
        this.song = song;
    }

    static async fromXML(xmlFile: string): Promise<Song2014> {
        const data = await promises.readFile(xmlFile);
        const parsed = await xml2js.parseStringPromise(data);
        const song = parsed.song;

        const ret: ISong2014 = {
            version: song.$.version,
            title: getS(song.title),
            arrangement: getS(song.arrangement).toLowerCase(),
            part: getI(song.part),
            offset: getF(song.offset),
            centOffset: getF(song.centOffset),
            songLength: getF(song.songLength),
            startBeat: getF(song.startBeat),
            averageTempo: getF(song.averageTempo),
            tuning: objectMap(song.tuning[0].$, (item: string) => parseInt(item, 10)) as Tuning,
            capo: getI(song.capo),
            artistName: getS(song.artistName),
            artistNameSort: getS(song.artistNameSort),
            albumName: getS(song.albumName),
            albumNameSort: getS(song.albumNameSort),
            albumYear: getS(song.albumYear),
            crowdSpeed: getS(song.crowdSpeed),
            lastConversionDateTime: getS(song.lastConversionDateTime),
            arrangementProperties: objectMap(song.arrangementProperties[0].$, (item: string) => parseInt(item, 10)) as SongArrangementProperties,
            phrases: SongPhrase.fromXML(song.phrases),
            phraseIterations: SongPhraseIteration.fromXML(song.phraseIterations),
            newLinkedDiffs: SongNewLinkedDiff.fromXML(song.newLinkedDiffs),
            linkedDiffs: SongLinkedDiff.fromXML(song.linkedDiffs),
            phraseProperties: SongPhraseProperty.fromXML(song.phraseProperties),
            chordTemplates: SongChordTemplate.fromXML(song.chordTemplates),
            fretHandMuteTemplates: [],
            ebeats: SongEbeat.fromXML(song.ebeats),
            tonebase: getS(song.tonebase),
            tonea: getS(song.tonea),
            toneb: getS(song.toneb),
            tonec: getS(song.tonec),
            toned: getS(song.toned),
            tones: SongTone.fromXML(song.tones),
            sections: SongSection.fromXML(song.sections),
            events: SongEvent.fromXML(song.events),
            controls: SongPhraseProperty.fromXML(song.controls),
            transcriptionTrack: TranscriptionTrack.fromXML(song.transcriptionTrack),
            levels: SongLevel.fromXML(song.levels),
        }
        return new Song2014(ret);
    }

    xmlize() {
        const { version, ...rest } = this.song;
        rest.tuning = { $: { ...rest.tuning } } as any;
        rest.arrangementProperties = { $: { ...rest.arrangementProperties } } as any;

        const _d = (obj: any[], child: string) => {
            return {
                $: { count: obj.length },
                [child]: obj.map(item => {
                    return { $: { ...item } }
                })
            }
        }
        rest.ebeats = _d(rest.ebeats, "ebeat") as any;
        rest.phrases = _d(rest.phrases, "phrase") as any;
        rest.phraseIterations = _d(rest.phraseIterations, "phraseIteration") as any;
        rest.newLinkedDiffs = _d(rest.newLinkedDiffs, "newLinkedDiff") as any;
        rest.linkedDiffs = _d(rest.linkedDiffs, "linkedDiff") as any;
        rest.phraseProperties = _d(rest.phraseProperties, "phraseProperty") as any;
        rest.chordTemplates = _d(rest.chordTemplates, "chordTemplate") as any;
        rest.fretHandMuteTemplates = _d(rest.fretHandMuteTemplates, "fretHandMuteTemplate") as any;
        rest.sections = _d(rest.sections, "section") as any;
        rest.events = _d(rest.events, "event") as any;
        rest.transcriptionTrack = {
            $: { difficulty: rest.transcriptionTrack.difficulty },
            notes: _d(rest.transcriptionTrack.notes, "note"),
            chords: _d(rest.transcriptionTrack.chords, "chord"),
            fretHandMutes: _d(rest.transcriptionTrack.fretHandMutes, "fretHandMute"),
            anchors: _d(rest.transcriptionTrack.anchors, "anchor"),
            handShapes: _d(rest.transcriptionTrack.handShapes, "handShape"),
        } as any;
        rest.levels = {
            $: { count: rest.levels.length },
            level: rest.levels.map(item => {
                return {
                    $: { difficulty: item.difficulty },
                    notes: _d(item.notes, "note"),
                    chords: _d(item.chords, "chord"),
                    anchors: _d(item.anchors, "anchor"),
                    handShapes: _d(item.handShapes, "handShape"),
                }
            })
        } as any;

        return {
            ...rest,
        };
    }

    async generateXML(dir: string, tag: string, tk: ToolkitInfo) {
        const builder = new xml2js.Builder({
            xmldec: {
                version: "1.0",
            }
        });
        const xml = builder.buildObject({
            song: {
                $: { version: this.song.version },
                $comments: [`${tk.name} v${tk.version} (psarcjs v${pkgInfo.version})`],
                ...this.xmlize(),
            }
        });
        const fileName = `${tag}_${this.song.arrangement}.xml`
        const file = join(dir, fileName);
        await promises.writeFile(file, xml);
        return file;
    }

    async generateSNG(dir: string, tag: string) {
        const fileName = `${tag}_${this.song.arrangement}.sng`;

        const toneObj = {
            tonebase: this.song.tonebase, tonea: this.song.tonea,
            toneb: this.song.toneb, tonec: this.song.tonec, toned: this.song.toned,
        }

        const dnas = SNGTypes.DNA.fromDNA(this.song.events);
        const chordTemplates = SNGTypes.CHORDTEMPLATES.fromSongChordTemplate(this.song.chordTemplates, this.song.tuning, this.song.arrangement, this.song.capo);
        const phraseIterations = SNGTypes.PHRASEITERATIONS.fromPhraseIterations(this.song.phraseIterations, this.song.phrases, this.song.songLength);
        const levels = SNGTypes.LEVELS.fromLevels(this.song.levels, this.song.phraseIterations,
            chordTemplates, phraseIterations, this.song.phrases);
        const chordNotes: SNGTypes.CHORDNOTES[] = SNGTypes.getChordNotes();
        const sngFormat: SNGTypes.SNGFORMAT = {
            beats_length: this.song.ebeats.length,
            beats: SNGTypes.BEATS.fromSongEBeat(this.song.ebeats, this.song.phraseIterations),
            phrases_length: this.song.phrases.length,
            phrases: SNGTypes.PHRASES.fromSongPhrase(this.song.phrases, this.song.phraseIterations),
            chord_templates_length: this.song.chordTemplates.length,
            chordTemplates,
            chord_notes_length: chordNotes.length,
            chordNotes: chordNotes,
            vocals_length: 0,
            vocals: [],
            symbols_length: 0,
            symbols: {
                header: [],
                texture: [],
                definition: [],
            },
            phrase_iter_length: this.song.phraseIterations.length,
            phraseIterations,
            phrase_extra_info_length: 0,
            phraseExtraInfos: [],
            new_linked_diffs_length: this.song.newLinkedDiffs.length,
            newLinkedDiffs: SNGTypes.NEWLINKEDDIFFS.fromNewLinkedDiffs(this.song.newLinkedDiffs),
            actions_length: 0,
            actions: [],
            events_length: this.song.events.length,
            events: SNGTypes.EVENTS.fromEvents(this.song.events),
            tone_length: this.song.tones.length,
            tone: SNGTypes.TONE.fromTone(this.song.tones, toneObj),
            dna_length: dnas.length,
            dna: dnas,
            sections_length: this.song.sections.length,
            sections: SNGTypes.SECTIONS.fromSections(
                this.song.sections, this.song.phraseIterations, this.song.phrases,
                this.song.levels, this.song.chordTemplates, this.song.songLength),
            levels_length: levels.length,
            levels,
            metadata: SNGTypes.METADATA.fromSong2014(this.song, phraseIterations, levels),
        };
        const _validate2 = (struct: any, data: any | undefined) => {
            if (data)
                struct.parse(struct.encode(data));
        }
        _validate2(SNGParser.SNGDATA, sngFormat);

        const path = join(dir, fileName);
        //await promises.writeFile(path, (SNGParser.SNGDATA as any).encode(sngFormat))
        const buf = (SNGParser.SNGDATA as any).encode(sngFormat);
        const sng = new SNG(path);
        sng.rawData = buf;
        sng.unpackedData = buf;
        await sng.pack();

        await promises.writeFile(path, sng.packedData);
        return path;
    }
}


export class SongEbeat {
    time: number = 0;
    measure?: number;

    static fromBeatData(beats: string[]): SongEbeat[] {
        let idx = 0;
        return beats.map(item => {
            const [time, beat] = item.split(" ");
            let timef = parseFloat(time);
            let beati = parseInt(beat);
            if (beati === 1) {
                idx++;
                return { time: timef, measure: idx }
            }
            else return { time: timef };
        });
    }

    static fromXML(xmlData: object[]): SongEbeat[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).ebeat;

        if (!list) return [];

        const controls: SongEbeat[] = list.map((item: object): SongEbeat => {
            const iany = (item as any);
            const main = {
                time: parseFloat(iany.$.time),
            }
            Object.assign(main,
                iany.$.measure && { measure: parseInt(iany.$.measure, 10) },
            )
            return main;
        })
        return controls;
    }
}

export class SongPhrase {
    disparity: number = 0;
    ignore: number = 0;
    maxDifficulty: number = 0;
    name: string = '';
    solo: number = 0;

    static fromXML(xmlData: object[]): SongPhrase[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).phrase;

        if (!list) return [];
        const phrases: SongPhrase[] = list.map((item: object): SongPhrase => {
            const iany = (item as any);
            return {
                disparity: iany.$.disparity ? parseInt(iany.$.disparity, 10) : 0,
                ignore: iany.$.ignore ? parseInt(iany.$.ignore, 10) : 0,
                maxDifficulty: iany.$.maxDifficulty ? parseInt(iany.$.maxDifficulty, 10) : 0,
                solo: iany.$.solo ? parseInt(iany.$.solo, 10) : 0,
                name: iany.$.name ? iany.$.name : '',
            }
        })
        return phrases;
    }
}

export class SongTone {
    time: number = 0;
    name: string = '';

    static fromXML(xmlData: object[]): SongTone[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).tone;

        if (!list) return [];
        const tones: SongTone[] = list.map((item: object): SongTone => {
            const iany = (item as any);
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                name: iany.$.name ? iany.$.name : '',
            }
        })
        return tones;
    }
}

export class SongSection {
    name: string = "";
    number: number = 0;
    startTime: number = 0;

    static fromXML(xmlData: object[]): SongSection[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).section;

        if (!list) return [];
        const sections: SongSection[] = list.map((item: object): SongSection => {
            const iany = (item as any);
            return {
                name: iany.$.name ? iany.$.name : '',
                number: iany.$.number ? parseInt(iany.$.number) : 0,
                startTime: iany.$.startTime ? parseFloat(iany.$.startTime) : 0,
            }
        })
        return sections;
    }
}

export class SongNote {
    time: number = 0;
    string: number = -1;
    fret: number = -1;
    linkNext?: number;
    accent?: number;
    bend?: number;
    hammerOn?: number;
    harmonic?: number;
    hopo?: number;
    ignore?: number;
    leftHand?: number;
    mute?: number;
    palmMute?: number;
    pluck?: number;
    pullOff?: number;
    slap?: number;
    slideTo?: number;
    sustain?: number;
    tremolo?: number;
    harmonicPinch?: number;
    pickDirection?: number;
    rightHand?: number;
    slideUnpitchTo?: number;
    tap?: number;
    vibrato?: number;
    bendValues?: BendValue[] = [];

    static fromNoteData(noteData: NoteData): SongNote[] {
        return noteData.notes.map(item => {
            return {
                time: item.startTime,
                string: item.string,
                fret: item.fret,
            }
        })
    }

    static fromXML(xmlData: object[], chordNote = false): SongNote[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = chordNote ? (item as any).chordNote : (item as any).note;

        if (!list) return [];

        const notes: SongNote[] = list.map((item: object): SongNote => {
            const iany = (item as any);
            let { time, sustain, ...rest } = iany.$;
            time = parseFloat(time);
            rest = objectMap(rest, item => parseInt(item, 10));
            const main = {
                time,
                ...rest,
            }
            Object.assign(main,
                sustain && { sustain: parseFloat(sustain) },
                iany.bendValues && { bendValues: BendValue.fromXML(iany.bendValues) }
            )
            return main;
        })
        return notes;
    }
}
export class SongEvent {
    time: number = 0;
    code: string = "";

    static fromXML(xmlData: object[]): SongEvent[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).event;

        if (!list) return [];

        const events: SongEvent[] = list.map((item: object): SongEvent => {
            const iany = (item as any);
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                code: iany.$.code ? iany.$.code : '',
            }
        })
        return events;
    }
}

export class SongChordTemplate {
    displayName: string = "";
    chordName: string = "";
    fret0: number = -1;
    fret1: number = -1;
    fret2: number = -1;
    fret3: number = -1;
    fret4: number = -1;
    fret5: number = -1
    finger0: number = -1;
    finger1: number = -1;
    finger2: number = -1;
    finger3: number = -1;
    finger4: number = -1;
    finger5: number = -1;

    static fromXML(xmlData: object[]): SongChordTemplate[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).chordTemplate;

        if (!list) return [];

        const chordTemplates: SongChordTemplate[] = list.map((item: object): SongChordTemplate => {
            const iany = (item as any);
            return {
                displayName: iany.$.displayName ? iany.$.displayName : '',
                chordName: iany.$.chordName ? iany.$.chordName : '',
                fret0: iany.$.fret0 ? parseInt(iany.$.fret0, 10) : -1,
                fret1: iany.$.fret1 ? parseInt(iany.$.fret1, 10) : -1,
                fret2: iany.$.fret2 ? parseInt(iany.$.fret2, 10) : -1,
                fret3: iany.$.fret3 ? parseInt(iany.$.fret3, 10) : -1,
                fret4: iany.$.fret4 ? parseInt(iany.$.fret4, 10) : -1,
                fret5: iany.$.fret5 ? parseInt(iany.$.fret5, 10) : -1,
                finger0: iany.$.finger0 ? parseInt(iany.$.finger0, 10) : -1,
                finger1: iany.$.finger1 ? parseInt(iany.$.finger1, 10) : -1,
                finger2: iany.$.finger2 ? parseInt(iany.$.finger2, 10) : -1,
                finger3: iany.$.finger3 ? parseInt(iany.$.finger3, 10) : -1,
                finger4: iany.$.finger4 ? parseInt(iany.$.finger4, 10) : -1,
                finger5: iany.$.finger5 ? parseInt(iany.$.finger5, 10) : -1,
            }
        })
        return chordTemplates;
    }
}

export class SongPhraseProperty {
    phraseId: number = 0;
    redundant: number = 0;
    levelJump: number = 0;
    empty: number = 0;
    difficulty: number = 0;

    static fromXML(xmlData: object[]): SongPhraseProperty[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).phraseProperty;

        if (!list) return [];

        const phraseProperty: SongPhraseProperty[] = list.map((item: object): SongPhraseProperty => {
            const iany = (item as any);
            return {
                phraseId: iany.$.phraseId ? parseInt(iany.$.phraseId) : 0,
                redundant: iany.$.redundant ? parseInt(iany.$.redundant) : 0,
                levelJump: iany.$.levelJump ? parseInt(iany.$.levelJump) : 0,
                empty: iany.$.empty ? parseInt(iany.$.empty) : 0,
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty) : 0,
            }
        })
        return phraseProperty;
    }
}

export class SongLinkedDiff {
    parentId: number = 0;
    childId: string = '';

    static fromXML(xmlData: object[]): SongLinkedDiff[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).linkedDiff;

        if (!list) return [];

        const songLinkedDiff: SongLinkedDiff[] = list.map((item: object): SongLinkedDiff => {
            const iany = (item as any);
            return {
                parentId: iany.$.parentId ? parseInt(iany.$.parentId) : 0,
                childId: iany.$.childId ? iany.$.childId : '',
            }
        })
        return songLinkedDiff;
    }
}

export class SongNld_Phrase {
    id: number = 0;

    static fromXML(xmlData: object[]): SongNld_Phrase[] {
        if (!xmlData) return [];
        const item = xmlData;
        const list = (item as any);

        if (!list) return [];

        const songnld_phrase: SongNld_Phrase[] = list.map((item: object): SongNld_Phrase => {
            const iany = (item as any);
            return {
                id: iany.$.id ? parseInt(iany.$.id) : 0,
            }
        })
        return songnld_phrase;
    }
}

export class SongNewLinkedDiff {
    phraseCount: number = 0;
    ratio: string = '';
    levelBreak: number = 0;
    nld_phrase: SongNld_Phrase[] = [];

    static fromXML(xmlData: object[]): SongNewLinkedDiff[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).newLinkedDiff;

        if (!list) return [];

        const songNewLinkedDiff: SongNewLinkedDiff[] = list.map((item: object): SongNewLinkedDiff => {
            const iany = (item as any);
            return {
                phraseCount: iany.$.phraseCount ? parseInt(iany.$.phraseCount) : 0,
                ratio: iany.$.ratio ? iany.$.ratio : '',
                levelBreak: iany.$.levelBreak ? parseInt(iany.$.levelBreak) : 0,
                nld_phrase: SongNld_Phrase.fromXML(iany.nld_phrase)
            }
        })
        return songNewLinkedDiff;
    }
}

export class HeroLevel {
    difficulty: number = 0;
    hero: number = 0;

    static fromXML(xmlData: object[]): HeroLevel[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).heroLevel;

        if (!list) return [];

        const heroLevel: HeroLevel[] = list.map((item: object): HeroLevel => {
            const iany = (item as any);
            return {
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty, 10) : 0,
                hero: iany.$.hero ? parseInt(iany.$.hero, 10) : 0,
            }
        })
        return heroLevel;
    }
}

export class SongPhraseIteration {
    time: number = 0;
    phraseId: number = 0;
    variation: string = '';
    heroLevels: HeroLevel[] = [];

    static fromXML(xmlData: object[]): SongPhraseIteration[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).phraseIteration;

        if (!list) return [];

        const phraseIteration: SongPhraseIteration[] = list.map((item: object): SongPhraseIteration => {
            const iany = (item as any);
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                phraseId: iany.$.phraseId ? parseInt(iany.$.phraseId, 10) : 0,
                variation: iany.$.variation ? iany.$.variation : '',
                heroLevels: HeroLevel.fromXML(iany.heroLevels)
            }
        })
        return phraseIteration;
    }
}

export class BendValue {
    time: number = 0;
    step: number = -1;
    unk5: number = -1;

    static fromXML(xmlData: object[]) {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).bendValue;

        if (!list) return [];
        const bendValues: BendValue[] = list.map((item: object): BendValue => {
            const iany = (item as any);
            let { time, step, ...rest } = iany.$;
            time = parseFloat(time);
            step = parseFloat(step);
            rest = objectMap(rest, item => parseInt(item, 10));
            const main = {
                time,
                step,
                ...rest,
            }
            return main;
        });
        return bendValues;
    }
}

export interface Tuning {
    string0: number;
    string1: number;
    string2: number;
    string3: number;
    string4: number;
    string5: number;
}

export class SongArrangementProperties {
    public bonusArr: number = 0;
    public Metronome: number = 0;
    public pathLead: number = 0;
    public pathRhythm: number = 0;
    public pathBass: number = 0;
    public routeMask: number = 0;
    public represent: number = 0;
    public standardTuning: number = 0;
    public nonStandardChords: number = 0;
    public barreChords: number = 0;
    public powerChords: number = 0;
    public dropDPower: number = 0;
    public openChords: number = 0;
    public fingerPicking: number = 0;
    public pickDirection: number = 0;
    public doubleStops: number = 0;
    public palmMutes: number = 0;
    public harmonics: number = 0;
    public pinchHarmonics: number = 0;
    public hopo: number = 0;
    public tremolo: number = 0;
    public slides: number = 0;
    public unpitchedSlides: number = 0;
    public bends: number = 0;
    public tapping: number = 0;
    public vibrato: number = 0;
    public fretHandMutes: number = 0;
    public slapPop: number = 0;
    public twoFingerPicking: number = 0;
    public fifthsAndOctaves: number = 0;
    public syncopation: number = 0;
    public bassPick: number = 0;
    public sustain: number = 0;
}


export interface SongFretHandMuteTemplate {

}

export class SongHandShape {
    chordId: number = 0;
    startTime: number = 0;
    endTime: number = 0;

    static fromXML(xmlData: object[]): SongHandShape[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).handShape;

        if (!list) return [];

        const handShapes: SongHandShape[] = list.map((item: object): SongHandShape => {
            const iany = (item as any);
            let { chordId, startTime, endTime } = iany.$;
            chordId = parseInt(chordId);
            startTime = parseFloat(startTime);
            endTime = parseFloat(endTime);
            return {
                chordId,
                endTime,
                startTime,
            }
        })
        return handShapes;
    }
}

export class SongAnchor {
    time: number = 0;
    fret: number = 0;
    width: number = 0;

    static fromXML(xmlData: object[]): SongAnchor[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).anchor;

        if (!list) return [];

        const anchors: SongAnchor[] = list.map((item: object): SongAnchor => {
            const iany = (item as any);
            let { time, fret, width } = iany.$;
            time = parseFloat(time);
            fret = parseInt(fret);
            width = parseFloat(width);
            return {
                time,
                fret,
                width,
            }
        })
        return anchors;
    }
}

export class SongChord {
    time: number = 0;
    linkNext: number = 0;
    accent: number = 0;
    chordId: number = 0;
    fretHandMute?: number = 0;
    highDensity?: number = 0;
    ignore?: number = 0;
    palmMute?: number = 0;
    hopo?: number = 0;
    strum?: number = 0;
    chordNote: SongNote[] = [];

    static fromXML(xmlData: object[]): SongChord[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).chord;

        if (!list) return [];

        const chords: SongChord[] = list.map((item: object): SongChord => {
            const iany = (item as any);
            let { time, strum, ...rest } = iany.$;
            time = parseFloat(time);
            rest = objectMap(rest, item => parseInt(item, 10));
            return {
                time,
                strum,
                ...rest,
                chordNote: SongNote.fromXML([iany], true),
            }
        })
        return chords;
    }
}

export class TranscriptionTrack {
    difficulty: number = 0;
    notes: SongNote[] = [];
    chords: SongChord[] = [];
    anchors: SongAnchor[] = [];
    handShapes: SongHandShape[] = [];
    fretHandMutes: SongFretHandMuteTemplate[] = [];

    static fromXML(xmlData: object[]): TranscriptionTrack {
        const item = (xmlData[0] as any);
        const iany = (item as any);

        const transcriptionTrack: TranscriptionTrack = {
            difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty) : 0,
            notes: SongNote.fromXML(iany.notes),
            chords: SongChord.fromXML(iany.chords),
            anchors: SongAnchor.fromXML(iany.anchors),
            handShapes: SongHandShape.fromXML(iany.handShapes),
            fretHandMutes: [],
        }
        return transcriptionTrack;
    }
}

export class SongLevel {
    difficulty: number = 0;
    notes: SongNote[] = [];
    chords: SongChord[] = [];
    anchors: SongAnchor[] = [];
    handShapes: SongHandShape[] = [];

    static fromXML(xmlData: object[]): SongLevel[] {
        if (!xmlData) return [];
        const item = xmlData[0];
        const list = (item as any).level;

        if (!list) return [];

        const levels: SongLevel[] = list.map((item: object): SongLevel => {
            const iany = (item as any);
            return {
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty, 10) : 0,
                notes: SongNote.fromXML(iany.notes),
                chords: SongChord.fromXML(iany.chords),
                anchors: SongAnchor.fromXML(iany.anchors),
                handShapes: SongHandShape.fromXML(iany.handShapes),
            }
        })
        return levels;
    }
}

export interface ISong2014 {
    version: string;
    title: string;
    arrangement: string;
    part: number;
    offset: number;
    centOffset: number;
    songLength: number;
    startBeat: number;
    averageTempo: number;
    tuning: Tuning;
    capo: number;
    artistName: string;
    artistNameSort: string;
    albumName: string;
    albumNameSort: string;
    albumYear: string;
    crowdSpeed: string;
    arrangementProperties: SongArrangementProperties;
    lastConversionDateTime: string;
    phrases: SongPhrase[];
    phraseIterations: SongPhraseIteration[];
    newLinkedDiffs: SongNewLinkedDiff[];
    linkedDiffs: SongLinkedDiff[];
    phraseProperties: SongPhraseProperty[];
    chordTemplates: SongChordTemplate[];
    fretHandMuteTemplates: SongFretHandMuteTemplate[];
    ebeats: SongEbeat[];
    tonebase: string;
    tonea: string;
    toneb: string;
    tonec: string;
    toned: string;
    tones: SongTone[];
    sections: SongSection[];
    events: SongEvent[];
    controls: SongPhraseProperty[];
    transcriptionTrack: TranscriptionTrack;
    levels: SongLevel[];
}

export interface NoteData {
    version: string;
    notes: NoteTime[];
}

export interface NoteTime {
    string: number;
    fret: number;
    type: number;
    startTime: number;
    endTime: number;
}

export const getI = (item: string[]): number =>
    item && item.length > 0 ? parseInt(item[0], 10) : 0;
export const getF = (item: string[]): number =>
    item && item.length > 0 ? parseFloat(item[0]) : 0;
export const getS = (item: string[]): string =>
    item && item.length > 0 ? item[0].toString() : '';
const objectMap = (object: { [key: string]: any }, mapFn: (item: any) => void) => {
    return Object.keys(object).reduce(function (result: { [key: string]: any }, key: string) {
        result[key] = mapFn(object[key])
        return result
    }, {})
}