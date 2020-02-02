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
var SNGTypes = __importStar(require("./types/sng"));
var SNGParser = __importStar(require("./sngparser"));
var sng_1 = require("./sng");
var pkgInfo = require("../package.json");
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
                            title: exports.getS(song.title),
                            arrangement: exports.getS(song.arrangement).toLowerCase(),
                            part: exports.getI(song.part),
                            offset: exports.getF(song.offset),
                            centOffset: exports.getF(song.centOffset),
                            songLength: exports.getF(song.songLength),
                            startBeat: exports.getF(song.startBeat),
                            averageTempo: exports.getF(song.averageTempo),
                            tuning: objectMap(song.tuning[0].$, function (item) { return parseInt(item, 10); }),
                            capo: exports.getI(song.capo),
                            artistName: exports.getS(song.artistName),
                            artistNameSort: exports.getS(song.artistNameSort),
                            albumName: exports.getS(song.albumName),
                            albumNameSort: exports.getS(song.albumNameSort),
                            albumYear: exports.getS(song.albumYear),
                            crowdSpeed: exports.getS(song.crowdSpeed),
                            lastConversionDateTime: exports.getS(song.lastConversionDateTime),
                            arrangementProperties: objectMap(song.arrangementProperties[0].$, function (item) { return parseInt(item, 10); }),
                            phrases: SongPhrase.fromXML(song.phrases),
                            phraseIterations: SongPhraseIteration.fromXML(song.phraseIterations),
                            newLinkedDiffs: SongNewLinkedDiff.fromXML(song.newLinkedDiffs),
                            linkedDiffs: SongLinkedDiff.fromXML(song.linkedDiffs),
                            phraseProperties: SongPhraseProperty.fromXML(song.phraseProperties),
                            chordTemplates: SongChordTemplate.fromXML(song.chordTemplates),
                            fretHandMuteTemplates: [],
                            ebeats: SongEbeat.fromXML(song.ebeats),
                            tonebase: exports.getS(song.tonebase),
                            tonea: exports.getS(song.tonea),
                            toneb: exports.getS(song.toneb),
                            tonec: exports.getS(song.tonec),
                            toned: exports.getS(song.toned),
                            tones: SongTone.fromXML(song.tones),
                            sections: SongSection.fromXML(song.sections),
                            events: SongEvent.fromXML(song.events),
                            controls: SongPhraseProperty.fromXML(song.controls),
                            transcriptionTrack: TranscriptionTrack.fromXML(song.transcriptionTrack),
                            levels: SongLevel.fromXML(song.levels),
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
        rest.transcriptionTrack = {
            $: { difficulty: rest.transcriptionTrack.difficulty },
            notes: _d(rest.transcriptionTrack.notes, "note"),
            chords: _d(rest.transcriptionTrack.chords, "chord"),
            fretHandMutes: _d(rest.transcriptionTrack.fretHandMutes, "fretHandMute"),
            anchors: _d(rest.transcriptionTrack.anchors, "anchor"),
            handShapes: _d(rest.transcriptionTrack.handShapes, "handShape"),
        };
        rest.levels = {
            $: { count: rest.levels.length },
            level: rest.levels.map(function (item) {
                return {
                    $: { difficulty: item.difficulty },
                    notes: _d(item.notes, "note"),
                    chords: _d(item.chords, "chord"),
                    anchors: _d(item.anchors, "anchor"),
                    handShapes: _d(item.handShapes, "handShape"),
                };
            })
        };
        return __assign({}, rest);
    };
    Song2014.prototype.generateXML = function (dir, tag, tk) {
        return __awaiter(this, void 0, void 0, function () {
            var builder, xml, fileName, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        builder = new xml2js.Builder({
                            xmldec: {
                                version: "1.0",
                            }
                        });
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
            var fileName, toneObj, dnas, chordTemplates, phraseIterations, levels, chordNotes, sngFormat, _validate2, path, buf, sng;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = tag + "_" + this.song.arrangement + ".sng";
                        toneObj = {
                            tonebase: this.song.tonebase, tonea: this.song.tonea,
                            toneb: this.song.toneb, tonec: this.song.tonec, toned: this.song.toned,
                        };
                        dnas = SNGTypes.DNA.fromDNA(this.song.events);
                        chordTemplates = SNGTypes.CHORDTEMPLATES.fromSongChordTemplate(this.song.chordTemplates, this.song.tuning, this.song.arrangement, this.song.capo);
                        phraseIterations = SNGTypes.PHRASEITERATIONS.fromPhraseIterations(this.song.phraseIterations, this.song.phrases, this.song.songLength);
                        levels = SNGTypes.LEVELS.fromLevels(this.song.levels, this.song.phraseIterations, chordTemplates, phraseIterations, this.song.phrases);
                        chordNotes = SNGTypes.getChordNotes();
                        sngFormat = {
                            beats_length: this.song.ebeats.length,
                            beats: SNGTypes.BEATS.fromSongEBeat(this.song.ebeats, this.song.phraseIterations),
                            phrases_length: this.song.phrases.length,
                            phrases: SNGTypes.PHRASES.fromSongPhrase(this.song.phrases, this.song.phraseIterations),
                            chord_templates_length: this.song.chordTemplates.length,
                            chordTemplates: chordTemplates,
                            chord_notes_length: chordNotes.length,
                            chordNotes: chordNotes,
                            vocals_length: 0,
                            vocals: [],
                            symbols_length: 0,
                            symbols: {
                                header: [],
                                texture: [],
                                definition: [],
                            },
                            phrase_iter_length: this.song.phraseIterations.length,
                            phraseIterations: phraseIterations,
                            phrase_extra_info_length: 0,
                            phraseExtraInfos: [],
                            new_linked_diffs_length: this.song.newLinkedDiffs.length,
                            newLinkedDiffs: SNGTypes.NEWLINKEDDIFFS.fromNewLinkedDiffs(this.song.newLinkedDiffs),
                            actions_length: 0,
                            actions: [],
                            events_length: this.song.events.length,
                            events: SNGTypes.EVENTS.fromEvents(this.song.events),
                            tone_length: this.song.tones.length,
                            tone: SNGTypes.TONE.fromTone(this.song.tones, toneObj),
                            dna_length: dnas.length,
                            dna: dnas,
                            sections_length: this.song.sections.length,
                            sections: SNGTypes.SECTIONS.fromSections(this.song.sections, this.song.phraseIterations, this.song.phrases, this.song.levels, this.song.chordTemplates, this.song.songLength),
                            levels_length: levels.length,
                            levels: levels,
                            metadata: SNGTypes.METADATA.fromSong2014(this.song, phraseIterations, levels),
                        };
                        _validate2 = function (struct, data) {
                            if (data)
                                struct.parse(struct.encode(data));
                        };
                        _validate2(SNGParser.SNGDATA, sngFormat);
                        path = path_1.join(dir, fileName);
                        buf = SNGParser.SNGDATA.encode(sngFormat);
                        sng = new sng_1.SNG(path);
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
    return Song2014;
}());
exports.Song2014 = Song2014;
var SongEbeat = /** @class */ (function () {
    function SongEbeat() {
        this.time = 0;
    }
    SongEbeat.fromBeatData = function (beats) {
        var idx = 0;
        return beats.map(function (item) {
            var _a = __read(item.split(" "), 2), time = _a[0], beat = _a[1];
            var timef = parseFloat(time);
            var beati = parseInt(beat);
            if (beati === 1) {
                idx++;
                return { time: timef, measure: idx };
            }
            else
                return { time: timef };
        });
    };
    SongEbeat.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.ebeat;
        if (!list)
            return [];
        var controls = list.map(function (item) {
            var iany = item;
            var main = {
                time: parseFloat(iany.$.time),
            };
            Object.assign(main, iany.$.measure && { measure: parseInt(iany.$.measure, 10) });
            return main;
        });
        return controls;
    };
    return SongEbeat;
}());
exports.SongEbeat = SongEbeat;
var SongPhrase = /** @class */ (function () {
    function SongPhrase() {
        this.disparity = 0;
        this.ignore = 0;
        this.maxDifficulty = 0;
        this.name = '';
        this.solo = 0;
    }
    SongPhrase.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.phrase;
        if (!list)
            return [];
        var phrases = list.map(function (item) {
            var iany = item;
            return {
                disparity: iany.$.disparity ? parseInt(iany.$.disparity, 10) : 0,
                ignore: iany.$.ignore ? parseInt(iany.$.ignore, 10) : 0,
                maxDifficulty: iany.$.maxDifficulty ? parseInt(iany.$.maxDifficulty, 10) : 0,
                solo: iany.$.solo ? parseInt(iany.$.solo, 10) : 0,
                name: iany.$.name ? iany.$.name : '',
            };
        });
        return phrases;
    };
    return SongPhrase;
}());
exports.SongPhrase = SongPhrase;
var SongTone = /** @class */ (function () {
    function SongTone() {
        this.time = 0;
        this.name = '';
    }
    SongTone.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.tone;
        if (!list)
            return [];
        var tones = list.map(function (item) {
            var iany = item;
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                name: iany.$.name ? iany.$.name : '',
            };
        });
        return tones;
    };
    return SongTone;
}());
exports.SongTone = SongTone;
var SongSection = /** @class */ (function () {
    function SongSection() {
        this.name = "";
        this.number = 0;
        this.startTime = 0;
    }
    SongSection.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.section;
        if (!list)
            return [];
        var sections = list.map(function (item) {
            var iany = item;
            return {
                name: iany.$.name ? iany.$.name : '',
                number: iany.$.number ? parseInt(iany.$.number) : 0,
                startTime: iany.$.startTime ? parseFloat(iany.$.startTime) : 0,
            };
        });
        return sections;
    };
    return SongSection;
}());
exports.SongSection = SongSection;
var SongNote = /** @class */ (function () {
    function SongNote() {
        this.time = 0;
        this.string = -1;
        this.fret = -1;
        this.bendValues = [];
    }
    SongNote.fromNoteData = function (noteData) {
        return noteData.notes.map(function (item) {
            return {
                time: item.startTime,
                string: item.string,
                fret: item.fret,
            };
        });
    };
    SongNote.fromXML = function (xmlData, chordNote) {
        if (chordNote === void 0) { chordNote = false; }
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = chordNote ? item.chordNote : item.note;
        if (!list)
            return [];
        var notes = list.map(function (item) {
            var iany = item;
            var _a = iany.$, time = _a.time, sustain = _a.sustain, rest = __rest(_a, ["time", "sustain"]);
            time = parseFloat(time);
            rest = objectMap(rest, function (item) { return parseInt(item, 10); });
            var main = __assign({ time: time }, rest);
            Object.assign(main, sustain && { sustain: parseFloat(sustain) }, iany.bendValues && { bendValues: BendValue.fromXML(iany.bendValues) });
            return main;
        });
        return notes;
    };
    return SongNote;
}());
exports.SongNote = SongNote;
var SongEvent = /** @class */ (function () {
    function SongEvent() {
        this.time = 0;
        this.code = "";
    }
    SongEvent.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.event;
        if (!list)
            return [];
        var events = list.map(function (item) {
            var iany = item;
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                code: iany.$.code ? iany.$.code : '',
            };
        });
        return events;
    };
    return SongEvent;
}());
exports.SongEvent = SongEvent;
var SongChordTemplate = /** @class */ (function () {
    function SongChordTemplate() {
        this.displayName = "";
        this.chordName = "";
        this.fret0 = -1;
        this.fret1 = -1;
        this.fret2 = -1;
        this.fret3 = -1;
        this.fret4 = -1;
        this.fret5 = -1;
        this.finger0 = -1;
        this.finger1 = -1;
        this.finger2 = -1;
        this.finger3 = -1;
        this.finger4 = -1;
        this.finger5 = -1;
    }
    SongChordTemplate.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.chordTemplate;
        if (!list)
            return [];
        var chordTemplates = list.map(function (item) {
            var iany = item;
            return {
                displayName: iany.$.displayName ? iany.$.displayName : '',
                chordName: iany.$.chordName ? iany.$.chordName : '',
                fret0: iany.$.fret0 ? parseInt(iany.$.fret0, 10) : -1,
                fret1: iany.$.fret1 ? parseInt(iany.$.fret1, 10) : -1,
                fret2: iany.$.fret2 ? parseInt(iany.$.fret2, 10) : -1,
                fret3: iany.$.fret3 ? parseInt(iany.$.fret3, 10) : -1,
                fret4: iany.$.fret4 ? parseInt(iany.$.fret4, 10) : -1,
                fret5: iany.$.fret5 ? parseInt(iany.$.fret5, 10) : -1,
                finger0: iany.$.finger0 ? parseInt(iany.$.finger0, 10) : -1,
                finger1: iany.$.finger1 ? parseInt(iany.$.finger1, 10) : -1,
                finger2: iany.$.finger2 ? parseInt(iany.$.finger2, 10) : -1,
                finger3: iany.$.finger3 ? parseInt(iany.$.finger3, 10) : -1,
                finger4: iany.$.finger4 ? parseInt(iany.$.finger4, 10) : -1,
                finger5: iany.$.finger5 ? parseInt(iany.$.finger5, 10) : -1,
            };
        });
        return chordTemplates;
    };
    return SongChordTemplate;
}());
exports.SongChordTemplate = SongChordTemplate;
var SongPhraseProperty = /** @class */ (function () {
    function SongPhraseProperty() {
        this.phraseId = 0;
        this.redundant = 0;
        this.levelJump = 0;
        this.empty = 0;
        this.difficulty = 0;
    }
    SongPhraseProperty.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.phraseProperty;
        if (!list)
            return [];
        var phraseProperty = list.map(function (item) {
            var iany = item;
            return {
                phraseId: iany.$.phraseId ? parseInt(iany.$.phraseId) : 0,
                redundant: iany.$.redundant ? parseInt(iany.$.redundant) : 0,
                levelJump: iany.$.levelJump ? parseInt(iany.$.levelJump) : 0,
                empty: iany.$.empty ? parseInt(iany.$.empty) : 0,
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty) : 0,
            };
        });
        return phraseProperty;
    };
    return SongPhraseProperty;
}());
exports.SongPhraseProperty = SongPhraseProperty;
var SongLinkedDiff = /** @class */ (function () {
    function SongLinkedDiff() {
        this.parentId = 0;
        this.childId = '';
    }
    SongLinkedDiff.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.linkedDiff;
        if (!list)
            return [];
        var songLinkedDiff = list.map(function (item) {
            var iany = item;
            return {
                parentId: iany.$.parentId ? parseInt(iany.$.parentId) : 0,
                childId: iany.$.childId ? iany.$.childId : '',
            };
        });
        return songLinkedDiff;
    };
    return SongLinkedDiff;
}());
exports.SongLinkedDiff = SongLinkedDiff;
var SongNld_Phrase = /** @class */ (function () {
    function SongNld_Phrase() {
        this.id = 0;
    }
    SongNld_Phrase.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData;
        var list = item;
        if (!list)
            return [];
        var songnld_phrase = list.map(function (item) {
            var iany = item;
            return {
                id: iany.$.id ? parseInt(iany.$.id) : 0,
            };
        });
        return songnld_phrase;
    };
    return SongNld_Phrase;
}());
exports.SongNld_Phrase = SongNld_Phrase;
var SongNewLinkedDiff = /** @class */ (function () {
    function SongNewLinkedDiff() {
        this.phraseCount = 0;
        this.ratio = '';
        this.levelBreak = 0;
        this.nld_phrase = [];
    }
    SongNewLinkedDiff.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.newLinkedDiff;
        if (!list)
            return [];
        var songNewLinkedDiff = list.map(function (item) {
            var iany = item;
            return {
                phraseCount: iany.$.phraseCount ? parseInt(iany.$.phraseCount) : 0,
                ratio: iany.$.ratio ? iany.$.ratio : '',
                levelBreak: iany.$.levelBreak ? parseInt(iany.$.levelBreak) : 0,
                nld_phrase: SongNld_Phrase.fromXML(iany.nld_phrase)
            };
        });
        return songNewLinkedDiff;
    };
    return SongNewLinkedDiff;
}());
exports.SongNewLinkedDiff = SongNewLinkedDiff;
var HeroLevel = /** @class */ (function () {
    function HeroLevel() {
        this.difficulty = 0;
        this.hero = 0;
    }
    HeroLevel.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.heroLevel;
        if (!list)
            return [];
        var heroLevel = list.map(function (item) {
            var iany = item;
            return {
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty, 10) : 0,
                hero: iany.$.hero ? parseInt(iany.$.hero, 10) : 0,
            };
        });
        return heroLevel;
    };
    return HeroLevel;
}());
exports.HeroLevel = HeroLevel;
var SongPhraseIteration = /** @class */ (function () {
    function SongPhraseIteration() {
        this.time = 0;
        this.phraseId = 0;
        this.variation = '';
        this.heroLevels = [];
    }
    SongPhraseIteration.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.phraseIteration;
        if (!list)
            return [];
        var phraseIteration = list.map(function (item) {
            var iany = item;
            return {
                time: iany.$.time ? parseFloat(iany.$.time) : 0,
                phraseId: iany.$.phraseId ? parseInt(iany.$.phraseId, 10) : 0,
                variation: iany.$.variation ? iany.$.variation : '',
                heroLevels: HeroLevel.fromXML(iany.heroLevels)
            };
        });
        return phraseIteration;
    };
    return SongPhraseIteration;
}());
exports.SongPhraseIteration = SongPhraseIteration;
var BendValue = /** @class */ (function () {
    function BendValue() {
        this.time = 0;
        this.step = -1;
        this.unk5 = -1;
    }
    BendValue.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.bendValue;
        if (!list)
            return [];
        var bendValues = list.map(function (item) {
            var iany = item;
            var _a = iany.$, time = _a.time, step = _a.step, rest = __rest(_a, ["time", "step"]);
            time = parseFloat(time);
            step = parseFloat(step);
            rest = objectMap(rest, function (item) { return parseInt(item, 10); });
            var main = __assign({ time: time,
                step: step }, rest);
            return main;
        });
        return bendValues;
    };
    return BendValue;
}());
exports.BendValue = BendValue;
var SongArrangementProperties = /** @class */ (function () {
    function SongArrangementProperties() {
        this.bonusArr = 0;
        this.Metronome = 0;
        this.pathLead = 0;
        this.pathRhythm = 0;
        this.pathBass = 0;
        this.routeMask = 0;
        this.represent = 0;
        this.standardTuning = 0;
        this.nonStandardChords = 0;
        this.barreChords = 0;
        this.powerChords = 0;
        this.dropDPower = 0;
        this.openChords = 0;
        this.fingerPicking = 0;
        this.pickDirection = 0;
        this.doubleStops = 0;
        this.palmMutes = 0;
        this.harmonics = 0;
        this.pinchHarmonics = 0;
        this.hopo = 0;
        this.tremolo = 0;
        this.slides = 0;
        this.unpitchedSlides = 0;
        this.bends = 0;
        this.tapping = 0;
        this.vibrato = 0;
        this.fretHandMutes = 0;
        this.slapPop = 0;
        this.twoFingerPicking = 0;
        this.fifthsAndOctaves = 0;
        this.syncopation = 0;
        this.bassPick = 0;
        this.sustain = 0;
    }
    return SongArrangementProperties;
}());
exports.SongArrangementProperties = SongArrangementProperties;
var SongHandShape = /** @class */ (function () {
    function SongHandShape() {
        this.chordId = 0;
        this.startTime = 0;
        this.endTime = 0;
    }
    SongHandShape.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.handShape;
        if (!list)
            return [];
        var handShapes = list.map(function (item) {
            var iany = item;
            var _a = iany.$, chordId = _a.chordId, startTime = _a.startTime, endTime = _a.endTime;
            chordId = parseInt(chordId);
            startTime = parseFloat(startTime);
            endTime = parseFloat(endTime);
            return {
                chordId: chordId,
                endTime: endTime,
                startTime: startTime,
            };
        });
        return handShapes;
    };
    return SongHandShape;
}());
exports.SongHandShape = SongHandShape;
var SongAnchor = /** @class */ (function () {
    function SongAnchor() {
        this.time = 0;
        this.fret = 0;
        this.width = 0;
    }
    SongAnchor.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.anchor;
        if (!list)
            return [];
        var anchors = list.map(function (item) {
            var iany = item;
            var _a = iany.$, time = _a.time, fret = _a.fret, width = _a.width;
            time = parseFloat(time);
            fret = parseInt(fret);
            width = parseFloat(width);
            return {
                time: time,
                fret: fret,
                width: width,
            };
        });
        return anchors;
    };
    return SongAnchor;
}());
exports.SongAnchor = SongAnchor;
var SongChord = /** @class */ (function () {
    function SongChord() {
        this.time = 0;
        this.linkNext = 0;
        this.accent = 0;
        this.chordId = 0;
        this.fretHandMute = 0;
        this.highDensity = 0;
        this.ignore = 0;
        this.palmMute = 0;
        this.hopo = 0;
        this.strum = 0;
        this.chordNote = [];
    }
    SongChord.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.chord;
        if (!list)
            return [];
        var chords = list.map(function (item) {
            var iany = item;
            var _a = iany.$, time = _a.time, strum = _a.strum, rest = __rest(_a, ["time", "strum"]);
            time = parseFloat(time);
            rest = objectMap(rest, function (item) { return parseInt(item, 10); });
            return __assign(__assign({ time: time,
                strum: strum }, rest), { chordNote: SongNote.fromXML([iany], true) });
        });
        return chords;
    };
    return SongChord;
}());
exports.SongChord = SongChord;
var TranscriptionTrack = /** @class */ (function () {
    function TranscriptionTrack() {
        this.difficulty = 0;
        this.notes = [];
        this.chords = [];
        this.anchors = [];
        this.handShapes = [];
        this.fretHandMutes = [];
    }
    TranscriptionTrack.fromXML = function (xmlData) {
        var item = xmlData[0];
        var iany = item;
        var transcriptionTrack = {
            difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty) : 0,
            notes: SongNote.fromXML(iany.notes),
            chords: SongChord.fromXML(iany.chords),
            anchors: SongAnchor.fromXML(iany.anchors),
            handShapes: SongHandShape.fromXML(iany.handShapes),
            fretHandMutes: [],
        };
        return transcriptionTrack;
    };
    return TranscriptionTrack;
}());
exports.TranscriptionTrack = TranscriptionTrack;
var SongLevel = /** @class */ (function () {
    function SongLevel() {
        this.difficulty = 0;
        this.notes = [];
        this.chords = [];
        this.anchors = [];
        this.handShapes = [];
    }
    SongLevel.fromXML = function (xmlData) {
        if (!xmlData)
            return [];
        var item = xmlData[0];
        var list = item.level;
        if (!list)
            return [];
        var levels = list.map(function (item) {
            var iany = item;
            return {
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty, 10) : 0,
                notes: SongNote.fromXML(iany.notes),
                chords: SongChord.fromXML(iany.chords),
                anchors: SongAnchor.fromXML(iany.anchors),
                handShapes: SongHandShape.fromXML(iany.handShapes),
            };
        });
        return levels;
    };
    return SongLevel;
}());
exports.SongLevel = SongLevel;
exports.getI = function (item) {
    return item && item.length > 0 ? parseInt(item[0], 10) : 0;
};
exports.getF = function (item) {
    return item && item.length > 0 ? parseFloat(item[0]) : 0;
};
exports.getS = function (item) {
    return item && item.length > 0 ? item[0].toString() : '';
};
var objectMap = function (object, mapFn) {
    return Object.keys(object).reduce(function (result, key) {
        result[key] = mapFn(object[key]);
        return result;
    }, {});
};
