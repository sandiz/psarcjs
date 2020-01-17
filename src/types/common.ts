import { promises } from 'fs';
import * as xml2js from 'xml2js';
import { SNG, toTitleCase } from '..';
import { ISong2014, Tuning, SongArrangementProperties, SongNote, SongChord } from '../song2014';
import { TagValue, getUuid } from '../aggregategraphwriter';
import { getRandomInt } from '../bnkparser';
import { getNoteCount } from './sng';
export interface PSARCHEADER {
    MAGIC: string[4],
    VERSION: number,
    COMPRESSION: string[4],
    header_size: number,
    ENTRY_SIZE: number,
    n_entries: number,
    BLOCK_SIZE: number,
    ARCHIVE_FLAGS: number,
    bom: Buffer,
}

export interface ENTRY {
    md5: string[16],
    zindex: number,
    length: Buffer,
    offset: Buffer,
}

export interface BOM {
    entries: ENTRY[],
    zlength: number[],
}

export interface ToolkitInfo {
    name: string;
    version: string;
}

export enum Platform { Windows, Mac }

export type Arrangements = { [persistentID: string]: object };

export enum ArrangementTypeInt { LEAD = 0/* Single notes */, RHYTHM /* Chords */, COMBO /* Combo */, BASS, VOCALS, JVOCALS, SHOWLIGHTS };
export enum ArrangementType { LEAD = "lead", RHYTHM = "rhythm", BASS = "bass", VOCALS = "vocals", SHOWLIGHTS = "showlights" }

export enum RouteMask {
    None = 0,
    Lead = 1,
    Rhythm = 2,
    Any = 3,
    Bass = 4
}

export enum DNAId {
    None = 0,
    Solo = 1,
    Riff = 2,
    Chord = 3
}
export interface ArrangementDetails {
    [ArrangementType.LEAD]: number;
    [ArrangementType.RHYTHM]: number;
    [ArrangementType.BASS]: number;
    [ArrangementType.VOCALS]: number;
    [ArrangementType.SHOWLIGHTS]: number;
}

const URN_TEMPLATE = (a: string, b: string, c: string) => `urn:${a}:${b}:${c}`;
const URN_TEMPLATE_SHORT = (a: string, b: string) => `urn:${a}:${b}`;

export interface Manifest {
    entries: {
        [key: string]: {
            [key: string]: Attributes | AttributesHeader
        }
    };
    modelName?: string;
    iterationVersion?: number;
    insertRoot: string;
}
export class AttributesHeader {
    /* AttributesHeader2014 */
    public albumArt: string = '';
    public albumName: string = '';
    public albumNameSort: string = '';
    public arrangementName: string = '';
    public artistName: string = '';
    public artistNameSort: string = '';
    public bassPick: number = 0;
    public capoFret: number = 0;
    public centOffset: number = 0;
    public dLC: boolean = false;
    public dLCKey: string = '';
    public dnaChords: number = 0;
    public dnaRiffs: number = 0;
    public dnaSolo: number = 0;
    public easyMastery: number = 0;
    public leaderboardChallengeRating: number = 0;
    public manifestUrn: string = '';
    public masterID_RDV: number = 0;
    public metronome: number = 0;
    public mediumMastery: number = 0;
    public notesEasy: number = 0;
    public notesHard: number = 0;
    public notesMedium: number = 0;
    public representative: number = 0;
    public routeMask: number = 0;
    public shipping: boolean = false;
    public sKU: string = '';
    public songDiffEasy: number = 0;
    public songDiffHard: number = 0;
    public songDiffMed: number = 0;
    public songDifficulty: number = 0;
    public songKey: string = '';
    public songLength: number = 0;
    public songName: string = '';
    public songNameSort: string = '';
    public songYear: number = 0;
    public tuning: Tuning = {
        string0: 0, string1: 0, string2: 0,
        string3: 0, string4: 0, string5: 0
    };
    public persistentID: string = '';
}
export class Attributes {
    /* Attributes2014 */
    public arrangementProperties: SongArrangementProperties = new SongArrangementProperties();
    public arrangementSort: number = 0;
    public arrangementType: ArrangementTypeInt = ArrangementTypeInt.VOCALS;
    public blockAsset: string = '';
    public chords: { [key: string]: { [key: string]: number[] } } = {}
    public chordTemplates: Array<ManifestChordTemplate> = [];
    public dynamicVisualDensity: Array<number> = [];
    public fullName: string = '';
    public lastConversionDateTime: string = '';
    public masterID_PS3: number = 0;
    public masterID_XBox360: number = 0;
    public maxPhraseDifficulty: number = 0;
    public phraseIterations: Array<ManifestPhraseIteration> = [];
    public phrases: Array<ManifestPhrase> = [];
    public previewBankPath: string = '';
    public relativeDifficulty: number = 0;
    public score_MaxNotes: number = 0;
    public score_PNV: number = 0;
    public sections: Array<ManifestSection> = [];
    public showlightsXML: string = '';
    public songAsset: string = '';
    public songAverageTempo: number = 0;
    public songBank: string = '';
    public songEvent: string = '';
    public songOffset: number = 0;
    public songPartition: number = 0;
    public songXml: string = '';
    public targetScore: number = 0;
    public techniques: { [key: string]: { [key: string]: number[] } } = {}
    public tone_A: string = '';
    public tone_B: string = '';
    public tone_Base: string = '';
    public tone_C: string = '';
    public tone_D: string = '';
    public tone_Multiplayer: string = '';
    public tones: Array<ManifestTone> = [];
    public inputEvent: string = '';
    public songVolume: number = 0;
    public previewVolume: number = 0;
}
export interface ArrangementPart {
    persistentID: string;
    arrangementType: ArrangementType;
}
/* represents an arrangment in psarc */
export class Arrangement {
    public isVocal: boolean;
    public song2014: ISong2014;
    public arrType: ArrangementType;

    public header = new AttributesHeader();
    public main = new Attributes();


    constructor(song: ISong2014, sng: SNG, options: {
        tag: string,
        sortOrder: number,
        volume: number,
        previewVolume: number,
        bassPicked?: boolean,
        represent?: boolean,
        details: ArrangementDetails,
        tones: ManifestTone[],
        info?: {
            songName: string,
            albumName: string,
            persistentID?: string,
            year?: number,
            currentPartition: number,
            scrollSpeed: number,
        }
    }) {
        this.arrType = ArrangementType[song.arrangement.toUpperCase() as keyof typeof ArrangementType];
        this.main.arrangementType = ArrangementTypeInt[song.arrangement.toUpperCase() as keyof typeof ArrangementType];
        this.header.arrangementName = toTitleCase(song.arrangement);

        const masterID = this.main.arrangementType == ArrangementTypeInt.VOCALS ? -1 : getRandomInt();
        const pID = options.info?.persistentID ?? getUuid().replace(/-/g, "").toUpperCase();
        const dlcName = options.tag.toLowerCase();
        const xblockUrn = URN_TEMPLATE_SHORT(TagValue.EmergentWorld, dlcName);
        const showlightUrn = URN_TEMPLATE(TagValue.Application, TagValue.XML, `${dlcName}_showlights`);
        const songXmlUrn = URN_TEMPLATE(TagValue.Application, TagValue.XML, `${dlcName}_${this.arrType}`);
        const songSngUrn = URN_TEMPLATE(TagValue.Application, TagValue.MusicgameSong, `${dlcName}_${this.arrType}`);
        const albumUrn = URN_TEMPLATE(TagValue.Image, TagValue.DDS, `album_${options.tag.toLowerCase()}`);
        const jsonUrn = URN_TEMPLATE(TagValue.Database, TagValue.JsonDB, `${dlcName}_${this.arrType}`);

        this.isVocal = this.main.arrangementType == ArrangementTypeInt.VOCALS;
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
        this.main.fullName = `${options.tag}_${toTitleCase(this.arrType)}`;
        this.main.masterID_PS3 = masterID;
        this.main.masterID_XBox360 = masterID;
        this.main.previewBankPath = `song_${dlcName}_preview.bnk`;
        this.main.relativeDifficulty = 0;
        this.main.showlightsXML = showlightUrn;
        this.main.songAsset = songSngUrn;
        this.main.songBank = `song_${dlcName}.bnk`;
        this.main.songEvent = `Play_${options.tag}`;
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
        this.header.dnaChords = sng.sng?.dna?.filter(item => item.id === DNAId.Chord).length ?? 0;
        this.header.dnaRiffs = sng.sng?.dna?.filter(item => item.id === DNAId.Riff).length ?? 0;
        this.header.dnaSolo = sng.sng?.dna?.filter(item => item.id === DNAId.Solo).length ?? 0;
        this.header.notesEasy = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 0) : 0;
        this.header.notesMedium = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 1) : 0;
        this.header.notesHard = sng.sng && sng.sng.phraseIterations && sng.sng.levels ? getNoteCount(sng.sng.phraseIterations, sng.sng.levels, 2) : 0;
        this.header.easyMastery = parseFloat((this.header.notesEasy / this.header.notesHard).toFixed(9));
        this.header.mediumMastery = parseFloat((this.header.notesMedium / this.header.notesHard).toFixed(9));
        this.main.arrangementProperties = song.arrangementProperties;
        /*
        if (this.arrType == ArrangementType.BASS) {
            this.header.bassPick = options.bassPicked == undefined ? 0 : (options.bassPicked ? 1 : 0);
        }
        else
            delete this.header.bassPick;
        */

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
        this.header.songYear = options.info?.year ?? parseInt(song.albumYear, 0);
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

        const diff = this.getSongDifficulty();
        this.header.songDiffEasy = parseFloat(diff.songDiffEasy.toFixed(9));
        this.header.songDiffMed = parseFloat(diff.songDiffMed.toFixed(9));
        this.header.songDiffHard = parseFloat(diff.songDiffHard.toFixed(9));
        this.header.songDifficulty = diff.songDifficulty;
        this.main.maxPhraseDifficulty = this.getMaxDifficulty();

        const ret = this.getPhraseIterations();
        this.main.phraseIterations = ret.phraseIterations;
        this.main.score_MaxNotes = ret.maxNotes;
        this.main.score_PNV = parseFloat(ret.PNV.toFixed(6));

        this.main.phrases = this.getPhrases();
        this.main.sections = this.getSections();
        this.main.chordTemplates = this.getChordTemplates();
        this.main.chords = this.getChords();
        this.main.techniques = this.getTechniques();
        this.main.dynamicVisualDensity = this.getDynamicDesnity(options.info?.scrollSpeed ?? 20);

        const tret = this.getTones(options.tones);
        this.main.tones = tret.tones;
        this.main.tone_A = tret.tonea;
        this.main.tone_B = tret.toneb;
        this.main.tone_C = tret.tonec;
        this.main.tone_D = tret.toned;
        this.main.tone_Base = tret.tonebase;
        this.main.tone_Multiplayer = tret.tone_mult;

        delete (this.header.metronome);
        delete (this.header.representative);
        delete (this.header.routeMask);
        delete (this.header.bassPick);
    }

    private getSongDifficulty() {
        // This is not the way official values are calculated, but sometimes gets pretty close
        // TODO: improve calculation
        var arrProrp = this.main.arrangementProperties;
        let techCoeff = arrProrp.nonStandardChords +
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
        const songDiffHard = (techCoeff * this.header.notesHard) / this.header.songLength / 100;
        const songDiffMed = (techCoeff * this.header.notesMedium) / this.header.songLength / 50;
        const songDiffEasy = (techCoeff * this.header.notesEasy) / this.header.songLength / 25;
        const songDifficulty = songDiffHard;

        return {
            songDiffEasy,
            songDiffMed,
            songDiffHard,
            songDifficulty,
        }
    }

    private getMaxDifficulty() {
        let max = 0;
        this.song2014.phrases.forEach(phrase => {
            if (max < phrase.maxDifficulty)
                max = phrase.maxDifficulty;
        })
        return max;
    }

    private getPhraseIterations() {
        const phraseIterations: ManifestPhraseIteration[] = [];
        let maxNotes = 0;
        let PNV = 0;

        for (let i = 0; i < this.song2014.phraseIterations.length; i++) {
            const phraseIteration = this.song2014.phraseIterations[i];
            const phrase = this.song2014.phrases[phraseIteration.phraseId];
            const endTime = i >= this.song2014.phraseIterations.length - 1 ? this.song2014.songLength : this.song2014.phraseIterations[i + 1].time;

            var pit: ManifestPhraseIteration = {
                startTime: phraseIteration.time,
                endTime,
                phraseIndex: phraseIteration.phraseId,
                name: phrase.name,
                maxDifficulty: phrase.maxDifficulty,
            };
            phraseIterations.push(pit);
        }

        let noteCnt = 0;
        const _noteCount = (start: number, end: number, notes: SongNote[]) => {
            let count = 0;
            notes.forEach(n => {
                if (n.time < end && n.time >= start)
                    count++;
            })
            return count;
        }

        const _chordCount = (start: number, end: number, chords: SongChord[]) => {
            let count = 0;
            chords.forEach(n => {
                if (n.time < end && n.time >= start)
                    count++;
            })
            return count;
        }

        phraseIterations.forEach(y => {
            if (this.song2014.levels[y.maxDifficulty].notes.length > 0) {
                noteCnt += _noteCount(y.startTime, y.endTime, this.song2014.levels[y.maxDifficulty].notes);
            }
            if (this.song2014.levels[y.maxDifficulty].chords.length > 0) {
                noteCnt += _chordCount(y.startTime, y.endTime, this.song2014.levels[y.maxDifficulty].chords);
            }
        });

        maxNotes = noteCnt;
        PNV = this.main.targetScore / noteCnt;

        return {
            phraseIterations,
            maxNotes,
            PNV,
        }
    }

    private getPhrases() {
        const ph: ManifestPhrase[] = [];

        this.song2014.phrases.forEach((phrase, ind) => {
            const p: ManifestPhrase = {
                iterationCount: this.song2014.phraseIterations.filter(z => z.phraseId == ind).length,
                maxDifficulty: phrase.maxDifficulty,
                name: phrase.name,
            }
            ph.push(p);
        })
        return ph;
    }

    private getSections() {
        const sects: ManifestSection[] = [];
        this.song2014.sections.forEach((section, i) => {
            var sect: ManifestSection = {
                name: section.name,
                number: section.number,
                startTime: section.startTime,
                endTime: (i >= this.song2014.sections.length - 1) ? this.song2014.songLength : this.song2014.sections[i + 1].startTime,
                uIName: '',
                startPhraseIterationIndex: 0,
                endPhraseIterationIndex: 0,
                isSolo: false,
            };
            let sep: string[] = sect.name.split(" ");

            // process "<section><number>" used by official XML
            var numAlpha = new RegExp("(?<Alpha>[a-zA-Z]*)(?<Numeric>[0-9]*)");
            var match = sep[0].match(numAlpha);
            if (match && match.groups && match.groups["Numeric"] != "")
                sep = [match.groups["Alpha"][0], match.groups["Numeric"][0]];

            if (sep.length == 1) {
                let uiName = SectionUINames[sep[0] as keyof typeof SectionUINames]
                if (uiName != '')
                    sect.uIName = uiName;
                else
                    throw new Error(`Unknown section name: ${sep[0]}`);
            }
            else {
                let uiName = SectionUINames[sep[0] as keyof typeof SectionUINames]

                if (parseInt(sep[1], 10) != 0 || parseInt(sep[1], 10) != 1)
                    uiName += `|${sep[1]}`;

                if (uiName != '')
                    sect.uIName = uiName;
                else
                    throw new Error(`Unknown section name: ${sep[0]}`);
            }
            var phraseIterStart = -1;
            var phraseIterEnd = 0;
            var isSolo = section.name == "solo";
            for (let o = 0; o < this.song2014.phraseIterations.length; o++) {
                var phraseIter = this.song2014.phraseIterations[o];
                if (phraseIterStart == -1 && phraseIter.time >= sect.startTime)
                    phraseIterStart = o;
                if (phraseIter.time >= sect.endTime)
                    break;
                phraseIterEnd = o;
                if (this.song2014.phrases[phraseIter.phraseId].solo > 0)
                    isSolo = true;
            }
            sect.startPhraseIterationIndex = phraseIterStart;
            sect.endPhraseIterationIndex = phraseIterEnd;
            sect.isSolo = isSolo;
            sects.push(sect);
        })
        return sects;
    }

    private getChordTemplates() {
        const mct: ManifestChordTemplate[] = [];

        this.song2014.chordTemplates.forEach((y, indx) => {
            if (y.chordName != "") {
                const st: ManifestChordTemplate = {
                    chordId: indx,
                    chordName: y.chordName,
                    fingers: [y.finger0, y.finger1, y.finger2,
                    y.finger3, y.finger4, y.finger5],
                    frets: [y.fret0, y.fret1, y.fret2,
                    y.fret3, y.fret4, y.fret5],
                }
                mct.push(st);
            }
        })
        return mct;
    }

    private getChords() {
        let chordsMap: { [key: string]: { [key: string]: number[] } } = {};
        for (let difficulty = 0; difficulty < this.song2014.levels.length; difficulty++) {
            var chords = this.song2014.levels[difficulty].handShapes;
            var sectionId: { [key: string]: number[] } = {}
            var chordId: Array<number> = [];

            for (let section = 0; section < this.song2014.sections.length; section++) {
                var sectionNumber = this.song2014.sections[section].number;
                var startTime = this.song2014.sections[section].startTime;
                var endTime = this.song2014.sections[Math.min(section + 1, this.song2014.sections.length - 1)].startTime;

                chords.forEach(chord => {
                    if (chord.startTime >= startTime && chord.endTime < endTime)
                        chordId.push(chord.chordId);
                });
                if (chordId.length > 0) {
                    let distinctChordIds: Array<number> = [...new Set(chordId)].sort((a, b) => a - b);
                    sectionId[section.toString()] = distinctChordIds;
                }
                chordId = [];
            }
            if (Object.keys(sectionId).length > 0) {
                chordsMap[difficulty.toString()] = sectionId;
            }
        }
        return chordsMap;
    }

    private getTechniques() {
        let ts: { [key: string]: { [key: string]: number[] } } = {};
        for (let difficulty = 0; difficulty < this.song2014.levels.length; difficulty++) {
            var notes = this.song2014.levels[difficulty].notes;
            var sectionId: { [key: string]: number[] } = {}
            var techId: Array<number> = [];

            for (let section = 0; section < this.song2014.sections.length; section++) {
                var sectionNumber = this.song2014.sections[section].number;
                var startTime = this.song2014.sections[section].startTime;
                var endTime = this.song2014.sections[Math.min(section + 1, this.song2014.sections.length - 1)].startTime;

                notes.forEach(note => {
                    if (note.time >= startTime && note.time < endTime) {
                        var nt: number[] = this.getNoteTech(note);
                        techId = techId.concat(nt);
                    }

                });
                if (techId.length > 0) {
                    const p = [...new Set(techId)];
                    p.sort((a, b) => a - b);
                    let distinctTechIds: Array<number> = p;
                    if (Object.keys(sectionId).includes(sectionNumber.toString())) {
                        var techIdValue = Object.values(sectionId[sectionNumber.toString()]);
                        if (techIdValue) {
                            techIdValue = techIdValue.concat(distinctTechIds);
                            const s = [...new Set(techIdValue)];
                            s.sort((a, b) => a - b);
                            distinctTechIds = s;
                            delete sectionId[sectionNumber.toString()]

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
    }

    private getNoteTech(n: SongNote): number[] {
        const t: number[] = [];
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
    }

    private getDynamicDesnity(scrollSpeed: number) {
        let mt: number[] = [];
        if (this.arrType == ArrangementType.VOCALS) {
            mt = new Array<number>(20).fill(2.0);
        }
        else {
            const floorLimit = 5;
            const endSpeed = Math.min(50, Math.max(floorLimit, scrollSpeed)) / 10;

            if (this.song2014.levels.length == 1)
                mt = new Array<number>(20).fill(endSpeed);
            else {
                let beginSpeed = 5.0;
                let maxLevel = Math.min(this.song2014.levels.length, 20) - 1;
                let factor = maxLevel > 0 ? Math.pow(endSpeed / beginSpeed, 1 / maxLevel) : 1;
                for (let i = 0; i < 20; i++) {
                    if (i >= maxLevel - 1)
                        mt.push(endSpeed);
                    else if (i == 0)
                        mt.push(beginSpeed);
                    else {
                        let speed = beginSpeed * Math.pow(factor, i);
                        speed = parseFloat(speed.toFixed(1));
                        mt.push(speed);
                    }
                }
            }
        }
        return mt;
    }

    private getTones(tones: ManifestTone[]) {
        const mt: ManifestTone[] = [];
        const _gtn = (tone: string) => {
            let toneName = "";
            let defaultTone = "default";
            if (tone && tone != "") {
                var matched = tones.find(t => t.name.toLowerCase() == tone.toLowerCase());
                if (matched) {
                    if (matched.gearList) {
                        if (!mt.includes(matched))
                            mt.push(matched);
                        toneName = tone;
                    } else {
                        toneName = defaultTone;
                    }
                }
            }
            return toneName;
        };
        let tonea: string = _gtn(this.song2014.tonea)
        let toneb: string = _gtn(this.song2014.toneb)
        let tonec: string = _gtn(this.song2014.tonec);
        let toned: string = _gtn(this.song2014.toned);
        let tonebase: string = _gtn(this.song2014.tonebase);
        let tone_mult: string = _gtn("");

        return {
            tonea,
            toneb,
            tonec,
            toned,
            tonebase,
            tone_mult,
            tones: mt,
        }
    }
}

const SectionUINames = {
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
    rifff: "$[34298] Riff [1]", //incorrect name in some adverse cases
    silence: "$[34299] Silence [1]",
    solo: "$[34300] Solo [1]",
    tapping: "$[34305] Tapping [1]",
    transition: "$[34301] Transition [1]",
    vamp: "$[34302] Vamp [1]",
    variation: "$[34303] Variation [1]",
    verse: "$[34304] Verse [1]",
    noguitar: "$[6091] No Guitar [1]",
}

const ToneDescriptors = {
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
}

export interface ManifestChordTemplate {
    chordId: number;
    chordName: string;
    fingers: number[];
    frets: number[];
}
export interface ManifestPhraseIteration {
    phraseIndex: number;
    maxDifficulty: number;
    name: string;
    startTime: number;
    endTime: number;
}

export interface ManifestPhrase {
    iterationCount: number;
    maxDifficulty: number;
    name: string;
}

export interface ManifestSection {
    name: string;
    uIName: string;
    number: number;
    startTime: number;
    endTime: number;
    startPhraseIterationIndex: number;
    endPhraseIterationIndex: number;
    isSolo: boolean;
}

export interface ManifestTone {
    gearList: ToneGear;
    isCustom: boolean;
    volume: string;
    toneDescriptors: string[];
    key: string;
    nameSeparator: string;
    name: string;
    sortOrder: number;
}

export const ManifestToneReviver = (key: string, value: any) => {
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
}


let currentSection = '';
export const ManifestReplacer = (allKeys: string[], key: string, value: any) => {
    function replacer(this: any, key: string, value: any) {

        const arrFields = ["ChordTemplates", "PhraseIterations",
            "Phrases", "Sections", "DynamicVisualDensity", "Tones", "ToneDescriptors"];
        const specialFields = ["Techniques", "Chords", "ChordTemplates"];
        const sect = allKeys.includes(key.charAt(0).toLowerCase() + key.substring(1))
            ? key : '';
        if (sect != '')
            currentSection = sect;

        if (value && typeof value === 'object') {
            var replacement: any;
            if (arrFields.includes(key) ||
                (specialFields.includes(currentSection)
                    && !specialFields.includes(key)
                    && Array.isArray(value))
            ) replacement = [];
            else replacement = {};

            for (var k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    if (k.startsWith("dna")) {
                        let newK = "DNA_" + toTitleCase(k.split("dna")[1]);
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
}

export interface ToneGear {
    rack1: TonePedal;
    rack2?: TonePedal;
    rack3?: TonePedal;
    rack4?: TonePedal;

    amp: TonePedal;
    cabinet: TonePedal;

    prePedal1: TonePedal;
    prePedal2?: TonePedal;
    prePedal3?: TonePedal;
    prePedal4?: TonePedal;

    postPedal1: TonePedal;
    postPedal2?: TonePedal;
    postPedal3?: TonePedal;
    postPedal4?: TonePedal;
}

export interface TonePedal {
    type: string;
    knobValues: { [key: string]: number };
    key: string;
    category?: string;
    skin?: string;
    skinIndex?: number;
}

export class ShowLights {
    time: number = 0;
    note: number = 0;

    static async fromXML(xmlFile: string): Promise<ShowLights[]> {
        const data = await promises.readFile(xmlFile);
        const parsed = await xml2js.parseStringPromise(data);
        const sl = parsed.showlights.showlight;

        const lights: ShowLights[] = [];
        sl.map((item: { $: ShowLights }) => {
            lights.push({
                time: parseFloat(item.$.time.toString()),
                note: parseInt(item.$.note.toString(), 10),
            })
        })
        return lights;
    }

    static toXML(sl: ShowLights[]): string {
        const e = {
            showlights: {
                $: {
                    count: sl.length,
                },
                showlight: sl.map(item => {
                    return {
                        $: { ...item },
                    }
                })
            }
        }


        const builder = new xml2js.Builder();
        const xml = builder.buildObject(e);
        return xml;
    }
}

export class Vocals {
    time: number = 0;
    note: number = 0;
    length: number = 0;
    lyric: string = '';

    static async fromXML(xmlFile: string): Promise<Vocals[]> {
        const data = await promises.readFile(xmlFile);
        const parsed = await xml2js.parseStringPromise(data);
        const sl = parsed.vocals.vocal;

        const vocals: Vocals[] = [];
        sl.map((item: { $: Vocals }) => {
            vocals.push({
                time: parseFloat(item.$.time.toString()),
                note: parseInt(item.$.note.toString(), 10),
                length: parseFloat(item.$.length.toString()),
                lyric: item.$.lyric,
            })
        })
        return vocals;
    }

    static toXML(sl: Vocals[]): string {
        const e = {
            vocals: {
                $: {
                    count: sl.length,
                },
                vocal: sl.map(item => {
                    return {
                        $: { ...item },
                    }
                })
            }
        }


        const builder = new xml2js.Builder();
        const xml = builder.buildObject(e);
        return xml;
    }
}

export interface PSARCOptions {
    tag: string,
    platform: Platform,
    toolkit: { author: string, comment: string, version: string, tk: ToolkitInfo },
    arrDetails: ArrangementDetails,
    dds: {
        '256': string,
        '128': string,
        '64': string,
    },
    audio: {
        main: { wem: string, bnk: string },
        preview: { wem: string, bnk: string },
    },
    songs: {
        arrangements: {
            [ArrangementType.LEAD]: string[],
            [ArrangementType.BASS]: string[],
            [ArrangementType.RHYTHM]: string[],
            [ArrangementType.VOCALS]: string[],
            [ArrangementType.SHOWLIGHTS]: string[],
        },
        sngs: {
            [ArrangementType.LEAD]: string[],
            [ArrangementType.BASS]: string[],
            [ArrangementType.RHYTHM]: string[],
            [ArrangementType.VOCALS]: string[],
        }
    }
}