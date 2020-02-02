import { promises } from 'fs';
import * as BNKParser from './bnkparser';

export class BNK {
    static async parse(bnkFile: string) {
        const data = await promises.readFile(bnkFile);
        return BNKParser.BNKDATA.parse(data);
    }

    static async generate(wemFile: string, tag: string, copyWem: boolean, dir: string, preview: boolean = false) {
        return await BNKParser.generate(dir, wemFile, tag, copyWem, preview);
    }
}