import { promises } from 'fs';
import * as DDSParser from './ddsparser';

export class DDS {
    public imageFile: string;
    public ddsFiles: string[] = [];

    constructor(file: string) {
        this.imageFile = file;
    }

    public async convert(tag: string = ""): Promise<string[]> {
        this.ddsFiles = await DDSParser.convert(this.imageFile, tag);
        return this.ddsFiles;
    }

    public async parse(): Promise<object> {
        const data = await promises.readFile(this.imageFile);
        return DDSParser.HEADER.parse(data);
    }
}