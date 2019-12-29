
import { Parser } from 'binary-parser';

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
    .skip(4)
    .skip(4)
    .skip(4)

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