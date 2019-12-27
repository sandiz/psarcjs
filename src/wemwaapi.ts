import * as waapi from 'waapi-client';
import { ak } from 'waapi';
import { join, resolve } from 'path';
import { copy, remove } from 'fs-extra';
import { tmpdir } from 'os';
import { promises } from 'fs';
import { Platform } from './index';

const globby = require('globby');


let connection: waapi.Session | null = null;
let subscription: any | null = null;
const waitForProjectLoad = async () => new Promise(async (resolve, reject) => {
    if (connection) {
        const subscription = await connection.subscribe(ak.wwise.core.project.loaded, () => {
            connection?.unsubscribe(subscription);
            resolve();
        }, {});
    }
    else {
        reject(new Error("no connection found"));
    }
});

const waitForProjectClosed = async () => new Promise(async (resolve, reject) => {
    if (connection) {
        const subscription = await connection.subscribe(ak.wwise.core.project.postClosed, () => {
            connection?.unsubscribe(subscription);
            resolve();
        }, {});
    }
    else {
        reject(new Error("no connection found"));
    }
});

const waitForCommandExecuted = async (args: any) => new Promise(async (resolve, reject) => {
    if (connection) {
        const p = await getPlatforms();
        const subscription = await connection.subscribe("ak.wwise.ui.commands.executed", (e, f) => {
            connection?.unsubscribe(subscription);
            resolve(f);
        }, {})
        connection.call(ak.wwise.ui.commands.execute, {
            command: "ConvertAllPlatform",
            objects: args,
        }, {
        });
    }
    else {
        reject(new Error("no connection found"));
    }
});

export async function Convert(file: string, tag: string, platform: Platform) {
    connection = await waapi.connect('ws://localhost:8080/waapi');

    // Obtain information about Wwise
    const wwiseInfo = await connection.call(ak.wwise.core.getInfo, {});
    console.log(`Found ${wwiseInfo.displayName} ${wwiseInfo.version.displayName}!`);

    const closeProj = await connection.call(ak.wwise.ui.project.close, {
        bypassSave: true,
    });
    if (closeProj.hadProjectOpen) {
        await waitForProjectClosed();
        console.log("Existing project closed!")
    }
    let projDir = resolve("data/psarcjs-default");
    const tmp = join(tmpdir(), "tmp-psarcjs");
    await remove(tmp);
    //console.log("moving project", projDir, tmp);
    await copy(projDir, tmp, {
        overwrite: true,
    });
    projDir = tmp;
    projDir = join("Z:", projDir);
    projDir = projDir.replace(/\//g, "\\");
    await connection.call(ak.wwise.ui.project.open, {
        path: projDir + "\\psarcjs-default.wproj",
        bypassSave: true,
        onUpgrade: 'migrate',
    })
    await waitForProjectLoad();
    console.log("Project loaded", projDir);

    var created = await connection.call(ak.wwise.core.object.create, {
        parent: "\\Interactive Music Hierarchy\\Default Work Unit\\",
        type: "MusicSegment",
        name: "psarcjs-inputWav",
        onNameConflict: "rename"
    }
    );
    console.log("Object created", created.name, created.id);
    const inputPath = file;
    const buffer = await promises.readFile(inputPath);

    const objects = await connection.call(ak.wwise.core.audio.import_, {
        imports: [
            {
                objectPath: "\\Interactive Music Hierarchy\\Default Work Unit\\psarcjs-inputWav\\input",
                audioFileBase64: "output.wav|" + buffer.toString("base64"),
            }
        ],
        importOperation: "createNew"
    });
    const args = objects.objects.map((item: any) => item.id);
    console.log("Imported audio", args);

    console.log("Waiting for conversion to finish...");
    const d = await waitForCommandExecuted(args);
    console.log(d);

    let wemPath = join(tmp, ".cache", platform === Platform.Windows ? "Windows" : "Mac", "SFX");
    let wemFiles = await globby("*.wem", {
        cwd: wemPath,
    })
    console.log("Found wems in", wemPath, wemFiles);
    let retFile = "";
    if (wemFiles.length > 0) {
        const wem = join(wemPath, wemFiles[0]);
        const newFile = join(wemPath, `Song_${tag}.wem`);
        await copy(wem, newFile);
        retFile = newFile;
    }
    const closeProj2 = await connection.call(ak.wwise.ui.project.close, {
        bypassSave: true,
    });
    if (closeProj2.hadProjectOpen) {
        await waitForProjectClosed();
        console.log("Existing project closed!")
    }
    await Disconnect();
    console.log("Disconnected!");
    return retFile;
}

export async function getPlatforms() {
    var query = {
        from: {
            ofType: [
                'Platform',
            ]
        }
    };
    var options = {
        return: ['id', 'name']
    };
    if (connection) {
        const res = await connection.call('ak.wwise.core.object.get', query, options);
        return res.return.filter((item: any) => item.name.toLowerCase() === 'windows').map((item: any) => item.id);
    }
}

export async function Disconnect() {
    if (connection) {
        await connection.disconnect();
    }
}