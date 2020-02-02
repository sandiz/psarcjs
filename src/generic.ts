import { promises } from 'fs';
import { join } from 'path';
import * as xml2js from 'xml2js';
import { generate } from './aggregategraphwriter';
import { toTitleCase } from './common';
import {
    ArrangementDetails, Platform, ToolkitInfo, MetaArrangement,
} from "./types/common";

const pkgInfo = require("../package.json");

export class GENERIC {
    static async generateToolkit(dir: string, author: string,
        comment: string, v2: string, tk: ToolkitInfo) {
        const f = join(dir, "toolkit.version");
        const data = `Package Author: ${author}\n` +
            `Package Version: ${v2}\n` +
            `Package Comment: ${comment}\n` +
            `Toolkit: ${tk.name} v${tk.version} (psarcjs v${pkgInfo.version})\n\n`
        await promises.writeFile(f, data);
        return f;
    }

    static async generateAppid(dir: string) {
        const appid = "248750";
        const f = join(dir, "appid.appid")
        await promises.writeFile(f, appid);
        return f;
    }

    static async generateAggregateGraph(dir: string, tag: string, arrDetails: ArrangementDetails, platform: Platform) {
        return await generate(dir, tag, arrDetails, platform);
    }

    static async generateXBlock(arrs: Partial<MetaArrangement>[], tag: string, dir: string) {
        const f = join(dir, `${tag}.xblock`);
        const ptypes = [
            "Header", "Manifest", "SngAsset",
            "AlbumArtSmall", "AlbumArtMedium", "AlbumArtLarge",
            "LyricArt", "ShowLightsXMLAsset", "SoundBank", "PreviewSoundBank"
        ];
        const ptypePrefix = [
            "urn:database:hsan-db:", "urn:database:json-db:", "urn:application:musicgame-song:", "urn:image:dds:",
            "urn:image:dds:", "urn:image:dds:", "", "urn:application:xml:",
            "urn:audio:wwise-sound-bank:", "urn:audio:wwise-sound-bank:"
        ]
        const getValue = (item: string, index: number, tag: string, arr: Partial<MetaArrangement>) => {
            switch (item) {
                case "Header":
                    return `${ptypePrefix[index]}songs_dlc_${tag}`;
                case "SngAsset":
                case "Manifest":
                    return `${ptypePrefix[index]}${tag}_${arr.header?.arrangementName.toLowerCase()}`;
                case "AlbumArtSmall":
                    return `${ptypePrefix[index]}album_${tag}_64`;
                case "AlbumArtMedium":
                    return `${ptypePrefix[index]}album_${tag}_128`;
                case "AlbumArtLarge":
                    return `${ptypePrefix[index]}album_${tag}_256`;
                case "ShowLightsXMLAsset":
                    return `${ptypePrefix[index]}${tag}_showlights`;
                case "SoundBank":
                    return `${ptypePrefix[index]}song_${tag}`;
                case "PreviewSoundBank":
                    return `${ptypePrefix[index]}song_${tag}_preview`;
                default:
                    return "";
            }
        }
        const property = (arr: Partial<MetaArrangement>) => ptypes.map((item, index) => {
            return {
                $: {
                    name: item
                },
                set: {
                    $: {
                        value: getValue(item, index, tag, arr)
                    }
                }
            }

        });
        const entities = arrs.map(item => {
            return {
                $: {
                    id: item.header?.persistentID.toLowerCase(),
                    modelName: "RSEnumerable_Song",
                    name: `${tag}_${toTitleCase(item.header?.arrangementName.toLowerCase() ?? '')}`,
                    iterations: 0,
                },
                properties: {
                    property: property(item),
                }
            }
        });
        const xblock = {
            game: {
                entitySet: {
                    entity: entities,
                }
            }
        }

        const builder = new xml2js.Builder({
            xmldec: {
                version: "1.0",
            }
        });
        const xml = builder.buildObject(xblock);
        await promises.writeFile(f, xml);
        return f;
    }
}