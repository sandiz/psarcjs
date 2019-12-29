
import { Parser } from 'binary-parser';
import { promises } from 'fs';
import { join } from 'path';
import { copy } from 'fs-extra';

export const HEADER = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
    })
    .int32("chunkSize")
    .int32("soundbankVersion")
    .int32("soundbankID")
    .int32("languageID")
    .int32("hasFeedback")
    .buffer("padding", {
        length: 12,
    })

export const DIDX = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
    })
    .int32("chunkSize")
    .int32("fileID")
    .int32("fileOffset")
    .int32("fileSize")

export const DATA = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
    })
    .int32("chunkSize")
    .buffer("data", {
        length: "chunkSize"
    })

export const HIRCSOUND = new Parser()
    .endianess("little")
    .uint32("soundID")
    .uint32("pluginID")
    .uint32("streamType")
    .uint32("fileID")
    .uint32("sourceID")
    .int8("languageSpecific")
    .int8("overrideParent")
    .int8("numFX")
    .uint32("parentBusID")
    .uint32("directParentID")
    .uint32("unkID1")
    .int32("mixerID")
    .int8("priorityOverrideParent")
    .int8("priorityApplyDist")
    .int8("overrideMidi")
    .int8("numParam")
    .int8("param1Type")
    .int8("param2Type")
    .int8("param3Type")
    .floatle("param1Value")
    .int32("param2Value")
    .int32("param3Value")
    .int8("numRange")
    .int8("positionOverride")
    .int8("overrideGameAux")
    .int8("useGameAux")
    .int8("overrideUserAux")
    .int8("hasAux")
    .int8("virtualQueueBehavior")
    .int8("killNewest")
    .int8("useVirtualBehavior")
    .int16("maxNumInstance")
    .int8("isGlobalLimit")
    .int8("belowThresholdBehavior")
    .int8("isMaxNumInstOverrideParent")
    .int8("isVVoiceOptOverrideParent")
    .int32("stateGroupList")
    .int16("rtpcList")
    .int32("feedbackBus")

export const HIRCACTORMIXER = new Parser()
    .endianess("little")
    .uint32("mixerID")
    .int8("overrideParent")
    .int8("numFX")
    .uint32("parentBusID")
    .int32("directParentID")
    .int32("unkID1")
    .int32("unkID2")
    .int8("priorityOverrideParent")
    .int8("priorityApplyDist")
    .int8("numParam")
    .int8("numRange")
    .int8("positionOverride")
    .int8("overrideGameAux")
    .int8("useGameAux")
    .int8("overrideUserAux")
    .int8("hasAux")
    .int8("virtualQueueBehavior")
    .int8("killNewest")
    .int8("useVirtualBehavior")
    .int16("maxNumInstance")
    .int8("isGlobalLimit")
    .int8("belowThresholdBehavior")
    .int8("isMaxNumInstOverrideParent")
    .int8("isVVoiceOptOverrideParent")
    .int32("stateGroupList")
    .int16("rtpcList")
    .int32("numchild")
    .int32("child1")

export const HIRCACTION = new Parser()
    .endianess("little")
    .int32("actionID")
    .int16("actionType")
    .int32("objectID")
    .int8("isBus")
    .int8("numParam")
    .int8("numRange")
    .int8("fadeCurve")
    .int32("soundbankID")

export const HIRCEVENT = new Parser()
    .endianess("little")
    .int32("eventID")
    .int32("numEvents")
    .int32("actionID")

export const HIERARCHY = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
    })
    .int32("chunkSize")
    .int32("numObjects")
    .int8("HIRC_SOUND")
    .int32("HIRC_SOUND_size")
    .nest("sound", {
        type: HIRCSOUND,
    })
    .int8("HIRC_ACTOR_MIXER")
    .int32("HIRC_ACTOR_MIXER_size")
    .nest("actor_mixer", {
        type: HIRCACTORMIXER,
    })
    .int8("HIRC_ACTION")
    .int32("HIRC_ACTION_size")
    .nest("action", {
        type: HIRCACTION,
    })
    .int8("HIRC_EVENT")
    .int32("HIRC_EVENT_size")
    .nest("event", {
        type: HIRCEVENT,
    })

export const STID = new Parser()
    .endianess("little")
    .string("magic", {
        length: 4,
    })
    .int32("chunkSize")
    .int32("stringType")
    .int32("numNames")
    .int32("soundbankID")
    .int8("len")
    .string("soundbankName", {
        length: "len",
        encoding: "ascii"
    })

export const BNKDATA = new Parser()
    .endianess("little")
    .nest("header", {
        type: HEADER,
    })
    .nest("didx", {
        type: DIDX,
    })
    .nest("data", {
        type: DATA,
    })
    .nest("hierarchy", {
        type: HIERARCHY,
    })
    .nest("strings", {
        type: STID,
    })

export interface BNKReturn {
    input: string;
    wem: string;
    bnk: string;
    fileID: number;
    soundbankID: number;
    soundID: number;
}

export async function generate(dir: string, wemFile: string, tag: string,
    rename: boolean, preview: boolean): Promise<BNKReturn> {
    const orig = wemFile;
    const soundbankID = getRandomInt();
    const fileID = getRandomInt();
    const soundID = getRandomInt();
    let dataBuffer = await promises.readFile(wemFile);
    dataBuffer = dataBuffer.slice(0, 51200);
    const header = getHeader(soundbankID);
    HEADER.parse((HEADER as any).encode(header))

    const didx = getDIDX(fileID, dataBuffer.length);
    DIDX.parse((DIDX as any).encode(didx))

    const dataChunk = getDataChunk(dataBuffer);
    DATA.parse((DATA as any).encode(dataChunk))

    const strings = getStringID(soundbankID, tag);
    STID.parse((STID as any).encode(strings))

    const hierarchy = getHierarchy(soundbankID, fileID, soundID, tag, preview);
    HIERARCHY.parse((HIERARCHY as any).encode(hierarchy))

    const data = {
        header,
        didx,
        data: dataChunk,
        hierarchy,
        strings,
    }
    const bnkData = (BNKDATA as any).encode(data);
    BNKDATA.parse(bnkData);
    const fileName = `Song_${tag}${preview ? "_Preview" : ""}.bnk`;
    const p = join(dir, fileName);
    await promises.writeFile(p, bnkData);
    if (rename) {
        const dest = join(dir, `${fileID}.wem`);
        await copy(wemFile, dest);
        wemFile = dest;
    }
    return {
        input: orig,
        wem: wemFile,
        bnk: p,
        fileID,
        soundbankID,
        soundID,
    };
}

function getHierarchy(soundbankID: number, fileID: number, soundID: number,
    soundbankName: string, preview: boolean) {
    const mixerID = 650605636;
    const actionID = getRandomInt();
    const DEFAULT_AUDIO_VOLUME = -7.0;
    const DEFAULT_PREVIEW_VOLUME = -5.0;
    const sound = {
        soundID,
        pluginID: 262145,
        streamType: 2,
        fileID,
        sourceID: fileID,
        languageSpecific: 0,
        overrideParent: 0,
        numFX: 0,
        parentBusID: getRandomInt(),
        directParentID: 65536,
        unkID1: (preview) ? 4178100890 : 0,
        mixerID,
        priorityOverrideParent: 0,
        priorityApplyDist: 0,
        overrideMidi: 0,
        numParam: 3,
        param1Type: 0,
        param2Type: 46,
        param3Type: 47,
        param1Value: preview ? DEFAULT_PREVIEW_VOLUME : DEFAULT_AUDIO_VOLUME,
        param2Value: 1,
        param3Value: 3,
        numRange: 0,
        positionOverride: 0,
        overrideGameAux: 0,
        useGameAux: 0,
        overrideUserAux: 0,
        hasAux: 0,
        virtualQueueBehavior: preview ? 1 : 0,
        killNewest: preview ? 1 : 0,
        useVirtualBehavior: 0,
        maxNumInstance: preview ? 1 : 0,
        isGlobalLimit: 0,
        belowThresholdBehavior: 0,
        isMaxNumInstOverrideParent: preview ? 1 : 0,
        isVVoiceOptOverrideParent: 0,
        stateGroupList: 0,
        rtpcList: 0,
        feedbackBus: 0,
    }
    const sObj: Buffer = (HIRCSOUND as any).encode(sound);
    const actor_mixer = {
        mixerID,
        overrideParent: 0,
        numFX: 0,
        parentBusID: 2616261673,
        directParentID: 0,
        unkID1: 0,
        unkID2: 65792,
        priorityOverrideParent: 0,
        priorityApplyDist: 0,
        numParam: 0,
        numRange: 0,
        positionOverride: 0,
        overrideGameAux: 0,
        useGameAux: 0,
        overrideUserAux: 0,
        hasAux: 0,
        virtualQueueBehavior: 0,
        killNewest: 0,
        useVirtualBehavior: 0,
        maxNumInstance: 0,
        isGlobalLimit: 0,
        belowThresholdBehavior: 0,
        isMaxNumInstOverrideParent: 0,
        isVVoiceOptOverrideParent: 0,
        stateGroupList: 0,
        rtpcList: 0,
        numChild: 1,
        child1: soundID,
    }
    const aMObj: Buffer = (HIRCACTORMIXER as any).encode(actor_mixer);
    const action = {
        actionID,
        actionType: 1027,
        objectID: soundID,
        isBus: 0,
        numParam: 0,
        numRange: 0,
        fadeCurve: 4,
        soundbankID
    }
    const aObj: Buffer = (HIRCACTION as any).encode(action);
    const event = {
        eventID: hashString("Play_" + soundbankName),
        numEvents: 1,
        actionID,
    }
    const eObj: Buffer = (HIRCEVENT as any).encode(event);

    const hirc = {
        magic: "HIRC",
        chunkSize: 4 + (1 + 4 + sObj.length) + (1 + 4 + aMObj.length) + (1 + 4 + aObj.length) + (1 + 4 + eObj.length),
        numObjects: 4,
        HIRC_SOUND: 2,
        HIRC_SOUND_size: sObj.length,
        sound,
        HIRC_ACTOR_MIXER: 7,
        HIRC_ACTOR_MIXER_size: aMObj.length,
        actor_mixer: actor_mixer,
        HIRC_ACTION: 3,
        HIRC_ACTION_size: aObj.length,
        action,
        HIRC_EVENT: 4,
        HIRC_EVENT_size: eObj.length,
        event,
    }
    //const o = (HIERARCHY as any).encode(hirc);
    return hirc;
}
function getStringID(soundbankID: number, tag: string) {
    const obj = {
        magic: "STID",
        chunkSize: 12,
        stringType: 1,
        numNames: 1,
        soundbankID,
        len: tag.length,
        soundbankName: tag,
    }
    //const o = (STID as any).encode(obj);
    return obj;
}
function getDataChunk(data: Buffer) {
    const obj = {
        magic: 'DATA',
        chunkSize: data.length,
        data
    }
    //const o = (DATA as any).encode(obj);
    return obj;
}
function getDIDX(fileID: number, dataChunkLength: number) {
    const obj = {
        magic: 'DIDX',
        chunkSize: 12,
        fileID: fileID,
        fileOffset: 0,
        fileSize: dataChunkLength
    }
    //const o = (DIDX as any).encode(obj);
    return obj;
}
function getHeader(soundbankID: number) {
    const obj = {
        magic: "BKHD",
        chunkSize: 28,
        soundbankVersion: 91,
        soundbankID,
        languageID: 0,
        hasFeedback: 0,
        padding: Buffer.alloc(12, 0),
    }
    //const o = (HEADER as any).encode(obj);
    return obj;
}
function getRandomInt() {
    let min = 0;
    let max = 2147483647;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function hashString(str: string) //FNV hash
{
    const bytes: Buffer = Buffer.from(str.toLowerCase());
    let hash: number = 2166136261;

    for (var i = 0; i < str.length; i += 1) {
        hash *= 16777619;
        hash = hash ^ bytes[i];
    }
    return hash;
}