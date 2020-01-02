import { promises } from 'fs';
import * as xml2js from 'xml2js';

//import * as util from 'util';
import * as Parser from './parser';
import * as SNGParser from './sngparser';
import * as DDSParser from './ddsparser';
import * as WEMParser from './wemparser';
import * as BNKParser from './bnkparser';
import * as WAAPIHandler from './wemwaapi';
import { SNGFORMAT } from './types/sng';
import { join } from 'path';
import { generate } from './aggregategraphwriter';

import {
    BOM, Arrangements, ArrangementDetails,
    Platform, Arrangement, ToolkitInfo,
} from "./types/common";

import {
    SongEbeat, SongNote, SongPhrase,
    getI, getF, getS, SongTone,
    SongSection, SongEvent, SongPhraseProperty,
    SongChordTemplate,
    SongLinkedDiff,
    SongNewLinkedDiff,
    SongPhraseIteration,
    ISong2014, Tuning, SongArrangementProperties,
    TranscriptionTrack, SongLevel,
} from './song2014';

const pkgInfo = require("../package.json");

class PSARC {
    /**
     * Initialise psarc file instance
     *
     * @param {string} file path to psarc
     * @example
     * const psarc = new PSARC('test/test.psarc');
     * await psarc.parse();
     * console.log(psarc.getFiles());
     * @returns {this}
     */
    public psarcFile: string;
    private psarcRawData: Buffer | null;
    private BOMEntries: BOM | null;
    private listing: string[];

    constructor(file: string) {
        this.psarcFile = file;
        this.psarcRawData = null;
        this.BOMEntries = null;
        this.listing = [];
    }
    /**
     * decrypt a psarc file and parse it, this function must be called first 
     * before calling any other member functions
     */
    public async parse(): Promise<void> {
        this.psarcRawData = await promises.readFile(this.psarcFile);
        //console.log("parsing psarc:", this.psarcFile, "size:", (this.psarcRawData.length / (1024 * 1024)).toFixed(2), "mb");

        if (this.psarcRawData) {
            const header = Parser.HEADER.parse(this.psarcRawData);
            const paddedbom = Parser.pad(header.bom);
            const decryptedbom = Buffer.from(Parser.BOMDecrypt(paddedbom));
            const slicedbom = decryptedbom.slice(0, header.bom.length);

            this.BOMEntries = Parser.BOM(header.n_entries).parse(slicedbom);
            // console.log(util.inspect(this.BOMEntries, { depth: null }));
            if (this.BOMEntries) {
                const rawlisting = await Parser.readEntry(this.psarcRawData, 0, this.BOMEntries);
                this.listing = unescape(rawlisting.toString()).split("\n");
            }
        }
    }

    /**
     * get all files in psarc
     *
     * @returns {Array} list of all files in the psarc
     */
    public getFiles(): string[] {
        return this.listing;
    }

    /**
     * get all arrangements from file
     *
     * @returns {Object} json object representing an arrangement keyed with persistentID
     */
    public async getArrangements(): Promise<Arrangements> {
        const arrangements: Arrangements = {};
        for (let i = 0; i < this.listing.length; i += 1) {
            const listing = this.listing[i];
            if (listing.endsWith("json")) {
                const data = await this.readFile(i);
                if (data) {
                    const body = data.toString("utf-8");
                    if (body === "") {
                        continue;
                    }
                    const json = JSON.parse(body);
                    const Entries = json.Entries;
                    const keys = Object.keys(Entries);
                    for (let j = 0; j < keys.length; j += 1) {
                        const key = keys[j];
                        const attr = json.Entries[key].Attributes;
                        attr.srcjson = listing;
                        arrangements[key] = attr;
                    }
                }
            }
        }
        return arrangements;
    }

    /**
     * extract file from psarc
     *
     * @param {number} idx index of the file in file list (see getFiles())
     * @param {String} outfile path to output file
     * @param {Boolean}  tostring convert data to string before outputting
     * @returns {Boolean} true | false based on success / failure 
     */
    public async extractFile(idx: number, outfile: string, tostring = false) {
        if (idx === -1) return false;
        const data = await this.readFile(idx);
        if (data) {
            if (tostring)
                await promises.writeFile(outfile, data.toString('utf-8'));
            else
                await promises.writeFile(outfile, data);
            return true;
        }
        return false;
    }

    /**
     * read file from psarc
     *
     * @param {number} idx index of the file in file list (see getFiles())
     * @returns {Buffer} file data
     */
    public async readFile(idx: number) {
        if (idx === -1) return null;
        if (this.psarcRawData && this.BOMEntries) {
            const data = await Parser.readEntry(this.psarcRawData, idx + 1, this.BOMEntries)
            if (data) {
                const decrypted = await Parser.Decrypt(this.listing[idx], data);
                return decrypted;
            }
        }
        return null;
    }

    /**
     * raw unencrypted psarc data
     *
     * @returns {Buffer} file raw data
     */
    getRawData() {
        return this.psarcRawData;
    }
}

class SNG {
    public sngFile: string;
    private sngRawData: Buffer | null;
    private sng: Partial<SNGFORMAT> | null = null;
    constructor(file: string) {
        this.sngFile = file;
        this.sngRawData = null;
    }

    public async parse(): Promise<void> {
        this.sngRawData = await promises.readFile(this.sngFile);
        if (this.sngRawData) {
            this.sng = SNGParser.SNGDATA.parse(this.sngRawData);
        }
    }
}

class DDS {
    public imageFile: string;
    public ddsFiles: string[] = [];

    constructor(file: string) {
        this.imageFile = file;
    }

    public async convert(tag: string = ""): Promise<string[]> {
        this.ddsFiles = await DDSParser.convert(this.imageFile, tag);
        return this.ddsFiles;
    }

    public async validate(): Promise<object> {
        const data = await promises.readFile(this.imageFile);
        return DDSParser.HEADER.parse(data);
    }

}

class WEM {
    static async convert(file: string, tag: string = "") {
        let wemFile = await WEMParser.convert(file, tag);
        return wemFile;
    }

    static async validate(wemFile: string) {
        const data = await promises.readFile(wemFile);
        return WEMParser.WEMDATA.parse(data);
    }
}


class BNK {
    static async validate(bnkFile: string) {
        const data = await promises.readFile(bnkFile);
        return BNKParser.BNKDATA.parse(data);
    }

    static async generate(wemFile: string, tag: string, copyWem: boolean, dir: string, preview: boolean = false) {
        return await BNKParser.generate(dir, wemFile, tag, copyWem, preview);
    }
}

class WAAPI {
    static async convert(file: string, tag: string, platform: Platform): Promise<string> {
        return await WAAPIHandler.Convert(file, tag, platform);
    }
}

class GENERIC {
    static async generateToolkit(dir: string, author: string,
        comment: string, v2: string, tk: ToolkitInfo) {
        const f = join(dir, "toolkit.version");
        const data = `Package Author: ${author}\n` +
            `Package Version: ${v2}\n` +
            `Package Comment: ${comment}\n` +
            `Toolkit: ${tk.name} v${tk.version} (psarcjs v${pkgInfo.version})\n\n`
        await promises.writeFile(f, data);
        return f;
    }

    static async generateAppid(dir: string) {
        const appid = "248750";
        const f = join(dir, "appid.appid")
        await promises.writeFile(f, appid);
        return f;
    }

    static async generateAggregateGraph(dir: string, tag: string, arrDetails: ArrangementDetails, platform: Platform) {
        return await generate(dir, tag, arrDetails, platform);
    }

    static async generateXBlock(arrs: Arrangement[], tag: string, dir: string) {
        const f = join(dir, `${tag}.xblock`);
        const ptypes = [
            "Header", "Manifest", "SngAsset",
            "AlbumArtSmall", "AlbumArtMedium", "AlbumArtLarge",
            "LyricArt", "ShowLightsXMLAsset", "SoundBank", "PreviewSoundBank"
        ];
        const ptypePrefix = [
            "urn:database:hsan-db:", "urn:database:json-db:", "urn:application:musicgame-song:", "urn:image:dds:",
            "urn:image:dds:", "urn:image:dds:", "", "urn:application:xml:",
            "urn:audio:wwise-sound-bank:", "urn:audio:wwise-sound-bank:"
        ]
        const getValue = (item: string, index: number, tag: string, arr: Arrangement) => {
            switch (item) {
                case "Header":
                    return `${ptypePrefix[index]}songs_dlc_${tag}`;
                case "SngAsset":
                case "Manifest":
                    return `${ptypePrefix[index]}${tag}_${arr.arrangementType}`;
                case "AlbumArtSmall":
                    return `${ptypePrefix[index]}album_${tag}_64`;
                case "AlbumArtMedium":
                    return `${ptypePrefix[index]}album_${tag}_128`;
                case "AlbumArtLarge":
                    return `${ptypePrefix[index]}album_${tag}_256`;
                case "ShowLightsXMLAsset":
                    return `${ptypePrefix[index]}${tag}_showlights`;
                case "SoundBank":
                    return `${ptypePrefix[index]}song_${tag}`;
                case "PreviewSoundBank":
                    return `${ptypePrefix[index]}song_${tag}_preview`;
                default:
                    return "";
            }
        }
        const property = (arr: Arrangement) => ptypes.map((item, index) => {
            return {
                $: {
                    name: item
                },
                set: {
                    $: {
                        value: getValue(item, index, tag, arr)
                    }
                }
            }

        });
        const entities = arrs.map(item => {
            return {
                $: {
                    id: item.persistentID,
                    modelName: "RSEnumerable_Song",
                    name: `${tag}_${toTitleCase(item.arrangementType)}`,
                    iterations: 0,
                },
                properties: {
                    property: property(item),
                }
            }
        });
        const xblock = {
            game: {
                entitySet: {
                    entity: entities,
                }
            }
        }

        const builder = new xml2js.Builder();
        const xml = builder.buildObject(xblock);
        await promises.writeFile(f, xml);
        return f;
    }
}


class Song2014 {
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
            arrangement: getS(song.arrangement),
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
        const builder = new xml2js.Builder();
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

    }
}


const toTitleCase = function (str: string) {
    return str.replace(/\w\S*/g, function (txt: string) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
const objectMap = (object: { [key: string]: any }, mapFn: (item: any) => void) => {
    return Object.keys(object).reduce(function (result: { [key: string]: any }, key: string) {
        result[key] = mapFn(object[key])
        return result
    }, {})
}


module.exports = {
    PSARC,
    SNG,
    DDS,
    WEM,
    WAAPI,
    GENERIC,
    BNK,
    Song2014,
    SongEbeat,
    SongNote,
}
