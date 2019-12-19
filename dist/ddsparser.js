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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var binary_parser_1 = require("binary-parser");
var dxt = __importStar(require("dxt-js"));
var imagemagick = __importStar(require("imagemagick-native"));
var isPo2 = require('is-power-of-two');
var nextPo2 = require('next-power-of-two');
var path = require('path');
var sharp = require('sharp');
exports.HEADER = new binary_parser_1.Parser()
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
    .uint32("reserved2");
function convert(image, tag) {
    return __awaiter(this, void 0, void 0, function () {
        var res, outfiles, i, r, out, _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    res = [64, 128, 256];
                    outfiles = [];
                    i = 0;
                    _g.label = 1;
                case 1:
                    if (!(i < res.length)) return [3 /*break*/, 5];
                    r = res[i];
                    out = path.dirname(image) + ("/album_" + tag + "_" + r + ".dds");
                    _b = (_a = fs_1.promises).writeFile;
                    _c = [out];
                    _e = (_d = imagemagick).convert;
                    _f = {};
                    return [4 /*yield*/, fs_1.promises.readFile(image)];
                case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_e.apply(_d, [(_f.srcData = _g.sent(),
                                _f.format = 'DDS',
                                _f.width = r,
                                _f.height = r,
                                _f)])]))];
                case 3:
                    _g.sent();
                    outfiles.push(out);
                    _g.label = 4;
                case 4:
                    i += 1;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, outfiles];
            }
        });
    });
}
exports.convert = convert;
function convert_old(image, tag) {
    return __awaiter(this, void 0, void 0, function () {
        var i, info, w, h, data, header, pfFlags, headerBuffer, flag, compressed, decompressed, bmp, finalBuffer, files, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sharp(image)];
                case 1:
                    i = _a.sent();
                    return [4 /*yield*/, i.metadata()];
                case 2:
                    info = _a.sent();
                    w = info.width;
                    h = info.height;
                    if (!isPo2(w)) {
                        w = nextPo2(w);
                    }
                    if (!isPo2(h)) {
                        h = nextPo2(h);
                    }
                    // the dds algo need 256 as minimum size
                    w = 256; //Math.max(256, w)
                    h = 256; //Math.max(256, w)
                    return [4 /*yield*/, sharp(image).resize(w, h, { fit: "contain" }).raw().toBuffer()];
                case 3:
                    data = _a.sent();
                    header = "";
                    header += "DDS "; //magic number
                    header += int32ToFourCC(124); //size header, have to be 124
                    header += int32ToFourCC(0x1 | 0x2 | 0x4 | 0x1000);
                    header += int32ToFourCC(h); //height
                    header += int32ToFourCC(w); //width
                    header += int32ToFourCC(calculatePitch(w * h, 24)); //pitch 
                    header += int32ToFourCC(0); // depth
                    header += int32ToFourCC(0); //mipmapCount
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    header += int32ToFourCC(0); // unused
                    pfFlags = 0x4;
                    header += int32ToFourCC(32); //size
                    header += int32ToFourCC(pfFlags); //off_pfFlags
                    header += 'DXT1';
                    header += int32ToFourCC(0); //off_RGBBitCount
                    header += int32ToFourCC(0); //off_RBitMask
                    header += int32ToFourCC(0); //off_GBitMask
                    header += int32ToFourCC(0); //off_BBitMask
                    header += int32ToFourCC(0); //off_ABitMask
                    header += int32ToFourCC(0x1000); //off_caps : for special texture
                    header += int32ToFourCC(0); //off_caps2 : for cubemap
                    header += int32ToFourCC(0); //off_caps3
                    header += int32ToFourCC(0); //off_caps4
                    header += int32ToFourCC(0); //reserved
                    headerBuffer = Buffer.from(header);
                    flag = 0;
                    flag = dxt.flags.DXT1;
                    compressed = dxt.compress(data, w, h, flag);
                    decompressed = dxt.decompress(compressed, w, h, flag);
                    bmp = path.dirname(image) + ("/album_" + tag + ".jpg");
                    return [4 /*yield*/, sharp(Buffer.from(decompressed), {
                            raw: {
                                width: w,
                                height: h,
                                channels: info.channels,
                            }
                        }).toFile(bmp)];
                case 4:
                    _a.sent();
                    finalBuffer = Buffer.concat([headerBuffer, compressed]);
                    files = [];
                    file = path.dirname(image) + ("/album_" + tag + ".dds");
                    return [4 /*yield*/, fs_1.promises.writeFile(file, finalBuffer)];
                case 5:
                    _a.sent();
                    files.push(file);
                    return [2 /*return*/, files];
            }
        });
    });
}
exports.convert_old = convert_old;
function calculatePitch(width, bitsPerPixel) {
    //return (width * bitsPerPixel + 7) / 8
    return Math.max(1, ((width + 3) / 4)) * 8;
}
function int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
}
