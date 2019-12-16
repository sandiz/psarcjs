
export interface BEND {
    time: number;
    step: number;
    UNK: number;
}

export interface BENDS {
    bendValues: Array<BEND>;
    count: number;
}

export interface RECT {
    y0: number;
    x0: number;
    y1: number;
    x1: number;
}

export interface BEATS {
    time: number;
    measure: number;
    beat: number;
    phraseIteration: number;
    mask: number;
}

export interface PHRASES {
    solo: number;
    disparity: number;
    ignore: number;
    maxDifficulty: number;
    phraseIterationLinks: number;
    name: string[32];
}

export interface CHORDTEMPLATES {
    mask: number;
    frets: Array<number>;
    fingers: Array<number>;
    notes: Array<number>;
    name: string[32];

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

export interface SYMBOLS {
    header: [Array<number>];
    texture: TEXTURE;
    definition: DEFINITION;
}

export interface VOCALS {
    time: number;
    note: number;
    length: number;
    lyrics: string[48];
}

export interface CHORDNOTES {
    mask: Array<number>;
    bends: Array<BENDS>;
    slideTo: Array<number>;
    slideUnpitchTo: Array<number>;
    vibrato: Array<number>;
}

export interface PHRASEITERATIONS {
    phraseId: number;
    time: number;
    endTime: number;
    difficulty: Array<number>;
}

export interface PHRASEEXTRAINFOS {
    phraseId: number;
    difficulty: number;
    empty: number;
    levelJump: number;
    redundant: number;
}

export interface NEWLINKEDDIFFS {
    levelBreak: number;
    nld_phrase: number[];
}

export interface ACTIONS {
    time: number;
    name: string[256];
}

export interface EVENTS {
    time: number;
    name: string[256];
}

export interface TONE {
    time: number;
    id: number;
}

export interface DNA {
    time: number;
    id: number;
}

export interface SECTIONS {
    name: string[32];
    number: number;
    startTime: number;
    endTime: number;
    startPhraseIterationId: number;
    endPhraseIterationId: number;
    stringMask: Array<number>;
}

export interface METADATA {
    maxScores: number;
    maxNotes: number;
    maxNotesNoIgnored: number;
    pointsPerNote: number;
    firstBeatLength: number;
    startTime: number;
    capo: number;
    lastConversionDateTime: string[32];
    part: number;
    songLength: number;
    tuning: number[];
    firstNoteTime: number;
    firstNoteTime2: number;
    maxDifficulty: number;
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

export interface NOTES {
    mask: number;
    flags: number;
    hash: number;
    time: number;
    string: number;
    fret: number;
    anchorFret: number;
    anchorWidth: number;
    chordId: number;
    chordNoteId: number;
    phraseId: number;
    phraseIterationId: number;
    fingerPrintId: Array<number>;
    nextIterNote: number;
    prevIterNote: number;
    parentPrevNote: number;
    slideTo: number;
    slideInpitchTo: number;
    leftHand: number;
    tap: number;
    pickDirection: number;
    slap: number;
    pluck: number;
    vibrato: number;
    sustain: number;
    bend_time: number;
    bends: BEND[];
}

export interface LEVELS {
    difficulty: number;
    anchors: ANCHORS[];
    anchor_extensions: ANCHOREXTENSIONS[];
    fingerprints: Array<FINGERPRINTS>;
    notes: NOTES[];
    averageNotesPerIter: number[];
    notesInIterCountNoIgnored: number[];
    notesInIterCount: number[];
}

export interface SNGFORMAT {
    beats_length: number;
    beats: BEATS[];

    phrases_length: number;
    phrases: PHRASES[];

    chord_templates_length: number;
    chordTemplates: CHORDTEMPLATES[];

    chordNotes: CHORDNOTES[];
    vocals: VOCALS[];
    symbols: SYMBOLS;
    phraseIterations: PHRASEITERATIONS[];
    phraseExtraInfos: PHRASEEXTRAINFOS[];
    newLinkedDiffs: NEWLINKEDDIFFS[];
    actions: ACTIONS[];
    events: EVENTS[];
    tone: TONE[];
    dna: DNA[];
    sections: SECTIONS[];
    levels: LEVELS[];
    metadata: METADATA;
}