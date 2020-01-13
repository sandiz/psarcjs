
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
    id?: number = 0;
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

export interface SongArrangementProperties {
    bonusArr: number;
    Metronome: number;
    pathLead: number;
    pathRhythm: number;
    pathBass: number;
    routeMask: number;
    represent: number;
    standardTuning: number;
    nonStandardChords: number
    barreChords: number;
    powerChords: number;
    dropDPower: number;
    openChords: number;
    fingerPicking: number;
    pickDirection: number;
    doubleStops: number;
    palmMutes: number;
    harmonics: number;
    pinchHarmonics: number;
    hopo: number;
    tremolo: number;
    slides: number;
    unpitchedSlides: number;
    bends: number;
    tapping: number;
    vibrato: number;
    fretHandMutes: number;
    slapPop: number;
    twoFingerPicking: number;
    fifthsAndOctaves: number;
    syncopation: number;
    bassPick: number;
    sustain: number;
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