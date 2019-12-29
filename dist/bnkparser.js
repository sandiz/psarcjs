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
var fs_1 = require("fs");
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
exports.HEADER = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
})
    .int32("chunkSize")
    .int32("soundbankVersion")
    .int32("soundbankID")
    .int32("languageID")
    .int32("hasFeedback")
    .buffer("padding", {
    length: 12,
});
exports.DIDX = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
})
    .int32("chunkSize")
    .int32("fileID")
    .int32("fileOffset")
    .int32("fileSize");
exports.DATA = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
})
    .int32("chunkSize")
    .buffer("data", {
    length: "chunkSize"
});
exports.HIRCSOUND = new binary_parser_1.Parser()
    .endianess("little")
    .uint32("soundID")
    .uint32("pluginID")
    .uint32("streamType")
    .uint32("fileID")
    .uint32("sourceID")
    .int8("languageSpecific")
    .int8("overrideParent")
    .int8("numFX")
    .uint32("parentBusID")
    .uint32("directParentID")
    .uint32("unkID1")
    .int32("mixerID")
    .int8("priorityOverrideParent")
    .int8("priorityApplyDist")
    .int8("overrideMidi")
    .int8("numParam")
    .int8("param1Type")
    .int8("param2Type")
    .int8("param3Type")
    .floatle("param1Value")
    .int32("param2Value")
    .int32("param3Value")
    .int8("numRange")
    .int8("positionOverride")
    .int8("overrideGameAux")
    .int8("useGameAux")
    .int8("overrideUserAux")
    .int8("hasAux")
    .int8("virtualQueueBehavior")
    .int8("killNewest")
    .int8("useVirtualBehavior")
    .int16("maxNumInstance")
    .int8("isGlobalLimit")
    .int8("belowThresholdBehavior")
    .int8("isMaxNumInstOverrideParent")
    .int8("isVVoiceOptOverrideParent")
    .int32("stateGroupList")
    .int16("rtpcList")
    .int32("feedbackBus");
exports.HIRCACTORMIXER = new binary_parser_1.Parser()
    .endianess("little")
    .uint32("mixerID")
    .int8("overrideParent")
    .int8("numFX")
    .uint32("parentBusID")
    .int32("directParentID")
    .int32("unkID1")
    .int32("unkID2")
    .int8("priorityOverrideParent")
    .int8("priorityApplyDist")
    .int8("numParam")
    .int8("numRange")
    .int8("positionOverride")
    .int8("overrideGameAux")
    .int8("useGameAux")
    .int8("overrideUserAux")
    .int8("hasAux")
    .int8("virtualQueueBehavior")
    .int8("killNewest")
    .int8("useVirtualBehavior")
    .int16("maxNumInstance")
    .int8("isGlobalLimit")
    .int8("belowThresholdBehavior")
    .int8("isMaxNumInstOverrideParent")
    .int8("isVVoiceOptOverrideParent")
    .int32("stateGroupList")
    .int16("rtpcList")
    .int32("numchild")
    .int32("child1");
exports.HIRCACTION = new binary_parser_1.Parser()
    .endianess("little")
    .int32("actionID")
    .int16("actionType")
    .int32("objectID")
    .int8("isBus")
    .int8("numParam")
    .int8("numRange")
    .int8("fadeCurve")
    .int32("soundbankID");
exports.HIRCEVENT = new binary_parser_1.Parser()
    .endianess("little")
    .int32("eventID")
    .int32("numEvents")
    .int32("actionID");
exports.HIERARCHY = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
})
    .int32("chunkSize")
    .int32("numObjects")
    .int8("HIRC_SOUND")
    .int32("HIRC_SOUND_size")
    .nest("sound", {
    type: exports.HIRCSOUND,
})
    .int8("HIRC_ACTOR_MIXER")
    .int32("HIRC_ACTOR_MIXER_size")
    .nest("actor_mixer", {
    type: exports.HIRCACTORMIXER,
})
    .int8("HIRC_ACTION")
    .int32("HIRC_ACTION_size")
    .nest("action", {
    type: exports.HIRCACTION,
})
    .int8("HIRC_EVENT")
    .int32("HIRC_EVENT_size")
    .nest("event", {
    type: exports.HIRCEVENT,
});
exports.STID = new binary_parser_1.Parser()
    .endianess("little")
    .string("magic", {
    length: 4,
})
    .int32("chunkSize")
    .int32("stringType")
    .int32("numNames")
    .int32("soundbankID")
    .int8("len")
    .string("soundbankName", {
    length: "len",
    encoding: "ascii"
});
exports.BNKDATA = new binary_parser_1.Parser()
    .endianess("little")
    .nest("header", {
    type: exports.HEADER,
})
    .nest("didx", {
    type: exports.DIDX,
})
    .nest("data", {
    type: exports.DATA,
})
    .nest("hierarchy", {
    type: exports.HIERARCHY,
})
    .nest("strings", {
    type: exports.STID,
});
function generate(dir, wemFile, tag, rename, preview) {
    return __awaiter(this, void 0, void 0, function () {
        var orig, soundbankID, fileID, soundID, dataBuffer, header, didx, dataChunk, strings, hierarchy, data, bnkData, fileName, p, dest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orig = wemFile;
                    soundbankID = getRandomInt();
                    fileID = getRandomInt();
                    soundID = getRandomInt();
                    return [4 /*yield*/, fs_1.promises.readFile(wemFile)];
                case 1:
                    dataBuffer = _a.sent();
                    dataBuffer = dataBuffer.slice(0, 51200);
                    header = getHeader(soundbankID);
                    exports.HEADER.parse(exports.HEADER.encode(header));
                    didx = getDIDX(fileID, dataBuffer.length);
                    exports.DIDX.parse(exports.DIDX.encode(didx));
                    dataChunk = getDataChunk(dataBuffer);
                    exports.DATA.parse(exports.DATA.encode(dataChunk));
                    strings = getStringID(soundbankID, tag);
                    exports.STID.parse(exports.STID.encode(strings));
                    hierarchy = getHierarchy(soundbankID, fileID, soundID, tag, preview);
                    exports.HIERARCHY.parse(exports.HIERARCHY.encode(hierarchy));
                    data = {
                        header: header,
                        didx: didx,
                        data: dataChunk,
                        hierarchy: hierarchy,
                        strings: strings,
                    };
                    bnkData = exports.BNKDATA.encode(data);
                    exports.BNKDATA.parse(bnkData);
                    fileName = "Song_" + tag + (preview ? "_Preview" : "") + ".bnk";
                    p = path_1.join(dir, fileName);
                    return [4 /*yield*/, fs_1.promises.writeFile(p, bnkData)];
                case 2:
                    _a.sent();
                    if (!rename) return [3 /*break*/, 4];
                    dest = path_1.join(dir, fileID + ".wem");
                    return [4 /*yield*/, fs_extra_1.copy(wemFile, dest)];
                case 3:
                    _a.sent();
                    wemFile = dest;
                    _a.label = 4;
                case 4: return [2 /*return*/, {
                        input: orig,
                        wem: wemFile,
                        bnk: p,
                        fileID: fileID,
                        soundbankID: soundbankID,
                        soundID: soundID,
                    }];
            }
        });
    });
}
exports.generate = generate;
function getHierarchy(soundbankID, fileID, soundID, soundbankName, preview) {
    var mixerID = 650605636;
    var actionID = getRandomInt();
    var DEFAULT_AUDIO_VOLUME = -7.0;
    var DEFAULT_PREVIEW_VOLUME = -5.0;
    var sound = {
        soundID: soundID,
        pluginID: 262145,
        streamType: 2,
        fileID: fileID,
        sourceID: fileID,
        languageSpecific: 0,
        overrideParent: 0,
        numFX: 0,
        parentBusID: getRandomInt(),
        directParentID: 65536,
        unkID1: (preview) ? 4178100890 : 0,
        mixerID: mixerID,
        priorityOverrideParent: 0,
        priorityApplyDist: 0,
        overrideMidi: 0,
        numParam: 3,
        param1Type: 0,
        param2Type: 46,
        param3Type: 47,
        param1Value: preview ? DEFAULT_PREVIEW_VOLUME : DEFAULT_AUDIO_VOLUME,
        param2Value: 1,
        param3Value: 3,
        numRange: 0,
        positionOverride: 0,
        overrideGameAux: 0,
        useGameAux: 0,
        overrideUserAux: 0,
        hasAux: 0,
        virtualQueueBehavior: preview ? 1 : 0,
        killNewest: preview ? 1 : 0,
        useVirtualBehavior: 0,
        maxNumInstance: preview ? 1 : 0,
        isGlobalLimit: 0,
        belowThresholdBehavior: 0,
        isMaxNumInstOverrideParent: preview ? 1 : 0,
        isVVoiceOptOverrideParent: 0,
        stateGroupList: 0,
        rtpcList: 0,
        feedbackBus: 0,
    };
    var sObj = exports.HIRCSOUND.encode(sound);
    var actor_mixer = {
        mixerID: mixerID,
        overrideParent: 0,
        numFX: 0,
        parentBusID: 2616261673,
        directParentID: 0,
        unkID1: 0,
        unkID2: 65792,
        priorityOverrideParent: 0,
        priorityApplyDist: 0,
        numParam: 0,
        numRange: 0,
        positionOverride: 0,
        overrideGameAux: 0,
        useGameAux: 0,
        overrideUserAux: 0,
        hasAux: 0,
        virtualQueueBehavior: 0,
        killNewest: 0,
        useVirtualBehavior: 0,
        maxNumInstance: 0,
        isGlobalLimit: 0,
        belowThresholdBehavior: 0,
        isMaxNumInstOverrideParent: 0,
        isVVoiceOptOverrideParent: 0,
        stateGroupList: 0,
        rtpcList: 0,
        numChild: 1,
        child1: soundID,
    };
    var aMObj = exports.HIRCACTORMIXER.encode(actor_mixer);
    var action = {
        actionID: actionID,
        actionType: 1027,
        objectID: soundID,
        isBus: 0,
        numParam: 0,
        numRange: 0,
        fadeCurve: 4,
        soundbankID: soundbankID
    };
    var aObj = exports.HIRCACTION.encode(action);
    var event = {
        eventID: hashString("Play_" + soundbankName),
        numEvents: 1,
        actionID: actionID,
    };
    var eObj = exports.HIRCEVENT.encode(event);
    var hirc = {
        magic: "HIRC",
        chunkSize: 4 + (1 + 4 + sObj.length) + (1 + 4 + aMObj.length) + (1 + 4 + aObj.length) + (1 + 4 + eObj.length),
        numObjects: 4,
        HIRC_SOUND: 2,
        HIRC_SOUND_size: sObj.length,
        sound: sound,
        HIRC_ACTOR_MIXER: 7,
        HIRC_ACTOR_MIXER_size: aMObj.length,
        actor_mixer: actor_mixer,
        HIRC_ACTION: 3,
        HIRC_ACTION_size: aObj.length,
        action: action,
        HIRC_EVENT: 4,
        HIRC_EVENT_size: eObj.length,
        event: event,
    };
    //const o = (HIERARCHY as any).encode(hirc);
    return hirc;
}
function getStringID(soundbankID, tag) {
    var obj = {
        magic: "STID",
        chunkSize: 12,
        stringType: 1,
        numNames: 1,
        soundbankID: soundbankID,
        len: tag.length,
        soundbankName: tag,
    };
    //const o = (STID as any).encode(obj);
    return obj;
}
function getDataChunk(data) {
    var obj = {
        magic: 'DATA',
        chunkSize: data.length,
        data: data
    };
    //const o = (DATA as any).encode(obj);
    return obj;
}
function getDIDX(fileID, dataChunkLength) {
    var obj = {
        magic: 'DIDX',
        chunkSize: 12,
        fileID: fileID,
        fileOffset: 0,
        fileSize: dataChunkLength
    };
    //const o = (DIDX as any).encode(obj);
    return obj;
}
function getHeader(soundbankID) {
    var obj = {
        magic: "BKHD",
        chunkSize: 28,
        soundbankVersion: 91,
        soundbankID: soundbankID,
        languageID: 0,
        hasFeedback: 0,
        padding: Buffer.alloc(12, 0),
    };
    //const o = (HEADER as any).encode(obj);
    return obj;
}
function getRandomInt() {
    var min = 0;
    var max = 2147483647;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function hashString(str) {
    var bytes = Buffer.from(str.toLowerCase());
    var hash = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
        hash *= 16777619;
        hash = hash ^ bytes[i];
    }
    return hash;
}
