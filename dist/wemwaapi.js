"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var waapi = __importStar(require("waapi-client"));
var waapi_1 = require("waapi");
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var os_1 = require("os");
var fs_1 = require("fs");
var common_1 = require("./types/common");
var globby = require('globby');
var connection = null;
var subscription = null;
var waitForProjectLoad = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var subscription_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) return [3 /*break*/, 2];
                            return [4 /*yield*/, connection.subscribe(waapi_1.ak.wwise.core.project.loaded, function () {
                                    var _a;
                                    (_a = connection) === null || _a === void 0 ? void 0 : _a.unsubscribe(subscription_1);
                                    resolve();
                                }, {})];
                        case 1:
                            subscription_1 = _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            reject(new Error("no connection found"));
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var waitForProjectClosed = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var subscription_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) return [3 /*break*/, 2];
                            return [4 /*yield*/, connection.subscribe(waapi_1.ak.wwise.core.project.postClosed, function () {
                                    var _a;
                                    (_a = connection) === null || _a === void 0 ? void 0 : _a.unsubscribe(subscription_2);
                                    resolve();
                                }, {})];
                        case 1:
                            subscription_2 = _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            reject(new Error("no connection found"));
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var waitForCommandExecuted = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var p, subscription_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) return [3 /*break*/, 3];
                            return [4 /*yield*/, getPlatforms()];
                        case 1:
                            p = _a.sent();
                            return [4 /*yield*/, connection.subscribe("ak.wwise.ui.commands.executed", function (e, f) {
                                    var _a;
                                    (_a = connection) === null || _a === void 0 ? void 0 : _a.unsubscribe(subscription_3);
                                    resolve(f);
                                }, {})];
                        case 2:
                            subscription_3 = _a.sent();
                            connection.call(waapi_1.ak.wwise.ui.commands.execute, {
                                command: "ConvertAllPlatform",
                                objects: args,
                            }, {});
                            return [3 /*break*/, 4];
                        case 3:
                            reject(new Error("no connection found"));
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
function Convert(file, tag, platform) {
    return __awaiter(this, void 0, void 0, function () {
        var wwiseInfo, closeProj, projDir, tmp, created, inputPath, buffer, objects, args, d, wemPath, wemFiles, retFile, wem, newFile, closeProj2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, waapi.connect('ws://localhost:8080/waapi')];
                case 1:
                    connection = _a.sent();
                    return [4 /*yield*/, connection.call(waapi_1.ak.wwise.core.getInfo, {})];
                case 2:
                    wwiseInfo = _a.sent();
                    console.log("Found " + wwiseInfo.displayName + " " + wwiseInfo.version.displayName + "!");
                    return [4 /*yield*/, connection.call(waapi_1.ak.wwise.ui.project.close, {
                            bypassSave: true,
                        })];
                case 3:
                    closeProj = _a.sent();
                    if (!closeProj.hadProjectOpen) return [3 /*break*/, 5];
                    return [4 /*yield*/, waitForProjectClosed()];
                case 4:
                    _a.sent();
                    console.log("Existing project closed!");
                    _a.label = 5;
                case 5:
                    projDir = path_1.resolve("data/psarcjs-default");
                    tmp = path_1.join(os_1.tmpdir(), "tmp-psarcjs");
                    return [4 /*yield*/, fs_extra_1.remove(tmp)];
                case 6:
                    _a.sent();
                    //console.log("moving project", projDir, tmp);
                    return [4 /*yield*/, fs_extra_1.copy(projDir, tmp, {
                            overwrite: true,
                        })];
                case 7:
                    //console.log("moving project", projDir, tmp);
                    _a.sent();
                    projDir = tmp;
                    projDir = path_1.join("Z:", projDir);
                    projDir = projDir.replace(/\//g, "\\");
                    return [4 /*yield*/, connection.call(waapi_1.ak.wwise.ui.project.open, {
                            path: projDir + "\\psarcjs-default.wproj",
                            bypassSave: true,
                            onUpgrade: 'migrate',
                        })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, waitForProjectLoad()];
                case 9:
                    _a.sent();
                    console.log("Project loaded", projDir);
                    return [4 /*yield*/, connection.call(waapi_1.ak.wwise.core.object.create, {
                            parent: "\\Interactive Music Hierarchy\\Default Work Unit\\",
                            type: "MusicSegment",
                            name: "psarcjs-inputWav",
                            onNameConflict: "rename"
                        })];
                case 10:
                    created = _a.sent();
                    console.log("Object created", created.name, created.id);
                    inputPath = file;
                    return [4 /*yield*/, fs_1.promises.readFile(inputPath)];
                case 11:
                    buffer = _a.sent();
                    return [4 /*yield*/, connection.call(waapi_1.ak.wwise.core.audio.import_, {
                            imports: [
                                {
                                    objectPath: "\\Interactive Music Hierarchy\\Default Work Unit\\psarcjs-inputWav\\input",
                                    audioFileBase64: "output.wav|" + buffer.toString("base64"),
                                }
                            ],
                            importOperation: "createNew"
                        })];
                case 12:
                    objects = _a.sent();
                    args = objects.objects.map(function (item) { return item.id; });
                    console.log("Imported audio", args);
                    console.log("Waiting for conversion to finish...");
                    return [4 /*yield*/, waitForCommandExecuted(args)];
                case 13:
                    d = _a.sent();
                    console.log(d);
                    wemPath = path_1.join(tmp, ".cache", platform === common_1.Platform.Windows ? "Windows" : "Mac", "SFX");
                    return [4 /*yield*/, globby("*.wem", {
                            cwd: wemPath,
                        })];
                case 14:
                    wemFiles = _a.sent();
                    console.log("Found wems in", wemPath, wemFiles);
                    retFile = "";
                    if (!(wemFiles.length > 0)) return [3 /*break*/, 16];
                    wem = path_1.join(wemPath, wemFiles[0]);
                    newFile = path_1.join(wemPath, "Song_" + tag + ".wem");
                    return [4 /*yield*/, fs_extra_1.copy(wem, newFile)];
                case 15:
                    _a.sent();
                    retFile = newFile;
                    _a.label = 16;
                case 16: return [4 /*yield*/, connection.call(waapi_1.ak.wwise.ui.project.close, {
                        bypassSave: true,
                    })];
                case 17:
                    closeProj2 = _a.sent();
                    if (!closeProj2.hadProjectOpen) return [3 /*break*/, 19];
                    return [4 /*yield*/, waitForProjectClosed()];
                case 18:
                    _a.sent();
                    console.log("Existing project closed!");
                    _a.label = 19;
                case 19: return [4 /*yield*/, Disconnect()];
                case 20:
                    _a.sent();
                    console.log("Disconnected!");
                    return [2 /*return*/, retFile];
            }
        });
    });
}
exports.Convert = Convert;
function getPlatforms() {
    return __awaiter(this, void 0, void 0, function () {
        var query, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        from: {
                            ofType: [
                                'Platform',
                            ]
                        }
                    };
                    options = {
                        return: ['id', 'name']
                    };
                    if (!connection) return [3 /*break*/, 2];
                    return [4 /*yield*/, connection.call('ak.wwise.core.object.get', query, options)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.return.filter(function (item) { return item.name.toLowerCase() === 'windows'; }).map(function (item) { return item.id; })];
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.getPlatforms = getPlatforms;
function Disconnect() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!connection) return [3 /*break*/, 2];
                    return [4 /*yield*/, connection.disconnect()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.Disconnect = Disconnect;
