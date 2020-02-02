import { promises } from 'fs';
import * as WEMParser from './wemparser';

export class WEM {
    static async convert(file: string, tag: string = "") {
        let wemFile = await WEMParser.convert(file, tag);
        return wemFile;
    }

    static async parse(wemFile: string) {
        const data = await promises.readFile(wemFile);
        return WEMParser.WEMDATA.parse(data);
    }
}