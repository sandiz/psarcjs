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
var path_1 = require("path");
var xml2js = __importStar(require("xml2js"));
var aggregategraphwriter_1 = require("./aggregategraphwriter");
var common_1 = require("./common");
var pkgInfo = require("../package.json");
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
                            var _a;
                            switch (item) {
                                case "Header":
                                    return ptypePrefix[index] + "songs_dlc_" + tag;
                                case "SngAsset":
                                case "Manifest":
                                    return "" + ptypePrefix[index] + tag + "_" + ((_a = arr.header) === null || _a === void 0 ? void 0 : _a.arrangementName.toLowerCase());
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
                            var _a, _b, _c;
                            return {
                                $: {
                                    id: (_a = item.header) === null || _a === void 0 ? void 0 : _a.persistentID.toLowerCase(),
                                    modelName: "RSEnumerable_Song",
                                    name: tag + "_" + common_1.toTitleCase((_c = (_b = item.header) === null || _b === void 0 ? void 0 : _b.arrangementName.toLowerCase(), (_c !== null && _c !== void 0 ? _c : ''))),
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
                        builder = new xml2js.Builder({
                            xmldec: {
                                version: "1.0",
                            }
                        });
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
exports.GENERIC = GENERIC;
