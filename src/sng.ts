import { Parser } from 'binary-parser';
import { promises } from 'fs';
import * as os from 'os';

import * as SNGTypes from './types/sng';
import * as PSARCParser from './parser';
import * as SNGParser from './sngparser';
import {
    Platform,
} from "./types/common";

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
        console.log("sngFile", this.sngFile);
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
                .endianess("little")
                .uint32("uncompressedLength")
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
                    console.log("packed sng", this.sngFile);
                    this.unpackedData = await PSARCParser.ENTRYDecrypt(this.rawData, this.platform == Platform.Mac ? PSARCParser.MAC_KEY : PSARCParser.WIN_KEY);
                }
                else {
                    console.trace("unpacked sng", this.sngFile);
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