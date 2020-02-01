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
var binary_parser_1 = require("binary-parser");
var aesjs = __importStar(require("aes-js"));
var zlib = __importStar(require("zlib"));
var common_1 = require("./types/common");
exports.BLOCK_SIZE = Math.pow(2, 16);
var ARC_KEY = "C53DB23870A1A2F71CAE64061FDD0E1157309DC85204D4C5BFDF25090DF2572C";
exports.ARC_IV = "E915AA018FEF71FC508132E4BB4CEB42";
exports.MAC_KEY = "9821330E34B91F70D0A48CBD625993126970CEA09192C0E6CDA676CC9838289D";
exports.WIN_KEY = "CB648DF3D12A16BF71701414E69619EC171CCA5D2A142E3E59DE7ADDA18A3A30";
exports.unzip = function (data) { return new Promise(function (resolve, reject) {
    zlib.unzip(data, {}, function (err, buffer) {
        if (!err) {
            resolve(buffer);
        }
        else {
            reject(err);
        }
    });
}); };
exports.zip = function (data, level) {
    if (level === void 0) { level = 9; }
    return new Promise(function (resolve, reject) {
        zlib.deflate(data, {
            level: level,
            windowBits: 15,
            memLevel: 8,
            strategy: 0,
            chunkSize: 4096,
        }, function (err, res) {
            if (err)
                reject(err);
            resolve(res);
        });
    });
};
exports.mod = function (x, n) { return (x % n + n) % n; };
function nextBlockSize(blockSize, mutipleOf) {
    if (mutipleOf === void 0) { mutipleOf = 16; }
    return Math.ceil(blockSize / mutipleOf) * mutipleOf;
}
exports.nextBlockSize = nextBlockSize;
function pad(buffer, blocksize) {
    if (blocksize === void 0) { blocksize = 16; }
    var size = exports.mod((blocksize - buffer.length), blocksize);
    var b = Buffer.alloc(size);
    return Buffer.concat([buffer, b]);
}
exports.pad = pad;
function BOMDecrypt(buffer) {
    var key = aesjs.utils.hex.toBytes(ARC_KEY);
    var iv = aesjs.utils.hex.toBytes(exports.ARC_IV);
    var aescfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
    return aescfb.decrypt(buffer);
}
exports.BOMDecrypt = BOMDecrypt;
function BOMEncrypt(buffer) {
    var key = aesjs.utils.hex.toBytes(ARC_KEY);
    var iv = aesjs.utils.hex.toBytes(exports.ARC_IV);
    var aescfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
    return aescfb.encrypt(pad(buffer));
}
exports.BOMEncrypt = BOMEncrypt;
function ENTRYDecrypt(data, key) {
    return __awaiter(this, void 0, void 0, function () {
        var iv, ctr, uintAkey, quanta, aesCtr, decrypted, payload, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iv = new Uint8Array(data.slice(8, 24));
                    ctr = Buffer.from(iv).readUInt32BE(0);
                    uintAkey = aesjs.utils.hex.toBytes(key);
                    quanta = data.slice(24, data.length - 56);
                    aesCtr = new aesjs.ModeOfOperation.ctr(uintAkey, new aesjs.Counter(ctr));
                    decrypted = aesCtr.decrypt(pad(quanta));
                    payload = decrypted.slice(4, data.length);
                    return [4 /*yield*/, exports.unzip(Buffer.from(payload))];
                case 1:
                    buf = _a.sent();
                    return [2 /*return*/, buf];
            }
        });
    });
}
exports.ENTRYDecrypt = ENTRYDecrypt;
function ENTRYEncrypt(data, platform) {
    return __awaiter(this, void 0, void 0, function () {
        var key, iv, ctr, uintAkey, quanta, aesCtr, buf;
        return __generator(this, function (_a) {
            key = platform == common_1.Platform.Mac ? exports.MAC_KEY : exports.WIN_KEY;
            iv = Buffer.alloc(16, 0);
            ctr = Buffer.from(iv).readUInt32BE(0);
            uintAkey = aesjs.utils.hex.toBytes(key);
            quanta = data;
            aesCtr = new aesjs.ModeOfOperation.ctr(uintAkey, new aesjs.Counter(ctr));
            buf = aesCtr.encrypt(pad(quanta));
            return [2 /*return*/, {
                    buf: Buffer.from(buf),
                    iv: iv
                }];
        });
    });
}
exports.ENTRYEncrypt = ENTRYEncrypt;
function Decrypt(listing, contents) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = contents;
                    if (!listing.includes("songs/bin/macos")) return [3 /*break*/, 2];
                    return [4 /*yield*/, ENTRYDecrypt(contents, exports.MAC_KEY)];
                case 1:
                    data = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!listing.includes("songs/bin/generic")) return [3 /*break*/, 4];
                    return [4 /*yield*/, ENTRYDecrypt(contents, exports.WIN_KEY)];
                case 3:
                    data = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, data];
            }
        });
    });
}
exports.Decrypt = Decrypt;
function Encrypt(listing, contents, platform) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = contents;
                    if (!listing.includes("songs/bin/macos")) return [3 /*break*/, 2];
                    return [4 /*yield*/, ENTRYEncrypt(contents, platform)];
                case 1:
                    data = (_a.sent()).buf;
                    return [3 /*break*/, 4];
                case 2:
                    if (!listing.includes("songs/bin/generic")) return [3 /*break*/, 4];
                    return [4 /*yield*/, ENTRYEncrypt(contents, platform)];
                case 3:
                    data = (_a.sent()).buf;
                    _a.label = 4;
                case 4: return [2 /*return*/, data];
            }
        });
    });
}
exports.Encrypt = Encrypt;
function readEntry(data, idx, bomentries) {
    return __awaiter(this, void 0, void 0, function () {
        var singlebom, entryoffset, entrylength, zlength, retBuffer, length, i, z, buf, buffer, E_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    singlebom = bomentries.entries[idx];
                    entryoffset = singlebom.offset.readUInt32BE(1);
                    entrylength = singlebom.length.readUInt32BE(1);
                    zlength = bomentries.zlength.slice(singlebom.zindex, bomentries.zlength.length);
                    retBuffer = Buffer.alloc(0);
                    length = 0;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < zlength.length)) return [3 /*break*/, 7];
                    z = zlength[i];
                    if (length === entrylength) {
                        return [3 /*break*/, 7];
                    }
                    buf = Buffer.alloc(z === 0 ? exports.BLOCK_SIZE : z);
                    buffer = data.slice(entryoffset, entryoffset + (z === 0 ? exports.BLOCK_SIZE : z));
                    entryoffset += (z === 0 ? exports.BLOCK_SIZE : z);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, exports.unzip(buffer)];
                case 3:
                    buffer = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    E_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    retBuffer = Buffer.concat([retBuffer, buffer]);
                    length += buffer.length;
                    _a.label = 6;
                case 6:
                    i += 1;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, retBuffer];
            }
        });
    });
}
exports.readEntry = readEntry;
exports.HEADER = new binary_parser_1.Parser()
    .string("MAGIC", {
    encoding: "ascii",
    zeroTerminated: false,
    length: 4,
    assert: 'PSAR',
})
    .uint32("VERSION")
    .string("COMPRESSION", {
    encoding: "ascii",
    zeroTerminated: false,
    length: 4,
    assert: 'zlib',
})
    .uint32("header_size")
    .uint32("ENTRY_SIZE")
    .uint32("n_entries")
    .uint32("BLOCK_SIZE")
    .uint32("ARCHIVE_FLAGS")
    .buffer("bom", {
    length: function () {
        return this.header_size - 32;
    }
});
exports.ENTRY = new binary_parser_1.Parser()
    .string("md5", {
    encoding: "hex",
    zeroTerminated: false,
    length: 16,
})
    .uint32("zindex")
    .buffer("length", {
    // type: "uint32be",
    length: 5,
})
    .buffer("offset", {
    //type: "uint32be",
    length: 5
});
function BOM(entries) {
    return new binary_parser_1.Parser()
        .array("entries", {
        type: exports.ENTRY,
        length: entries
    })
        .array("zlength", {
        type: "uint16be",
        //lengthInBytes: 16
        readUntil: "eof"
    });
}
exports.BOM = BOM;
