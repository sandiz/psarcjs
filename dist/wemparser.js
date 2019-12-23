"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var binary_parser_1 = require("binary-parser");
exports.HEADER = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
    assert: 'RIFF',
})
    .int32("fileSize") /* +8 */
    .string("riffType", {
    length: 4,
    assert: 'WAVE',
});
exports.DATA = new binary_parser_1.Parser()
    .endianess("little");
exports.PACKET = new binary_parser_1.Parser()
    .endianess("little")
    .int16("packet_size")
    .nest("first", {
    type: new binary_parser_1.Parser().endianess("little")
        .bit1("mode_number").bit7("remainder")
})
    .buffer("rest", {
    length: function () {
        return this.packet_size - 1;
    }
});
/* .buffer("packet_data", {
    length: function () {
        return (this as any).packet_size;
    }
}) */
exports.SETUPPACKET = new binary_parser_1.Parser()
    .endianess("little")
    .bit8("codebook_count")
    .buffer("codebook_ids", {
    length: function () {
        return (this.codebook_count * 10) / 8;
    },
});
//.bit10("codebook_id")
exports.FORMAT = new binary_parser_1.Parser()
    .endianess("little")
    .namely("format")
    .string("fmtMagic", {
    length: 4,
    assert: 'fmt ',
})
    .int32("fmtSize") /* 66, 0x42 */
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
    formatter: function (v) { return v.toString(16); },
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
        return this.setup_packet_offset;
    }
})
    .uint16("setup_packet_size")
    .buffer("setup_package_data", {
    length: function () {
        return (this.setup_packet_size);
    },
})
    .array("packets", {
    type: exports.PACKET,
    lengthInBytes: function () {
        return this.dataSize -
            this.first_audio_packet_offset;
    }
});
exports.WEMDATA = new binary_parser_1.Parser()
    .endianess("little")
    .nest("header", {
    type: exports.HEADER,
})
    .nest("format", {
    type: exports.FORMAT,
});
function convert(wavFile, tag) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ""];
        });
    });
}
exports.convert = convert;
