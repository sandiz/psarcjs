import { Parser } from 'binary-parser';
import * as aesjs from 'aes-js';
import * as zlib from 'zlib';
import { PSARCHEADER, BOM } from './types/types';

const BLOCK_SIZE = 2 ** 16;
const ARC_KEY = "C53DB23870A1A2F71CAE64061FDD0E1157309DC85204D4C5BFDF25090DF2572C"
const ARC_IV = "E915AA018FEF71FC508132E4BB4CEB42"
const MAC_KEY = "9821330E34B91F70D0A48CBD625993126970CEA09192C0E6CDA676CC9838289D"
const WIN_KEY = "CB648DF3D12A16BF71701414E69619EC171CCA5D2A142E3E59DE7ADDA18A3A30"

export const unzip = (data: Buffer) => new Promise<Buffer>((resolve, reject) => {
    zlib.unzip(data, {
    }, (err, buffer) => {
        if (!err) {
            resolve(buffer)
        } else {
            reject(err)
        }
    });
});

export const mod = (x: number, n: number) => (x % n + n) % n

export function pad(buffer: Buffer, blocksize = 16) {
    const size = mod((blocksize - buffer.length), blocksize)
    const b = Buffer.alloc(size)
    return Buffer.concat([buffer, b])
}

export function BOMDecrypt(buffer: Buffer) {
    const key = aesjs.utils.hex.toBytes(ARC_KEY)
    const iv = aesjs.utils.hex.toBytes(ARC_IV)
    const aescfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
    return aescfb.decrypt(buffer)
}

export async function ENTRYDecrypt(data: Buffer, key: string) {
    const iv = new Uint8Array(data.slice(8, 24));
    const ctr = Buffer.from(iv).readUInt32BE(0);
    const uintAkey = aesjs.utils.hex.toBytes(key)
    const quanta = data.slice(24, data.length - 56)

    const aesCtr = new aesjs.ModeOfOperation.ctr(uintAkey, new aesjs.Counter(ctr));
    const decrypted = aesCtr.decrypt(pad(quanta));
    //const length = new Uint32Array(decrypted.slice(0, 4))
    let payload = decrypted.slice(4, data.length)
    let buf: Buffer = await unzip(Buffer.from(payload))
    return buf;
}

export async function Decrypt(listing: string, contents: Buffer): Promise<Buffer> {
    let data = contents;
    if (listing.includes("songs/bin/macos")) {
        data = await ENTRYDecrypt(contents, MAC_KEY)
    }
    else if (listing.includes("songs/bin/generic")) {
        data = await ENTRYDecrypt(contents, WIN_KEY)
    }
    return data
}

export async function readEntry(data: Buffer, idx: number, bomentries: BOM) {
    const singlebom = bomentries.entries[idx];
    let entryoffset = singlebom.offset.readUInt32BE(1)
    const entrylength = singlebom.length.readUInt32BE(1)
    const zlength = bomentries.zlength.slice(singlebom.zindex, bomentries.zlength.length)
    let retBuffer = Buffer.alloc(0)
    let length = 0
    for (let i = 0; i < zlength.length; i += 1) {
        const z = zlength[i]
        if (length === entrylength) { break; }

        let buf = Buffer.alloc(z === 0 ? BLOCK_SIZE : z)
        //let { bytesRead, buffer } = await readFD(fd, buf, 0, z === 0 ? BLOCK_SIZE : z, entryoffset)
        let buffer = data.slice(entryoffset, entryoffset + (z === 0 ? BLOCK_SIZE : z));
        entryoffset += (z === 0 ? BLOCK_SIZE : z)
        try {
            buffer = await unzip(buffer)
        }
        catch (E) {
        }
        retBuffer = Buffer.concat([retBuffer, buffer])
        length += buffer.length
    }
    return retBuffer
}

export const HEADER: Parser<PSARCHEADER> = new Parser()
    .string("MAGIC", {
        encoding: "ascii",
        zeroTerminated: false,
        //validate: "PSAR",
        length: 4
    })
    .uint32("VERSION")
    .string("COMPRESSION", {
        encoding: "ascii",
        zeroTerminated: false,
        //validate: "zlib",
        length: 4
    })
    .uint32("header_size")
    .uint32("ENTRY_SIZE")
    .uint32("n_entries")
    .uint32("BLOCK_SIZE")
    .uint32("ARCHIVE_FLAGS")
    .buffer("bom", {
        length: function () {
            return (this as any).header_size - 32;
        }
    })

export const ENTRY = new Parser()
    .string("md5", {
        encoding: "ascii",
        zeroTerminated: false,
        length: 16
    })
    .uint32("zindex")
    .buffer("length", {
        // type: "uint32be",
        length: 5
    })
    .buffer("offset", {
        //type: "uint32be",
        length: 5
    })

export function BOM(entries: number) {
    return new Parser()
        .array("entries", {
            type: ENTRY,
            length: entries
        })
        .array("zlength", {
            type: "uint16be",
            //lengthInBytes: 16
            readUntil: "eof"
        })
}