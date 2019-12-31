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
Object.defineProperty(exports, "__esModule", { value: true });
var SongEbeat = /** @class */ (function () {
    function SongEbeat() {
        this.time = 0;
    }
    SongEbeat.fromBeatData = function (beats) {
        return beats.map(function (item) {
            var _a = item.split(" "), time = _a[0], beat = _a[1];
            var timef = parseFloat(time);
            var beati = parseInt(beat);
            if (beati === 1)
                return { time: timef, measure: beati };
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
            return {
                time: parseFloat(iany.$.time),
                measure: iany.$.measure ? parseInt(iany.$.measure) : 0,
            };
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
        this.id = 0;
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
        this.string = 0;
        this.fret = 0;
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
            sustain = parseFloat(sustain);
            rest = objectMap(rest, function (item) { return parseInt(item, 10); });
            return __assign({ time: time,
                sustain: sustain }, rest);
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
        this.fret0 = 0;
        this.fret1 = 0;
        this.fret2 = 0;
        this.fret3 = 0;
        this.fret4 = 0;
        this.fret5 = 0;
        this.finger0 = 0;
        this.finger1 = 0;
        this.finger2 = 0;
        this.finger3 = 0;
        this.finger4 = 0;
        this.finger5 = 0;
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
                fret0: iany.$.fret0 ? parseInt(iany.$.fret0, 10) : 0,
                fret1: iany.$.fret0 ? parseInt(iany.$.fret1, 10) : 0,
                fret2: iany.$.fret0 ? parseInt(iany.$.fret2, 10) : 0,
                fret3: iany.$.fret0 ? parseInt(iany.$.fret3, 10) : 0,
                fret4: iany.$.fret0 ? parseInt(iany.$.fret4, 10) : 0,
                fret5: iany.$.fret0 ? parseInt(iany.$.fret5, 10) : 0,
                finger0: iany.$.fret0 ? parseInt(iany.$.finger0, 10) : 0,
                finger1: iany.$.fret0 ? parseInt(iany.$.finger1, 10) : 0,
                finger2: iany.$.fret0 ? parseInt(iany.$.finger2, 10) : 0,
                finger3: iany.$.fret0 ? parseInt(iany.$.finger3, 10) : 0,
                finger4: iany.$.fret0 ? parseInt(iany.$.finger4, 10) : 0,
                finger5: iany.$.fret0 ? parseInt(iany.$.finger5, 10) : 0,
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
        var chords = list.map(function (item) {
            var iany = item;
            return {
                difficulty: iany.$.difficulty ? parseInt(iany.$.difficulty, 10) : 0,
                notes: SongNote.fromXML(iany.notes),
                chords: SongChord.fromXML(iany.chords),
                anchors: SongAnchor.fromXML(iany.anchors),
                handShapes: SongHandShape.fromXML(iany.handShapes),
            };
        });
        return chords;
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
