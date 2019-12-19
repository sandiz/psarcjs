'use strict';

var util = require('util');
var tmp = require('tmp');
var chai = require('chai');
var forEach = require('mocha-each');
var chaiExclude = require('chai-exclude');
const assertArrays = require('chai-arrays');
var promises = require('fs').promises;
var { PSARC, SNG, DDS } = require('../dist');

var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(chaiExclude);
chai.use(assertArrays);
tmp.setGracefulCleanup();

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
                const file = `test/sng/${f2}`;
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
    return await dds.convert("test");
}
async function ddsTests() {
    const files = await promises.readdir(ddss);
    const imgs = files.filter(i => i.endsWith(".png") || i.endsWith(".jpg"));
    await forEach(imgs)
        .describe('psarcjs: DDS: %s', async function (f2) {
            let DDS;
            it('dds convert', async () => {
                const input = `test/dds/${f2}`;
                const files = await convertToDDS(input);
                expect(files).to.be.array()
            }).timeout(15000);
        })


    const f = await promises.readdir(ddss);
    const dds = f.filter(i => i.endsWith(".dds"));
    await forEach(dds)
        .describe('psarcjs: DDS: parse %s', async function (f2) {
            it('dds validate', async () => {
                const input = `test/dds/${f2}`;
                const dds = new DDS(input);
                const res = await dds.validate();
                //console.log(res);
            }).timeout(15000)
        })
}


psarcTests();

const sngs = "test/sng/";
sngTests();

const ddss = "test/dds";
ddsTests();
