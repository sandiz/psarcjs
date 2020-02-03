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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var crypto = __importStar(require("crypto"));
var PSARCParser = __importStar(require("./parser"));
var common_1 = require("./types/common");
var dds_1 = require("./dds");
var wem_1 = require("./wem");
var bnk_1 = require("./bnk");
var song2014_1 = require("./song2014");
var sng_1 = require("./sng");
var manifest_1 = require("./manifest");
var generic_1 = require("./generic");
var readdir = require('fs').promises.readdir;
var resolve = require('path').resolve;
var PSARC = /** @class */ (function () {
    function PSARC(file) {
        this.psarcFile = "";
        this.psarcRawData = null;
        if (file instanceof Buffer)
            this.psarcRawData = file;
        else
            this.psarcFile = file;
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
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.psarcRawData == null)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, fs_1.promises.readFile(this.psarcFile)];
                    case 1:
                        _a.psarcRawData = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!this.psarcRawData) return [3 /*break*/, 4];
                        header = PSARCParser.HEADER.parse(this.psarcRawData);
                        paddedbom = PSARCParser.pad(header.bom);
                        decryptedbom = Buffer.from(PSARCParser.BOMDecrypt(paddedbom));
                        slicedbom = decryptedbom.slice(0, header.bom.length);
                        this.BOMEntries = PSARCParser.BOM(header.n_entries).parse(slicedbom);
                        if (!this.BOMEntries) return [3 /*break*/, 4];
                        return [4 /*yield*/, PSARCParser.readEntry(this.psarcRawData, 0, this.BOMEntries)];
                    case 3:
                        rawlisting = _b.sent();
                        this.listing = unescape(rawlisting.toString()).split("\n");
                        this.BOMEntries.entries.forEach(function (v, i) {
                            if (i === 0)
                                v.name = "listing";
                            else
                                v.name = _this.listing[i - 1];
                        });
                        _b.label = 4;
                    case 4: return [2 /*return*/];
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
                        return [4 /*yield*/, PSARCParser.readEntry(this.psarcRawData, idx + 1, this.BOMEntries)];
                    case 1:
                        data = _a.sent();
                        if (!data) return [3 /*break*/, 3];
                        return [4 /*yield*/, PSARCParser.Decrypt(this.listing[idx], data)];
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
    PSARC.existsAsync = function (path) {
        return new Promise(function (resolve, reject) {
            fs_1.exists(path, function (exists) {
                resolve(exists);
            });
        });
    };
    PSARC.generateDirectory = function (dir, tag, files, arrInfo, toolkit, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var info, _getFiles, _getVocalSNG, leadFiles, rhythmFiles, bassFiles, vocalFiles, allArrs, hsan, details, options, name, root, exists, fm, gfxassets, audio, songsarr, arrKeys, i, key, arr, j, oneIdx, xml, dest_1, songsbin, binKeys, i, key, sng, j, oneIdx, sngFile, dest_2, manifestDir, manifestKeys, i, key, manifest, j, oneIdx, json, dest_3, dest, gamex;
            var _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: 
                    /* validate dds */
                    return [4 /*yield*/, Promise.all(Object.keys(files.dds).map(function (key) {
                            var dds1 = new dds_1.DDS(files.dds[key]);
                            return dds1.parse();
                        }))
                        /* validate wem */
                    ];
                    case 1:
                        /* validate dds */
                        _e.sent();
                        /* validate wem */
                        return [4 /*yield*/, wem_1.WEM.parse(files.wem.main.wem)];
                    case 2:
                        /* validate wem */
                        _e.sent();
                        return [4 /*yield*/, wem_1.WEM.parse(files.wem.preview.wem)];
                    case 3:
                        _e.sent();
                        /* validate bnk */
                        return [4 /*yield*/, bnk_1.BNK.parse(files.wem.main.bnk)];
                    case 4:
                        /* validate bnk */
                        _e.sent();
                        return [4 /*yield*/, bnk_1.BNK.parse(files.wem.preview.bnk)];
                    case 5:
                        _e.sent();
                        info = function (index) { arrInfo.currentPartition = index; return arrInfo; };
                        _getFiles = function (xml, tones, index) { return __awaiter(_this, void 0, void 0, function () {
                            var parsed, sngFile, sng, tonesObj, _a, _b, arr, json;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, song2014_1.Song2014.fromXML(xml)];
                                    case 1:
                                        parsed = _c.sent();
                                        return [4 /*yield*/, parsed.generateSNG("/tmp/", tag, platform)];
                                    case 2:
                                        sngFile = _c.sent();
                                        sng = new sng_1.SNG(sngFile, platform);
                                        return [4 /*yield*/, sng.parse()];
                                    case 3:
                                        _c.sent();
                                        return [4 /*yield*/, sng.pack()];
                                    case 4:
                                        _c.sent();
                                        _b = (_a = JSON).parse;
                                        return [4 /*yield*/, fs_1.promises.readFile(tones)];
                                    case 5: return [4 /*yield*/, (_c.sent()).toString()];
                                    case 6:
                                        tonesObj = _b.apply(_a, [_c.sent(), common_1.ManifestToneReviver]);
                                        arr = new common_1.Arrangement(parsed.song, sng, {
                                            tag: tag,
                                            sortOrder: index,
                                            volume: arrInfo.volume,
                                            previewVolume: arrInfo.previewVolume,
                                            bassPicked: xml.endsWith("_bass.xml"),
                                            represent: index === 0,
                                            details: details,
                                            tones: tonesObj,
                                            info: info(index),
                                        });
                                        return [4 /*yield*/, manifest_1.MANIFEST.generateJSON("/tmp/", tag, arr)];
                                    case 7:
                                        json = _c.sent();
                                        return [2 /*return*/, {
                                                sng: sngFile,
                                                manifest: json,
                                                arrangement: arr,
                                            }];
                                }
                            });
                        }); };
                        _getVocalSNG = function (xml, index) { return __awaiter(_this, void 0, void 0, function () {
                            var parsed, sngFile, arr, json;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, common_1.Vocals.fromXML(xml)];
                                    case 1:
                                        parsed = _a.sent();
                                        return [4 /*yield*/, common_1.Vocals.generateSNG("/tmp/", tag, parsed, platform)];
                                    case 2:
                                        sngFile = _a.sent();
                                        arr = new common_1.VocalArrangement({
                                            tag: tag,
                                            sortOrder: index,
                                            volume: arrInfo.volume,
                                            previewVolume: arrInfo.previewVolume,
                                            bassPicked: false,
                                            represent: true,
                                            details: details,
                                            tones: [],
                                            info: info(index),
                                        });
                                        return [4 /*yield*/, manifest_1.MANIFEST.generateJSON("/tmp", tag, arr)];
                                    case 3:
                                        json = _a.sent();
                                        return [2 /*return*/, {
                                                sng: sngFile,
                                                manifest: json,
                                                arrangement: arr,
                                            }];
                                }
                            });
                        }); };
                        return [4 /*yield*/, Promise.all(files.xml[common_1.ArrangementType.LEAD].map(function (xml, index) { return _getFiles(xml, files.tones[common_1.ArrangementType.LEAD][index], index); }))];
                    case 6:
                        leadFiles = _e.sent();
                        return [4 /*yield*/, Promise.all(files.xml[common_1.ArrangementType.RHYTHM].map(function (xml, index) { return _getFiles(xml, files.tones[common_1.ArrangementType.RHYTHM][index], index); }))];
                    case 7:
                        rhythmFiles = _e.sent();
                        return [4 /*yield*/, Promise.all(files.xml[common_1.ArrangementType.BASS].map(function (xml, index) { return _getFiles(xml, files.tones[common_1.ArrangementType.BASS][index], index); }))];
                    case 8:
                        bassFiles = _e.sent();
                        return [4 /*yield*/, Promise.all(files.xml[common_1.ArrangementType.VOCALS].map(function (xml, index) { return _getVocalSNG(xml, index); }))];
                    case 9:
                        vocalFiles = _e.sent();
                        allArrs = [];
                        allArrs = allArrs.concat(vocalFiles.map(function (item) { return item.arrangement; }));
                        allArrs = allArrs.concat(leadFiles.map(function (item) { return item.arrangement; }).concat(rhythmFiles.map(function (item) { return item.arrangement; })).concat(bassFiles.map(function (item) { return item.arrangement; })));
                        return [4 /*yield*/, manifest_1.MANIFEST.generateHSAN(dir, tag, allArrs)];
                    case 10:
                        hsan = _e.sent();
                        details = (_a = {},
                            _a[common_1.ArrangementType.LEAD] = leadFiles.length,
                            _a[common_1.ArrangementType.RHYTHM] = rhythmFiles.length,
                            _a[common_1.ArrangementType.BASS] = bassFiles.length,
                            _a[common_1.ArrangementType.VOCALS] = vocalFiles.length,
                            _a[common_1.ArrangementType.SHOWLIGHTS] = files.xml[common_1.ArrangementType.SHOWLIGHTS].length,
                            _a);
                        options = {
                            tag: tag,
                            platform: platform,
                            toolkit: toolkit,
                            arrDetails: details,
                            dds: files.dds,
                            audio: files.wem,
                            songs: {
                                xmls: (_b = {},
                                    _b[common_1.ArrangementType.LEAD] = files.xml[common_1.ArrangementType.LEAD],
                                    _b[common_1.ArrangementType.RHYTHM] = files.xml[common_1.ArrangementType.RHYTHM],
                                    _b[common_1.ArrangementType.BASS] = files.xml[common_1.ArrangementType.BASS],
                                    _b[common_1.ArrangementType.VOCALS] = files.xml[common_1.ArrangementType.VOCALS],
                                    _b[common_1.ArrangementType.SHOWLIGHTS] = files.xml[common_1.ArrangementType.SHOWLIGHTS],
                                    _b),
                                sngs: (_c = {},
                                    _c[common_1.ArrangementType.LEAD] = leadFiles.map(function (item) { return item.sng; }),
                                    _c[common_1.ArrangementType.RHYTHM] = rhythmFiles.map(function (item) { return item.sng; }),
                                    _c[common_1.ArrangementType.BASS] = bassFiles.map(function (item) { return item.sng; }),
                                    _c[common_1.ArrangementType.VOCALS] = vocalFiles.map(function (item) { return item.sng; }),
                                    _c),
                                manifests: (_d = {},
                                    _d[common_1.ArrangementType.LEAD] = leadFiles.map(function (item) { return item.manifest; }),
                                    _d[common_1.ArrangementType.RHYTHM] = rhythmFiles.map(function (item) { return item.manifest; }),
                                    _d[common_1.ArrangementType.BASS] = bassFiles.map(function (item) { return item.manifest; }),
                                    _d[common_1.ArrangementType.VOCALS] = vocalFiles.map(function (item) { return item.manifest; }),
                                    _d),
                                hsan: hsan,
                                arrangements: allArrs,
                            }
                        };
                        name = "" + options.tag + (options.platform == common_1.Platform.Windows ? '_p' : '_m');
                        root = path_1.join(dir, name);
                        return [4 /*yield*/, PSARC.existsAsync(root)];
                    case 11:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 13];
                        return [4 /*yield*/, fs_1.promises.mkdir(root)];
                    case 12:
                        _e.sent();
                        _e.label = 13;
                    case 13: return [4 /*yield*/, generic_1.GENERIC.generateToolkit(root, options.toolkit.author, options.toolkit.comment, options.toolkit.version, options.toolkit.tk)];
                    case 14:
                        _e.sent();
                        return [4 /*yield*/, generic_1.GENERIC.generateAppid(root)];
                    case 15:
                        _e.sent();
                        return [4 /*yield*/, generic_1.GENERIC.generateAggregateGraph(root, options.tag, options.arrDetails, options.platform)];
                    case 16:
                        _e.sent();
                        fm = path_1.join(root, "flatmodels/rs");
                        return [4 /*yield*/, PSARC.existsAsync(fm)];
                    case 17:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 19];
                        return [4 /*yield*/, fs_extra_1.mkdirp(fm)];
                    case 18:
                        _e.sent();
                        _e.label = 19;
                    case 19: return [4 /*yield*/, fs_1.promises.copyFile("data/flatmodels/rsenumerable_root.flat", path_1.join(fm, "rsenumerable_root.flat"))];
                    case 20:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile("data/flatmodels/rsenumerable_song.flat", path_1.join(fm, "rsenumerable_song.flat"))];
                    case 21:
                        _e.sent();
                        gfxassets = path_1.join(root, "gfxassets/album_art");
                        return [4 /*yield*/, PSARC.existsAsync(gfxassets)];
                    case 22:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 24];
                        return [4 /*yield*/, fs_extra_1.mkdirp(gfxassets)];
                    case 23:
                        _e.sent();
                        _e.label = 24;
                    case 24: return [4 /*yield*/, fs_1.promises.copyFile(options.dds[256], path_1.join(gfxassets, "album_" + options.tag + "_256.dds"))];
                    case 25:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(options.dds[128], path_1.join(gfxassets, "album_" + options.tag + "_128.dds"))];
                    case 26:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(options.dds[64], path_1.join(gfxassets, "album_" + options.tag + "_64.dds"))];
                    case 27:
                        _e.sent();
                        audio = path_1.join(root, "audio", options.platform === common_1.Platform.Windows ? "windows" : "mac");
                        return [4 /*yield*/, PSARC.existsAsync(audio)];
                    case 28:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 30];
                        return [4 /*yield*/, fs_extra_1.mkdirp(audio)];
                    case 29:
                        _e.sent();
                        _e.label = 30;
                    case 30: return [4 /*yield*/, fs_1.promises.copyFile(options.audio.main.wem, path_1.join(audio, path_1.basename(options.audio.main.wem)))];
                    case 31:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(options.audio.preview.wem, path_1.join(audio, path_1.basename(options.audio.preview.wem)))];
                    case 32:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(options.audio.main.bnk, path_1.join(audio, "song_" + options.tag + ".bnk"))];
                    case 33:
                        _e.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(options.audio.preview.bnk, path_1.join(audio, "song_" + options.tag + "_preview.bnk"))];
                    case 34:
                        _e.sent();
                        songsarr = path_1.join(root, "songs/arr");
                        return [4 /*yield*/, PSARC.existsAsync(songsarr)];
                    case 35:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 37];
                        return [4 /*yield*/, fs_extra_1.mkdirp(songsarr)];
                    case 36:
                        _e.sent();
                        _e.label = 37;
                    case 37:
                        arrKeys = Object.keys(options.songs.xmls);
                        i = 0;
                        _e.label = 38;
                    case 38:
                        if (!(i < arrKeys.length)) return [3 /*break*/, 43];
                        key = arrKeys[i];
                        arr = options.songs.xmls[key];
                        j = 0;
                        _e.label = 39;
                    case 39:
                        if (!(j < arr.length)) return [3 /*break*/, 42];
                        oneIdx = j + 1;
                        xml = arr[j];
                        dest_1 = path_1.join(songsarr, options.tag + "_" + key + (oneIdx > 1 ? "" + oneIdx : "") + ".xml");
                        return [4 /*yield*/, fs_1.promises.copyFile(xml, dest_1)];
                    case 40:
                        _e.sent();
                        _e.label = 41;
                    case 41:
                        j += 1;
                        return [3 /*break*/, 39];
                    case 42:
                        i += 1;
                        return [3 /*break*/, 38];
                    case 43:
                        songsbin = path_1.join(root, "songs/bin", options.platform == common_1.Platform.Windows ? "generic" : "macos");
                        return [4 /*yield*/, PSARC.existsAsync(songsbin)];
                    case 44:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 46];
                        return [4 /*yield*/, fs_extra_1.mkdirp(songsbin)];
                    case 45:
                        _e.sent();
                        _e.label = 46;
                    case 46:
                        binKeys = Object.keys(options.songs.sngs);
                        i = 0;
                        _e.label = 47;
                    case 47:
                        if (!(i < binKeys.length)) return [3 /*break*/, 52];
                        key = binKeys[i];
                        sng = options.songs.sngs[key];
                        j = 0;
                        _e.label = 48;
                    case 48:
                        if (!(j < sng.length)) return [3 /*break*/, 51];
                        oneIdx = j + 1;
                        sngFile = sng[j];
                        dest_2 = path_1.join(songsbin, options.tag + "_" + key + (oneIdx > 1 ? "" + oneIdx : "") + ".sng");
                        return [4 /*yield*/, fs_extra_1.move(sngFile, dest_2, {
                                overwrite: true,
                            })];
                    case 49:
                        _e.sent();
                        _e.label = 50;
                    case 50:
                        j += 1;
                        return [3 /*break*/, 48];
                    case 51:
                        i += 1;
                        return [3 /*break*/, 47];
                    case 52:
                        manifestDir = path_1.join(root, "manifests", "songs_dlc_" + options.tag);
                        return [4 /*yield*/, PSARC.existsAsync(manifestDir)];
                    case 53:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 55];
                        return [4 /*yield*/, fs_extra_1.mkdirp(manifestDir)];
                    case 54:
                        _e.sent();
                        _e.label = 55;
                    case 55:
                        manifestKeys = Object.keys(options.songs.manifests);
                        i = 0;
                        _e.label = 56;
                    case 56:
                        if (!(i < manifestKeys.length)) return [3 /*break*/, 61];
                        key = manifestKeys[i];
                        manifest = options.songs.manifests[key];
                        j = 0;
                        _e.label = 57;
                    case 57:
                        if (!(j < manifest.length)) return [3 /*break*/, 60];
                        oneIdx = j + 1;
                        json = manifest[j];
                        dest_3 = path_1.join(manifestDir, options.tag + "_" + key + (oneIdx > 1 ? "" + oneIdx : "") + ".json");
                        return [4 /*yield*/, fs_extra_1.move(json, dest_3, {
                                overwrite: true,
                            })];
                    case 58:
                        _e.sent();
                        _e.label = 59;
                    case 59:
                        j += 1;
                        return [3 /*break*/, 57];
                    case 60:
                        i += 1;
                        return [3 /*break*/, 56];
                    case 61:
                        dest = path_1.join(manifestDir, "songs_dlc_" + options.tag + ".hsan");
                        return [4 /*yield*/, fs_extra_1.move(options.songs.hsan, dest, {
                                overwrite: true,
                            })];
                    case 62:
                        _e.sent();
                        gamex = path_1.join(root, "gamexblocks/nsongs");
                        return [4 /*yield*/, PSARC.existsAsync(gamex)];
                    case 63:
                        exists = _e.sent();
                        if (!!exists) return [3 /*break*/, 65];
                        return [4 /*yield*/, fs_extra_1.mkdirp(gamex)];
                    case 64:
                        _e.sent();
                        _e.label = 65;
                    case 65: return [4 /*yield*/, generic_1.GENERIC.generateXBlock(options.songs.arrangements, options.tag, gamex)];
                    case 66:
                        _e.sent();
                        return [2 /*return*/, root];
                }
            });
        });
    };
    PSARC.packDirectory = function (packDir, outDir, tag, extra, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var plat, psarcFilename, listingFileName, files, entries, zLengths, prevOffset, _loop_1, this_1, s, i, state_1, bNum, headerSize, bom, bomBuffer, bomEncrypted, header, result, ph, i, entry, j;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plat = platform == common_1.Platform.Windows ? "p" : "m";
                        psarcFilename = path_1.join(outDir, "" + tag + extra + "_" + plat + ".psarc");
                        listingFileName = "NamesBlock.bin";
                        return [4 /*yield*/, this.getFiles(packDir)];
                    case 1:
                        files = _a.sent();
                        entries = [];
                        zLengths = [];
                        files = __spread([listingFileName], files);
                        prevOffset = 0;
                        _loop_1 = function (i) {
                            var f, isSNG, name_1, rawData, _a, magic, ph_1, blocks_1, origLengths, zippedBlocks, localLengths, totalLength, localZLengths, totalZLength, modZLengths, item, e_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        f = files[i];
                                        isSNG = f.endsWith(".sng");
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 10, , 11]);
                                        name_1 = f.replace(packDir + "/", "");
                                        if (!(name_1 === listingFileName)) return [3 /*break*/, 2];
                                        _a = Buffer.from(files
                                            .slice(1, files.length)
                                            .map(function (i) { return i.replace(packDir + "/", ""); })
                                            .join("\n"));
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, fs_1.promises.readFile(f)];
                                    case 3:
                                        _a = _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        rawData = _a;
                                        if (!isSNG) return [3 /*break*/, 8];
                                        magic = Buffer.from(rawData.slice(0, 4)).readInt32LE(0);
                                        ph_1 = Buffer.from(rawData.slice(4, 8)).readInt32LE(0);
                                        if (!(magic == 0x4A && ph_1 == 3)) return [3 /*break*/, 5];
                                        return [3 /*break*/, 8];
                                    case 5:
                                        //console.log("packdir", "unpacked sng", f);
                                        s = new sng_1.SNG(f, platform);
                                        return [4 /*yield*/, s.parse()];
                                    case 6:
                                        _b.sent();
                                        return [4 /*yield*/, s.pack()];
                                    case 7:
                                        _b.sent();
                                        if (s.packedData) {
                                            rawData = s.packedData;
                                        }
                                        _b.label = 8;
                                    case 8:
                                        blocks_1 = this_1.chunks(rawData, PSARCParser.BLOCK_SIZE);
                                        origLengths = blocks_1.map(function (i) { return i.length; });
                                        return [4 /*yield*/, Promise.all(blocks_1.map(function (b, idx) { return __awaiter(_this, void 0, void 0, function () {
                                                var packed, packedLen, plainLen, blockToReturn;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, PSARCParser.zip(b)];
                                                        case 1:
                                                            packed = _a.sent();
                                                            packedLen = packed.length;
                                                            plainLen = blocks_1[idx].length;
                                                            blockToReturn = null;
                                                            if (packedLen < plainLen)
                                                                blockToReturn = packed;
                                                            else
                                                                blockToReturn = blocks_1[idx];
                                                            //console.log(name, "block", idx, isPacked);
                                                            return [2 /*return*/, blockToReturn];
                                                    }
                                                });
                                            }); }))];
                                    case 9:
                                        zippedBlocks = _b.sent();
                                        localLengths = blocks_1.map(function (i) { return i.length; });
                                        totalLength = localLengths.reduce(function (p, v) { return p + v; });
                                        localZLengths = zippedBlocks.map(function (i) { return i.length; });
                                        totalZLength = localZLengths.reduce(function (p, v) { return p + v; });
                                        modZLengths = localZLengths.map(function (i) { return i % PSARCParser.BLOCK_SIZE; });
                                        item = {
                                            name: name_1,
                                            origLengths: origLengths,
                                            zippedBlocks: zippedBlocks,
                                            zLengths: localZLengths,
                                            modZLengths: modZLengths,
                                            totalLength: totalLength,
                                            zIndex: zLengths.length,
                                            offset: prevOffset,
                                        };
                                        zLengths = zLengths.concat(modZLengths);
                                        prevOffset += totalZLength;
                                        entries.push(item);
                                        return [3 /*break*/, 11];
                                    case 10:
                                        e_1 = _b.sent();
                                        console.log("failed to pack entry", f);
                                        console.log(e_1);
                                        return [2 /*return*/, { value: null }];
                                    case 11: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < files.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 4;
                    case 4:
                        i += 1;
                        return [3 /*break*/, 2];
                    case 5:
                        bNum = Math.log(PSARCParser.BLOCK_SIZE) / Math.log(256);
                        headerSize = ((32 + (entries.length * 30) + (zLengths.length * bNum)));
                        bom = {
                            entries: entries.map(function (item) {
                                var lBuffer = Buffer.alloc(5).fill(0);
                                var oBuffer = Buffer.alloc(5).fill(0);
                                lBuffer.writeUInt32BE(item.totalLength, 1);
                                oBuffer.writeUInt32BE(item.offset + headerSize, 1);
                                //console.log(item.name, item.zIndex, item.totalLength, item.offset + headerSize);
                                return {
                                    md5: crypto
                                        .createHash('md5', { encoding: 'ascii' })
                                        .update(item.name)
                                        .digest("hex"),
                                    zindex: item.zIndex,
                                    length: lBuffer,
                                    offset: oBuffer,
                                };
                            }),
                            zlength: zLengths,
                        };
                        bomBuffer = PSARCParser.BOM(entries.length).encode(bom);
                        bomEncrypted = Buffer.from(PSARCParser.BOMEncrypt(bomBuffer)).slice(0, bomBuffer.length);
                        header = {
                            MAGIC: 'PSAR',
                            VERSION: 65540,
                            COMPRESSION: 'zlib',
                            header_size: headerSize,
                            ENTRY_SIZE: 30,
                            n_entries: entries.length,
                            BLOCK_SIZE: PSARCParser.BLOCK_SIZE,
                            ARCHIVE_FLAGS: 4,
                            bom: bomEncrypted,
                        };
                        result = Buffer.alloc(0);
                        ph = PSARCParser.HEADER.encode(header);
                        result = Buffer.concat([ph]);
                        for (i = 0; i < entries.length; i += 1) {
                            entry = entries[i];
                            for (j = 0; j < entry.zippedBlocks.length; j += 1) {
                                result = Buffer.concat([result, entry.zippedBlocks[j]]);
                            }
                        }
                        return [4 /*yield*/, fs_1.promises.writeFile(psarcFilename, result)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, psarcFilename];
                }
            });
        });
    };
    PSARC.getFiles = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var dirents, files;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, readdir(dir, { withFileTypes: true })];
                    case 1:
                        dirents = _b.sent();
                        return [4 /*yield*/, Promise.all(dirents.map(function (dirent) {
                                var res = resolve(dir, dirent.name);
                                return dirent.isDirectory() ? _this.getFiles(res) : res;
                            }))];
                    case 2:
                        files = _b.sent();
                        return [2 /*return*/, (_a = Array.prototype).concat.apply(_a, __spread(files))];
                }
            });
        });
    };
    PSARC.chunks = function (buffer, chunkSize) {
        var result = [];
        var len = buffer.length;
        var i = 0;
        while (i < len) {
            result.push(buffer.slice(i, i += chunkSize));
        }
        return result;
    };
    return PSARC;
}());
exports.PSARC = PSARC;
