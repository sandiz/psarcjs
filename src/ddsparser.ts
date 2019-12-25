import { promises } from 'fs';
import { Parser } from 'binary-parser';
import * as imagemagick from 'imagemagick-native'
const path = require('path');
/*
//import * as dxt from 'dxt-js';
const isPo2 = require('is-power-of-two')
const nextPo2 = require('next-power-of-two')
const sharp = require('sharp');
*/

export const HEADER = new Parser()
    .endianess("little")
    .string("MAGIC", {
        encoding: "ascii",
        zeroTerminated: false,
        //validate: "DDS ",
        length: 4
    })
    .uint32("header_length")
    .uint32("flags")
    .uint32("height")
    .uint32("width")
    .uint32("pitch")
    .uint32("depth")
    .uint32("mipmapCount")
    .array("reserved", {
        type: "int32le",
        length: 11,
    })
    .uint32("pf_size")
    .uint32("pf_flags")
    .string("pf_fourcc", {
        length: 4,
    })
    .uint32("pf_rgbbitcount")
    .uint32("pf_rbitmmask")
    .uint32("pf_gbitmmask")
    .uint32("pf_bbitmmask")
    .uint32("pf_abitmmask")
    .uint32("caps")
    .uint32("caps2")
    .uint32("caps3")
    .uint32("caps4")
    .uint32("reserved2")

export async function convert(image: string, tag: string): Promise<string[]> {
    const res = [64, 128, 256];
    const outfiles = []
    for (let i = 0; i < res.length; i += 1) {
        const r = res[i];
        const out = path.dirname(image) + `/album_${tag}_${r}.dds`;
        await promises.writeFile(out, imagemagick.convert({
            srcData: await promises.readFile(image),
            format: 'DDS',
            width: r,
            height: r,
        }));
        outfiles.push(out);
    }

    return outfiles;;
}

/*
export async function convert_old(image: string, tag: string): Promise<string[]> {
    let i = await sharp(image)
    const info = await i.metadata()
    let w = info.width
    let h = info.height
    if (!isPo2(w)) { w = nextPo2(w) }
    if (!isPo2(h)) { h = nextPo2(h) }
    // the dds algo need 256 as minimum size
    w = 256//Math.max(256, w)
    h = 256//Math.max(256, w)
    const data = await sharp(image).resize(w, h, { fit: "contain" }).raw().toBuffer()

    let header = ""
    header += "DDS "//magic number
    header += int32ToFourCC(124)//size header, have to be 124
    header += int32ToFourCC(0x1 | 0x2 | 0x4 | 0x1000)
    header += int32ToFourCC(h)//height
    header += int32ToFourCC(w)//width
    header += int32ToFourCC(calculatePitch(w * h, 24))//pitch
    header += int32ToFourCC(0)// depth
    header += int32ToFourCC(0)//mipmapCount
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused
    header += int32ToFourCC(0)// unused

    let pfFlags = 0x4
    header += int32ToFourCC(32)//size
    header += int32ToFourCC(pfFlags)//off_pfFlags
    header += 'DXT1'
    header += int32ToFourCC(0)//off_RGBBitCount
    header += int32ToFourCC(0)//off_RBitMask
    header += int32ToFourCC(0)//off_GBitMask
    header += int32ToFourCC(0)//off_BBitMask
    header += int32ToFourCC(0)//off_ABitMask

    header += int32ToFourCC(0x1000)//off_caps : for special texture
    header += int32ToFourCC(0)//off_caps2 : for cubemap
    header += int32ToFourCC(0)//off_caps3
    header += int32ToFourCC(0)//off_caps4
    header += int32ToFourCC(0)//reserved

    let headerBuffer = Buffer.from(header)
    let flag = 0
    flag = dxt.flags.DXT1;
    // flag |= dxt.flags.ColourIterativeClusterFit;
//flag |= dxt.flags.ColourMetricUniform
//flag |= dxt.flags.WeightColourByAlpha

let compressed = dxt.compress(data, w, h, flag)
let decompressed = dxt.decompress(compressed, w, h, flag);
const bmp = path.dirname(image) + `/album_${tag}.jpg`
await sharp(Buffer.from(decompressed), {
    raw: {
        width: w,
        height: h,
        channels: info.channels,
    }
}).toFile(bmp);
let finalBuffer = Buffer.concat([headerBuffer, compressed])

const files = [];
const file = path.dirname(image) + `/album_${tag}.dds`
await promises.writeFile(file, finalBuffer);
files.push(file)
return files;
}


function calculatePitch(width: number, bitsPerPixel: number): number {
    //return (width * bitsPerPixel + 7) / 8
    return Math.max(1, ((width + 3) / 4)) * 8;
}

function int32ToFourCC(value: number): string {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    )
}
*/