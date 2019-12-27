"use strict";
var ogg = require("ogg");
var fs = require('fs');
var util = require('util');
var Parser = require('binary-parser').Parser;
var WEMParser = require("../dist/wemparser");
var outputFile = process.argv[2];
var refWem = process.argv[3];
function addPackets() {
    var inputFile = "test/wem/output.ogg";
    var od = new ogg.Decoder();
    od.on('stream', function (stream) {
        console.log('new "stream":', stream.serialno);
        // emitted for each `ogg_packet` instance in the stream.
        stream.on('data', function (packet) {
            console.log('got "packet":', "bytes", packet.bytes, "no", packet.packetno, "b_o_s", packet.b_o_s, "e_o_s", packet.e_o_s, "granulepos", packet.granulepos);
            if (packet.packetno >= 3) {
                var h = new Parser()
                    .endianess("little")
                    .bit8("packet_type")
                    .buffer("rest", {
                    readUntil: "eof",
                });
                console.log(h.parse(packet.packet));
            }
        });
        stream.on('page', function (page) {
            //console.log('got "page": ', page.serialno, page.packets);
            var p = new Parser()
                .endianess("little")
                .buffer("data", {
                readUntil: "eof"
            });
            //console.log(p.parse(page.page));
        });
        // emitted after the last packet of the stream
        stream.on('end', function () {
            console.log('got "end":', stream.serialno);
        });
        // stream.pipe(vd);
    });
    fs.createReadStream(inputFile).pipe(od);
}
var outputBuffer = null;
function addHeader(refHeader) {
    var header = {
        magic: "RIFF",
        fileSize: refHeader.fileSize,
        riffType: "WAVE"
    };
    return WEMParser.HEADER.encode(header);
}
function addFormat(refFormat) {
    var setupPacket = fs.readFileSync("data/setup_packet.bin");
    var format = {
        fmtMagic: 'fmt ',
        fmtSize: 66,
        formatTag: -1,
        channels: refFormat.channels,
        sampleRate: refFormat.sampleRate,
        avgBPS: refFormat.avgBPS,
        sampleFrameSize: refFormat.sampleFrameSize,
        bitsPerSample: refFormat.bitsPerSample,
        fmtSizeMinus0x12: 48,
        unk1: 0,
        subtype: 3,
        sampleCount: refFormat.sampleCount,
        modSignal: 217,
        unk2: refFormat.unk2,
        setup_packet_offset: refFormat.setup_packet_offset,
        first_audio_packet_offset: refFormat.first_audio_packet_offset,
        unk3: refFormat.unk3,
        uid: 1085276160,
        bs_0: 0,
        bs_1: 0,
        bs_2: 0,
        bs_3: 0,
        unk4: refFormat.unk4,
        dataMagic: 'data',
        dataSize: refFormat.dataSize,
        unk5: refFormat.unk5,
        setup_packet_size: setupPacket.length,
        setup_package_data: setupPacket,
        packets: refFormat.packets /*TODO */
    };
    return WEMParser.FORMAT.encode(format);
}
function generateWem() {
    var refData = fs.readFileSync(refWem);
    var refObj = WEMParser.WEMDATA.parse(refData);
    var header = addHeader(refObj.header);
    var parsed = WEMParser.HEADER.parse(header);
    console.log(parsed);
    var format = addFormat(refObj.format);
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
