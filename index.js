const fs = require('fs')
const Parser = require('./parser');
const util = require('util');

const fsAsync = {
    readFile: util.promisify(fs.readFile),
    writeFile: util.promisify(fs.writeFile)
}

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
    constructor(file) {
        this.psarcFile = file;
        this.psarcRawData = null;
        this.BOMEntries = null;
        this.listing = [];
    }
    /**
     * decrypt a psarc file and parse it, this function must be called first 
     * before calling any other member functions
     */
    async parse() {
        this.psarcRawData = await fsAsync.readFile(this.psarcFile);
        //console.log("parsing psarc:", this.psarcFile, "size:", (this.psarcRawData.length / (1024 * 1024)).toFixed(2), "mb");

        const header = Parser.HEADER.parse(this.psarcRawData);
        const paddedbom = Parser.pad(header.bom);
        const decryptedbom = Buffer.from(Parser.BOMDecrypt(paddedbom));
        const slicedbom = decryptedbom.slice(0, header.bom.length);

        this.BOMEntries = Parser.BOM(header.n_entries).parse(slicedbom);
        // console.log(util.inspect(this.BOMEntries, { depth: null }));

        const rawlisting = await Parser.readEntry(this.psarcRawData, 0, this.BOMEntries);
        this.listing = unescape(rawlisting).split("\n");
    }

    /**
     * get all files in psarc
     *
     * @returns {Array} list of all files in the psarc
     */
    getFiles() {
        return this.listing;
    }

    /**
     * get all arrangements from file
     *
     * @returns {Object} json object representing an arrangement keyed with persistentID
     */
    async getArrangements() {
        const arrangements = [];
        for (let i = 0; i < this.listing.length; i += 1) {
            const listing = this.listing[i];
            if (listing.endsWith("json")) {
                const data = await this.readFile(i);
                const body = data.toString("utf-8");
                if (body === "") {
                    arrangements.push(null);
                    continue;
                }
                const json = JSON.parse(body);
                const Entries = json.Entries;
                const keys = Object.keys(Entries);
                for (let j = 0; j < keys.length; j += 1) {
                    const key = keys[j];
                    const attr = json.Entries[key].Attributes;
                    const obj = {}; obj[key] = attr;
                    arrangements.push(obj);
                }
            }
        }
        return arrangements;
    }

    /**
     * extract file from psarc
     *
     * @param {integer} idx index of the file in file list (see getFiles())
     * @param {String} outfile path to output file
     * @param {Boolean}  tostring convert data to string before outputting
     * @returns {Boolean} true | false based on success / failure 
     */
    async extractFile(idx, outfile, tostring = false) {
        if (idx === -1) return false;
        const data = await this.readFile(idx);
        if (data) {
            if (tostring)
                await fsAsync.writeFile(outfile, data.toString('utf-8'));
            else
                await fsAsync.writeFile(outfile, data);
            return true;
        }
        return false;
    }

    /**
     * read file from psarc
     *
     * @param {integer} idx index of the file in file list (see getFiles())
     * @returns {Buffer} file data
     */
    async readFile(idx) {
        if (idx === -1) return null;
        const data = await Parser.readEntry(this.psarcRawData, idx + 1, this.BOMEntries)
        if (data) {
            const decrypted = await Parser.Decrypt(this.listing[idx], data);
            return decrypted;
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

module.exports = PSARC;

/*
async function handleCmd() {
    const psarc = new PSARC(process.argv[2]);
    await psarc.parse();
    const files = psarc.getFiles();
    console.log("files:", files);
    const arrangements = await psarc.getArrangements();
    //console.log("arrangements:", util.inspect(arrangements, false, null, true));
    console.log("arrangements:", arrangements.length);

    const outfile = '/tmp/test.xml';
    const idx = files.indexOf('songs/arr/witchcraftsong_lead.xml');
    if (idx !== -1) {
        await psarc.extractFile(idx, outfile, true);
        console.log(idx.toString(), "extracted to", outfile);
    }
}
*/

