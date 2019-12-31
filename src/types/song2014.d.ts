/* Song2014 XML Format */
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

export interface SongPhrase {
    disparity: number;
    ignore: number;
    maxDifficulty: number;
    name: string;
    solo: number;
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

export interface SongLinkedDiff {
    parentId: number;
    childId: string;
}

export interface SongPhraseProperty {
    phraseId: number;
    redundant: number;
    levelJump: number;
    empty: number;
    difficulty: number;
}

export interface SongChordTemplate {
    displayName: string;
    chordName: string;
    fret0: number;
    fret1: number;
    fret2: number;
    fret3: number;
    fret4: number;
    fret5: number;
    finger0: number;
    finger1: number;
    finger2: number;
    finger3: number;
    finger4: number;
    finger5: number;
}

export interface SongFretHandMuteTemplate {

}

export interface SongControl {
    time: number;
    code: string;
}

export interface SongEbeat {
    time: number;
    measure?: number;
}

export interface SongSection {
    name: string;
    number: number;
    startTime: number;
}

export interface SongEvent {
    time: number;
    code: string;
}

export interface SongTone {
    time: number;
    id: number;
    name: string;
}

export interface SongHandShape {
    chordId: number;
    startTime: number;
    endTime: number;
}

export interface SongAnchor {
    width: number;
}

export interface BendValue {
    time: number;
    step: number;
    unk5: number;
}

export interface SongNote {
    time: number;
    string: number;
    fret: number;
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
    bendValues?: BendValue[];
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
    songLegnth: number;
    songNameSort: number;
    startBeat: number;
    averageTempo: number;
    tuning: Tuning;
    capo: number;
    artistName: string;
    artistNameSort: string;
    albumName: string;
    albumNameSort: string;
    albumYear: string;
    albumArt: string;
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
    controls: SongControl[];
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