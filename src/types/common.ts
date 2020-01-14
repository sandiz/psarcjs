import { promises } from 'fs';
import * as xml2js from 'xml2js';

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

export interface ToolkitInfo {
    name: string;
    version: string;
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

export class ShowLights {
    time: number = 0;
    note: number = 0;

    static async fromXML(xmlFile: string): Promise<ShowLights[]> {
        const data = await promises.readFile(xmlFile);
        const parsed = await xml2js.parseStringPromise(data);
        const sl = parsed.showlights.showlight;

        const lights: ShowLights[] = [];
        sl.map((item: { $: ShowLights }) => {
            lights.push({
                time: parseFloat(item.$.time.toString()),
                note: parseInt(item.$.note.toString(), 10),
            })
        })
        return lights;
    }

    static toXML(sl: ShowLights[]): string {
        const e = {
            showlights: {
                $: {
                    count: sl.length,
                },
                showlight: sl.map(item => {
                    return {
                        $: { ...item },
                    }
                })
            }
        }


        const builder = new xml2js.Builder();
        const xml = builder.buildObject(e);
        return xml;
    }
}

export class Vocals {
    time: number = 0;
    note: number = 0;
    length: number = 0;
    lyric: string = '';

    static async fromXML(xmlFile: string): Promise<Vocals[]> {
        const data = await promises.readFile(xmlFile);
        const parsed = await xml2js.parseStringPromise(data);
        const sl = parsed.vocals.vocal;

        const vocals: Vocals[] = [];
        sl.map((item: { $: Vocals }) => {
            vocals.push({
                time: parseFloat(item.$.time.toString()),
                note: parseInt(item.$.note.toString(), 10),
                length: parseFloat(item.$.length.toString()),
                lyric: item.$.lyric,
            })
        })
        return vocals;
    }

    static toXML(sl: Vocals[]): string {
        const e = {
            vocals: {
                $: {
                    count: sl.length,
                },
                vocal: sl.map(item => {
                    return {
                        $: { ...item },
                    }
                })
            }
        }


        const builder = new xml2js.Builder();
        const xml = builder.buildObject(e);
        return xml;
    }
}