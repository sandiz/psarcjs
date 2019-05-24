'use strict';

var tmp = require('tmp');
var chai = require('chai');
var PSARC = require('../index');

var expect = chai.expect;
chai.use(require('chai-fs'));
tmp.setGracefulCleanup();

describe('psarcjs: test.psarc', function () {
    const file = "test/test.psarc";
    const json = "manifests/songs_dlc_butitrainedsong/butitrainedsong_lead.json";
    let psarc = null;
    it('open psarc file', async function () {
        psarc = await getPSARC(file);
        await openPSARC(psarc);
    });
    it('get files', async function () {
        await getFiles(psarc, 18, json);
    });
    it('get arrangements', async function () {
        await getArrangements(psarc, 1);
    });
    it('extract file from psarc', async function () {
        await extractFile(psarc, json);
    });
});
describe('psarcjs: test2.psarc', function () {
    const file = "test/test2.psarc";
    const json = "manifests/songs_dlc_witchcraftsong/witchcraftsong_lead.json";
    let psarc = null;
    it('open psarc file', async function () {
        psarc = await getPSARC(file);
        await openPSARC(psarc);
    });
    it('get files', async function () {
        await getFiles(psarc, 24, json);
    });
    it('get arrangements', async function () {
        await getArrangements(psarc, 3);
    });
    it('extract file from psarc', async function () {
        await extractFile(psarc, json);
    });
});


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