import { promises, exists, Dirent, readFile } from 'fs';
import { mkdirp, move } from 'fs-extra';
import { Parser } from 'binary-parser';
import * as xml2js from 'xml2js';
import * as crypto from 'crypto';

import * as util from 'util';
import * as os from 'os';
import * as PSARCParser from './parser';
import * as SNGParser from './sngparser';
import * as DDSParser from './ddsparser';
import * as WEMParser from './wemparser';
import * as BNKParser from './bnkparser';
import * as WAAPIHandler from './wemwaapi';
import * as SNGTypes from './types/sng';
import { join, basename } from 'path';
import { generate } from './aggregategraphwriter';

import {
    BOM, Arrangements, ArrangementDetails,
    Platform, Arrangement, ToolkitInfo, PSARCOptions, Manifest, ManifestReplacer, VocalArrangement, HSANManifest, ArrangementType, MetaArrangement, ArrangementInfo, ManifestTone, ManifestToneReviver, Vocals, Toolkit,
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

const { readdir } = require('fs').promises;
const { resolve } = require('path');


const pkgInfo = require("../package.json");

export class PSARC {
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
            const header = PSARCParser.HEADER.parse(this.psarcRawData);
            console.log(header);
            const paddedbom = PSARCParser.pad(header.bom);
            const decryptedbom = Buffer.from(PSARCParser.BOMDecrypt(paddedbom));
            const slicedbom = decryptedbom.slice(0, header.bom.length);

            this.BOMEntries = PSARCParser.BOM(header.n_entries).parse(slicedbom);
            // console.log(util.inspect(this.BOMEntries, { depth: null }));
            if (this.BOMEntries) {
                const rawlisting = await PSARCParser.readEntry(this.psarcRawData, 0, this.BOMEntries);
                this.listing = unescape(rawlisting.toString()).split("\n");
                this.BOMEntries.entries.forEach((v, i) => {
                    if (i === 0) (v as any).name = "listing";
                    else (v as any).name = this.listing[i - 1];
                })
                console.log(this.BOMEntries);
                /* this.listing.forEach(l => {
                    const md5 = crypto.createHash('md5', { encoding: 'ascii' }).update(l).digest("hex")
                    console.log(l, md5);
                }) */
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
            const data = await PSARCParser.readEntry(this.psarcRawData, idx + 1, this.BOMEntries)
            if (data) {
                const decrypted = await PSARCParser.Decrypt(this.listing[idx], data);
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

    static existsAsync(path: string) {
        return new Promise(function (resolve, reject) {
            exists(path, function (exists) {
                resolve(exists);
            })
        })
    }


    static async generateDirectory(
        dir: string,
        tag: string,
        files: {
            xml: {
                [ArrangementType.LEAD]: string[],
                [ArrangementType.RHYTHM]: string[],
                [ArrangementType.BASS]: string[],
                [ArrangementType.SHOWLIGHTS]: string[],
                [ArrangementType.VOCALS]: string[],
            },
            tones: {
                [ArrangementType.LEAD]: string[],
                [ArrangementType.RHYTHM]: string[],
                [ArrangementType.BASS]: string[],
            },
            dds: {
                '256': string,
                '128': string,
                '64': string,
            },
            wem: {
                main: { wem: string, bnk: string },
                preview: { wem: string, bnk: string },
            }
        },
        arrInfo: ArrangementInfo,
        toolkit: Toolkit,
        platform: Platform
    ): Promise<string> {
        /* validate dds */
        await Promise.all(Object.keys(files.dds).map(key => {
            const dds1 = new DDS(files.dds[key as keyof typeof files.dds]);
            return dds1.validate();
        }))
        /* validate wem */
        await WEM.validate(files.wem.main.wem);
        await WEM.validate(files.wem.preview.wem);

        /* validate bnk */
        await BNK.validate(files.wem.main.bnk);
        await BNK.validate(files.wem.preview.bnk);

        const info = (index: number): ArrangementInfo => { arrInfo.currentPartition = index; return arrInfo; }

        const _getFiles = async (xml: string, tones: string, index: number): Promise<{ sng: string, manifest: string, arrangement: Arrangement }> => {
            const parsed: Song2014 = await Song2014.fromXML(xml);
            const sngFile = await parsed.generateSNG("/tmp/", tag);
            const sng = new SNG(sngFile);
            await sng.parse();
            const tonesObj: ManifestTone[] = JSON.parse(await (await promises.readFile(tones)).toString(), ManifestToneReviver);

            const arr = new Arrangement(parsed.song, sng, {
                tag: tag,
                sortOrder: index,
                volume: arrInfo.volume,
                previewVolume: arrInfo.previewVolume,
                bassPicked: xml.endsWith("_bass.xml"),
                represent: index === 0,
                details: details,
                tones: tonesObj,
                info: info(index),
            });
            const json = await MANIFEST.generateJSON("/tmp/", tag, arr);

            return {
                sng: sngFile,
                manifest: json,
                arrangement: arr,
            };
        }

        const _getVocalSNG = async (xml: string, index: number): Promise<{ sng: string, manifest: string, arrangement: VocalArrangement }> => {
            const parsed: Vocals[] = await Vocals.fromXML(xml);
            const sngFile = await Vocals.generateSNG("/tmp/", tag, parsed);
            const arr = new VocalArrangement({
                tag: tag,
                sortOrder: index,
                volume: arrInfo.volume,
                previewVolume: arrInfo.previewVolume,
                bassPicked: false,
                represent: true,
                details: details,
                tones: [],
                info: info(index),
            });
            const json = await MANIFEST.generateJSON("/tmp", tag, arr);
            return {
                sng: sngFile,
                manifest: json,
                arrangement: arr,
            };
        }

        const leadFiles =
            await Promise.all(files.xml[ArrangementType.LEAD].map((xml, index) => _getFiles(xml, files.tones[ArrangementType.LEAD][index], index)));
        const rhythmFiles =
            await Promise.all(files.xml[ArrangementType.RHYTHM].map((xml, index) => _getFiles(xml, files.tones[ArrangementType.RHYTHM][index], index)));
        const bassFiles =
            await Promise.all(files.xml[ArrangementType.BASS].map((xml, index) => _getFiles(xml, files.tones[ArrangementType.BASS][index], index)));
        const vocalFiles =
            await Promise.all(files.xml[ArrangementType.VOCALS].map((xml, index) => _getVocalSNG(xml, index)));

        let allArrs: (Arrangement | VocalArrangement)[] = [];
        allArrs = allArrs.concat(vocalFiles.map(item => item.arrangement));
        allArrs = allArrs.concat(leadFiles.map(item => item.arrangement).concat(rhythmFiles.map(item => item.arrangement)).concat(bassFiles.map(item => item.arrangement)));

        const hsan = await MANIFEST.generateHSAN(dir, tag, allArrs);
        const details: ArrangementDetails = {
            [ArrangementType.LEAD]: leadFiles.length,
            [ArrangementType.RHYTHM]: rhythmFiles.length,
            [ArrangementType.BASS]: bassFiles.length,
            [ArrangementType.VOCALS]: vocalFiles.length,
            [ArrangementType.SHOWLIGHTS]: files.xml[ArrangementType.SHOWLIGHTS].length,
        };
        const options: PSARCOptions = {
            tag: tag,
            platform: platform,
            toolkit,
            arrDetails: details,
            dds: files.dds,
            audio: files.wem,
            songs: {
                xmls: {
                    [ArrangementType.LEAD]: files.xml[ArrangementType.LEAD],
                    [ArrangementType.RHYTHM]: files.xml[ArrangementType.RHYTHM],
                    [ArrangementType.BASS]: files.xml[ArrangementType.BASS],
                    [ArrangementType.VOCALS]: files.xml[ArrangementType.VOCALS],
                    [ArrangementType.SHOWLIGHTS]: files.xml[ArrangementType.SHOWLIGHTS],
                },
                sngs: {
                    [ArrangementType.LEAD]: leadFiles.map(item => item.sng),
                    [ArrangementType.RHYTHM]: rhythmFiles.map(item => item.sng),
                    [ArrangementType.BASS]: bassFiles.map(item => item.sng),
                    [ArrangementType.VOCALS]: vocalFiles.map(item => item.sng),
                },
                manifests: {
                    [ArrangementType.LEAD]: leadFiles.map(item => item.manifest),
                    [ArrangementType.RHYTHM]: rhythmFiles.map(item => item.manifest),
                    [ArrangementType.BASS]: bassFiles.map(item => item.manifest),
                    [ArrangementType.VOCALS]: vocalFiles.map(item => item.manifest),
                },
                hsan: hsan,
                arrangements: allArrs,
            }
        }
        /* Options are ready, generate and move files now */
        /*
            toolkit.version -- DONE
            appid.appid
            tag_aggregrategraph.nt
            flatmodels -> rs -> rsenumerable_song.flat, rsenumerable_root.flat
            gfxassets -> album_art -> album_tag_{256,128,64}.dds
            audio -> mac/windows -> rand.wem, rand.wem, song_tag.bnk song_tag_preview.bnk
            songs -> arr -> tag_showlights.xml, tag_arrangement.xml
                  -> bin -> macos/generic -> tag_arrangement.sng
            manifests -> songs_dlc_tag -> songs_dlc_tag.hsan, tag_arrangement.json
            gamexblocks -> nsongs -> tag.xblock
        */
        const name = `${options.tag}${options.platform == Platform.Mac ? '_m' : '_p'}`;
        const root = join(dir, name);
        let exists = await PSARC.existsAsync(root);
        if (!exists) await promises.mkdir(root);

        await GENERIC.generateToolkit(root, options.toolkit.author, options.toolkit.comment, options.toolkit.version, options.toolkit.tk);
        await GENERIC.generateAppid(root);
        await GENERIC.generateAggregateGraph(root, options.tag, options.arrDetails, options.platform)

        const fm = join(root, "flatmodels/rs");
        exists = await PSARC.existsAsync(fm);
        if (!exists) await mkdirp(fm)

        await promises.copyFile("data/flatmodels/rsenumerable_root.flat", join(fm, "rsenumerable_root.flat"));
        await promises.copyFile("data/flatmodels/rsenumerable_song.flat", join(fm, "rsenumerable_song.flat"));

        const gfxassets = join(root, "gfxassets/album_art");
        exists = await PSARC.existsAsync(gfxassets);
        if (!exists) await mkdirp(gfxassets);

        await promises.copyFile(options.dds[256], join(gfxassets, `album_${options.tag}_256.dds`));
        await promises.copyFile(options.dds[128], join(gfxassets, `album_${options.tag}_128.dds`));
        await promises.copyFile(options.dds[64], join(gfxassets, `album_${options.tag}_64.dds`));


        const audio = join(root, "audio", options.platform === Platform.Mac ? "mac" : "windows");
        exists = await PSARC.existsAsync(audio);
        if (!exists) await mkdirp(audio);

        await promises.copyFile(options.audio.main.wem, join(audio, basename(options.audio.main.wem)));
        await promises.copyFile(options.audio.preview.wem, join(audio, basename(options.audio.preview.wem)));
        await promises.copyFile(options.audio.main.bnk, join(audio, `song_${options.tag}.bnk`));
        await promises.copyFile(options.audio.preview.bnk, join(audio, `song_${options.tag}_preview.bnk`));

        const songsarr = join(root, "songs/arr");
        exists = await PSARC.existsAsync(songsarr);
        if (!exists) await mkdirp(songsarr);
        const arrKeys = Object.keys(options.songs.xmls);
        for (let i = 0; i < arrKeys.length; i += 1) {
            const key = arrKeys[i] as keyof typeof options.songs.xmls;
            const arr = options.songs.xmls[key];
            for (let j = 0; j < arr.length; j += 1) {
                const oneIdx = j + 1;
                const xml = arr[j];
                const dest = join(songsarr, `${options.tag}_${key}${oneIdx > 1 ? `${oneIdx}` : ""}.xml`);
                await promises.copyFile(xml, dest);
            }
        }

        const songsbin = join(root, "songs/bin", options.platform == Platform.Mac ? "macos" : "generic");
        exists = await PSARC.existsAsync(songsbin);
        if (!exists) await mkdirp(songsbin);
        const binKeys = Object.keys(options.songs.sngs);
        for (let i = 0; i < binKeys.length; i += 1) {
            const key = binKeys[i] as keyof typeof options.songs.sngs;
            const sng = options.songs.sngs[key];
            for (let j = 0; j < sng.length; j += 1) {
                const oneIdx = j + 1;
                const sngFile = sng[j];
                const dest = join(songsbin, `${options.tag}_${key}${oneIdx > 1 ? `${oneIdx}` : ""}.sng`);
                await move(sngFile, dest, {
                    overwrite: true,
                });
            }
        }

        const manifestDir = join(root, "manifests", `songs_dlc_${options.tag}`);
        exists = await PSARC.existsAsync(manifestDir);
        if (!exists) await mkdirp(manifestDir);
        const manifestKeys = Object.keys(options.songs.manifests);
        for (let i = 0; i < manifestKeys.length; i += 1) {
            const key = manifestKeys[i] as keyof typeof options.songs.manifests;
            const manifest = options.songs.manifests[key];
            for (let j = 0; j < manifest.length; j += 1) {
                const oneIdx = j + 1;
                const json = manifest[j];
                const dest = join(manifestDir, `${options.tag}_${key}${oneIdx > 1 ? `${oneIdx}` : ""}.json`);
                await move(json, dest, {
                    overwrite: true,
                });
            }
        }
        let dest = join(manifestDir, `songs_dlc_${options.tag}.hsan`);
        await move(options.songs.hsan, dest, {
            overwrite: true,
        });

        const gamex = join(root, "gamexblocks/nsongs");
        exists = await PSARC.existsAsync(gamex);
        if (!exists) await mkdirp(gamex);
        await GENERIC.generateXBlock(options.songs.arrangements, options.tag, gamex);

        return root;
    }

    static async packDirectory(dir: string, platform: Platform) {
        const listingFileName = "NamesBlock.bin";
        let files: string[] = await this.getFiles(dir);
        const entries: {
            name: string,
            zippedBlocks: Buffer[],
            origLengths: number[],
            zLengths: number[],
            totalZLength: number,
        }[] = [];
        files = [listingFileName, ...files];
        for (let i = 0; i < files.length; i += 1) {
            const f = files[i];
            try {
                const name = f.replace(dir + "/", "");
                const rawData = name === listingFileName
                    ? Buffer.from(
                        files
                            .slice(1, files.length)
                            .map(i => i.replace(dir + "/", ""))
                            .join("\n")
                    )
                    : await promises.readFile(f);
                const blocks = this.chunks(rawData, PSARCParser.BLOCK_SIZE);
                const origLengths = blocks.map(i => i.length);
                const zippedBlocks: Buffer[] = await Promise.all(blocks.map(async (b, idx) => {
                    const packed = await PSARCParser.zip(b);
                    const packedLen = packed.length;
                    const plainLen = blocks[idx].length;

                    if (packedLen >= plainLen) {
                        return blocks[idx];
                    }
                    else {
                        if (packedLen < PSARCParser.BLOCK_SIZE - 1) {
                            return packed;
                        }
                        else {
                            return blocks[idx];
                        }
                    }
                }));
                const zLengths: number[] = zippedBlocks.map(i => i.length);

                const totalZLength = zLengths.reduce((p, v) => p + v);
                const item = {
                    name,
                    origLengths,
                    zippedBlocks,
                    zLengths,
                    totalZLength,
                }
                entries.push(item);

            }
            catch (e) {
                console.log("failed to pack entry", f);
                console.log(e);
                return;
            }
        }

    }

    static async  getFiles(dir: string) {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent: Dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    static chunks(buffer: Buffer, chunkSize: number) {
        var result = [];
        var len = buffer.length;
        var i = 0;

        while (i < len) {
            result.push(buffer.slice(i, i += chunkSize));
        }

        return result;
    }
}

const packedParser = (len: number): Parser<SNGTypes.PackedSNG> => new Parser()
    .endianess("little")
    .int32("magic")
    .int32("platformHeader")
    .buffer("iv", {
        length: 16
    })
    .buffer("encryptedData", {
        length: len - (4 + 4 + 16 + 56)
    })
    .buffer("signature", {
        length: 56,
    });

export class SNG {
    public sngFile: string;
    public rawData: Buffer | null = null;      /* sng file data, can be encrypted or decrypted */
    public packedData: Buffer | null = null;   /* encrypted sng  */
    public unpackedData: Buffer | null = null; /* decrypted sng */
    public sng: Partial<SNGTypes.SNGFORMAT> | null = null;
    public packedSNG: SNGTypes.PackedSNG | null = null;
    private platform: Platform;

    constructor(file: string, platform: Platform | undefined = undefined) {
        this.sngFile = file;
        if (platform)
            this.platform = platform;
        else
            this.platform = os.platform() == "darwin" ? Platform.Mac : Platform.Windows;
    }

    public async parse(): Promise<void> {
        const d = await promises.readFile(this.sngFile);
        this.rawData = d;
        if (this.rawData) {
            await this.unpack();
            if (this.unpackedData)
                this.sng = SNGParser.SNGDATA.parse(this.unpackedData);
            else
                throw (new Error("failed to unpack sng"));
        }
    }

    public async pack() {
        if (this.unpackedData) {
            const compressed = await PSARCParser.zip(this.unpackedData);
            await PSARCParser.unzip(compressed);
            const q: Parser<SNGTypes.UnpackedSNG> = new Parser()
                .int32("uncompressedLength")
                .buffer("compressedData", {
                    length: compressed.length,
                });
            const p: SNGTypes.UnpackedSNG = {
                uncompressedLength: this.unpackedData.length,
                compressedData: compressed,
            }

            const payload = await PSARCParser.ENTRYEncrypt((q as any).encode(p), this.platform);

            const encrypted: SNGTypes.PackedSNG = {
                magic: 0x4A,
                platformHeader: 3,
                iv: payload.iv,
                encryptedData: payload.buf,
                signature: Buffer.alloc(56, 0),
            };
            const encParser = packedParser(payload.buf.length + (4 + 4 + 16 + 56));
            const encryptedBuffer: Buffer = (encParser as any).encode(encrypted);

            this.packedData = encryptedBuffer;
        }
        else {
            throw new Error("sng decrypted data is null, call parse() first");
        }
    }

    async unpack() {
        if (this.rawData) {
            const p = packedParser(this.rawData.length);
            try {
                const pData = p.parse(this.rawData);
                if (pData.magic == 0x4A) {
                    this.unpackedData = await PSARCParser.ENTRYDecrypt(this.rawData, this.platform == Platform.Mac ? PSARCParser.MAC_KEY : PSARCParser.WIN_KEY);
                }
                else {
                    this.unpackedData = this.rawData;
                }
            }
            catch (e) {
                console.log(e);
                this.unpackedData = this.rawData;
            }
        }
        else {
            throw new Error("sng raw data is null, call parse() first");
        }
    }
}

export class DDS {
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

export class WEM {
    static async convert(file: string, tag: string = "") {
        let wemFile = await WEMParser.convert(file, tag);
        return wemFile;
    }

    static async validate(wemFile: string) {
        const data = await promises.readFile(wemFile);
        return WEMParser.WEMDATA.parse(data);
    }
}

export class BNK {
    static async validate(bnkFile: string) {
        const data = await promises.readFile(bnkFile);
        return BNKParser.BNKDATA.parse(data);
    }

    static async generate(wemFile: string, tag: string, copyWem: boolean, dir: string, preview: boolean = false) {
        return await BNKParser.generate(dir, wemFile, tag, copyWem, preview);
    }
}

export class WAAPI {
    static async convert(file: string, tag: string, platform: Platform): Promise<string> {
        return await WAAPIHandler.Convert(file, tag, platform);
    }
}

export class GENERIC {
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

    static async generateXBlock(arrs: Partial<MetaArrangement>[], tag: string, dir: string) {
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
        const getValue = (item: string, index: number, tag: string, arr: Partial<MetaArrangement>) => {
            switch (item) {
                case "Header":
                    return `${ptypePrefix[index]}songs_dlc_${tag}`;
                case "SngAsset":
                case "Manifest":
                    return `${ptypePrefix[index]}${tag}_${arr.header?.arrangementName.toLowerCase()}`;
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
        const property = (arr: Partial<MetaArrangement>) => ptypes.map((item, index) => {
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
                    id: item.header?.persistentID.toLowerCase(),
                    modelName: "RSEnumerable_Song",
                    name: `${tag}_${toTitleCase(item.header?.arrangementName.toLowerCase() ?? '')}`,
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

        const builder = new xml2js.Builder({
            xmldec: {
                version: "1.0",
            }
        });
        const xml = builder.buildObject(xblock);
        await promises.writeFile(f, xml);
        return f;
    }
}

export class MANIFEST {
    static async generateJSON(dir: string, tag: string, arr: Arrangement | VocalArrangement) {
        const header = JSON.parse(JSON.stringify(arr.header));
        if (arr instanceof Arrangement) {
            delete (header.metronome);
            delete (header.representative);
            delete (header.routeMask);
            delete (header.bassPick);
        }
        const obj: Manifest = {
            entries: {
                [arr.header.persistentID]: {
                    attributes: {
                        ...arr.main,
                        ...header,
                    }
                }
            },
            modelName: "RSEnumerable_Song",
            iterationVersion: 2,
            insertRoot: "Static.Songs.Entries",
        };
        const allKeys = arr instanceof Arrangement ? Object.keys(arr.main).concat(Object.keys(header)) : Object.keys(arr);
        const json = JSON.stringify(obj, (k, v) => ManifestReplacer(allKeys, k, v), "  ");
        const path = join(dir, `${tag}_${arr instanceof Arrangement ? arr.arrType : "vocals"}.json`);
        await promises.writeFile(path, json);
        return path;
    }

    static async generateHSAN(dir: string, tag: string, arrs: (Arrangement | VocalArrangement)[]) {
        const filename = `songs_dlc_${tag}.hsan`;
        const obj: HSANManifest = {
            entries: {

            },
            insertRoot: "Static.Songs.Headers",
        };
        arrs.forEach(arr => {
            const header = JSON.parse(JSON.stringify(arr.header));
            if (arr instanceof Arrangement) {
                delete (header.metronome);
                if (arr.header.arrangementName.toLowerCase() !== ArrangementType.BASS)
                    delete (header.bassPick);
            }
            if (!Object.keys(obj.entries).includes(header.persistentID))
                obj.entries[header.persistentID] = {};

            obj.entries[header.persistentID]["attributes"] = header;
        });
        const json = JSON.stringify(obj, (k, v) => ManifestReplacer([], k, v), "  ");
        const path = join(dir, filename);
        await promises.writeFile(path, json);
        return path;
    }
}

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


export const toTitleCase = function (str: string) {
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
    MANIFEST,
}
