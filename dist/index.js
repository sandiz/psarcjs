"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var xml2js = __importStar(require("xml2js"));
//import * as util from 'util';
var Parser = __importStar(require("./parser"));
var SNGParser = __importStar(require("./sngparser"));
var DDSParser = __importStar(require("./ddsparser"));
var WEMParser = __importStar(require("./wemparser"));
var BNKParser = __importStar(require("./bnkparser"));
var WAAPIHandler = __importStar(require("./wemwaapi"));
var path_1 = require("path");
var aggregategraphwriter_1 = require("./aggregategraphwriter");
var song2014_1 = require("./song2014");
var pkgInfo = require("../package.json");
var PSARC = /** @class */ (function () {
    function PSARC(file) {
        this.psarcFile = file;
        this.psarcRawData = null;
        this.BOMEntries = null;
        this.listing = [];
    }
    /**
     * decrypt a psarc file and parse it, this function must be called first
     * before calling any other member functions
     */
    PSARC.prototype.parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, header, paddedbom, decryptedbom, slicedbom, rawlisting;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, fs_1.promises.readFile(this.psarcFile)];
                    case 1:
                        _a.psarcRawData = _b.sent();
                        if (!this.psarcRawData) return [3 /*break*/, 3];
                        header = Parser.HEADER.parse(this.psarcRawData);
                        paddedbom = Parser.pad(header.bom);
                        decryptedbom = Buffer.from(Parser.BOMDecrypt(paddedbom));
                        slicedbom = decryptedbom.slice(0, header.bom.length);
                        this.BOMEntries = Parser.BOM(header.n_entries).parse(slicedbom);
                        if (!this.BOMEntries) return [3 /*break*/, 3];
                        return [4 /*yield*/, Parser.readEntry(this.psarcRawData, 0, this.BOMEntries)];
                    case 2:
                        rawlisting = _b.sent();
                        this.listing = unescape(rawlisting.toString()).split("\n");
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * get all files in psarc
     *
     * @returns {Array} list of all files in the psarc
     */
    PSARC.prototype.getFiles = function () {
        return this.listing;
    };
    /**
     * get all arrangements from file
     *
     * @returns {Object} json object representing an arrangement keyed with persistentID
     */
    PSARC.prototype.getArrangements = function () {
        return __awaiter(this, void 0, void 0, function () {
            var arrangements, i, listing, data, body, json, Entries, keys, j, key, attr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        arrangements = {};
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.listing.length)) return [3 /*break*/, 4];
                        listing = this.listing[i];
                        if (!listing.endsWith("json")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.readFile(i)];
                    case 2:
                        data = _a.sent();
                        if (data) {
                            body = data.toString("utf-8");
                            if (body === "") {
                                return [3 /*break*/, 3];
                            }
                            json = JSON.parse(body);
                            Entries = json.Entries;
                            keys = Object.keys(Entries);
                            for (j = 0; j < keys.length; j += 1) {
                                key = keys[j];
                                attr = json.Entries[key].Attributes;
                                attr.srcjson = listing;
                                arrangements[key] = attr;
                            }
                        }
                        _a.label = 3;
                    case 3:
                        i += 1;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, arrangements];
                }
            });
        });
    };
    /**
     * extract file from psarc
     *
     * @param {number} idx index of the file in file list (see getFiles())
     * @param {String} outfile path to output file
     * @param {Boolean}  tostring convert data to string before outputting
     * @returns {Boolean} true | false based on success / failure
     */
    PSARC.prototype.extractFile = function (idx, outfile, tostring) {
        if (tostring === void 0) { tostring = false; }
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (idx === -1)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.readFile(idx)];
                    case 1:
                        data = _a.sent();
                        if (!data) return [3 /*break*/, 6];
                        if (!tostring) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_1.promises.writeFile(outfile, data.toString('utf-8'))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, fs_1.promises.writeFile(outfile, data)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * read file from psarc
     *
     * @param {number} idx index of the file in file list (see getFiles())
     * @returns {Buffer} file data
     */
    PSARC.prototype.readFile = function (idx) {
        return __awaiter(this, void 0, void 0, function () {
            var data, decrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (idx === -1)
                            return [2 /*return*/, null];
                        if (!(this.psarcRawData && this.BOMEntries)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Parser.readEntry(this.psarcRawData, idx + 1, this.BOMEntries)];
                    case 1:
                        data = _a.sent();
                        if (!data) return [3 /*break*/, 3];
                        return [4 /*yield*/, Parser.Decrypt(this.listing[idx], data)];
                    case 2:
                        decrypted = _a.sent();
                        return [2 /*return*/, decrypted];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * raw unencrypted psarc data
     *
     * @returns {Buffer} file raw data
     */
    PSARC.prototype.getRawData = function () {
        return this.psarcRawData;
    };
    return PSARC;
}());
var SNG = /** @class */ (function () {
    function SNG(file) {
        this.sng = null;
        this.sngFile = file;
        this.sngRawData = null;
    }
    SNG.prototype.parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, fs_1.promises.readFile(this.sngFile)];
                    case 1:
                        _a.sngRawData = _b.sent();
                        if (this.sngRawData) {
                            this.sng = SNGParser.SNGDATA.parse(this.sngRawData);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SNG;
}());
var DDS = /** @class */ (function () {
    function DDS(file) {
        this.ddsFiles = [];
        this.imageFile = file;
    }
    DDS.prototype.convert = function (tag) {
        if (tag === void 0) { tag = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, DDSParser.convert(this.imageFile, tag)];
                    case 1:
                        _a.ddsFiles = _b.sent();
                        return [2 /*return*/, this.ddsFiles];
                }
            });
        });
    };
    DDS.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(this.imageFile)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, DDSParser.HEADER.parse(data)];
                }
            });
        });
    };
    return DDS;
}());
var WEM = /** @class */ (function () {
    function WEM() {
    }
    WEM.convert = function (file, tag) {
        if (tag === void 0) { tag = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var wemFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, WEMParser.convert(file, tag)];
                    case 1:
                        wemFile = _a.sent();
                        return [2 /*return*/, wemFile];
                }
            });
        });
    };
    WEM.validate = function (wemFile) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(wemFile)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, WEMParser.WEMDATA.parse(data)];
                }
            });
        });
    };
    return WEM;
}());
var BNK = /** @class */ (function () {
    function BNK() {
    }
    BNK.validate = function (bnkFile) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(bnkFile)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, BNKParser.BNKDATA.parse(data)];
                }
            });
        });
    };
    BNK.generate = function (wemFile, tag, copyWem, dir, preview) {
        if (preview === void 0) { preview = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BNKParser.generate(dir, wemFile, tag, copyWem, preview)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return BNK;
}());
var WAAPI = /** @class */ (function () {
    function WAAPI() {
    }
    WAAPI.convert = function (file, tag, platform) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, WAAPIHandler.Convert(file, tag, platform)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return WAAPI;
}());
var GENERIC = /** @class */ (function () {
    function GENERIC() {
    }
    GENERIC.generateToolkit = function (dir, author, comment, v2, tk) {
        return __awaiter(this, void 0, void 0, function () {
            var f, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        f = path_1.join(dir, "toolkit.version");
                        data = "Package Author: " + author + "\n" +
                            ("Package Version: " + v2 + "\n") +
                            ("Package Comment: " + comment + "\n") +
                            ("Toolkit: " + tk.name + " v" + tk.version + " (psarcjs v" + pkgInfo.version + ")\n\n");
                        return [4 /*yield*/, fs_1.promises.writeFile(f, data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, f];
                }
            });
        });
    };
    GENERIC.generateAppid = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var appid, f;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appid = "248750";
                        f = path_1.join(dir, "appid.appid");
                        return [4 /*yield*/, fs_1.promises.writeFile(f, appid)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, f];
                }
            });
        });
    };
    GENERIC.generateAggregateGraph = function (dir, tag, arrDetails, platform) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, aggregategraphwriter_1.generate(dir, tag, arrDetails, platform)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GENERIC.generateXBlock = function (arrs, tag, dir) {
        return __awaiter(this, void 0, void 0, function () {
            var f, ptypes, ptypePrefix, getValue, property, entities, xblock, builder, xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        f = path_1.join(dir, tag + ".xblock");
                        ptypes = [
                            "Header", "Manifest", "SngAsset",
                            "AlbumArtSmall", "AlbumArtMedium", "AlbumArtLarge",
                            "LyricArt", "ShowLightsXMLAsset", "SoundBank", "PreviewSoundBank"
                        ];
                        ptypePrefix = [
                            "urn:database:hsan-db:", "urn:database:json-db:", "urn:application:musicgame-song:", "urn:image:dds:",
                            "urn:image:dds:", "urn:image:dds:", "", "urn:application:xml:",
                            "urn:audio:wwise-sound-bank:", "urn:audio:wwise-sound-bank:"
                        ];
                        getValue = function (item, index, tag, arr) {
                            switch (item) {
                                case "Header":
                                    return ptypePrefix[index] + "songs_dlc_" + tag;
                                case "SngAsset":
                                case "Manifest":
                                    return "" + ptypePrefix[index] + tag + "_" + arr.arrangementType;
                                case "AlbumArtSmall":
                                    return ptypePrefix[index] + "album_" + tag + "_64";
                                case "AlbumArtMedium":
                                    return ptypePrefix[index] + "album_" + tag + "_128";
                                case "AlbumArtLarge":
                                    return ptypePrefix[index] + "album_" + tag + "_256";
                                case "ShowLightsXMLAsset":
                                    return "" + ptypePrefix[index] + tag + "_showlights";
                                case "SoundBank":
                                    return ptypePrefix[index] + "song_" + tag;
                                case "PreviewSoundBank":
                                    return ptypePrefix[index] + "song_" + tag + "_preview";
                                default:
                                    return "";
                            }
                        };
                        property = function (arr) { return ptypes.map(function (item, index) {
                            return {
                                $: {
                                    name: item
                                },
                                set: {
                                    $: {
                                        value: getValue(item, index, tag, arr)
                                    }
                                }
                            };
                        }); };
                        entities = arrs.map(function (item) {
                            return {
                                $: {
                                    id: item.persistentID,
                                    modelName: "RSEnumerable_Song",
                                    name: tag + "_" + toTitleCase(item.arrangementType),
                                    iterations: 0,
                                },
                                properties: {
                                    property: property(item),
                                }
                            };
                        });
                        xblock = {
                            game: {
                                entitySet: {
                                    entity: entities,
                                }
                            }
                        };
                        builder = new xml2js.Builder();
                        xml = builder.buildObject(xblock);
                        return [4 /*yield*/, fs_1.promises.writeFile(f, xml)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, f];
                }
            });
        });
    };
    return GENERIC;
}());
var Song2014 = /** @class */ (function () {
    function Song2014(song) {
        this.song = song;
    }
    Song2014.fromXML = function (xmlFile) {
        return __awaiter(this, void 0, void 0, function () {
            var data, parsed, song, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(xmlFile)];
                    case 1:
                        data = _a.sent();
                        return [4 /*yield*/, xml2js.parseStringPromise(data)];
                    case 2:
                        parsed = _a.sent();
                        song = parsed.song;
                        ret = {
                            version: song.$.version,
                            title: song2014_1.getS(song.title),
                            arrangement: song2014_1.getS(song.arrangement),
                            part: song2014_1.getI(song.part),
                            offset: song2014_1.getF(song.offset),
                            centOffset: song2014_1.getF(song.centOffset),
                            songLength: song2014_1.getF(song.songLength),
                            startBeat: song2014_1.getF(song.startBeat),
                            averageTempo: song2014_1.getF(song.averageTempo),
                            tuning: objectMap(song.tuning[0].$, function (item) { return parseInt(item, 10); }),
                            capo: song2014_1.getI(song.capo),
                            artistName: song2014_1.getS(song.artistName),
                            artistNameSort: song2014_1.getS(song.artistNameSort),
                            albumName: song2014_1.getS(song.albumName),
                            albumNameSort: song2014_1.getS(song.albumNameSort),
                            albumYear: song2014_1.getS(song.albumYear),
                            crowdSpeed: song2014_1.getS(song.crowdSpeed),
                            lastConversionDateTime: song2014_1.getS(song.lastConversionDateTime),
                            arrangementProperties: objectMap(song.arrangementProperties[0].$, function (item) { return parseInt(item, 10); }),
                            phrases: song2014_1.SongPhrase.fromXML(song.phrases),
                            phraseIterations: song2014_1.SongPhraseIteration.fromXML(song.phraseIterations),
                            newLinkedDiffs: song2014_1.SongNewLinkedDiff.fromXML(song.newLinkedDiffs),
                            linkedDiffs: song2014_1.SongLinkedDiff.fromXML(song.linkedDiffs),
                            phraseProperties: song2014_1.SongPhraseProperty.fromXML(song.phraseProperties),
                            chordTemplates: song2014_1.SongChordTemplate.fromXML(song.chordTemplates),
                            fretHandMuteTemplates: [],
                            ebeats: song2014_1.SongEbeat.fromXML(song.ebeats),
                            tonebase: song2014_1.getS(song.tonebase),
                            tonea: song2014_1.getS(song.tonea),
                            toneb: song2014_1.getS(song.toneb),
                            tonec: song2014_1.getS(song.tonec),
                            toned: song2014_1.getS(song.toned),
                            tones: song2014_1.SongTone.fromXML(song.tones),
                            sections: song2014_1.SongSection.fromXML(song.sections),
                            events: song2014_1.SongEvent.fromXML(song.events),
                            controls: song2014_1.SongPhraseProperty.fromXML(song.controls),
                            transcriptionTrack: song2014_1.TranscriptionTrack.fromXML(song.transcriptionTrack),
                            levels: song2014_1.SongLevel.fromXML(song.levels),
                        };
                        return [2 /*return*/, new Song2014(ret)];
                }
            });
        });
    };
    Song2014.prototype.xmlize = function () {
        var _a = this.song, version = _a.version, rest = __rest(_a, ["version"]);
        rest.tuning = { $: __assign({}, rest.tuning) };
        rest.arrangementProperties = { $: __assign({}, rest.arrangementProperties) };
        var _d = function (obj, child) {
            var _a;
            return _a = {
                    $: { count: obj.length }
                },
                _a[child] = obj.map(function (item) {
                    return { $: __assign({}, item) };
                }),
                _a;
        };
        rest.ebeats = _d(rest.ebeats, "ebeat");
        rest.phrases = _d(rest.phrases, "phrase");
        rest.phraseIterations = _d(rest.phraseIterations, "phraseIteration");
        rest.newLinkedDiffs = _d(rest.newLinkedDiffs, "newLinkedDiff");
        rest.linkedDiffs = _d(rest.linkedDiffs, "linkedDiff");
        rest.phraseProperties = _d(rest.phraseProperties, "phraseProperty");
        rest.chordTemplates = _d(rest.chordTemplates, "chordTemplate");
        rest.fretHandMuteTemplates = _d(rest.fretHandMuteTemplates, "fretHandMuteTemplate");
        rest.sections = _d(rest.sections, "section");
        rest.events = _d(rest.events, "event");
        rest.levels = _d(rest.levels, "level");
        rest.transcriptionTrack = {
            $: { difficulty: rest.transcriptionTrack.difficulty },
            notes: _d(rest.transcriptionTrack.notes, "note"),
            chords: _d(rest.transcriptionTrack.chords, "chord"),
            fretHandMutes: _d(rest.transcriptionTrack.fretHandMutes, "fretHandMute"),
            anchors: _d(rest.transcriptionTrack.anchors, "anchor"),
            handShapes: _d(rest.transcriptionTrack.handShapes, "handShape"),
        };
        return __assign({}, rest);
    };
    Song2014.prototype.generateXML = function (dir, tag, tk) {
        return __awaiter(this, void 0, void 0, function () {
            var builder, xml, fileName, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        builder = new xml2js.Builder();
                        xml = builder.buildObject({
                            song: __assign({ $: { version: this.song.version }, $comments: [tk.name + " v" + tk.version + " (psarcjs v" + pkgInfo.version + ")"] }, this.xmlize())
                        });
                        fileName = tag + "_" + this.song.arrangement + ".xml";
                        file = path_1.join(dir, fileName);
                        return [4 /*yield*/, fs_1.promises.writeFile(file, xml)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, file];
                }
            });
        });
    };
    Song2014.prototype.generateSNG = function (dir, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Song2014;
}());
var toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};
var objectMap = function (object, mapFn) {
    return Object.keys(object).reduce(function (result, key) {
        result[key] = mapFn(object[key]);
        return result;
    }, {});
};
module.exports = {
    PSARC: PSARC,
    SNG: SNG,
    DDS: DDS,
    WEM: WEM,
    WAAPI: WAAPI,
    GENERIC: GENERIC,
    BNK: BNK,
    Song2014: Song2014,
    SongEbeat: song2014_1.SongEbeat,
    SongNote: song2014_1.SongNote,
};
