const ogg = require("ogg");
const fs = require('fs');
const util = require('util');
const Parser = require('binary-parser').Parser;
const WEMParser = require("../dist/wemparser");

const outputFile = "test/wem/1563725178.wem.cut";
const refWem = "/Users/sandi/Downloads/Amit-Trivedi_Main-Kaun-Hoon-Cover_v1_DD_m/audio/mac/1563725178.wem"

function addPackets() {
    const inputFile = "test/wem/output.ogg";
    var od = new ogg.Decoder();
    od.on('stream', function (stream) {
        console.log('new "stream":', stream.serialno);

        // emitted for each `ogg_packet` instance in the stream.
        stream.on('data', function (packet) {
            console.log('got "packet":', "bytes",
                packet.bytes, "no", packet.packetno,
                "b_o_s", packet.b_o_s,
                "e_o_s", packet.e_o_s,
                "granulepos", packet.granulepos
            );
            if (packet.packetno >= 3) {
                const h = new Parser()
                    .endianess("little")
                    .bit8("packet_type")
                    .buffer("rest", {
                        readUntil: "eof",
                    })
                console.log(h.parse(packet.packet))
            }
        });
        stream.on('page', function (page) {
            //console.log('got "page": ', page.serialno, page.packets);
            const p = new Parser()
                .endianess("little")
                .buffer("data", {
                    readUntil: "eof"
                })
            //console.log(p.parse(page.page));
        })
        // emitted after the last packet of the stream
        stream.on('end', function () {
            console.log('got "end":', stream.serialno);
        });

        // stream.pipe(vd);
    });
    fs.createReadStream(inputFile).pipe(od);
}

let outputBuffer = null;

function addHeader(refHeader) {
    var header = {
        magic: "RIFF",
        fileSize: refHeader.fileSize,
        riffType: "WAVE"
    }
    return WEMParser.HEADER.encode(header);
}

function addFormat(refFormat) {
    var format = {
        fmtMagic: 'fmt ',
        fmtSize: 66,//66,
        formatTag: -1,// -1,
        channels: refFormat.channels, //2, /*TODO*/
        sampleRate: refFormat.sampleRate, // 44100, /*TODO*/
        avgBPS: refFormat.avgBPS, /*TODO*/
        sampleFrameSize: refFormat.sampleFrameSize, //0, /*TODO*/
        bitsPerSample: refFormat.bitsPerSample, /*TODO*/
        fmtSizeMinus0x12: 48,
        unk1: 0,
        subtype: 3,
        sampleCount: refFormat.sampleCount, /*TODO */
        modSignal: refFormat.modSignal,
        unk2: refFormat.unk2,//[0, 0], /*TODO*/
        setup_packet_offset: refFormat.setup_packet_offset, //1, /*TODO*/
        first_audio_packet_offset: refFormat.first_audio_packet_offset, /*TODO*/
        unk3: refFormat.unk3, ///[0, 0, 16080],/*TODO*/
        uid: refFormat.uid,
        unk4: refFormat.unk4,//[-1461190656, 185128267],
        dataMagic: 'data',
        dataSize: refFormat.dataSize, /*TODO */
        unk5: refFormat.unk5,//Buffer.from([0x00]), /*TODO */
        setup_packet_size: refFormat.setup_packet_size,  /*TODO */
        setup_package_data: refFormat.setup_package_data,   /*TODO */
        packets: refFormat.packets /*TODO */
    }
    return WEMParser.FORMAT.encode(format)
}

function generateWem() {
    const refData = fs.readFileSync(refWem);
    const refObj = WEMParser.WEMDATA.parse(refData);

    const header = addHeader(refObj.header)
    let parsed = WEMParser.HEADER.parse(header);
    console.log(parsed);
    const format = addFormat(refObj.format);
    parsed = WEMParser.FORMAT.parse(format);

    console.log(util.inspect(parsed, {
        depth: 6,
        colors: true,
        maxArrayLength: 10,
        compact: true,
    }));
    fs.writeFileSync(outputFile, Buffer.concat([header, format]));
}

generateWem();
