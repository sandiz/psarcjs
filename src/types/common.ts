
export interface PSARCHEADER {
    MAGIC: string[4],
    VERSION: number,
    COMPRESSION: string[4],
    header_size: number,
    ENTRY_SIZE: number,
    n_entries: number,
    BLOCK_SIZE: number,
    ARCHIVE_FLAGS: number,
    bom: Buffer,
}

export interface ENTRY {
    md5: string[16],
    zindex: number,
    length: Buffer,
    offset: Buffer,
}

export interface BOM {
    entries: ENTRY[],
    zlength: number[],
}

export enum Platform { Windows, Mac }

export type Arrangements = { [persistentID: string]: object };

export enum ArrangmentType { LEAD = "lead", RHYTHM = "rhythm", BASS = "bass", VOCALS = "vocals" }
export interface ArrangementDetails {
    [ArrangmentType.LEAD]: number;
    [ArrangmentType.RHYTHM]: number;
    [ArrangmentType.BASS]: number;
    [ArrangmentType.VOCALS]: number;
}

/* represents an arrangment in psarc */
export interface Arrangement {
    persistentID: string;
    arrangementType: ArrangmentType;
}