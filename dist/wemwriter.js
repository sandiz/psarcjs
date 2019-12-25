"use strict";
var ogg = require("ogg");
var fs = require('fs');
var util = require('util');
var Parser = require('binary-parser').Parser;
var WEMParser = require("../dist/wemparser");
var outputFile = "test/wem/1563725178.wem.cut";
var refWem = "/Users/sandi/Downloads/Amit-Trivedi_Main-Kaun-Hoon-Cover_v1_DD_m/audio/mac/1563725178.wem";
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
        magic: refHeader.magic,
        fileSize: refHeader.fileSize,
        riffType: refHeader.riffType,
    };
    return WEMParser.HEADER.encode(header);
}
function addFormat(refFormat) {
    var format = {
        fmtMagic: refFormat.fmtMagic,
        fmtSize: refFormat.fmtSize,
        formatTag: refFormat.formatTag,
        channels: refFormat.channels,
        sampleRate: refFormat.sampleRate,
        avgBPS: refFormat.avgBPS,
        sampleFrameSize: refFormat.sampleFrameSize,
        bitsPerSample: refFormat.bitsPerSample,
        fmtSizeMinus0x12: refFormat.fmtSizeMinus0x12,
        unk1: refFormat.unk1,
        subtype: refFormat.subtype,
        sampleCount: refFormat.sampleCount,
        modSignal: refFormat.modSignal,
        unk2: refFormat.unk2,
        setup_packet_offset: refFormat.setup_packet_offset,
        first_audio_packet_offset: refFormat.first_audio_packet_offset,
        unk3: refFormat.unk3,
        uid: refFormat.uid,
        unk4: refFormat.unk4,
        dataMagic: refFormat.dataMagic,
        dataSize: refFormat.dataSize,
        unk5: refFormat.unk5,
        setup_packet_size: refFormat.setup_packet_size,
        setup_package_data: refFormat.setup_package_data,
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
