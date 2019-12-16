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

export type Arrangements = { [persistentID: string]: object };