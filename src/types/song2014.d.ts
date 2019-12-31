/* Song2014 XML Format */
import {
    SongEbeat, SongNote, SongPhrase,
    SongTone, SongSection, SongEvent,
    SongPhraseProperty, SongChordTemplate, SongLinkedDiff,
} from '../song2014'
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
}

export interface SongNld_Phrase {
    id: number;
}

export interface SongNewLinkedDiff {
    levelBreak: number;
    ratio: string;
    phraseCount: number;
    nld_phrase: SongNld_Phrase[];
}

export interface SongFretHandMuteTemplate {

}

export interface SongHandShape {
    chordId: number;
    startTime: number;
    endTime: number;
}

export interface SongAnchor {
    width: number;
}

export interface SongChord {
    time: number;
    linkNext: number;
    accent: number;
    chordId: number;
    fretHandMute: number;
    highDensity: number;
    ignore: number;
    palmMute: number;
    hopo: number;
    strum: number;
    chordNote: SongNote[]
}

export interface TranscriptionTrack {
    difficulty: number;
    notes: SongNote[];
    chords: SongChord[];
    anchors: SongAnchor[];
    handShapes: SongHandShape[];
    fretHandMutes: SongFretHandMuteTemplate[];
}

export interface SongLevel {
    difficulty: number;
    notes: SongNote[];
    chords: SongChord[];
    anchors: SongAnchor[];
    handShapes: SongHandShape[];
}

export interface HeroLevel {
    difficulty: number;
    hero: number;
}

export interface SongPhraseIterations {
    time: number;
    phraseId: number;
    variation: string;
    HeroLevels: HeroLevel[];
}

export interface Song2014 {
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
    phraseIterations: SongPhraseIterations[];
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