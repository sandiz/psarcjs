"use strict";
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
        var list = item.control;
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
        var list = item.control;
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
exports.getI = function (item) {
    return item && item.length > 0 ? parseInt(item[0], 10) : 0;
};
exports.getF = function (item) {
    return item && item.length > 0 ? parseFloat(item[0]) : 0;
};
exports.getS = function (item) {
    return item && item.length > 0 ? item[0].toString() : '';
};
