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
var path_1 = require("path");
var fs_1 = require("fs");
var common_1 = require("./types/common");
var TagType;
(function (TagType) {
    TagType["tag"] = "tag";
    TagType["llid"] = "llid";
    TagType["canonical"] = "canonical";
    TagType["name"] = "name";
    TagType["relpath"] = "relpath";
    TagType["logpath"] = "logpath";
})(TagType = exports.TagType || (exports.TagType = {}));
var TagValue;
(function (TagValue) {
    TagValue["Database"] = "database";
    TagValue["JsonDB"] = "json-db";
    TagValue["HsanDB"] = "hsan-db";
    TagValue["Application"] = "application";
    TagValue["MusicgameSong"] = "musicgame-song";
    TagValue["DDS"] = "dds";
    TagValue["Image"] = "image";
    TagValue["XML"] = "xml";
    TagValue["Audio"] = "audio";
    TagValue["WwiseSoundBank"] = "wwise-sound-bank";
    TagValue["DX9"] = "dx9";
    TagValue["MacOS"] = "macos";
    TagValue["EmergentWorld"] = "emergent-world";
    TagValue["XWorld"] = "x-world";
    TagValue["GamebryoSceneGraph"] = "gamebryo-scenegraph";
})(TagValue = exports.TagValue || (exports.TagValue = {}));
var GraphItem = /** @class */ (function () {
    function GraphItem() {
        var _this = this;
        this.name = "";
        this.canonical = "";
        this.relpath = "";
        this.tags = [];
        this.serialize = function () {
            var template = function (one, two) { return "<urn:uuid:" + _this.uuid + "> <http://" + ("emergent.net/aweb/1.0/" + one + "> \"" + two + "\".\n"); };
            var data = "";
            _this.tags.forEach(function (item) {
                data += template(TagType.tag, item);
            });
            data += template(TagType.canonical, _this.canonical);
            data += template(TagType.name, _this.name);
            data += template(TagType.relpath, _this.relpath);
            //data += "\n"; //debug
            return data;
        };
        this.uuid = getUuid();
    }
    return GraphItem;
}());
exports.GraphItem = GraphItem;
var GraphItemLLID = /** @class */ (function () {
    function GraphItemLLID() {
        var _this = this;
        this.llid = "";
        this.name = "";
        this.canonical = "";
        this.relpath = "";
        this.logpath = "";
        this.tags = [];
        this.serialize = function () {
            var template = function (one, two) { return "<urn:uuid:" + _this.uuid + "> <http://" + ("emergent.net/aweb/1.0/" + one + "> \"" + two + "\".\n"); };
            var data = "";
            _this.tags.forEach(function (item) {
                data += template(TagType.tag, item);
            });
            data += template(TagType.canonical, _this.canonical);
            data += template(TagType.name, _this.name);
            data += template(TagType.relpath, _this.relpath);
            data += template(TagType.llid, "" + _this.llid);
            data += template(TagType.logpath, _this.logpath);
            //data += "\n"; //debug
            return data;
        };
        this.uuid = getUuid();
    }
    return GraphItemLLID;
}());
exports.GraphItemLLID = GraphItemLLID;
function generate(dir, tag, details, platform) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, file, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileName = tag + "_aggregategraph.nt";
                    file = path_1.join(dir, fileName);
                    data = "";
                    data += addJSON(tag, details);
                    data += addHSAN(tag);
                    data += addXML(tag, details);
                    data += addSNG(tag, details, platform);
                    data += addDDS(tag);
                    data += addBNK(tag, platform);
                    data += addXBLOCK(tag);
                    return [4 /*yield*/, fs_1.promises.writeFile(file, data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, file];
            }
        });
    });
}
exports.generate = generate;
function addJSON(tag, details) {
    var data = "";
    var keys = Object.keys(details);
    var values = Object.values(details);
    for (var i = 0; i < keys.length; i += 1) {
        var count = values[i];
        var type = keys[i];
        if (count > 0) {
            for (var j = 1; j <= count; j += 1) {
                var arr = type;
                var json = new GraphItem();
                json.name = tag + "_" + arr + (j > 1 ? j : "");
                json.canonical = "/manifests/songs_dlc_" + tag;
                json.tags = [TagValue.Database, TagValue.JsonDB];
                json.relpath = json.canonical + "/" + json.name + ".json";
                data += json.serialize();
            }
        }
    }
    return data;
}
function addHSAN(tag) {
    var data = "";
    var json = new GraphItem();
    json.name = "songs_dlc_" + tag;
    json.canonical = "/manifests/songs_dlc_" + tag;
    json.tags = [TagValue.Database, TagValue.HsanDB];
    json.relpath = json.canonical + "/" + json.name + ".hsan";
    data += json.serialize();
    return data;
}
function addXML(tag, details) {
    var data = "";
    var keys = Object.keys(details);
    var values = Object.values(details);
    for (var i = 0; i < keys.length; i += 1) {
        var count = values[i];
        var type = keys[i];
        if (count > 0) {
            for (var j = 1; j <= count; j += 1) {
                var arr_1 = type;
                var xml = new GraphItemLLID();
                xml.name = tag + "_" + arr_1 + (j > 1 ? j : "");
                xml.canonical = "/songs/arr";
                xml.tags = [TagValue.Application, TagValue.XML];
                xml.relpath = xml.canonical + "/" + xml.name + ".xml";
                xml.logpath = xml.canonical + "/" + xml.name + ".xml";
                xml.llid = getUuid().split("").map(function (v, index) { return (index > 8 && v != '-') ? 0 : v; }).join("");
                data += xml.serialize();
            }
        }
    }
    /* add showlights */
    var arr = "showlights";
    var xml = new GraphItemLLID();
    xml.name = tag + "_" + arr;
    xml.canonical = "/songs/arr";
    xml.tags = [TagValue.Application, TagValue.XML];
    xml.relpath = xml.canonical + "/" + xml.name + ".xml";
    xml.logpath = xml.canonical + "/" + xml.name + ".xml";
    xml.llid = getUuid().split("").map(function (v, index) { return (index > 8 && v != '-') ? 0 : v; }).join("");
    data += xml.serialize();
    return data;
}
function addSNG(tag, details, platform) {
    var data = "";
    var keys = Object.keys(details);
    var values = Object.values(details);
    for (var i = 0; i < keys.length; i += 1) {
        var count = values[i];
        var type = keys[i];
        if (count > 0) {
            for (var j = 1; j <= count; j += 1) {
                var arr = type;
                var sng = new GraphItemLLID();
                sng.name = tag + "_" + arr + (j > 1 ? j : "");
                sng.canonical = "/songs/bin/" + (platform === common_1.Platform.Mac ? "macos" : "generic");
                sng.tags = [TagValue.Application, TagValue.MusicgameSong];
                sng.relpath = sng.canonical + "/" + sng.name + ".sng";
                sng.logpath = sng.canonical + "/" + sng.name + ".sng";
                sng.llid = getUuid().split("").map(function (v, index) { return (index > 8 && v != '-') ? 0 : v; }).join("");
                data += sng.serialize();
            }
        }
    }
    return data;
}
function addDDS(tag) {
    var data = "";
    var ress = [256, 128, 64];
    for (var i = 0; i < ress.length; i += 1) {
        var dds = new GraphItemLLID();
        var res = ress[i];
        dds.name = "album_" + tag + "_" + res;
        dds.canonical = "/gfxassets/album_art";
        dds.tags = [TagValue.DDS, TagValue.Image];
        dds.relpath = dds.canonical + "/" + dds.name + ".dds";
        dds.logpath = dds.canonical + "/" + dds.name + ".dds";
        dds.llid = getUuid().split("").map(function (v, index) { return (index > 8 && v != '-') ? 0 : v; }).join("");
        data += dds.serialize();
    }
    return data;
}
function addBNK(tag, platform) {
    var data = "";
    var ress = 2;
    for (var i = 0; i < ress; i += 1) {
        var bnk = new GraphItemLLID();
        var extra = i === 1 ? "_preview" : "";
        bnk.name = "song_" + tag + extra;
        bnk.canonical = "/audio/" + (platform === common_1.Platform.Mac ? "mac" : "windows");
        bnk.tags = [TagValue.Audio, TagValue.WwiseSoundBank, platform === common_1.Platform.Mac ? TagValue.MacOS : TagValue.DX9];
        bnk.relpath = bnk.canonical + "/" + bnk.name + ".bnk";
        bnk.logpath = bnk.canonical + "/" + bnk.name + ".bnk";
        bnk.llid = getUuid().split("").map(function (v, index) { return (index > 8 && v != '-') ? 0 : v; }).join("");
        data += bnk.serialize();
    }
    return data;
}
function addXBLOCK(tag) {
    var data = "";
    var xblock = new GraphItem();
    xblock.name = "" + tag;
    xblock.canonical = "/gamexblocks/nsongs";
    xblock.tags = [TagValue.EmergentWorld, TagValue.XWorld];
    xblock.relpath = xblock.canonical + "/" + xblock.name + ".xblock";
    data += xblock.serialize();
    return data;
}
var getUuid = function (a) {
    if (a === void 0) { a = ''; }
    return (a
        /* eslint-disable no-bitwise */
        ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
        : (1e7 + "-" + 1e3 + "-" + 4e3 + "-" + 8e3 + "-" + 1e11).replace(/[018]/g, getUuid));
};
