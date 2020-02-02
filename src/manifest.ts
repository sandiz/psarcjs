import { promises } from "fs";
import { join } from "path";
import {
    Arrangement, VocalArrangement, Manifest,
    ManifestReplacer, HSANManifest, ArrangementType
} from "./types/common";

export class MANIFEST {
    static async generateJSON(dir: string, tag: string, arr: Arrangement | VocalArrangement) {
        const header = JSON.parse(JSON.stringify(arr.header));
        if (arr instanceof Arrangement) {
            delete (header.metronome);
            delete (header.representative);
            delete (header.routeMask);
            delete (header.bassPick);
        }
        const obj: Manifest = {
            entries: {
                [arr.header.persistentID]: {
                    attributes: {
                        ...arr.main,
                        ...header,
                    }
                }
            },
            modelName: "RSEnumerable_Song",
            iterationVersion: 2,
            insertRoot: "Static.Songs.Entries",
        };
        const allKeys = arr instanceof Arrangement ? Object.keys(arr.main).concat(Object.keys(header)) : Object.keys(arr);
        const json = JSON.stringify(obj, (k, v) => ManifestReplacer(allKeys, k, v), "  ");
        const path = join(dir, `${tag}_${arr instanceof Arrangement ? arr.arrType : "vocals"}.json`);
        await promises.writeFile(path, json);
        return path;
    }

    static async generateHSAN(dir: string, tag: string, arrs: (Arrangement | VocalArrangement)[]) {
        const filename = `songs_dlc_${tag}.hsan`;
        const obj: HSANManifest = {
            entries: {

            },
            insertRoot: "Static.Songs.Headers",
        };
        arrs.forEach(arr => {
            const header = JSON.parse(JSON.stringify(arr.header));
            if (arr instanceof Arrangement) {
                delete (header.metronome);
                if (arr.header.arrangementName.toLowerCase() !== ArrangementType.BASS)
                    delete (header.bassPick);
            }
            if (!Object.keys(obj.entries).includes(header.persistentID))
                obj.entries[header.persistentID] = {};

            obj.entries[header.persistentID]["attributes"] = header;
        });
        const json = JSON.stringify(obj, (k, v) => ManifestReplacer([], k, v), "  ");
        const path = join(dir, filename);
        await promises.writeFile(path, json);
        return path;
    }
}