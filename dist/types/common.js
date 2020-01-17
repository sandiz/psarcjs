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
var xml2js = __importStar(require("xml2js"));
var path_1 = require("path");
var __1 = require("..");
var song2014_1 = require("../song2014");
var aggregategraphwriter_1 = require("../aggregategraphwriter");
var bnkparser_1 = require("../bnkparser");
var sng_1 = require("./sng");
var sngparser_1 = require("../sngparser");
var Platform;
(function (Platform) {
    Platform[Platform["Windows"] = 0] = "Windows";
    Platform[Platform["Mac"] = 1] = "Mac";
})(Platform = exports.Platform || (exports.Platform = {}));
var ArrangementTypeInt;
(function (ArrangementTypeInt) {
    ArrangementTypeInt[ArrangementTypeInt["LEAD"] = 0] = "LEAD"; /* Single notes */
    ArrangementTypeInt[ArrangementTypeInt["RHYTHM"] = 1] = "RHYTHM"; /* Chords */
    ArrangementTypeInt[ArrangementTypeInt["COMBO"] = 2] = "COMBO"; /* Combo */
    ArrangementTypeInt[ArrangementTypeInt["BASS"] = 3] = "BASS";
    ArrangementTypeInt[ArrangementTypeInt["VOCALS"] = 4] = "VOCALS";
    ArrangementTypeInt[ArrangementTypeInt["JVOCALS"] = 5] = "JVOCALS";
    ArrangementTypeInt[ArrangementTypeInt["SHOWLIGHTS"] = 6] = "SHOWLIGHTS";
})(ArrangementTypeInt = exports.ArrangementTypeInt || (exports.ArrangementTypeInt = {}));
;
var ArrangementType;
(function (ArrangementType) {
    ArrangementType["LEAD"] = "lead";
    ArrangementType["RHYTHM"] = "rhythm";
    ArrangementType["BASS"] = "bass";
    ArrangementType["VOCALS"] = "vocals";
    ArrangementType["SHOWLIGHTS"] = "showlights";
})(ArrangementType = exports.ArrangementType || (exports.ArrangementType = {}));
var RouteMask;
(function (RouteMask) {
    RouteMask[RouteMask["None"] = 0] = "None";
    RouteMask[RouteMask["Lead"] = 1] = "Lead";
    RouteMask[RouteMask["Rhythm"] = 2] = "Rhythm";
    RouteMask[RouteMask["Any"] = 3] = "Any";
    RouteMask[RouteMask["Bass"] = 4] = "Bass";
})(RouteMask = exports.RouteMask || (exports.RouteMask = {}));
var DNAId;
(function (DNAId) {
    DNAId[DNAId["None"] = 0] = "None";
    DNAId[DNAId["Solo"] = 1] = "Solo";
    DNAId[DNAId["Riff"] = 2] = "Riff";
    DNAId[DNAId["Chord"] = 3] = "Chord";
})(DNAId = exports.DNAId || (exports.DNAId = {}));
var URN_TEMPLATE = function (a, b, c) { return "urn:" + a + ":" + b + ":" + c; };
var URN_TEMPLATE_SHORT = function (a, b) { return "urn:" + a + ":" + b; };
var AttributesHeader = /** @class */ (function () {
    function AttributesHeader() {
        /* AttributesHeader2014 */
        this.albumArt = '';
        this.albumName = '';
        this.albumNameSort = '';
        this.arrangementName = '';
        this.artistName = '';
        this.artistNameSort = '';
        this.bassPick = 0;
        this.capoFret = 0;
        this.centOffset = 0;
        this.dLC = false;
        this.dLCKey = '';
        this.dnaChords = 0;
        this.dnaRiffs = 0;
        this.dnaSolo = 0;
        this.easyMastery = 0;
        this.leaderboardChallengeRating = 0;
        this.manifestUrn = '';
        this.masterID_RDV = 0;
        this.metronome = 0;
        this.mediumMastery = 0;
        this.notesEasy = 0;
        this.notesHard = 0;
        this.notesMedium = 0;
        this.representative = 0;
        this.routeMask = 0;
        this.shipping = false;
        this.sKU = '';
        this.songDiffEasy = 0;
        this.songDiffHard = 0;
        this.songDiffMed = 0;
        this.songDifficulty = 0;
        this.songKey = '';
        this.songLength = 0;
        this.songName = '';
        this.songNameSort = '';
        this.songYear = 0;
        this.tuning = {
            string0: 0, string1: 0, string2: 0,
            string3: 0, string4: 0, string5: 0
        };
        this.persistentID = '';
    }
    return AttributesHeader;
}());
exports.AttributesHeader = AttributesHeader;
var Attributes = /** @class */ (function () {
    function Attributes() {
        /* Attributes2014 */
        this.arrangementProperties = new song2014_1.SongArrangementProperties();
        this.arrangementSort = 0;
        this.arrangementType = ArrangementTypeInt.VOCALS;
        this.blockAsset = '';
        this.chords = {};
        this.chordTemplates = [];
        this.dynamicVisualDensity = [];
        this.fullName = '';
        this.lastConversionDateTime = '';
        this.masterID_PS3 = 0;
        this.masterID_XBox360 = 0;
        this.maxPhraseDifficulty = 0;
        this.phraseIterations = [];
        this.phrases = [];
        this.previewBankPath = '';
        this.relativeDifficulty = 0;
        this.score_MaxNotes = 0;
        this.score_PNV = 0;
        this.sections = [];
        this.showlightsXML = '';
        this.songAsset = '';
        this.songAverageTempo = 0;
        this.songBank = '';
        this.songEvent = '';
        this.songOffset = 0;
        this.songPartition = 0;
        this.songXml = '';
        this.targetScore = 0;
        this.techniques = {};
        this.tone_A = '';
        this.tone_B = '';
        this.tone_Base = '';
        this.tone_C = '';
        this.tone_D = '';
        this.tone_Multiplayer = '';
        this.tones = [];
        this.inputEvent = '';
        this.songVolume = 0;
        this.previewVolume = 0;
    }
    return Attributes;
}());
exports.Attributes = Attributes;
/* represents an arrangment in psarc */
var Arrangement = /** @class */ (function () {
    function Arrangement(song, sng, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        this.header = new AttributesHeader();
        this.main = new Attributes();
        this.arrType = ArrangementType[song.arrangement.toUpperCase()];
        this.main.arrangementType = ArrangementTypeInt[song.arrangement.toUpperCase()];
        this.header.arrangementName = __1.toTitleCase(song.arrangement);
        var masterID = this.main.arrangementType == ArrangementTypeInt.VOCALS ? -1 : bnkparser_1.getRandomInt();
        var pID = (_b = (_a = options.info) === null || _a === void 0 ? void 0 : _a.persistentID, (_b !== null && _b !== void 0 ? _b : aggregategraphwriter_1.getUuid().replace(/-/g, "").toUpperCase()));
        var dlcName = options.tag.toLowerCase();
        var xblockUrn = URN_TEMPLATE_SHORT(aggregategraphwriter_1.TagValue.EmergentWorld, dlcName);
        var showlightUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.XML, dlcName + "_showlights");
        var songXmlUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.XML, dlcName + "_" + this.arrType);
        var songSngUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.MusicgameSong, dlcName + "_" + this.arrType);
        var albumUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Image, aggregategraphwriter_1.TagValue.DDS, "album_" + options.tag.toLowerCase());
        var jsonUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Database, aggregategraphwriter_1.TagValue.JsonDB, dlcName + "_" + this.arrType);
        this.song2014 = song;
        this.header.albumArt = albumUrn;
        this.header.dLCKey = options.tag;
        this.header.songKey = options.tag;
        this.header.leaderboardChallengeRating = 0;
        this.header.manifestUrn = jsonUrn;
        this.header.shipping = true;
        this.header.dLC = true;
        this.header.sKU = "RS2";
        this.header.persistentID = pID;
        this.header.masterID_RDV = masterID;
        this.main.arrangementSort = options.sortOrder;
        this.main.blockAsset = xblockUrn;
        this.main.fullName = options.tag + "_" + __1.toTitleCase(this.arrType);
        this.main.masterID_PS3 = masterID;
        this.main.masterID_XBox360 = masterID;
        this.main.previewBankPath = "song_" + dlcName + "_preview.bnk";
        this.main.relativeDifficulty = 0;
        this.main.showlightsXML = showlightUrn;
        this.main.songAsset = songSngUrn;
        this.main.songBank = "song_" + dlcName + ".bnk";
        this.main.songEvent = "Play_" + options.tag;
        this.main.songXml = songXmlUrn;
        this.main.songVolume = options.volume;
        this.main.previewVolume = options.previewVolume;
        if (this.main.arrangementType == ArrangementTypeInt.VOCALS)
            this.main.inputEvent = "Play_Tone_Standard_Mic";
        else
            delete (this.main.inputEvent);
        this.main.songPartition = options.info ? options.info.currentPartition : 0;
        this.header.albumName = options.info ? options.info.albumName : song.albumName;
        this.header.albumNameSort = options.info ? options.info.albumName.replace(/[^a-z0-9 ]/gi, '') : song.albumNameSort;
        this.header.artistName = song.artistName;
        this.header.centOffset = song.centOffset;
        this.header.artistNameSort = song.artistNameSort;
        this.header.capoFret = song.capo;
        this.header.dnaChords = (_e = (_d = (_c = sng.sng) === null || _c === void 0 ? void 0 : _c.dna) === null || _d === void 0 ? void 0 : _d.filter(function (item) { return item.id === DNAId.Chord; }).length, (_e !== null && _e !== void 0 ? _e : 0));
        this.header.dnaRiffs = (_h = (_g = (_f = sng.sng) === null || _f === void 0 ? void 0 : _f.dna) === null || _g === void 0 ? void 0 : _g.filter(function (item) { return item.id === DNAId.Riff; }).length, (_h !== null && _h !== void 0 ? _h : 0));
        this.header.dnaSolo = (_l = (_k = (_j = sng.sng) === null || _j === void 0 ? void 0 : _j.dna) === null || _k === void 0 ? void 0 : _k.filter(function (item) { return item.id === DNAId.Solo; }).length, (_l !== null && _l !== void 0 ? _l : 0));
        this.header.notesEasy = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? sng_1.getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 0) : 0;
        this.header.notesMedium = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? sng_1.getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 1) : 0;
        this.header.notesHard = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? sng_1.getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 2) : 0;
        this.header.easyMastery = parseFloat((this.header.notesEasy / this.header.notesHard).toFixed(9));
        this.header.mediumMastery = parseFloat((this.header.notesMedium / this.header.notesHard).toFixed(9));
        this.main.arrangementProperties = song.arrangementProperties;
        if (this.arrType == ArrangementType.BASS) {
            this.header.bassPick = options.bassPicked == undefined ? 0 : (options.bassPicked ? 1 : 0);
        }
        this.main.arrangementProperties.Metronome = 0;
        switch (this.arrType) {
            case ArrangementType.BASS:
                this.header.routeMask = RouteMask.Bass;
                break;
            case ArrangementType.LEAD:
                this.header.routeMask = RouteMask.Lead;
                break;
            case ArrangementType.RHYTHM:
                this.header.routeMask = RouteMask.Rhythm;
                break;
            default:
                this.header.routeMask = RouteMask.Any;
                break;
        }
        this.main.arrangementProperties.routeMask = this.header.routeMask;
        this.header.songLength = song.songLength;
        this.header.songName = options.info ? options.info.songName : song.title;
        this.header.songNameSort = options.info ? options.info.songName.replace(/[^a-z0-9 ]/gi, '') : song.title;
        this.header.songYear = (_o = (_m = options.info) === null || _m === void 0 ? void 0 : _m.year, (_o !== null && _o !== void 0 ? _o : parseInt(song.albumYear, 0)));
        this.header.tuning = song.tuning;
        this.main.arrangementProperties.pathLead = (this.header.routeMask == RouteMask.Lead) ? 1 : 0;
        this.main.arrangementProperties.pathRhythm = (this.header.routeMask == RouteMask.Rhythm) ? 1 : 0;
        this.main.arrangementProperties.pathBass = (this.header.routeMask == RouteMask.Bass) ? 1 : 0;
        this.main.arrangementProperties.twoFingerPicking = this.main.arrangementProperties.pathBass === 1 && this.main.arrangementProperties.bassPick === 0 ? 1 : 0;
        this.header.representative = (options.represent === true) ? 1 : 0;
        this.main.lastConversionDateTime = song.lastConversionDateTime;
        this.main.targetScore = 100000;
        this.main.songAverageTempo = song.averageTempo;
        this.main.songOffset = -song.startBeat;
        var diff = this.getSongDifficulty();
        this.header.songDiffEasy = parseFloat(diff.songDiffEasy.toFixed(9));
        this.header.songDiffMed = parseFloat(diff.songDiffMed.toFixed(9));
        this.header.songDiffHard = parseFloat(diff.songDiffHard.toFixed(9));
        this.header.songDifficulty = diff.songDifficulty;
        this.main.maxPhraseDifficulty = this.getMaxDifficulty();
        var ret = this.getPhraseIterations();
        this.main.phraseIterations = ret.phraseIterations;
        this.main.score_MaxNotes = ret.maxNotes;
        this.main.score_PNV = parseFloat(ret.PNV.toFixed(6));
        this.main.phrases = this.getPhrases();
        this.main.sections = this.getSections();
        this.main.chordTemplates = this.getChordTemplates();
        this.main.chords = this.getChords();
        this.main.techniques = this.getTechniques();
        this.main.dynamicVisualDensity = this.getDynamicDesnity((_q = (_p = options.info) === null || _p === void 0 ? void 0 : _p.scrollSpeed, (_q !== null && _q !== void 0 ? _q : 20)));
        var tret = this.getTones(options.tones);
        this.main.tones = tret.tones;
        this.main.tone_A = tret.tonea;
        this.main.tone_B = tret.toneb;
        this.main.tone_C = tret.tonec;
        this.main.tone_D = tret.toned;
        this.main.tone_Base = tret.tonebase;
        this.main.tone_Multiplayer = tret.tone_mult;
    }
    Arrangement.prototype.getSongDifficulty = function () {
        // This is not the way official values are calculated, but sometimes gets pretty close
        // TODO: improve calculation
        var arrProrp = this.main.arrangementProperties;
        var techCoeff = arrProrp.nonStandardChords +
            3 * arrProrp.barreChords +
            (arrProrp.powerChords | arrProrp.doubleStops) +
            arrProrp.dropDPower +
            2 * arrProrp.openChords +
            arrProrp.fingerPicking +
            arrProrp.twoFingerPicking +
            arrProrp.palmMutes +
            2 * arrProrp.harmonics +
            3 * arrProrp.pinchHarmonics +
            arrProrp.hopo +
            arrProrp.tremolo +
            (arrProrp.pathBass == 1 ? 4 : 1) * arrProrp.slides +
            arrProrp.unpitchedSlides +
            3 * arrProrp.bends +
            4 * arrProrp.tapping +
            2 * arrProrp.vibrato +
            arrProrp.fretHandMutes +
            arrProrp.slapPop +
            arrProrp.sustain +
            arrProrp.fifthsAndOctaves +
            arrProrp.syncopation;
        // Arrangements with few/no techniques get very low values otherwise
        if (techCoeff <= 5)
            techCoeff += 4;
        // In official content maximum value for SongDiffHard is 1.0
        var songDiffHard = (techCoeff * this.header.notesHard) / this.header.songLength / 100;
        var songDiffMed = (techCoeff * this.header.notesMedium) / this.header.songLength / 50;
        var songDiffEasy = (techCoeff * this.header.notesEasy) / this.header.songLength / 25;
        var songDifficulty = songDiffHard;
        return {
            songDiffEasy: songDiffEasy,
            songDiffMed: songDiffMed,
            songDiffHard: songDiffHard,
            songDifficulty: songDifficulty,
        };
    };
    Arrangement.prototype.getMaxDifficulty = function () {
        var max = 0;
        this.song2014.phrases.forEach(function (phrase) {
            if (max < phrase.maxDifficulty)
                max = phrase.maxDifficulty;
        });
        return max;
    };
    Arrangement.prototype.getPhraseIterations = function () {
        var _this = this;
        var phraseIterations = [];
        var maxNotes = 0;
        var PNV = 0;
        for (var i = 0; i < this.song2014.phraseIterations.length; i++) {
            var phraseIteration = this.song2014.phraseIterations[i];
            var phrase = this.song2014.phrases[phraseIteration.phraseId];
            var endTime = i >= this.song2014.phraseIterations.length - 1 ? this.song2014.songLength : this.song2014.phraseIterations[i + 1].time;
            var pit = {
                startTime: phraseIteration.time,
                endTime: endTime,
                phraseIndex: phraseIteration.phraseId,
                name: phrase.name,
                maxDifficulty: phrase.maxDifficulty,
            };
            phraseIterations.push(pit);
        }
        var noteCnt = 0;
        var _noteCount = function (start, end, notes) {
            var count = 0;
            notes.forEach(function (n) {
                if (n.time < end && n.time >= start)
                    count++;
            });
            return count;
        };
        var _chordCount = function (start, end, chords) {
            var count = 0;
            chords.forEach(function (n) {
                if (n.time < end && n.time >= start)
                    count++;
            });
            return count;
        };
        phraseIterations.forEach(function (y) {
            if (_this.song2014.levels[y.maxDifficulty].notes.length > 0) {
                noteCnt += _noteCount(y.startTime, y.endTime, _this.song2014.levels[y.maxDifficulty].notes);
            }
            if (_this.song2014.levels[y.maxDifficulty].chords.length > 0) {
                noteCnt += _chordCount(y.startTime, y.endTime, _this.song2014.levels[y.maxDifficulty].chords);
            }
        });
        maxNotes = noteCnt;
        PNV = this.main.targetScore / noteCnt;
        return {
            phraseIterations: phraseIterations,
            maxNotes: maxNotes,
            PNV: PNV,
        };
    };
    Arrangement.prototype.getPhrases = function () {
        var _this = this;
        var ph = [];
        this.song2014.phrases.forEach(function (phrase, ind) {
            var p = {
                iterationCount: _this.song2014.phraseIterations.filter(function (z) { return z.phraseId == ind; }).length,
                maxDifficulty: phrase.maxDifficulty,
                name: phrase.name,
            };
            ph.push(p);
        });
        return ph;
    };
    Arrangement.prototype.getSections = function () {
        var _this = this;
        var sects = [];
        this.song2014.sections.forEach(function (section, i) {
            var sect = {
                name: section.name,
                number: section.number,
                startTime: section.startTime,
                endTime: (i >= _this.song2014.sections.length - 1) ? _this.song2014.songLength : _this.song2014.sections[i + 1].startTime,
                uIName: '',
                startPhraseIterationIndex: 0,
                endPhraseIterationIndex: 0,
                isSolo: false,
            };
            var sep = sect.name.split(" ");
            // process "<section><number>" used by official XML
            var numAlpha = new RegExp("(?<Alpha>[a-zA-Z]*)(?<Numeric>[0-9]*)");
            var match = sep[0].match(numAlpha);
            if (match && match.groups && match.groups["Numeric"] != "")
                sep = [match.groups["Alpha"][0], match.groups["Numeric"][0]];
            if (sep.length == 1) {
                var uiName = SectionUINames[sep[0]];
                if (uiName != '')
                    sect.uIName = uiName;
                else
                    throw new Error("Unknown section name: " + sep[0]);
            }
            else {
                var uiName = SectionUINames[sep[0]];
                if (parseInt(sep[1], 10) != 0 || parseInt(sep[1], 10) != 1)
                    uiName += "|" + sep[1];
                if (uiName != '')
                    sect.uIName = uiName;
                else
                    throw new Error("Unknown section name: " + sep[0]);
            }
            var phraseIterStart = -1;
            var phraseIterEnd = 0;
            var isSolo = section.name == "solo";
            for (var o = 0; o < _this.song2014.phraseIterations.length; o++) {
                var phraseIter = _this.song2014.phraseIterations[o];
                if (phraseIterStart == -1 && phraseIter.time >= sect.startTime)
                    phraseIterStart = o;
                if (phraseIter.time >= sect.endTime)
                    break;
                phraseIterEnd = o;
                if (_this.song2014.phrases[phraseIter.phraseId].solo > 0)
                    isSolo = true;
            }
            sect.startPhraseIterationIndex = phraseIterStart;
            sect.endPhraseIterationIndex = phraseIterEnd;
            sect.isSolo = isSolo;
            sects.push(sect);
        });
        return sects;
    };
    Arrangement.prototype.getChordTemplates = function () {
        var mct = [];
        this.song2014.chordTemplates.forEach(function (y, indx) {
            if (y.chordName != "") {
                var st = {
                    chordId: indx,
                    chordName: y.chordName,
                    fingers: [y.finger0, y.finger1, y.finger2,
                        y.finger3, y.finger4, y.finger5],
                    frets: [y.fret0, y.fret1, y.fret2,
                        y.fret3, y.fret4, y.fret5],
                };
                mct.push(st);
            }
        });
        return mct;
    };
    Arrangement.prototype.getChords = function () {
        var chordsMap = {};
        for (var difficulty = 0; difficulty < this.song2014.levels.length; difficulty++) {
            var chords = this.song2014.levels[difficulty].handShapes;
            var sectionId = {};
            var chordId = [];
            for (var section = 0; section < this.song2014.sections.length; section++) {
                var sectionNumber = this.song2014.sections[section].number;
                var startTime = this.song2014.sections[section].startTime;
                var endTime = this.song2014.sections[Math.min(section + 1, this.song2014.sections.length - 1)].startTime;
                chords.forEach(function (chord) {
                    if (chord.startTime >= startTime && chord.endTime < endTime)
                        chordId.push(chord.chordId);
                });
                if (chordId.length > 0) {
                    var distinctChordIds = __spread(new Set(chordId)).sort(function (a, b) { return a - b; });
                    sectionId[section.toString()] = distinctChordIds;
                }
                chordId = [];
            }
            if (Object.keys(sectionId).length > 0) {
                chordsMap[difficulty.toString()] = sectionId;
            }
        }
        return chordsMap;
    };
    Arrangement.prototype.getTechniques = function () {
        var _this = this;
        var ts = {};
        for (var difficulty = 0; difficulty < this.song2014.levels.length; difficulty++) {
            var notes = this.song2014.levels[difficulty].notes;
            var sectionId = {};
            var techId = [];
            for (var section = 0; section < this.song2014.sections.length; section++) {
                var sectionNumber = this.song2014.sections[section].number;
                var startTime = this.song2014.sections[section].startTime;
                var endTime = this.song2014.sections[Math.min(section + 1, this.song2014.sections.length - 1)].startTime;
                notes.forEach(function (note) {
                    if (note.time >= startTime && note.time < endTime) {
                        var nt = _this.getNoteTech(note);
                        techId = techId.concat(nt);
                    }
                });
                if (techId.length > 0) {
                    var p = __spread(new Set(techId));
                    p.sort(function (a, b) { return a - b; });
                    var distinctTechIds = p;
                    if (Object.keys(sectionId).includes(sectionNumber.toString())) {
                        var techIdValue = Object.values(sectionId[sectionNumber.toString()]);
                        if (techIdValue) {
                            techIdValue = techIdValue.concat(distinctTechIds);
                            var s = __spread(new Set(techIdValue));
                            s.sort(function (a, b) { return a - b; });
                            distinctTechIds = s;
                            delete sectionId[sectionNumber.toString()];
                        }
                    }
                    sectionId[sectionNumber.toString()] = distinctTechIds;
                }
                techId = [];
            }
            if (Object.keys(sectionId).length > 0) {
                ts[difficulty.toString()] = sectionId;
            }
        }
        return ts;
    };
    Arrangement.prototype.getNoteTech = function (n) {
        var t = [];
        if (n.accent != undefined && 1 == n.accent)
            t.push(0);
        if (n.bend != undefined && 0 != n.bend)
            t.push(1);
        if (n.mute != undefined && 1 == n.mute)
            t.push(2);
        if (n.hammerOn != undefined && 1 == n.hammerOn)
            t.push(3);
        if (n.harmonic != undefined && 1 == n.harmonic)
            t.push(4);
        if (n.harmonicPinch != undefined && 1 == n.harmonicPinch)
            t.push(5);
        if (n.hopo != undefined && 1 == n.hopo)
            t.push(6);
        if (n.palmMute != undefined && 1 == n.palmMute)
            t.push(7);
        if (n.pluck != undefined && 1 == n.pluck)
            t.push(8);
        if (n.pullOff != undefined && 1 == n.pullOff)
            t.push(9);
        if (n.slap != undefined && 1 == n.slap)
            t.push(10);
        if (n.slideTo != undefined && n.slideTo > 0)
            t.push(11);
        if (n.slideUnpitchTo != undefined && n.slideUnpitchTo > 0)
            t.push(12);
        if (n.sustain != undefined && n.sustain > 0)
            t.push(13);
        if (n.tap != undefined && 1 == n.tap)
            t.push(14);
        if (n.tremolo != undefined && 1 == n.tremolo)
            t.push(15);
        if (n.vibrato != undefined && 1 == n.vibrato)
            t.push(16);
        return t;
    };
    Arrangement.prototype.getDynamicDesnity = function (scrollSpeed) {
        var mt = [];
        if (this.arrType == ArrangementType.VOCALS) {
            mt = new Array(20).fill(2.0);
        }
        else {
            var floorLimit = 5;
            var endSpeed = Math.min(50, Math.max(floorLimit, scrollSpeed)) / 10;
            if (this.song2014.levels.length == 1)
                mt = new Array(20).fill(endSpeed);
            else {
                var beginSpeed = 5.0;
                var maxLevel = Math.min(this.song2014.levels.length, 20) - 1;
                var factor = maxLevel > 0 ? Math.pow(endSpeed / beginSpeed, 1 / maxLevel) : 1;
                for (var i = 0; i < 20; i++) {
                    if (i >= maxLevel - 1)
                        mt.push(endSpeed);
                    else if (i == 0)
                        mt.push(beginSpeed);
                    else {
                        var speed = beginSpeed * Math.pow(factor, i);
                        speed = parseFloat(speed.toFixed(1));
                        mt.push(speed);
                    }
                }
            }
        }
        return mt;
    };
    Arrangement.prototype.getTones = function (tones) {
        var mt = [];
        var _gtn = function (tone) {
            var toneName = "";
            var defaultTone = "default";
            if (tone && tone != "") {
                var matched = tones.find(function (t) { return t.name.toLowerCase() == tone.toLowerCase(); });
                if (matched) {
                    if (matched.gearList) {
                        if (!mt.includes(matched))
                            mt.push(matched);
                        toneName = tone;
                    }
                    else {
                        toneName = defaultTone;
                    }
                }
            }
            return toneName;
        };
        var tonea = _gtn(this.song2014.tonea);
        var toneb = _gtn(this.song2014.toneb);
        var tonec = _gtn(this.song2014.tonec);
        var toned = _gtn(this.song2014.toned);
        var tonebase = _gtn(this.song2014.tonebase);
        var tone_mult = _gtn("");
        return {
            tonea: tonea,
            toneb: toneb,
            tonec: tonec,
            toned: toned,
            tonebase: tonebase,
            tone_mult: tone_mult,
            tones: mt,
        };
    };
    return Arrangement;
}());
exports.Arrangement = Arrangement;
var VocalAttributes = /** @class */ (function () {
    function VocalAttributes() {
        this.arrangementSort = 0;
        this.blockAsset = '';
        this.dynamicVisualDensity = new Array(20).fill(2.0);
        this.fullName = '';
        this.masterID_PS3 = -1;
        this.masterID_XBox360 = -1;
        this.maxPhraseDifficulty = 0;
        this.previewBankPath = '';
        this.relativeDifficulty = 0;
        this.score_MaxNotes = 0;
        this.score_PNV = 0;
        this.showlightsXML = '';
        this.songAsset = '';
        this.songAverageTempo = 0;
        this.songBank = '';
        this.songEvent = '';
        this.songPartition = 0;
        this.songXml = '';
        this.targetScore = 0;
        this.inputEvent = '';
        this.songVolume = 0;
        this.previewVolume = 0;
    }
    return VocalAttributes;
}());
exports.VocalAttributes = VocalAttributes;
var VocalAttributesHeader = /** @class */ (function () {
    function VocalAttributesHeader() {
        this.albumArt = '';
        this.arrangementName = '';
        this.capoFret = 0;
        this.DLC = true;
        this.DLCKey = '';
        this.leaderboardChallengeRating = 0;
        this.manifestUrn = '';
        this.masterID_RDV = 0;
        this.shipping = true;
        this.SKU = "RS2";
        this.songKey = '';
        this.persistentID = '';
    }
    return VocalAttributesHeader;
}());
exports.VocalAttributesHeader = VocalAttributesHeader;
var VocalArrangement = /** @class */ (function () {
    function VocalArrangement(options) {
        var _a, _b;
        this.arrType = ArrangementType.VOCALS;
        this.header = new VocalAttributesHeader();
        this.main = new VocalAttributes();
        var masterID = bnkparser_1.getRandomInt();
        var pID = (_b = (_a = options.info) === null || _a === void 0 ? void 0 : _a.persistentID, (_b !== null && _b !== void 0 ? _b : aggregategraphwriter_1.getUuid().replace(/-/g, "").toUpperCase()));
        var dlcName = options.tag.toLowerCase();
        var xblockUrn = URN_TEMPLATE_SHORT(aggregategraphwriter_1.TagValue.EmergentWorld, dlcName);
        var showlightUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.XML, dlcName + "_showlights");
        var songXmlUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.XML, dlcName + "_" + this.arrType);
        var songSngUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Application, aggregategraphwriter_1.TagValue.MusicgameSong, dlcName + "_" + this.arrType);
        var albumUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Image, aggregategraphwriter_1.TagValue.DDS, "album_" + options.tag.toLowerCase());
        var jsonUrn = URN_TEMPLATE(aggregategraphwriter_1.TagValue.Database, aggregategraphwriter_1.TagValue.JsonDB, dlcName + "_" + this.arrType);
        this.main.blockAsset = xblockUrn;
        this.main.fullName = options.tag + "_" + __1.toTitleCase(this.arrType);
        this.main.previewBankPath = "song_" + dlcName + "_preview.bnk";
        this.main.showlightsXML = showlightUrn;
        this.main.songAsset = songSngUrn;
        this.main.songBank = "song_" + dlcName + ".bnk";
        this.main.songEvent = "Play_" + options.tag;
        this.main.inputEvent = "Play_Tone_Standard_Mic";
        this.main.songVolume = options.volume;
        this.main.previewVolume = options.previewVolume;
        this.header.albumArt = albumUrn;
        this.header.arrangementName = "Vocals";
        this.header.DLCKey = options.tag;
        this.header.manifestUrn = jsonUrn;
        this.header.masterID_RDV = masterID;
        this.header.songKey = this.header.DLCKey;
        this.header.persistentID = pID;
        this.main.songXml = songXmlUrn;
        delete (this.arrType);
    }
    return VocalArrangement;
}());
exports.VocalArrangement = VocalArrangement;
var SectionUINames = {
    fadein: "$[34276] Fade In [1]",
    fadeout: "$[34277] Fade Out [1]",
    buildup: "$[34278] Buildup [1]",
    chorus: "$[34279] Chorus [1]",
    hook: "$[34280] Hook [1]",
    head: "$[34281] Head [1]",
    bridge: "$[34282] Bridge [1]",
    ambient: "$[34283] Ambient [1]",
    breakdown: "$[34284] Breakdown [1]",
    interlude: "$[34285] Interlude [1]",
    intro: "$[34286] Intro [1]",
    melody: "$[34287] Melody [1]",
    modbridge: "$[34288] Modulated Bridge [1]",
    modchorus: "$[34289] Modulated Chorus [1]",
    modverse: "$[34290] Modulated Verse [1]",
    outro: "$[34291] Outro [1]",
    postbrdg: "$[34292] Post Bridge [1]",
    postchorus: "$[34293] Post Chorus [1]",
    postvs: "$[34294] Post Verse [1]",
    prebrdg: "$[34295] Pre Bridge [1]",
    prechorus: "$[34296] Pre Chorus [1]",
    preverse: "$[34297] Pre Verse [1]",
    riff: "$[34298] Riff [1]",
    rifff: "$[34298] Riff [1]",
    silence: "$[34299] Silence [1]",
    solo: "$[34300] Solo [1]",
    tapping: "$[34305] Tapping [1]",
    transition: "$[34301] Transition [1]",
    vamp: "$[34302] Vamp [1]",
    variation: "$[34303] Variation [1]",
    verse: "$[34304] Verse [1]",
    noguitar: "$[6091] No Guitar [1]",
};
var ToneDescriptors = {
    BASS: "$[35715]BASS",
    OVERDRIVE: "$[35716]OVERDRIVE",
    OCTAVE: "$[35719]OCTAVE",
    CLEAN: "$[35720]CLEAN",
    ACOUSTIC: "$[35721]ACOUSTIC",
    DISTORTION: "$[35722]DISTORTION",
    CHORUS: "$[35723]CHORUS",
    LEAD: "$[35724]LEAD",
    ROTARY: "$[35725]ROTARY",
    REVERB: "$[35726]REVERB",
    TREMOLO: "$[35727]TREMOLO",
    VIBRATO: "$[35728]VIBRATO",
    FILTER: "$[35729]FILTER",
    PHASER: "$[35730]PHASER",
    FLANGER: "$[35731]FLANGER",
    LOW_OUTPUT: "$[35732]LOW OUTPUT",
    PROCESSED: "$[35734]PROCESSED",
    SPECIAL_EFFECT: "$[35750]SPECIAL EFFECT",
    MULTI_EFFECT: "$[35751]MULTI-EFFECT",
    DELAY: "$[35753]DELAY",
    ECHO: "$[35754]ECHO",
    HIGH_GAIN: "$[35755]HIGH GAIN",
    FUZZ: "$[35756]FUZZ",
};
exports.ManifestToneReviver = function (key, value) {
    if (value && typeof value === 'object')
        for (var k in value) {
            if (key === "KnobValues") {
            }
            else if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
                value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                delete value[k];
            }
        }
    return value;
};
var currentSection = '';
exports.ManifestReplacer = function (allKeys, key, value) {
    function replacer(key, value) {
        var arrFields = ["ChordTemplates", "PhraseIterations",
            "Phrases", "Sections", "DynamicVisualDensity", "Tones", "ToneDescriptors"];
        var specialFields = ["Techniques", "Chords", "ChordTemplates"];
        var sect = allKeys.includes(key.charAt(0).toLowerCase() + key.substring(1))
            ? key : '';
        if (sect != '')
            currentSection = sect;
        if (value && typeof value === 'object') {
            var replacement;
            if (arrFields.includes(key) ||
                (specialFields.includes(currentSection)
                    && !specialFields.includes(key)
                    && Array.isArray(value)))
                replacement = [];
            else
                replacement = {};
            for (var k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    if (k.startsWith("dna")) {
                        var newK = "DNA_" + __1.toTitleCase(k.split("dna")[1]);
                        replacement[newK] = value[k];
                    }
                    else if (["Tuning", "ArrangementProperties"].includes(key)) {
                        replacement[k] = value[k];
                    }
                    else if (arrFields.includes(key)) {
                        replacement.push(value[k]);
                    }
                    else if (Array.isArray(replacement))
                        replacement.push(value[k]);
                    else
                        replacement[k && k.charAt(0).toUpperCase() + k.substring(1)] = value[k];
                }
            }
            return replacement;
        }
        return value;
    }
    return replacer(key, value);
};
var ShowLights = /** @class */ (function () {
    function ShowLights() {
        this.time = 0;
        this.note = 0;
    }
    ShowLights.fromXML = function (xmlFile) {
        return __awaiter(this, void 0, void 0, function () {
            var data, parsed, sl, lights;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(xmlFile)];
                    case 1:
                        data = _a.sent();
                        return [4 /*yield*/, xml2js.parseStringPromise(data)];
                    case 2:
                        parsed = _a.sent();
                        sl = parsed.showlights.showlight;
                        lights = [];
                        sl.map(function (item) {
                            lights.push({
                                time: parseFloat(item.$.time.toString()),
                                note: parseInt(item.$.note.toString(), 10),
                            });
                        });
                        return [2 /*return*/, lights];
                }
            });
        });
    };
    ShowLights.toXML = function (sl) {
        var e = {
            showlights: {
                $: {
                    count: sl.length,
                },
                showlight: sl.map(function (item) {
                    return {
                        $: __assign({}, item),
                    };
                })
            }
        };
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(e);
        return xml;
    };
    return ShowLights;
}());
exports.ShowLights = ShowLights;
var Vocals = /** @class */ (function () {
    function Vocals() {
        this.time = 0;
        this.note = 0;
        this.length = 0;
        this.lyric = '';
    }
    Vocals.fromXML = function (xmlFile) {
        return __awaiter(this, void 0, void 0, function () {
            var data, parsed, sl, vocals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(xmlFile)];
                    case 1:
                        data = _a.sent();
                        return [4 /*yield*/, xml2js.parseStringPromise(data)];
                    case 2:
                        parsed = _a.sent();
                        sl = parsed.vocals.vocal;
                        vocals = [];
                        sl.map(function (item) {
                            vocals.push({
                                time: parseFloat(item.$.time.toString()),
                                note: parseInt(item.$.note.toString(), 10),
                                length: parseFloat(item.$.length.toString()),
                                lyric: item.$.lyric,
                            });
                        });
                        return [2 /*return*/, vocals];
                }
            });
        });
    };
    Vocals.toXML = function (sl) {
        var e = {
            vocals: {
                $: {
                    count: sl.length,
                },
                vocal: sl.map(function (item) {
                    return {
                        $: __assign({}, item),
                    };
                })
            }
        };
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(e);
        return xml;
    };
    Vocals.generateSNG = function (dir, tag, vocals) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, sngFormat, path, buf, sng;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = tag + "_vocals.sng";
                        sngFormat = {
                            beats_length: 0,
                            beats: [],
                            phrases_length: 0,
                            phrases: [],
                            chord_templates_length: 0,
                            chordTemplates: [],
                            chord_notes_length: 0,
                            chordNotes: [],
                            vocals_length: vocals.length,
                            vocals: sng_1.VOCALS.fromVocals(vocals),
                            symbols_length: 0,
                            symbols: {
                                header: [],
                                texture: [],
                                definition: [],
                            },
                            phrase_iter_length: 0,
                            phraseIterations: [],
                            phrase_extra_info_length: 0,
                            phraseExtraInfos: [],
                            new_linked_diffs_length: 0,
                            newLinkedDiffs: [],
                            actions_length: 0,
                            actions: [],
                            events_length: 0,
                            events: [],
                            tone_length: 0,
                            tone: [],
                            dna_length: 0,
                            dna: [],
                            sections_length: 0,
                            sections: [],
                            levels_length: 0,
                            levels: [],
                            metadata: new sng_1.METADATA(),
                        };
                        sngparser_1.SNGDATA.parse(sngparser_1.SNGDATA.encode(sngFormat));
                        path = path_1.join(dir, fileName);
                        buf = sngparser_1.SNGDATA.encode(sngFormat);
                        sng = new __1.SNG(path);
                        sng.rawData = buf;
                        sng.unpackedData = buf;
                        return [4 /*yield*/, sng.pack()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs_1.promises.writeFile(path, sng.packedData)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, path];
                }
            });
        });
    };
    return Vocals;
}());
exports.Vocals = Vocals;
