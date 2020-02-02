import { promises, exists, Dirent } from 'fs';
import { mkdirp, move } from 'fs-extra';
import { join, basename } from 'path';
import * as crypto from 'crypto';

import * as PSARCParser from './parser'
import {
    PSARCBOM, PSARCENTRY, Arrangements, ArrangementType,
    ArrangementInfo, Toolkit, Platform, Arrangement,
    ManifestTone, ManifestToneReviver, VocalArrangement, Vocals,
    ArrangementDetails, PSARCOptions, PSARCHEADER,
} from './types/common';

import { DDS } from './dds';
import { WEM } from './wem';
import { BNK } from './bnk';
import { Song2014 } from './song2014';
import { SNG } from './sng';
import { MANIFEST } from './manifest';
import { GENERIC } from './generic';

const { readdir } = require('fs').promises;
const { resolve } = require('path');


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
    private BOMEntries: PSARCBOM | null;
    private listing: string[];

    constructor(file: string | Buffer) {
        this.psarcFile = "";
        this.psarcRawData = null;
        if (file instanceof Buffer)
            this.psarcRawData = file;
        else
            this.psarcFile = file;
        this.BOMEntries = null;
        this.listing = [];
    }
    /**
     * decrypt a psarc file and parse it, this function must be called first 
     * before calling any other member functions
     */
    public async parse(): Promise<void> {
        if (this.psarcRawData == null)
            this.psarcRawData = await promises.readFile(this.psarcFile);
        //console.log("parsing psarc:", this.psarcFile, "size:", (this.psarcRawData.length / (1024 * 1024)).toFixed(2), "mb");

        if (this.psarcRawData) {
            const header = PSARCParser.HEADER.parse(this.psarcRawData);
            const paddedbom = PSARCParser.pad(header.bom);
            const decryptedbom = Buffer.from(PSARCParser.BOMDecrypt(paddedbom));
            const slicedbom = decryptedbom.slice(0, header.bom.length);

            this.BOMEntries = PSARCParser.BOM(header.n_entries).parse(slicedbom);
            // console.log(util.inspect(this.BOMEntries, { depth: null }));
            if (this.BOMEntries) {
                const rawlisting = await PSARCParser.readEntry(this.psarcRawData, 0, this.BOMEntries);
                this.listing = unescape(rawlisting.toString()).split("\n");
                this.BOMEntries.entries.forEach((v: PSARCENTRY, i: number) => {
                    if (i === 0) (v as any).name = "listing";
                    else (v as any).name = this.listing[i - 1];
                })
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
            return dds1.parse();
        }))
        /* validate wem */
        await WEM.parse(files.wem.main.wem);
        await WEM.parse(files.wem.preview.wem);

        /* validate bnk */
        await BNK.parse(files.wem.main.bnk);
        await BNK.parse(files.wem.preview.bnk);

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

    static async packDirectory(dir: string, psarcFilename: string) {
        const listingFileName = "NamesBlock.bin";
        let files: string[] = await this.getFiles(dir);
        const entries: {
            name: string,
            zippedBlocks: Buffer[],
            origLengths: number[],
            zLengths: number[],
            modZLengths: number[],
            totalLength: number,
            zIndex: number,
            offset: number,
        }[] = [];
        let zLengths: number[] = [];
        files = [listingFileName, ...files];
        let prevOffset = 0;
        for (let i = 0; i < files.length; i += 1) {
            const f = files[i];
            const isSNG = f.endsWith(".sng");
            try {
                const name = f.replace(dir + "/", "");
                let rawData = name === listingFileName
                    ? Buffer.from(
                        files
                            .slice(1, files.length)
                            .map(i => i.replace(dir + "/", ""))
                            .join("\n")
                    )
                    : await promises.readFile(f);
                if (isSNG) {
                    let magic = Buffer.from(rawData.slice(0, 4)).readInt32LE(0)
                    let ph = Buffer.from(rawData.slice(4, 8)).readInt32LE(0)
                    if (magic == 0x4A && ph == 3) {
                        //console.log("packed sng")
                    }
                    else {
                        //console.log("unpacked sng");
                        var s = new SNG(f);
                        await s.parse();
                        await s.pack();
                        if (s.packedData) {
                            rawData = s.packedData;
                        }
                    }
                }
                const blocks = this.chunks(rawData, PSARCParser.BLOCK_SIZE);
                const origLengths = blocks.map(i => i.length);
                const zippedBlocks: Buffer[] = await Promise.all(blocks.map(async (b, idx) => {
                    const packed = await PSARCParser.zip(b);
                    const packedLen = packed.length;
                    const plainLen = blocks[idx].length;
                    let blockToReturn: Buffer | null = null;

                    if (packedLen < plainLen)
                        blockToReturn = packed;
                    else
                        blockToReturn = blocks[idx];
                    //console.log(name, "block", idx, isPacked);
                    return blockToReturn;
                }));
                const localLengths: number[] = blocks.map(i => i.length);
                const totalLength = localLengths.reduce((p, v) => p + v);
                const localZLengths: number[] = zippedBlocks.map(i => i.length);
                const totalZLength = localZLengths.reduce((p, v) => p + v);
                const modZLengths = localZLengths.map(i => i % PSARCParser.BLOCK_SIZE);
                const item = {
                    name,
                    origLengths,
                    zippedBlocks,
                    zLengths: localZLengths,
                    modZLengths,
                    totalLength,
                    zIndex: zLengths.length,
                    offset: prevOffset,
                }
                zLengths = zLengths.concat(modZLengths);
                prevOffset += totalZLength;
                entries.push(item);
            }
            catch (e) {
                console.log("failed to pack entry", f);
                console.log(e);
                return;
            }
        }

        const bNum = Math.log(PSARCParser.BLOCK_SIZE) / Math.log(256);
        const headerSize = ((32 + (entries.length * 30) + (zLengths.length * bNum)));
        /*console.log(headerSize)
        console.log(entries.map(i => {
            return {
                md5: crypto
                    .createHash('md5', { encoding: 'ascii' })
                    .update(i.name)
                    .digest("hex"),
                name: i.name,
                lens: i.modZLengths,
                length: i.origLengths.reduce((p, v) => p + v),
                zLength: i.zLengths.reduce((p, v) => p + v),
                zIndex: i.zIndex,
                offset: i.offset + headerSize,
            }
        }));
        */
        const bom: PSARCBOM = {
            entries: entries.map(item => {
                const lBuffer: Buffer = Buffer.alloc(5).fill(0);
                const oBuffer: Buffer = Buffer.alloc(5).fill(0);
                lBuffer.writeUInt32BE(item.totalLength, 1);
                oBuffer.writeUInt32BE(item.offset + headerSize, 1);
                //console.log(item.name, item.zIndex, item.totalLength, item.offset + headerSize);
                return {
                    md5: crypto
                        .createHash('md5', { encoding: 'ascii' })
                        .update(item.name)
                        .digest("hex"),
                    zindex: item.zIndex,
                    length: lBuffer,
                    offset: oBuffer,
                }
            }),
            zlength: zLengths,
        }
        const bomBuffer: Buffer = (PSARCParser.BOM(entries.length) as any).encode(bom)
        const bomEncrypted = Buffer.from(PSARCParser.BOMEncrypt(bomBuffer)).slice(0, bomBuffer.length);
        //console.log("bom", bomBuffer.length, "bomenc", bomEncrypted.length)
        const header: PSARCHEADER = {
            MAGIC: 'PSAR',
            VERSION: 65540,
            COMPRESSION: 'zlib',
            header_size: headerSize,
            ENTRY_SIZE: 30,
            n_entries: entries.length,
            BLOCK_SIZE: PSARCParser.BLOCK_SIZE,
            ARCHIVE_FLAGS: 4,
            bom: bomEncrypted,
        }

        let result: Buffer = Buffer.alloc(0);
        const ph: Buffer = (PSARCParser.HEADER as any).encode(header);
        result = Buffer.concat([ph]);
        for (let i = 0; i < entries.length; i += 1) {
            const entry = entries[i];
            for (let j = 0; j < entry.zippedBlocks.length; j += 1) {
                result = Buffer.concat([result, entry.zippedBlocks[j]]);
            }
        }
        await promises.writeFile(psarcFilename, result);
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

