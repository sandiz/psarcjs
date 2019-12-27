import { promises } from 'fs';
import * as util from 'util';
import { BOM, Arrangements } from "./types/types";
import * as Parser from './parser';
import * as SNGParser from './sngparser';
import * as DDSParser from './ddsparser';
import * as WEMParser from './wemparser';
import * as WAAPIHandler from './wemwaapi';
import { SNGFORMAT } from './types/sng'

export enum Platform { Windows, Mac }
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

class WAAPI {
    static async convert(file: string, tag: string, platform: Platform): Promise<string> {
        return await WAAPIHandler.Convert(file, tag, platform);
    }
}

module.exports = {
    PSARC,
    SNG,
    DDS,
    WEM,
    WAAPI,
}
