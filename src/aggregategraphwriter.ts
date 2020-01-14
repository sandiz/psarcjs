import { join } from "path";
import { promises } from "fs";
import { ArrangementDetails, Platform } from "./types/common";

export enum TagType {
    tag = "tag",
    llid = "llid",
    canonical = "canonical",
    name = "name",
    relpath = "relpath",
    logpath = "logpath",
}

export enum TagValue {
    Database = "database",
    JsonDB = "json-db",
    HsanDB = "hsan-db",
    Application = "application",
    MusicgameSong = "musicgame-song",
    DDS = "dds",
    Image = "image",
    XML = "xml",
    Audio = "audio",
    WwiseSoundBank = "wwise-sound-bank",
    DX9 = "dx9",
    MacOS = "macos",
    EmergentWorld = "emergent-world",
    XWorld = "x-world",
    GamebryoSceneGraph = "gamebryo-scenegraph",
}

export class GraphItem {
    name: string = "";
    canonical: string = "";
    relpath: string = "";
    tags: string[] = [];
    uuid: string;

    constructor() {
        this.uuid = getUuid();
    }

    serialize = () => {
        const template = (one: string, two: string) => `<urn:uuid:${this.uuid}> <http://` + `emergent.net/aweb/1.0/${one}> \"${two}\".\n`;
        let data = "";
        this.tags.forEach(item => {
            data += template(TagType.tag, item);
        })
        data += template(TagType.canonical, this.canonical);
        data += template(TagType.name, this.name);
        data += template(TagType.relpath, this.relpath);
        //data += "\n"; //debug
        return data;
    }
}

export class GraphItemLLID {
    llid: string = "";
    name: string = "";
    canonical: string = "";
    relpath: string = "";
    logpath: string = "";
    tags: string[] = [];
    uuid: string;

    constructor() {
        this.uuid = getUuid();
    }

    serialize = () => {
        const template = (one: string, two: string) => `<urn:uuid:${this.uuid}> <http://` + `emergent.net/aweb/1.0/${one}> \"${two}\".\n`;
        let data = "";
        this.tags.forEach(item => {
            data += template(TagType.tag, item);
        })
        data += template(TagType.canonical, this.canonical);
        data += template(TagType.name, this.name);
        data += template(TagType.relpath, this.relpath);
        data += template(TagType.llid, `${this.llid}`)
        data += template(TagType.logpath, this.logpath);
        //data += "\n"; //debug
        return data;
    }
}

export async function generate(dir: string, tag: string, details: ArrangementDetails, platform: Platform) {
    const fileName = `${tag}_aggregategraph.nt`;
    const file = join(dir, fileName);
    let data = "";
    data += addJSON(tag, details);
    data += addHSAN(tag);
    data += addXML(tag, details);
    data += addSNG(tag, details, platform)
    data += addDDS(tag);
    data += addBNK(tag, platform);
    data += addXBLOCK(tag);
    await promises.writeFile(file, data);
    return file;
}

function addJSON(tag: string, details: ArrangementDetails): string {
    let data = "";
    const keys = Object.keys(details);
    const values = Object.values(details);
    for (let i = 0; i < keys.length; i += 1) {
        const count = values[i];
        const type = keys[i];
        if (count > 0) {
            for (let j = 1; j <= count; j += 1) {
                const arr = type;
                var json = new GraphItem();
                json.name = `${tag}_${arr}${j > 1 ? j : ""}`;
                json.canonical = `/manifests/songs_dlc_${tag}`;
                json.tags = [TagValue.Database, TagValue.JsonDB];
                json.relpath = `${json.canonical}/${json.name}.json`;
                data += json.serialize();
            }
        }
    }
    return data;
}
function addHSAN(tag: string): string {
    let data = "";
    var json = new GraphItem();
    json.name = `songs_dlc_${tag}`;
    json.canonical = `/manifests/songs_dlc_${tag}`;
    json.tags = [TagValue.Database, TagValue.HsanDB];
    json.relpath = `${json.canonical}/${json.name}.hsan`;
    data += json.serialize();
    return data;
}
function addXML(tag: string, details: ArrangementDetails): string {
    let data = "";
    const keys = Object.keys(details);
    const values = Object.values(details);
    for (let i = 0; i < keys.length; i += 1) {
        const count = values[i];
        const type = keys[i];
        if (count > 0) {
            for (let j = 1; j <= count; j += 1) {
                const arr = type;
                var xml = new GraphItemLLID();
                xml.name = `${tag}_${arr}${j > 1 ? j : ""}`;
                xml.canonical = `/songs/arr`;
                xml.tags = [TagValue.Application, TagValue.XML];
                xml.relpath = `${xml.canonical}/${xml.name}.xml`;
                xml.logpath = `${xml.canonical}/${xml.name}.xml`;
                xml.llid = getUuid().split("").map((v, index) => (index > 8 && v != '-') ? 0 : v).join("");
                data += xml.serialize();
            }
        }
    }
    /* add showlights */
    const arr = "showlights";
    var xml = new GraphItemLLID();
    xml.name = `${tag}_${arr}`;
    xml.canonical = `/songs/arr`;
    xml.tags = [TagValue.Application, TagValue.XML];
    xml.relpath = `${xml.canonical}/${xml.name}.xml`;
    xml.logpath = `${xml.canonical}/${xml.name}.xml`;
    xml.llid = getUuid().split("").map((v, index) => (index > 8 && v != '-') ? 0 : v).join("");
    data += xml.serialize();
    return data;
}
function addSNG(tag: string, details: ArrangementDetails, platform: Platform): string {
    let data = "";
    const keys = Object.keys(details);
    const values = Object.values(details);
    for (let i = 0; i < keys.length; i += 1) {
        const count = values[i];
        const type = keys[i];
        if (count > 0) {
            for (let j = 1; j <= count; j += 1) {
                const arr = type;
                var sng = new GraphItemLLID();
                sng.name = `${tag}_${arr}${j > 1 ? j : ""}`;
                sng.canonical = `/songs/bin/${platform === Platform.Mac ? "macos" : "generic"}`;
                sng.tags = [TagValue.Application, TagValue.MusicgameSong];
                sng.relpath = `${sng.canonical}/${sng.name}.sng`;
                sng.logpath = `${sng.canonical}/${sng.name}.sng`;
                sng.llid = getUuid().split("").map((v, index) => (index > 8 && v != '-') ? 0 : v).join("");
                data += sng.serialize();
            }
        }
    }
    return data;
}
function addDDS(tag: string): string {
    let data = "";
    const ress = [256, 128, 64];
    for (let i = 0; i < ress.length; i += 1) {
        var dds = new GraphItemLLID();
        const res = ress[i];
        dds.name = `album_${tag}_${res}`;
        dds.canonical = `/gfxassets/album_art`;
        dds.tags = [TagValue.DDS, TagValue.Image];
        dds.relpath = `${dds.canonical}/${dds.name}.dds`;
        dds.logpath = `${dds.canonical}/${dds.name}.dds`;
        dds.llid = getUuid().split("").map((v, index) => (index > 8 && v != '-') ? 0 : v).join("");
        data += dds.serialize();
    }
    return data;
}
function addBNK(tag: string, platform: Platform): string {
    let data = "";
    const ress = 2;
    for (let i = 0; i < ress; i += 1) {
        var bnk = new GraphItemLLID();
        const extra = i === 1 ? "_preview" : "";

        bnk.name = `song_${tag}${extra}`;
        bnk.canonical = `/audio/${platform === Platform.Mac ? "mac" : "windows"}`;
        bnk.tags = [TagValue.Audio, TagValue.WwiseSoundBank, platform === Platform.Mac ? TagValue.MacOS : TagValue.DX9];
        bnk.relpath = `${bnk.canonical}/${bnk.name}.bnk`;
        bnk.logpath = `${bnk.canonical}/${bnk.name}.bnk`;
        bnk.llid = getUuid().split("").map((v, index) => (index > 8 && v != '-') ? 0 : v).join("");
        data += bnk.serialize();
    }
    return data;
}
function addXBLOCK(tag: string): string {
    let data = "";
    var xblock = new GraphItem();

    xblock.name = `${tag}`;
    xblock.canonical = `/gamexblocks/nsongs`;
    xblock.tags = [TagValue.EmergentWorld, TagValue.XWorld];
    xblock.relpath = `${xblock.canonical}/${xblock.name}.xblock`;
    data += xblock.serialize();
    return data;
}

export const getUuid = (a: string = ''): string => (
    a
        /* eslint-disable no-bitwise */
        ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
        : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
);