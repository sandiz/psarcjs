'use strict';

var util = require('util');
var path = require('path');
var tmp = require('tmp');
var chai = require('chai');
var forEach = require('mocha-each');
var chaiExclude = require('chai-exclude');
const assertArrays = require('chai-arrays');
var promises = require('fs').promises;
var {
    PSARC, SNG, DDS,
    WEM, WAAPI, GENERIC, BNK,
    SONGXML, SongEbeat, SongNote,
} = require('../dist');

var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(chaiExclude);
chai.use(assertArrays);
tmp.setGracefulCleanup();

const getUuid = (a = '') => (
    a
        /* eslint-disable no-bitwise */
        ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
        : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
);
async function psarcTests() {
    describe('psarcjs: PSARC: test.psarc', function () {
        const file = "test/psarc/test.psarc";
        const json = "manifests/songs_dlc_butitrainedsong/butitrainedsong_lead.json";
        let psarc;
        before(async () => {
            psarc = await getPSARC(file);
        })
        it('open psarc file: test.psarc', async function () {
            await openPSARC(psarc);
        });
        it('get files: expect 18', async function () {
            await getFiles(psarc, 18, json);
        });
        it('get arrangements: expect 1', async function () {
            await getArrangements(psarc, 1);
        });
        it('extract file from psarc: expect json', async function () {
            await extractFile(psarc, json);
        });
    });
    describe('psarcjs: PSARC: test2.psarc', function () {
        const file = "test/psarc/test2.psarc";
        const json = "manifests/songs_dlc_witchcraftsong/witchcraftsong_lead.json";
        let psarc;
        before(async () => {
            psarc = await getPSARC(file);
        })
        it('open psarc file: test2.psarc', async function () {
            await openPSARC(psarc);
        });
        it('get files: expect 24', async function () {
            await getFiles(psarc, 24, json);
        });
        it('get arrangements: expect 3', async function () {
            await getArrangements(psarc, 3);
        });
        it('extract file from psarc: export json', async function () {
            await extractFile(psarc, json);
        });
    });
}
async function sngTests() {
    const files = await promises.readdir(sngs);
    const sngfiles = files.filter(i => i.endsWith(".sng"));
    await forEach(sngfiles)
        .describe('psarcjs: SNG: %s', async function (f2) {
            let SNG;
            let json;
            before(async () => {
                const file = `${sngs}/${f2}`;
                json = JSON.parse(await promises.readFile(`${file}.json`));
                SNG = await getSNG(file);
                /*
                console.log(util.inspect(SNG.sng, {
                    depth: 2,
                    colors: true,
                    maxArrayLength: 2,
                    compact: false,
                }));
                */
            });
            it('valid sng file', async () => {
                expect(SNG.sng).to.be.not.null;
            });
            it(`check beats_length`, async () => {
                expect(SNG.sng.beats_length).to.equal(json.beats.length);
            });
            it(`check all beats`, async () => {
                for (let i = 0; i < SNG.sng.beats.length; i += 1) {
                    const le = SNG.sng.beats[i];
                    const re = json.beats[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check phrases_length`, async () => {
                expect(SNG.sng.phrases_length).to.equal(json.phrases.length);
            });
            it(`check all phrases`, async () => {
                for (let i = 0; i < SNG.sng.phrases.length; i += 1) {
                    const le = SNG.sng.phrases[i];
                    const re = json.phrases[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check chord_templates_length`, async () => {
                expect(SNG.sng.chord_templates_length).to.equal(json.chordTemplates.length);
            });
            it(`check all chordTemplates`, async () => {
                for (let i = 0; i < SNG.sng.chordTemplates.length; i += 1) {
                    const le = SNG.sng.chordTemplates[i];
                    const re = json.chordTemplates[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check chord_notes_length`, async () => {
                expect(SNG.sng.chord_notes_length).to.equal(json.chordNotes.length);
            });
            it(`check all chordNotes`, async () => {
                for (let i = 0; i < SNG.sng.chordNotes.length; i += 1) {
                    const le = SNG.sng.chordNotes[i];
                    const re = json.chordNotes[i];
                    expect(le).to.be.deep.equal(re);
                    expect(le.bends).to.be.deep.equal(re.bends);
                    expect(le.bends.bendValues).to.be.deep.equal(re.bends.bendValues);
                }
            });
            it(`check vocals_length`, async () => {
                expect(SNG.sng.vocals_length).to.equal(json.vocals.length);
            });
            it(`check all vocals`, async () => {
                for (let i = 0; i < SNG.sng.vocals.length; i += 1) {
                    const le = SNG.sng.vocals[i];
                    const re = json.vocals[i];
                    expect(le).to.be.deep.equal(re);
                }
                if (SNG.sng.vocals.length > 0) {
                    //expect(SNG.sng.symbols.header).to.be.deep.equal(json.symbols.header);
                    expect(SNG.sng.symbols.texture).to.be.deep.equal(json.symbols.texture);
                    expect(SNG.sng.symbols.definition).to.be.deep.equal(json.symbols.definition);
                }
            });
            it(`check phrase_iter_length`, async () => {
                expect(SNG.sng.phrase_iter_length).to.equal(json.phraseIterations.length);
            });
            it(`check all phraseIterations`, async () => {
                for (let i = 0; i < SNG.sng.phraseIterations.length; i += 1) {
                    const le = SNG.sng.phraseIterations[i];
                    const re = json.phraseIterations[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check phrase_extra_length`, async () => {
                expect(SNG.sng.phrase_extra_length).to.equal(json.phraseExtraInfos.length);
            });
            it(`check all phraseExtraInfos`, async () => {
                for (let i = 0; i < SNG.sng.phraseExtraInfos.length; i += 1) {
                    const le = SNG.sng.phraseExtraInfos[i];
                    const re = json.phraseExtraInfos[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check new_linked_length`, async () => {
                expect(SNG.sng.new_linked_length).to.equal(json.newLinkedDiffs.length);
            });
            it(`check all newLinkedDiffs`, async () => {
                for (let i = 0; i < SNG.sng.newLinkedDiffs.length; i += 1) {
                    const le = SNG.sng.newLinkedDiffs[i];
                    const re = json.newLinkedDiffs[i];
                    expect(le.levelBreak).to.be.deep.equal(re.levelBreak);

                    if (le.nld_phrase.nld_phrase_length > 0) {
                        expect(le.nld_phrase.nld_phrase_length).to.equal(json.newLinkedDiffs.nld_phrase.length)
                        for (let i = 0; i < SNG.sng.newLinkedDiffs.nld_phrase.length; i += 1) {
                            const le = SNG.sng.newLinkedDiffs.nld_phrase[i];
                            const re = json.newLinkedDiffs.nld_phrase[i];
                            expect(le.levelBreak).to.be.deep.equal(re.levelBreak);
                        }
                    }
                }
            });
            it(`check actions_length`, async () => {
                expect(SNG.sng.actions_length).to.equal(json.actions.length);
            });
            it(`check all actions`, async () => {
                for (let i = 0; i < SNG.sng.actions.length; i += 1) {
                    const le = SNG.sng.actions[i];
                    const re = json.actions[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check events_length`, async () => {
                expect(SNG.sng.events_length).to.equal(json.events.length);
            });
            it(`check all events`, async () => {
                for (let i = 0; i < SNG.sng.events.length; i += 1) {
                    const le = SNG.sng.events[i];
                    const re = json.events[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check tone_length`, async () => {
                expect(SNG.sng.tone_length).to.equal(json.tone.length);
            });
            it(`check all tones`, async () => {
                for (let i = 0; i < SNG.sng.tone.length; i += 1) {
                    const le = SNG.sng.tone[i];
                    const re = json.tone[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check dna_length`, async () => {
                expect(SNG.sng.dna_length).to.equal(json.dna.length);
            });
            it(`check all dnas`, async () => {
                for (let i = 0; i < SNG.sng.dna.length; i += 1) {
                    const le = SNG.sng.dna[i];
                    const re = json.dna[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check sections_length`, async () => {
                expect(SNG.sng.sections_length).to.equal(json.sections.length);
            });
            it(`check all sections`, async () => {
                for (let i = 0; i < SNG.sng.sections.length; i += 1) {
                    const le = SNG.sng.sections[i];
                    const re = json.sections[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check levels_length`, async () => {
                expect(SNG.sng.levels_length).to.equal(json.levels.length);
            });
            it(`check all levels`, async () => {
                for (let i = 0; i < SNG.sng.levels.length; i += 1) {
                    const le = SNG.sng.levels[i];
                    const re = json.levels[i];
                    expect(le.difficulty).to.be.deep.equal(re.difficulty);
                    expect(le.anchors_length).to.be.deep.equal(re.anchors.length)
                    for (let j = 0; j < le.anchors.length; j += 1) {
                        const le2 = le.anchors[i];
                        const re2 = re.anchors[i];
                        expect(le2).to.be.deep.equal(re2);
                    }
                    expect(le.anchor_ext_length).to.be.deep.equal(re.anchor_extensions.length)
                    for (let j = 0; j < le.anchor_extensions.length; j += 1) {
                        const le2 = le.anchor_extensions[i];
                        const re2 = re.anchor_extensions[i];
                        expect(le2).to.be.deep.equal(re2);
                    }
                    expect(le.fingerprints.length).to.be.equal(re.fingerprints.length)
                    for (let j = 0; j < le.fingerprints.length; j += 1) {
                        const le2 = le.fingerprints[j].I0;
                        const re2 = re.fingerprints[j];
                        expect(le2).to.be.deep.equal(re2);
                    }
                    /* notes */
                    expect(le.notes_length).to.be.deep.equal(re.notes.length)
                    for (let j = 0; j < le.notes.length; j += 1) {
                        const le2 = le.notes[j];
                        const re2 = re.notes[j];
                        expect(le2).excluding('bend_length').to.be.deep.equal(re2);
                        expect(le2.bends).to.be.deep.equal(re2.bends)
                    }

                    expect(le.anpi).to.be.equal(re.averageNotesPerIter.length)
                    for (let j = 0; j < le.averageNotesPerIter.length; j += 1) {
                        const le2 = le.averageNotesPerIter[j];
                        const re2 = re.averageNotesPerIter[j];
                        expect(le2).to.be.deep.equal(re2);
                    }

                    expect(le.niicni).to.be.equal(re.notesInIterCountNoIgnored.length)
                    for (let j = 0; j < le.notesInIterCountNoIgnored.length; j += 1) {
                        const le2 = le.notesInIterCountNoIgnored[j];
                        const re2 = re.notesInIterCountNoIgnored[j];
                        expect(le2).to.be.deep.equal(re2);
                    }

                    expect(le.niicni).to.be.equal(re.notesInIterCountNoIgnored.length)
                    for (let j = 0; j < le.notesInIterCountNoIgnored.length; j += 1) {
                        const le2 = le.notesInIterCountNoIgnored[i];
                        const re2 = re.notesInIterCountNoIgnored[i];
                        expect(le2).to.be.deep.equal(re2);
                    }

                    expect(le.niic).to.be.equal(re.notesInIterCount.length)
                    for (let j = 0; j < le.notesInIterCount.length; j += 1) {
                        const le2 = le.notesInIterCount[i];
                        const re2 = re.notesInIterCount[i];
                        expect(le2).to.be.deep.equal(re2);
                    }
                }
            });
            it(`check metadata`, async () => {
                expect(SNG.sng.metadata).excluding('tuning_length').to.be.deep.equal(json.metadata);
                expect(SNG.sng.metadata.tuning).to.be.deep.equal(json.metadata.tuning);
            });

        });
}
async function getSNG(file) {
    const sng = new SNG(file);
    await sng.parse();
    return sng;
}
async function getPSARC(file) {
    const psarc = new PSARC(file);
    await psarc.parse();
    return psarc;
}
async function openPSARC(psarc) {
    const data = psarc.getRawData();
    expect(data.length).to.greaterThan(0);
}
async function getArrangements(psarc, num) {
    const arr = await psarc.getArrangements();
    expect(Object.keys(arr).length).to.equal(num)
    if (arr.length > 0) {
        expect(arr[0]).to.be.an('object');
    }
}
async function getFiles(psarc, num, filetocheck) {
    const arr = await psarc.getFiles();
    expect(arr.length).to.equal(num)
    if (arr.length > 0) {
        expect(arr).to.contain(filetocheck);
    }
}
async function extractFile(psarc, file) {
    const tmpfile = tmp.fileSync();
    const files = await psarc.getFiles();
    const idx = files.indexOf(file);
    expect(idx).to.be.greaterThan(-1);
    if (idx != -1) {
        await psarc.extractFile(idx, tmpfile.name);
        expect(tmpfile.name).to.be.a.file().with.json;
    }
    tmpfile.removeCallback();
}
async function convertToDDS(file) {
    const dds = new DDS(file);
    const p = path.parse(file);
    return await dds.convert(p.name);
}
async function ddsTests() {
    const files = await promises.readdir(ddss);
    const imgs = files.filter(i => i.endsWith(".png") || i.endsWith(".jpg"));
    await forEach(imgs)
        .describe('psarcjs: DDS: convert %s', async function (f2) {
            let DDS;
            it('dds convert', async () => {
                const input = `${ddss}/${f2}`;
                const files = await convertToDDS(input);
                expect(files).to.be.array()
            }).timeout(15000);
        })


    const f = await promises.readdir(ddss);
    const dds = f.filter(i => i.endsWith(".dds"));
    await forEach(dds)
        .describe('psarcjs: DDS: parse %s', async function (f2) {
            it('dds validate', async () => {
                const input = `${ddss}${f2}`;
                const dds = new DDS(input);
                const res = await dds.validate();
                console.log(res);
            }).timeout(15000)
        })
}

async function convertToWEM(file) {
    const p = path.parse(file);
    return await WEM.convert(file, p.name);
}
async function wemTests() {
    const f = await promises.readdir(wems);
    const wemf = f.filter(i => i.endsWith(".wem"));
    await forEach(wemf)
        .describe('psarcjs: WEM: parse %s', async function (f2) {
            it('wem validate', async () => {
                const input = `${wems}${f2}`;
                const res = await WEM.validate(input);

                console.log(util.inspect(res, {
                    depth: 6,
                    colors: true,
                    maxArrayLength: 3,
                    compact: true,
                }));
            }).timeout(15000)
            it('bnk generate', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", false, "/tmp/");
                console.log(files);
            });
            it('bnk replace', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", true, "/tmp/");
                console.log(files);
            });
            it('bnk preview', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", false, "/tmp/", true);
                console.log(files);
            });
        })
}
async function waapiTests() {
    describe("waapi tests", () => {
        it("waapi convert/parse macos", async () => {
            const f = await WAAPI.convert("/Users/sandi/Downloads/output.wav", "testTag", 1);
            console.log("Generated wem file", f);

            const res = await WEM.validate(f);
            console.log(util.inspect(res, {
                depth: 4,
                colors: true,
                maxArrayLength: 3,
                compact: true,
            }));
            const bnk = await BNK.generate(f, "testTag", true, "/tmp/");
            console.log(bnk);
        }).timeout(45000);
        it("waapi convert/parse windows", async () => {
            const f = await WAAPI.convert("/Users/sandi/Downloads/output.wav", "testTag", 0);
            console.log("Generated wem file", f);

            const res = await WEM.validate(f);
            console.log(util.inspect(res, {
                depth: 4,
                colors: true,
                maxArrayLength: 3,
                compact: true,
            }));
            const bnk = await BNK.generate(f, "testTag", true, "/tmp/");
            console.log(bnk);
        }).timeout(45000);
    }).timeout(45000);
}

async function genericTests() {
    describe("generic tests", async () => {
        it("generate toolkit.version", async () => {
            const f = await GENERIC.generateToolkit("/tmp/", "sandi", "comment 1", 1, { name: "psarcjs-test", version: "0.0.1" });
            const data = await promises.readFile(f);
            console.log(data.toString());
        })
        it("generate appid", async () => {
            const f = await GENERIC.generateAppid("/tmp/");
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
            //console.log(data.toString());
        })
        it("generate aggregategraph.nt macos", async () => {
            const details = {
                "lead": 1,
                "rhythm": 2,
                "bass": 1,
                "vocals": 1,
            }
            const f = await GENERIC.generateAggregateGraph("/tmp", "psarcjsTest", details, 0);
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
            //console.log(data.toString());
        })
        it("generate aggregategraph.nt windows", async () => {
            const details = {
                "lead": 1,
                "rhythm": 2,
                "bass": 1,
                "vocals": 1,
            }
            const f = await GENERIC.generateAggregateGraph("/tmp", "psarcjsTest", details, 1);
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
            //console.log(data.toString());
        })
        it("generate xblock", async () => {

            const f = await GENERIC.generateXBlock([
                { persistentID: getUuid().toLowerCase().replace(/-/g, ""), arrangementType: "bass" },
                { persistentID: getUuid().toLowerCase().replace(/-/g, ""), arrangementType: "vocals" },
            ], "psarcjsTest", "/tmp/");
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
        })
    });
}

async function bnkTests() {
    const f = await promises.readdir(bnks);
    const bnkf = f.filter(i => i.endsWith(".bnk"));
    await forEach(bnkf)
        .describe('psarcjs: BNK: parse %s', async function (f2) {
            it('bnk validate', async () => {
                const input = `${bnks}${f2}`;
                const res = await BNK.validate(input);

                console.log(util.inspect(res, {
                    depth: 6,
                    colors: true,
                    maxArrayLength: 3,
                    compact: true,
                }));

            }).timeout(15000)
        })
}

async function songxmlTests() {
    describe("songxml tests", async () => {
        it("generate xml from Song2014", async () => {
            var date = new Date(Date.now());
            const beats = await (await promises.readFile('data/song2014/beats')).toString().split("\n");
            const tempo = parseFloat(await promises.readFile('data/song2014/tempo'));
            const notes = JSON.parse(await promises.readFile('data/song2014/notes.json'));
            const md = JSON.parse(await promises.readFile('data/song2014/metadata.json'));
            const song2014 = {
                version: 2,
                arrangement: "bass",
                title: md.song,
                part: 1,
                offset: 0,
                centOffset: 0,
                songLength: 120,
                lastConversionDateTime: `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
                startBeat: beats[0].split(" ")[0],
                averageTempo: tempo.toFixed(3),
                tuning: {
                    string0: 0,
                    string1: 0,
                    string2: 0,
                    string3: 0,
                    string4: 0,
                    string5: 0,
                },
                capo: 0,
                artistName: md.artist,
                artistNameSort: md.artist,
                albumName: md.album,
                albumYear: md.year,
                crowdSpeed: 1,
                arrangementProperties: {
                    represent: 1, bonusArr: 0, standardTuning: 1, nonStandardChords: 0,
                    barreChords: 0, powerChords: 0, dropDPower: 0, openChords: 0,
                    fingerPicking: 0, pickDirection: 0, doubleStops: 0, palmMutes: 0,
                    harmonics: 0, pinchHarmonics: 0, hopo: 0, tremolo: 0, slides: 0,
                    unpitchedSlides: 0, bends: 0, tapping: 0, vibrato: 0, fretHandMutes: 0,
                    slapPop: 0, twoFingerPicking: 0, fifthsAndOctaves: 0, syncopation: 0,
                    bassPick: 0, sustain: 1, pathLead: 0, pathRhythm: 0, pathBass: 1,
                },
                phrases: [],
                phraseIterations: [],
                newLinkedDiffs: [],
                linkedDiffs: [],
                phraseProperties: [],
                chordTemplates: [],
                fretHandMuteTemplates: [],
                ebeats: SongEbeat.fromBeatData(beats),
                tonebase: "default",
                tonea: "default",
                sections: [],
                events: [],
                transcriptionTrack: {
                    difficulty: -1,
                    notes: SongNote.fromNoteData(notes),
                    chords: [],
                    fretHandMutes: [],
                    anchors: [],
                    handShapes: [],
                },
                levels: [],
            }
            var s = new SONGXML(song2014);
            const f = await s.generateXML("/tmp/", "psarcJSTest", {
                name: "psarcjsTest",
                version: "0.0.1"
            });
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
            //console.log(data.toString());
        })
        it("generate sng from Song2014", async () => {

        })
    })
    const f = await promises.readdir(xmls);
    const xmlf = f.filter(i => i.endsWith(".xml")
        && !i.includes("vocals")
        && !i.includes("showlights")
    );
    await forEach(xmlf)
        .describe("songxml: parse %s", async (xml) => {
            it("create Song2014 from xml", async () => {
                const parsedXml = await SONGXML.fromXML(`${xmls}/${xml}`);

                console.log(util.inspect(parsedXml, {
                    depth: 2,
                    colors: true,
                    maxArrayLength: 2,
                    compact: false,
                }));

            })
        })


}

const sngs = "test/sng/";
const ddss = "test/dds/";
const wems = "test/wem/";
const bnks = "test/bnk/";
const xmls = "test/xml/";
async function fn() {
    await songxmlTests();
    /*
    await genericTests();
    await psarcTests();
    await sngTests();
    await ddsTests();
    await bnkTests();
    await wemTests();
    if (process.env.GITHUB_ACTIONS !== "true") {
        await waapiTests();
    }*/
}

fn();