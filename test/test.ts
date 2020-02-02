const util = require('util');
const path = require('path');
const tmp = require('tmp');
const spawn = require('await-spawn')
const exec = util.promisify(require('child_process').exec);

import { mkdirp, remove } from 'fs-extra';
import { expect, use } from 'chai';
import chaiExclude from 'chai-exclude'
import assertArrays from 'chai-arrays'
import forEach from 'mocha-each'
import Chaifs = require('chai-fs');
import crypto = require("crypto");
import xml2js = require("xml2js");
const promises = require('fs').promises;
import {
    join, parse, basename
} from 'path';
import {
    SongEbeat, SongNote, ISong2014, Song2014
} from '../src/song2014'
import {
    ArrangementType, ShowLights, Vocals, Arrangement, ManifestTone, ManifestToneReviver,
    VocalArrangement, ArrangementInfo, AttributesHeader, Toolkit, Platform
} from '../src/types/common';
import { getUuid } from '../src/aggregategraphwriter';
import { PSARC } from '../src/psarc';
import { SNG } from '../src/sng';
import { DDS } from '../src/dds';
import { WEM } from '../src/wem';
import { BNK } from '../src/bnk';
import { GENERIC } from '../src/generic';
import { MANIFEST } from '../src/manifest';
import { WAAPI } from '../src/waapi';


use(Chaifs);
use(chaiExclude);
use(assertArrays);
tmp.setGracefulCleanup();

async function psarcTests() {
    describe('psarcjs: PSARC: test.psarc', function () {
        const file = "test/psarc/test.psarc";
        const json = "manifests/songs_dlc_butitrainedsong/butitrainedsong_lead.json";
        const sng = "songs/bin/macos/butitrainedsong_lead.sng"
        let psarc: PSARC;
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
            await extractFile(psarc, sng);
        });
    });
    describe('psarcjs: PSARC: test2.psarc', function () {
        const file = "test/psarc/test2.psarc";
        const json = "manifests/songs_dlc_witchcraftsong/witchcraftsong_lead.json";
        const sng = "songs/bin/macos/witchcraftsong_lead.sng";
        let psarc: PSARC;
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
            await extractFile(psarc, sng);
        });
    });
}
async function sngTests() {
    const files = await promises.readdir(sngs);
    const sngfiles = files.filter((i: string) => i.endsWith(".sng"));
    (forEach(sngfiles) as any)
        .describe('psarcjs: SNG: %s', async function (f2: string) {
            let SNG: SNG;
            let json: any;
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
                expect(SNG.sng?.beats_length).to.equal(json.beats.length);
            });
            it(`check all beats`, async () => {
                if (!SNG.sng?.beats) return;
                for (let i = 0; i < SNG.sng?.beats.length; i += 1) {
                    const le = SNG.sng?.beats[i];
                    const re = json.beats[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check phrases_length`, async () => {
                expect(SNG.sng?.phrases_length).to.equal(json.phrases.length);
            });
            it(`check all phrases`, async () => {
                if (!SNG.sng?.phrases) return;
                for (let i = 0; i < SNG.sng?.phrases.length; i += 1) {
                    const le = SNG.sng?.phrases[i];
                    const re = json.phrases[i];
                    expect(le).excluding('padding').to.be.deep.equal(re);
                }
            });
            it(`check chord_templates_length`, async () => {
                expect(SNG.sng?.chord_templates_length).to.equal(json.chordTemplates.length);
            });
            it(`check all chordTemplates`, async () => {
                if (!SNG.sng?.chordTemplates) return;
                for (let i = 0; i < SNG.sng?.chordTemplates.length; i += 1) {
                    if (!SNG.sng?.chordTemplates) return;
                    const le = SNG.sng?.chordTemplates[i];
                    const re = json.chordTemplates[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check chord_notes_length`, async () => {
                expect(SNG.sng?.chord_notes_length).to.equal(json.chordNotes.length);
            });
            it(`check all chordNotes`, async () => {
                if (!SNG.sng?.chordNotes) return;
                for (let i = 0; i < SNG.sng?.chordNotes.length; i += 1) {
                    const le = SNG.sng?.chordNotes[i];
                    const re = json.chordNotes[i];
                    expect(le).to.be.deep.equal(re);
                    expect(le.bends).to.be.deep.equal(re.bends);
                    //expect(le.bends).to.be.deep.equal(re.bends.bendValues);
                }
            });
            it(`check vocals_length`, async () => {
                expect(SNG.sng?.vocals_length).to.equal(json.vocals.length);
            });
            it(`check all vocals`, async () => {
                if (!SNG.sng?.vocals) return;
                for (let i = 0; i < SNG.sng?.vocals.length; i += 1) {
                    const le = SNG.sng?.vocals[i];
                    const re = json.vocals[i];
                    expect(le).to.be.deep.equal(re);
                }
                if (SNG.sng?.vocals.length > 0) {
                    //expect(SNG.sng?.symbols.header).to.be.deep.equal(json.symbols.header);
                    expect(SNG.sng?.symbols?.texture).to.be.deep.equal(json.symbols.texture);
                    expect(SNG.sng?.symbols?.definition).to.be.deep.equal(json.symbols.definition);
                }
            });
            it(`check phrase_iter_length`, async () => {
                expect(SNG.sng?.phrase_iter_length).to.equal(json.phraseIterations.length);
            });
            it(`check all phraseIterations`, async () => {
                if (!SNG.sng?.phraseIterations) return;
                for (let i = 0; i < SNG.sng?.phraseIterations.length; i += 1) {
                    const le = SNG.sng?.phraseIterations[i];
                    const re = json.phraseIterations[i];
                    re.startTime = re.time;
                    re.nextPhraseTime = re.endTime;
                    delete re.time;
                    delete re.endTime;
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check phrase_extra_length`, async () => {
                expect(SNG.sng?.phrase_extra_info_length).to.equal(json.phraseExtraInfos.length);
            });
            it(`check all phraseExtraInfos`, async () => {
                if (!SNG.sng?.phraseExtraInfos) return;
                for (let i = 0; i < SNG.sng?.phraseExtraInfos.length; i += 1) {
                    const le = SNG.sng?.phraseExtraInfos[i];
                    const re = json.phraseExtraInfos[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check new_linked_length`, async () => {
                expect(SNG.sng?.new_linked_diffs_length).to.equal(json.newLinkedDiffs.length);
            });
            it(`check all newLinkedDiffs`, async () => {
                if (!SNG.sng?.newLinkedDiffs) return;
                for (let i = 0; i < SNG.sng?.newLinkedDiffs.length; i += 1) {
                    const le = SNG.sng?.newLinkedDiffs[i];
                    const re = json.newLinkedDiffs[i];
                    expect(le.levelBreak).to.be.deep.equal(re.levelBreak);

                    if (le.nld_phrase_length > 0) {
                        expect(le.nld_phrase_length).to.equal(re.nld_phrase.length)
                        expect(le.levelBreak).to.be.deep.equal(re.levelBreak);

                        for (let i = 0; i < SNG.sng?.newLinkedDiffs.length; i += 1) {
                            const le2 = re.nld_phrase[i]
                            const re2 = re.nld_phrase[i];
                            expect(le2).to.be.deep.equal(re2);
                        }
                    }
                }
            });
            it(`check actions_length`, async () => {
                expect(SNG.sng?.actions_length).to.equal(json.actions.length);
            });
            it(`check all actions`, async () => {
                if (!SNG.sng?.actions) return;
                for (let i = 0; i < SNG.sng?.actions.length; i += 1) {
                    const le = SNG.sng?.actions[i];
                    const re = json.actions[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check events_length`, async () => {
                expect(SNG.sng?.events_length).to.equal(json.events.length);
            });
            it(`check all events`, async () => {
                if (!SNG.sng?.events) return;
                for (let i = 0; i < SNG.sng?.events.length; i += 1) {
                    const le = SNG.sng?.events[i];
                    const re = json.events[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check tone_length`, async () => {
                expect(SNG.sng?.tone_length).to.equal(json.tone.length);
            });
            it(`check all tones`, async () => {
                if (!SNG.sng?.tone) return;
                for (let i = 0; i < SNG.sng?.tone.length; i += 1) {
                    const le = SNG.sng?.tone[i];
                    const re = json.tone[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check dna_length`, async () => {
                expect(SNG.sng?.dna_length).to.equal(json.dna.length);
            });
            it(`check all dnas`, async () => {
                if (!SNG.sng?.dna) return;
                for (let i = 0; i < SNG.sng?.dna.length; i += 1) {
                    const le = SNG.sng?.dna[i];
                    const re = json.dna[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check sections_length`, async () => {
                expect(SNG.sng?.sections_length).to.equal(json.sections.length);
            });
            it(`check all sections`, async () => {
                if (!SNG.sng?.sections) return;
                for (let i = 0; i < SNG.sng?.sections.length; i += 1) {
                    const le = SNG.sng?.sections[i];
                    const re = json.sections[i];
                    expect(le).to.be.deep.equal(re);
                }
            });
            it(`check levels_length`, async () => {
                expect(SNG.sng?.levels_length).to.equal(json.levels.length);
            });
            it(`check all levels`, async () => {
                if (!SNG.sng?.levels) return;
                for (let i = 0; i < SNG.sng?.levels.length; i += 1) {
                    const le = SNG.sng?.levels[i];
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
                        re2.maxBend = re2.bend_time
                        delete re2.bend_time;
                        expect(le2).excluding('bend_length').to.be.deep.equal(re2);
                        expect(le2.bends).to.be.deep.equal(re2.bends)
                    }

                    expect(le.anpi_length).to.be.equal(re.averageNotesPerIter.length)
                    for (let j = 0; j < le.averageNotesPerIter.length; j += 1) {
                        const le2 = le.averageNotesPerIter[j];
                        const re2 = re.averageNotesPerIter[j];
                        expect(le2).to.be.deep.equal(re2);
                    }

                    expect(le.niicni_length).to.be.equal(re.notesInIterCountNoIgnored.length)
                    for (let j = 0; j < le.notesInIterCountNoIgnored.length; j += 1) {
                        const le2 = le.notesInIterCountNoIgnored[j];
                        const re2 = re.notesInIterCountNoIgnored[j];
                        expect(le2).to.be.deep.equal(re2);
                    }

                    expect(le.niic_length).to.be.equal(re.notesInIterCount.length)
                    for (let j = 0; j < le.notesInIterCount.length; j += 1) {
                        const le2 = le.notesInIterCount[i];
                        const re2 = re.notesInIterCount[i];
                        expect(le2).to.be.deep.equal(re2);
                    }
                }
            });
            it(`check metadata`, async () => {
                json.metadata.maxNotesAndChords = json.metadata.maxNotes;
                json.metadata.maxNotesAndChords_Real = json.metadata.maxNotesNoIgnored;
                delete json.metadata.maxNotes;
                delete json.metadata.maxNotesNoIgnored;
                expect(SNG.sng?.metadata).excluding('tuningLength').to.be.deep.equal(json.metadata);
                expect(SNG.sng?.metadata?.tuning).to.be.deep.equal(json.metadata.tuning);
            });

        });
}
async function getSNG(file: string) {
    const sng = new SNG(file);
    await sng.parse();
    return sng;
}
async function getPSARC(file: string) {
    const psarc = new PSARC(file);
    await psarc.parse();
    return psarc;
}
async function openPSARC(psarc: PSARC) {
    const data = psarc.getRawData();
    expect(data?.length).to.greaterThan(0);
}
async function getArrangements(psarc: PSARC, num: number) {
    const arr = await psarc.getArrangements();
    expect(Object.keys(arr).length).to.equal(num)
    expect(arr).to.be.an('object');
}
async function getFiles(psarc: PSARC, num: number, filetocheck: string) {
    const arr = await psarc.getFiles();
    expect(arr.length).to.equal(num)
    if (arr.length > 0) {
        expect(arr).to.contain(filetocheck);
    }
}
async function extractFile(psarc: PSARC, file: string) {
    const tmpfile = tmp.fileSync();
    const files = await psarc.getFiles();
    const idx = files.indexOf(file);
    expect(idx).to.be.greaterThan(-1);
    if (idx != -1) {
        await psarc.extractFile(idx, tmpfile.name);
        if (file.endsWith("json")) {
            //@ts-ignore
            expect(tmpfile.name).to.be.a.file().with.json;
        }
        else if (file.endsWith("sng")) {
            //@ts-ignore
            await new SNG(tmpfile.name).parse();
        }
    }
    tmpfile.removeCallback();
}
async function convertToDDS(file: string) {
    const dds = new DDS(file);
    const p = path.parse(file);
    return await dds.convert(p.name);
}
async function ddsTests() {
    const files = await promises.readdir(ddss);
    const imgs = files.filter((i: string) => i.endsWith(".png") || i.endsWith(".jpg"));
    (forEach(imgs) as any)
        .describe('psarcjs: DDS: convert %s', async function (f2: string) {
            let DDS;
            it('dds convert', async () => {
                const input = `${ddss}/${f2}`;
                const files = await convertToDDS(input);
                expect(files).to.be.array()
            }).timeout(15000);
        })


    const f = await promises.readdir(ddss);
    const dds = f.filter((i: string) => i.endsWith(".dds"));
    (forEach(dds) as any)
        .describe('psarcjs: DDS: parse %s', async function (f2: string) {
            it('dds validate', async () => {
                const input = `${ddss}${f2}`;
                const dds = new DDS(input);
                const res = await dds.parse();
                //console.log(res);
            }).timeout(15000)
        })
}

async function convertToWEM(file: string) {
    const p = path.parse(file);
    return await WEM.convert(file, p.name);
}
async function wemTests() {
    const f = await promises.readdir(wems);
    const wemf = f.filter((i: string) => i.endsWith(".wem"));
    (forEach(wemf) as any)
        .describe('psarcjs: WEM: parse %s', async function (f2: string) {
            it('wem validate', async () => {
                const input = `${wems}${f2}`;
                const res = await WEM.parse(input);

                /*console.log(util.inspect(res, {
                    depth: 6,
                    colors: true,
                    maxArrayLength: 3,
                    compact: true,
                }));*/
            }).timeout(15000)
            it('bnk generate', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", false, "/tmp/");
                //console.log(files);
            });
            it('bnk replace', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", true, "/tmp/");
                //console.log(files);
            });
            it('bnk preview', async () => {
                const input = `${wems}${f2}`;
                const files = await BNK.generate(input, "psarcjsTest", false, "/tmp/", true);
                //console.log(files);
            });
        })
}
async function waapiTests() {
    describe("waapi tests", () => {
        it("waapi convert/parse macos", async () => {
            const f = await WAAPI.convert("/Users/sandi/Downloads/output.wav", "testTag", 1);
            console.log("Generated wem file", f);

            const res = await WEM.parse(f);
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

            const res = await WEM.parse(f);
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
    describe("psarcjs: GENERIC tests", async () => {
        it("generate toolkit.version", async () => {
            const f = await GENERIC.generateToolkit("/tmp/", "sandi", "comment 1", "1", { name: "psarcjs-test", version: "0.0.1" });
            const data = await promises.readFile(f);
            //console.log(data.toString());
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
                "showlights": 0,
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
                "showlights": 0,
            }
            const f = await GENERIC.generateAggregateGraph("/tmp", "psarcjsTest", details, 1);
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
            //console.log(data.toString());
        })
        it("generate xblock", async () => {
            const _header = (h: ArrangementType, pid: string) => {
                const f = new AttributesHeader();
                f.arrangementName = h;
                f.persistentID = pid;
                return f;
            }
            const f = await GENERIC.generateXBlock([
                {
                    header: _header(ArrangementType.BASS, getUuid().toLowerCase().replace(/-/g, ""))
                },
                {
                    header: _header(ArrangementType.VOCALS, getUuid().toLowerCase().replace(/-/g, ""))
                },
            ], "psarcjsTest", "/tmp/");
            const data = await promises.readFile(f);
            expect(data).to.be.of.length.greaterThan(0);
        })
    });
}

async function showLightsTest() {
    const f = await promises.readdir(xmls);
    const xmlf = f.filter((i: string) => i.endsWith("showlights.xml"));

    (forEach(xmlf) as any)
        .describe("psarcjs: SHOWLIGHTS tests", async (f2: string) => {
            const file = `${xmls}/${f2}`
            it("generate/parse showlights", async () => {
                const lights = await ShowLights.fromXML(file);
                const xml = ShowLights.toXML(lights);
                const f = "/tmp/showlights.xml"
                await promises.writeFile(f, xml);
                await ShowLights.fromXML(f);
            })
        })
}


async function vocalsTest() {
    const f = await promises.readdir(xmls);
    const xmlf = f.filter((i: string) => i.endsWith("vocals.xml"));

    (forEach(xmlf) as any)
        .describe("psarcjs: VOCALS tests", async (f2: string) => {
            const file = `${xmls}/${f2}`
            it("generate/parse vocals", async () => {
                const vocals = await Vocals.fromXML(file);
                const xml = Vocals.toXML(vocals);
                const f = "/tmp/vocals.xml"
                await promises.writeFile(f, xml);
                await Vocals.fromXML(f);
            })

            it("generate vocals sng", async () => {
                const parsed: Vocals[] = await Vocals.fromXML(file);
                const sngFile = await Vocals.generateSNG("/tmp/", "psarcJSGenerateTest", parsed);
                const sng = new SNG(sngFile);
                await sng.parse();
            })
        })
}

async function bnkTests() {
    const f = await promises.readdir(bnks);
    const bnkf = f.filter((i: string) => i.endsWith(".bnk"));
    (forEach(bnkf) as any)
        .describe('psarcjs: BNK: parse %s', async function (f2: string) {
            it('bnk validate', async () => {
                const input = `${bnks}${f2}`;
                const res = await BNK.parse(input);

                /*console.log(util.inspect(res, {
                    depth: 6,
                    colors: true,
                    maxArrayLength: 3,
                    compact: true,
                }));*/

            }).timeout(15000)
        })
}

async function song2014Tests() {
    describe("psarcjs: SONG2014: generate xml/sng", async () => {
        let song2014: ISong2014;
        before(async () => {
            const date = new Date(Date.now());
            const beats = await (await promises.readFile('data/song2014/beats')).toString().split("\n");
            const tempo = parseFloat(await promises.readFile('data/song2014/tempo'));
            const notes = JSON.parse(await promises.readFile('data/song2014/notes.json'));
            const md = JSON.parse(await promises.readFile('data/song2014/metadata.json'));
            song2014 = {
                version: "2",
                arrangement: "bass",
                title: md.song,
                part: 1,
                offset: 0,
                centOffset: 0,
                songLength: 120,
                lastConversionDateTime: `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
                startBeat: parseFloat(beats[0].split(" ")[0]),
                averageTempo: parseFloat(tempo.toFixed(3)),
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
                albumNameSort: "",
                albumYear: md.year,
                crowdSpeed: "1",
                arrangementProperties: {
                    represent: 1, bonusArr: 0, standardTuning: 1, nonStandardChords: 0,
                    barreChords: 0, powerChords: 0, dropDPower: 0, openChords: 0,
                    fingerPicking: 0, pickDirection: 0, doubleStops: 0, palmMutes: 0,
                    harmonics: 0, pinchHarmonics: 0, hopo: 0, tremolo: 0, slides: 0,
                    unpitchedSlides: 0, bends: 0, tapping: 0, vibrato: 0, fretHandMutes: 0,
                    slapPop: 0, twoFingerPicking: 0, fifthsAndOctaves: 0, syncopation: 0,
                    bassPick: 0, sustain: 1, pathLead: 0, pathRhythm: 0, pathBass: 1,
                    routeMask: 0, Metronome: 0,
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
                toneb: "",
                tonec: "",
                toned: "",
                tones: [],
                sections: [],
                events: [],
                controls: [],
                transcriptionTrack: {
                    difficulty: -1,
                    notes: SongNote.fromNoteData(notes),
                    chords: [],
                    fretHandMutes: [],
                    anchors: [],
                    handShapes: [],
                },
                levels: [{
                    difficulty: 16,
                    notes: SongNote.fromNoteData(notes),
                    chords: [],
                    anchors: [],
                    handShapes: [],
                },
                {
                    difficulty: 17,
                    notes: SongNote.fromNoteData(notes),
                    chords: [],
                    anchors: [],
                    handShapes: [],
                }],
            }
        })
        it("generate XML from Song2014", async () => {
            var s = new Song2014(song2014);
            const f = await s.generateXML("/tmp/", "psarcJSTest-song2014", {
                name: "psarcjsTest",
                version: "0.0.1"
            });
            const parsed = await Song2014.fromXML(f);
            expect(parsed).to.be.deep.equal(s);
        })
        it("generate SNG from Song2014", async () => {
            var s = new Song2014(song2014);
            const f = await s.generateSNG("/tmp/", "psarcJSTest");

            const sng = new SNG(f);
            await sng.parse();
        })
    })
    const f = await promises.readdir(xmls);
    const xmlf = f.filter((i: string) => i.endsWith(".xml")
        && !i.includes("vocals")
        && !i.includes("showlights")
    );
    (forEach(xmlf) as any)
        .describe("psarcjs: SONG2014: parse %s", async (xml: string) => {
            let sng: SNG | null = null;
            it("create Song2014 from xml", async () => {
                const parsedXml = await Song2014.fromXML(`${xmls}/${xml}`);
                expect(parsedXml).to.be.an("object");
            }).timeout(15000);
            it("create SNG from xml", async () => {
                const xFile = `${xmls}${xml}`;
                const parsedXml = await Song2014.fromXML(xFile);
                const f = await parsedXml.generateSNG("/tmp/", "psarcJSTest");

                sng = new SNG(f);
                await sng.parse();

                const xmlPathParse = path.parse(xml);
                const leftSNG = `${xmls}/${xmlPathParse.name}.sng`

                let out = await spawn('mono',
                    ['test/xml/xml2sng2014/sng2014.exe', '--xml2sng', '-i', xFile])

                //console.log(out.toString());
                const idealSNG = new SNG(leftSNG);
                await idealSNG.parse();

                const lsng = sng.sng;
                const rsng = idealSNG.sng;

                if (lsng && rsng) {
                    expect(lsng.beats).to.be.deep.equal(rsng.beats);
                    expect(lsng.phrases).to.be.deep.equal(rsng.phrases);
                    expect(lsng.chordTemplates).to.be.deep.equal(rsng.chordTemplates);
                    expect(lsng.chordNotes).to.be.deep.equal(rsng.chordNotes);
                    expect(lsng.vocals).to.be.deep.equal(rsng.vocals);
                    expect(lsng.symbols).to.be.deep.equal(rsng.symbols);
                    expect(lsng.phraseIterations).to.be.deep.equal(rsng.phraseIterations);
                    expect(lsng.phraseExtraInfos).to.be.deep.equal(rsng.phraseExtraInfos);
                    expect(lsng.newLinkedDiffs).to.be.deep.equal(rsng.newLinkedDiffs);
                    expect(lsng.actions).to.be.deep.equal(rsng.actions);
                    expect(lsng.events).to.be.deep.equal(rsng.events);
                    expect(lsng.tone).to.be.deep.equal(rsng.tone);
                    expect(lsng.dna).to.be.deep.equal(rsng.dna);
                    expect(lsng.sections).to.be.deep.equal(rsng.sections);

                    const ll = lsng.levels;
                    const rl = rsng.levels;
                    if (ll && rl) {
                        expect(ll.length).to.be.equal(rl.length);
                        for (let i = 0; i < ll.length; i += 1) {
                            const l0 = ll[i];
                            const r0 = rl[i];
                            expect(l0.difficulty).to.be.equal(r0.difficulty);

                            const la = l0.anchors;
                            const ra = r0.anchors;
                            if (la && ra) {
                                expect(l0.anchors.length).to.be.equal(r0.anchors.length);
                                for (let i = 0; i < l0.anchors.length; i += 1) {
                                    const li = la[i]
                                    const ri = ra[i];

                                    expect(li.width).to.be.equal(ri.width);
                                    expect(li.endTime).to.be.equal(ri.endTime);
                                    expect(li.time).to.be.equal(ri.time);
                                    expect(li.fret).to.be.equal(ri.fret);
                                    expect(li.phraseIterationId).to.be.equal(ri.phraseIterationId);
                                    expect(li.UNK_time).to.be.equal(ri.UNK_time);
                                    expect(li.UNK_time2).to.be.closeTo(ri.UNK_time2, 0.001);
                                }
                            }

                            const lae = l0.anchor_extensions;
                            const rae = r0.anchor_extensions;
                            if (lae && rae) {
                                expect(l0.anchor_extensions.length).to.be.equal(r0.anchor_extensions.length);
                                for (let i = 0; i < l0.anchor_extensions.length; i += 1) {
                                    const li = lae[i]
                                    const ri = rae[i];

                                    expect(li.fret).to.be.equal(ri.fret);
                                    expect(li.time).to.be.closeTo(ri.time, 0.001);
                                }
                            }

                            const lfp1 = l0.fingerprints[0]
                            const rfp1 = r0.fingerprints[0]
                            if (lfp1 && rfp1) {
                                expect(lfp1.item0_length).to.be.equal(rfp1.item0_length);
                                for (let i = 0; i < lfp1.item0_length; i += 1) {
                                    const li = lfp1.I0[i];
                                    const ri = rfp1.I0[i];

                                    expect(li.chordId).to.be.equal(ri.chordId);
                                    expect(li.startTime).to.be.equal(ri.startTime);
                                    expect(li.endTime).to.be.equal(ri.endTime);
                                    let msg = "mine: " + JSON.stringify(li) + "\n";
                                    msg += "ideal: " + JSON.stringify(ri) + "\n";
                                    expect(li.UNK_startTime).to.be.equal(ri.UNK_startTime, msg);
                                    expect(li.UNK_endTime).to.be.closeTo(ri.UNK_endTime, 0.001);
                                }
                            }

                            const ln = l0.notes;
                            const rn = r0.notes;
                            if (ln && rn) {
                                expect(l0.notes.length).to.be.equal(r0.notes.length);
                                for (let i = 0; i < l0.notes.length; i += 1) {
                                    const ln = l0.notes[i];
                                    const rn = r0.notes[i];
                                    //let msg = "mine: " + maskPrinter(ln.mask) + "\n\n";
                                    //msg += "ideal: " + maskPrinter(rn.mask) + "\n\n";
                                    expect(ln).to.be.deep.equal(rn);
                                }
                            }

                            const lanpi = l0.averageNotesPerIter;
                            const ranpi = r0.averageNotesPerIter;
                            if (lanpi && ranpi) {
                                expect(lanpi.length).to.be.equal(ranpi.length);
                                expect(lanpi).to.be.deep.equal(ranpi);
                            }

                            const lniicni = l0.notesInIterCountNoIgnored;
                            const rniicni = r0.notesInIterCountNoIgnored;
                            if (lniicni && rniicni) {
                                expect(lniicni.length).to.be.equal(rniicni.length);
                                expect(lniicni).to.be.deep.equal(rniicni);
                            }

                            const lniici = l0.notesInIterCount;
                            const rniicc = r0.notesInIterCount;
                            if (lniici && rniicc) {
                                expect(lniici.length).to.be.equal(rniicc.length);
                                expect(lniici).to.be.deep.equal(rniicc);
                            }
                        }
                    }

                    expect(lsng.metadata).to.be.deep.equal(rsng.metadata);
                }
            }).timeout(60000);
            it("pack/unpack sng", async () => {
                if (sng) {
                    await sng.pack();
                    const fileName = `psarcJSTest_packed.sng`;
                    const path = join("/tmp/", fileName);
                    await promises.writeFile(path, sng.packedData);

                    const sng2 = new SNG(path);
                    await sng2.parse();
                    expect(path).to.be.length.greaterThan(0);
                    expect(sng2.sng?.metadata?.maxScores).to.be.greaterThan(10);
                }
            }).timeout(60000);
        })
}

async function psarcGenerateTests() {
    let outDir = "/tmp/bwab1anthem_m";
    const dir = "/tmp/";
    const tag = "bwab1anthem";
    describe("psarcjs: PSARC: generate tests ", async () => {
        it("psarcjs: generate directory", async () => {
            const leadXMLs = ["test/blinktest/bwab1anthem_lead.xml"];
            const leadTones = ["test/blinktest/bwab1anthem_lead_tones.json"];
            const rhythmXMLs = ["test/blinktest/bwab1anthem_rhythm.xml"];
            const rhythmTones = ["test/blinktest/bwab1anthem_rhythm_tones.json"];
            const bassXMLs = ["test/blinktest/bwab1anthem_bass.xml"];
            const bassTones = ["test/blinktest/bwab1anthem_bass_tones.json"];
            const slightXMLs = ["test/blinktest/bwab1anthem_showlights.xml"];
            const vocalXMLs = ["test/blinktest/bwab1anthem_vocals.xml"];
            const info: ArrangementInfo = {
                songName: "Anthem",
                albumName: "Enema of the State",
                year: 1999,
                currentPartition: 0,
                scrollSpeed: 13,
                volume: -9.2,
                previewVolume: -8.3
            }
            const dds = {
                '256': 'test/dds/album_poster_256.dds',
                '128': 'test/dds/album_poster_128.dds',
                '64': 'test/dds/album_poster_64.dds',
            }
            const wem = {
                main: { wem: 'test/blinktest/1224431012.wem', bnk: 'test/blinktest/song_bwab1anthem.bnk' },
                preview: { wem: 'test/blinktest/376327087.wem', bnk: 'test/blinktest/song_bwab1anthem_preview.bnk' }
            }
            const toolkit: Toolkit = {
                author: 'psarcjs_author',
                comment: 'psarcjs_comment',
                version: '1',
                tk: {
                    name: 'application_using_psarcjs',
                    version: "0.0.1"
                }
            }

            outDir = await PSARC.generateDirectory(
                dir,
                tag, {
                xml: {
                    [ArrangementType.LEAD]: leadXMLs,
                    [ArrangementType.RHYTHM]: rhythmXMLs,
                    [ArrangementType.BASS]: bassXMLs,
                    [ArrangementType.SHOWLIGHTS]: slightXMLs,
                    [ArrangementType.VOCALS]: vocalXMLs,
                },
                tones: {
                    [ArrangementType.LEAD]: leadTones,
                    [ArrangementType.RHYTHM]: rhythmTones,
                    [ArrangementType.BASS]: bassTones,
                },
                dds,
                wem,
            },
                info,
                toolkit,
                Platform.Mac,
            );
        }).timeout(30000);

        it("psarcjs: pack directory", async () => {
            const out = `/tmp/${tag}_psarcjs_m.psarc`;
            await PSARC.packDirectory(outDir, out);

            const psarc = new PSARC(out);
            await psarc.parse();
            const files = psarc.getFiles();
            const meter = files.length
            const extractedDir = "/tmp/extracted_psarc/psarcjs/";
            await remove(extractedDir);
            await mkdirp(extractedDir);
            for (let i = 0; i < meter; i += 1) {
                const outfile = join(extractedDir, basename(files[i]));
                await psarc.extractFile(i, outfile);
            }
            const cwd = process.cwd();
            process.chdir("/tmp/");
            const { stdout, stderr } = await exec(`pyrocksmith --pack ${outDir}`);
            expect(stderr).to.be.empty;

            const t = "/tmp/bwab1anthem_m.psarc";
            const psarc2 = new PSARC(t);
            await psarc2.parse();
            const files2 = psarc2.getFiles();
            const extractedDir2 = "/tmp/extracted_psarc/rstk/";
            await remove(extractedDir2);
            await mkdirp(extractedDir2);
            for (let i = 0; i < files.length; i += 1) {
                const outfile = join(extractedDir2, basename(files2[i]));
                await psarc2.extractFile(i, outfile);
            }

            for (let i = 0; i < meter; i += 1) {
                const f = files[i];
                const parsed = parse(f);
                const lf = join(extractedDir, basename(f));
                const rf = join(extractedDir2, basename(f));
                const ld = await promises.readFile(lf);
                const rd = await promises.readFile(rf);

                switch (parsed.ext) {
                    case ".appid":
                        expect(ld).to.be.deep.equal(rd);
                        break;
                    case ".wem":
                        await WEM.parse(lf);
                        await WEM.parse(rf);
                        expect(crypto.createHash("sha256").update(ld).digest("hex")).to.be.equal(crypto.createHash("sha256").update(rd).digest("hex"));
                        break;
                    case ".bnk":
                        await BNK.parse(lf);
                        await BNK.parse(rf);
                        expect(crypto.createHash("sha256").update(ld).digest("hex")).to.be.equal(crypto.createHash("sha256").update(rd).digest("hex"));
                        break;
                    case ".version":
                    case ".nt":
                        break;
                    case ".xblock":
                    case ".xml":
                        await xml2js.parseStringPromise(ld);
                        await xml2js.parseStringPromise(rd);
                        break;
                    case ".dds":
                        await new DDS(lf).parse();
                        await new DDS(rf).parse();
                        expect(crypto.createHash("sha256").update(ld).digest("hex")).to.be.equal(crypto.createHash("sha256").update(rd).digest("hex"));
                        break;
                    case ".json":
                    case ".hsan":
                        JSON.parse(ld);
                        JSON.parse(rd);
                        break;
                    case ".sng":
                        await new SNG(lf).parse();
                        await new SNG(rf).parse();
                        break;
                    case ".flat":
                        expect(ld.toString()).to.be.equal(rd.toString());
                        break;
                    default:
                        break;
                }
            }
        }).timeout(30000);
    })
}

export interface ManifestTestInfo {
    xml: string;
    json: string;
    tones: string;
    pid: string;
    tag: string;
    songName: string;
    albumName: string;
    year: number;
    scrollSpeed: number;
}
async function manifestTests() {
    const leads: ManifestTestInfo[] = [];
    const rhythms: ManifestTestInfo[] = [];
    const basss: ManifestTestInfo[] = [];
    leads.push({
        xml: 'test/blinktest/bwab1anthem_lead.xml',
        json: 'test/blinktest/bwab1anthem_lead.json',
        tones: "test/blinktest/bwab1anthem_lead_tones.json",
        pid: "A38B3EAFB9044CEE867F8F7E6BE4650D",
        tag: 'bwaB1Anthem',
        songName: 'Anthem',
        albumName: 'Enema of the State',
        year: 1999,
        scrollSpeed: 13
    });
    rhythms.push({
        xml: 'test/blinktest/bwab1anthem_rhythm.xml',
        json: 'test/blinktest/bwab1anthem_rhythm.json',
        tones: "test/blinktest/bwab1anthem_rhythm_tones.json",
        pid: "3C55FEF5B38D4EC797AD307C1520B415",
        tag: 'bwaB1Anthem',
        songName: 'Anthem',
        albumName: 'Enema of the State',
        year: 1999,
        scrollSpeed: 13
    });
    basss.push({
        xml: 'test/blinktest/bwab1anthem_bass.xml',
        json: 'test/blinktest/bwab1anthem_bass.json',
        tones: "test/blinktest/bwab1anthem_bass_tones.json",
        pid: "D0F7AB64FB614C228EAE84160C28BF91",
        tag: 'bwaB1Anthem',
        songName: 'Anthem',
        albumName: 'Enema of the State',
        year: 1999,
        scrollSpeed: 13
    });

    const vocals: ManifestTestInfo = {
        xml: 'test/blinktest/bwab1anthem_vocals.xml',
        json: 'test/blinktest/bwab1anthem_vocals.json',
        tones: "",
        pid: "3EEA95820F8E4F738651AE628EF72A57",
        tag: 'bwaB1Anthem',
        songName: 'Anthem',
        albumName: 'Enema of the State',
        year: 1999,
        scrollSpeed: 13
    }
    const hsanFile = "test/blinktest/songs_dlc_bwab1anthem.hsan";

    const arrangements: (Arrangement | VocalArrangement)[] = [];
    describe("psarcjs: MANIFEST: generate tests", async () => {
        (forEach(leads.concat(rhythms).concat(basss)) as any)
            .it(`psarcjs: generate arrangement json`, async function (lead: ManifestTestInfo) {
                //@ts-ignore
                this.timeout(15000);
                const xml = lead.xml;
                const left = lead.json;
                const tones = lead.tones;
                const pid = lead.pid;
                const parsed: Song2014 = await Song2014.fromXML(xml);
                const sngFile = await parsed.generateSNG("/tmp/", "psarcJSGenerateTest");
                const sng = new SNG(sngFile);
                await sng.parse();
                const tonesObj: ManifestTone[] = JSON.parse(await promises.readFile(tones), ManifestToneReviver);
                const arr = new Arrangement(parsed.song, sng, {
                    tag: lead.tag,
                    sortOrder: 0,
                    volume: -9.2,
                    previewVolume: -8.3,
                    bassPicked: lead.xml.endsWith("_bass.xml"),
                    represent: true,
                    details: {
                        [ArrangementType.LEAD]: leads.length,
                        [ArrangementType.RHYTHM]: rhythms.length,
                        [ArrangementType.BASS]: basss.length,
                        [ArrangementType.VOCALS]: 1,
                        [ArrangementType.SHOWLIGHTS]: 1,
                    },
                    tones: tonesObj,
                    info: {
                        songName: "Anthem",
                        albumName: "Enema of the State",
                        persistentID: pid,
                        year: 1999,
                        currentPartition: 0,
                        scrollSpeed: 13,
                        volume: -9.2,
                        previewVolume: -8.3
                    }
                });
                arrangements.push(arr);
                const json = await MANIFEST.generateJSON("/tmp", "psarcjs_test", arr);

                const genObj = JSON.parse(await promises.readFile(json));
                const leftObj = JSON.parse(await promises.readFile(left))

                const lattr = genObj.Entries[pid].Attributes;
                const rattr = leftObj.Entries[pid].Attributes;
                /* force some fields */
                rattr.SKU = "RS2";

                let excludes = ["MasterID_PS3", "MasterID_RDV", "MasterID_XBox360", "Score_PNV", "SongDiffEasy", "SongDiffHard", "SongDiffMed", "SongDifficulty"];

                expect(lattr["Score_PNV"]).to.be.closeTo(rattr["Score_PNV"], 0.0001)
                expect(lattr["SongDiffEasy"]).to.be.closeTo(rattr["SongDiffEasy"], 0.0001)
                expect(lattr["SongDiffMed"]).to.be.closeTo(rattr["SongDiffMed"], 0.0001)
                expect(lattr["SongDiffHard"]).to.be.closeTo(rattr["SongDiffHard"], 0.0001)
                expect(lattr["SongDifficulty"]).to.be.closeTo(rattr["SongDifficulty"], 0.0001)
                expect(lattr).excluding(excludes).to.be.deep.equal(rattr);
            })

        it("psarcjs: generate vocals json", async function () {
            //@ts-ignore
            this.timeout(15000);
            const left = vocals.json;
            const pid = vocals.pid;
            const arr = new VocalArrangement({
                tag: vocals.tag,
                sortOrder: 0,
                volume: -9.2,
                previewVolume: -8.3,
                bassPicked: false,
                represent: true,
                details: {
                    [ArrangementType.LEAD]: leads.length,
                    [ArrangementType.RHYTHM]: rhythms.length,
                    [ArrangementType.BASS]: basss.length,
                    [ArrangementType.VOCALS]: 1,
                    [ArrangementType.SHOWLIGHTS]: 1,
                },
                tones: [],
                info: {
                    songName: "Anthem",
                    albumName: "Enema of the State",
                    persistentID: pid,
                    year: 1999,
                    currentPartition: 0,
                    scrollSpeed: 13,
                    volume: -9.2,
                    previewVolume: -8.3
                }
            });
            arrangements.push(arr);
            const json = await MANIFEST.generateJSON("/tmp", "psarcjs_test", arr);

            const genObj = JSON.parse(await promises.readFile(json));
            const leftObj = JSON.parse(await promises.readFile(left));

            const lattr = genObj.Entries[pid].Attributes;
            const rattr = leftObj.Entries[pid].Attributes;
            /* force some fields */
            rattr.SKU = "RS2";
            expect(lattr).excluding(['MasterID_RDV']).to.be.deep.equal(rattr);
        })

        it("psarcjs: generate hsan", async () => {
            expect(arrangements.length).to.be.greaterThan(0);
            const hsan = await MANIFEST.generateHSAN("/tmp", "psarcjs_test", arrangements);
            const hsanObj = JSON.parse(await promises.readFile(hsan));
            const leftObj = JSON.parse(await promises.readFile(hsanFile));

            const keys = Object.keys(hsanObj["Entries"]);
            for (let i = 0; i < keys.length; i += 1) {
                const pid = keys[i];
                const rattr = hsanObj["Entries"][pid]["Attributes"];
                const lattr = leftObj["Entries"][pid]["Attributes"];
                lattr.SKU = "RS2";
                let excludes = ["MasterID_RDV", "SongDiffEasy", "SongDiffHard", "SongDiffMed", "SongDifficulty"];

                if (lattr["ArrangementName"] !== "Vocals") {
                    expect(lattr["SongDiffEasy"]).to.be.closeTo(rattr["SongDiffEasy"], 0.0001)
                    expect(lattr["SongDiffMed"]).to.be.closeTo(rattr["SongDiffMed"], 0.0001)
                    expect(lattr["SongDiffHard"]).to.be.closeTo(rattr["SongDiffHard"], 0.0001)
                    expect(lattr["SongDifficulty"]).to.be.closeTo(rattr["SongDifficulty"], 0.0001)
                }
                expect(lattr).excluding(excludes).to.be.deep.equal(rattr);
            }
        })
    });


}

const sngs = "test/sng/";
const ddss = "test/dds/";
const wems = "test/wem/";
const bnks = "test/bnk/";
const xmls = "test/xml/";
async function testMain() {
    await psarcTests();
    await sngTests();
    await song2014Tests();

    await genericTests();
    await showLightsTest();
    await vocalsTest();
    await ddsTests();
    await bnkTests();
    await wemTests();

    if (process.env.GITHUB_ACTIONS !== "true") {
        await waapiTests();
    }

    await manifestTests();
    await psarcGenerateTests();
}

testMain();