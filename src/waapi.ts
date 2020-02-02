import * as WAAPIHandler from './wemwaapi';
import { Platform } from './types/common';

export class WAAPI {
    static async convert(file: string, tag: string, platform: Platform): Promise<string> {
        return await WAAPIHandler.Convert(file, tag, platform);
    }
}
