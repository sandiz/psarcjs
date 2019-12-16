'use strict';

var util = require('util');
var tmp = require('tmp');
var chai = require('chai');
var forEach = require('mocha-each');
var promises = require('fs').promises;
var { PSARC, SNG } = require('../dist');

var expect = chai.expect;
chai.use(require('chai-fs'));
tmp.setGracefulCleanup();

describe('psarcjs: PSARC: test.psarc', function () {
    const file = "test/psarc/test.psarc";
    const json = "manifests/songs_dlc_butitrainedsong/butitrainedsong_lead.json";
    let psarc = null;
    it('open psarc file: test.psarc', async function () {
        psarc = await getPSARC(file);
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
    let psarc = null;
    it('open psarc file: test2.psarc', async function () {
        psarc = await getPSARC(file);
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

const sngs = "test/sng/";
sngTests();

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
                /*console.log(util.inspect(SNG.sng.chordNotes, {
                    depth: 2,
                    colors: true,
                    maxArrayLength: 1,
                    compact: false,
                }));*/
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