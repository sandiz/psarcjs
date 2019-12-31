
import { NoteData } from './types/song2014'
export class SongEbeat {
    time: number = 0;
    measure?: number;

    static fromBeatData(beats: string[]): SongEbeat[] {
        return beats.map(item => {
            const [time, beat] = item.split(" ");
            let timef = parseFloat(time);
            let beati = parseInt(beat);
            if (beati === 1) return { time: timef, measure: beati }
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
            return {
                time: parseFloat(iany.$.time),
                measure: iany.$.measure ? parseInt(iany.$.measure) : 0,
            }
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
    string: number = 0;
    fret: number = 0;
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
    fret0: number = 0;
    fret1: number = 0;
    fret2: number = 0;
    fret3: number = 0;
    fret4: number = 0;
    fret5: number = 0;
    finger0: number = 0;
    finger1: number = 0;
    finger2: number = 0;
    finger3: number = 0;
    finger4: number = 0;
    finger5: number = 0;

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
                fret0: iany.$.fret0 ? parseInt(iany.$.fret0, 10) : 0,
                fret1: iany.$.fret0 ? parseInt(iany.$.fret1, 10) : 0,
                fret2: iany.$.fret0 ? parseInt(iany.$.fret2, 10) : 0,
                fret3: iany.$.fret0 ? parseInt(iany.$.fret3, 10) : 0,
                fret4: iany.$.fret0 ? parseInt(iany.$.fret4, 10) : 0,
                fret5: iany.$.fret0 ? parseInt(iany.$.fret5, 10) : 0,
                finger0: iany.$.fret0 ? parseInt(iany.$.finger0, 10) : 0,
                finger1: iany.$.fret0 ? parseInt(iany.$.finger1, 10) : 0,
                finger2: iany.$.fret0 ? parseInt(iany.$.finger2, 10) : 0,
                finger3: iany.$.fret0 ? parseInt(iany.$.finger3, 10) : 0,
                finger4: iany.$.fret0 ? parseInt(iany.$.finger4, 10) : 0,
                finger5: iany.$.fret0 ? parseInt(iany.$.finger5, 10) : 0,
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
        const list = (item as any).control;

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
        const list = (item as any).control;

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

export interface BendValue {
    time: number;
    step: number;
    unk5: number;
}

export const getI = (item: string[]): number =>
    item && item.length > 0 ? parseInt(item[0], 10) : 0;
export const getF = (item: string[]): number =>
    item && item.length > 0 ? parseFloat(item[0]) : 0;
export const getS = (item: string[]): string =>
    item && item.length > 0 ? item[0].toString() : '';