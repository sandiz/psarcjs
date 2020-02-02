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
var fs_1 = require("fs");
var os = __importStar(require("os"));
var PSARCParser = __importStar(require("./parser"));
var SNGParser = __importStar(require("./sngparser"));
var common_1 = require("./types/common");
var packedParser = function (len) { return new binary_parser_1.Parser()
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
}); };
var SNG = /** @class */ (function () {
    function SNG(file, platform) {
        if (platform === void 0) { platform = undefined; }
        this.rawData = null; /* sng file data, can be encrypted or decrypted */
        this.packedData = null; /* encrypted sng  */
        this.unpackedData = null; /* decrypted sng */
        this.sng = null;
        this.packedSNG = null;
        this.sngFile = file;
        console.log("sngFile", this.sngFile);
        if (platform)
            this.platform = platform;
        else
            this.platform = os.platform() == "darwin" ? common_1.Platform.Mac : common_1.Platform.Windows;
    }
    SNG.prototype.parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var d;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(this.sngFile)];
                    case 1:
                        d = _a.sent();
                        this.rawData = d;
                        if (!this.rawData) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.unpack()];
                    case 2:
                        _a.sent();
                        if (this.unpackedData)
                            this.sng = SNGParser.SNGDATA.parse(this.unpackedData);
                        else
                            throw (new Error("failed to unpack sng"));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SNG.prototype.pack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var compressed, q, p, payload, encrypted, encParser, encryptedBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.unpackedData) return [3 /*break*/, 4];
                        return [4 /*yield*/, PSARCParser.zip(this.unpackedData)];
                    case 1:
                        compressed = _a.sent();
                        return [4 /*yield*/, PSARCParser.unzip(compressed)];
                    case 2:
                        _a.sent();
                        q = new binary_parser_1.Parser()
                            .endianess("little")
                            .uint32("uncompressedLength")
                            .buffer("compressedData", {
                            length: compressed.length,
                        });
                        p = {
                            uncompressedLength: this.unpackedData.length,
                            compressedData: compressed,
                        };
                        return [4 /*yield*/, PSARCParser.ENTRYEncrypt(q.encode(p), this.platform)];
                    case 3:
                        payload = _a.sent();
                        encrypted = {
                            magic: 0x4A,
                            platformHeader: 3,
                            iv: payload.iv,
                            encryptedData: payload.buf,
                            signature: Buffer.alloc(56, 0),
                        };
                        encParser = packedParser(payload.buf.length + (4 + 4 + 16 + 56));
                        encryptedBuffer = encParser.encode(encrypted);
                        this.packedData = encryptedBuffer;
                        return [3 /*break*/, 5];
                    case 4: throw new Error("sng decrypted data is null, call parse() first");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SNG.prototype.unpack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var p, pData, _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.rawData) return [3 /*break*/, 7];
                        p = packedParser(this.rawData.length);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        pData = p.parse(this.rawData);
                        if (!(pData.magic == 0x4A)) return [3 /*break*/, 3];
                        console.log("packed sng", this.sngFile);
                        _a = this;
                        return [4 /*yield*/, PSARCParser.ENTRYDecrypt(this.rawData, this.platform == common_1.Platform.Mac ? PSARCParser.MAC_KEY : PSARCParser.WIN_KEY)];
                    case 2:
                        _a.unpackedData = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.trace("unpacked sng", this.sngFile);
                        this.unpackedData = this.rawData;
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _b.sent();
                        console.log(e_1);
                        this.unpackedData = this.rawData;
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7: throw new Error("sng raw data is null, call parse() first");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return SNG;
}());
exports.SNG = SNG;
