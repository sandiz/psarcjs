import { Parser } from 'binary-parser';

export const HEADER = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
        assert: 'RIFF',
    })
    .int32("fileSize") /* +8 */
    .string("riffType", {
        length: 4,
        assert: 'WAVE',
    })

export const DATA = new Parser()
    .endianess("little")


export const PACKET = new Parser()
    .endianess("little")
    .int16("packet_size")
    .nest("first", {
        type: new Parser().endianess("little")
            .bit1("mode_number").bit7("remainder")
    })
    .buffer("rest", {
        length: function () {
            return (this as any).packet_size - 1;
        }
    })

export const SETUPPACKET = new Parser()
    .endianess("little")
    .bit8("codebook_count")
    .buffer("codebook_ids", {
        length: function () {
            return ((this as any).codebook_count * 10) / 8
        },
    })
//.bit10("codebook_id")

export const FORMAT = new Parser()
    .endianess("little")
    .namely("format")
    .string("fmtMagic", {
        length: 4,
        assert: 'fmt ',
    })
    .int32("fmtSize")          /* 66, 0x42 */
    .int16("formatTag")
    .int16("channels")
    .int32("sampleRate")
    .int32("avgBPS") // * 8
    .int16("sampleFrameSize")
    .int16("bitsPerSample")
    .int16("fmtSizeMinus0x12") /* 48 = 66 - 18(0x12) */
    .int16("unk1")
    .int32("subtype")
    .int32("sampleCount")
    .int32("modSignal", {
        formatter: v => (v as number).toString(16),
    })
    .array("unk2", {
        type: "int32le",
        length: 2,
    })
    .int32("setup_packet_offset")
    .int32("first_audio_packet_offset")
    .array("unk3", {
        type: "int16le",
        length: 3,
    })
    .int32("uid")
    .buffer("unk4", {
        length: function () {
            return 8;
        }
    })
    .string("dataMagic", {
        length: 4,
        assert: 'data',
    })
    .int32("dataSize")
    .buffer("unk5", {
        length: function () {
            return (this as any).setup_packet_offset;
        }
    })
    .uint16("setup_packet_size")
    .buffer("setup_package_data", {
        length: function () {
            return ((this as any).setup_packet_size)
        },
    })
    .array("packets", {
        type: PACKET,
        lengthInBytes: function () {
            return (this as any).dataSize -
                (this as any).first_audio_packet_offset;
        }
    })



export const WEMDATA: Parser<any> = new Parser()
    .endianess("little")
    .nest("header", {
        type: HEADER,
    })
    .nest("format", {
        type: FORMAT,
    });




export async function convert(wavFile: string, tag: string): Promise<string> {
    return "";
}