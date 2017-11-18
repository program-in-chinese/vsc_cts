"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
function getSymbolKind(item) {
    switch (item.kind) {
        case '方法': return vscode_1.SymbolKind.Method;
        case '枚举': return vscode_1.SymbolKind.Enum;
        case '函数': return vscode_1.SymbolKind.Function;
        case '类别': return vscode_1.SymbolKind.Class;
        case '接口': return vscode_1.SymbolKind.Interface;
        case '值量': return vscode_1.SymbolKind.Variable;
        default: return vscode_1.SymbolKind.Variable;
    }
}
class TypeScriptWorkspaceSymbolProvider {
    constructor(client, modeIds) {
        this.client = client;
        this.modeIds = modeIds;
    }
    provideWorkspaceSymbols(search, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // typescript wants to have a resource even when asking
            // general questions so we check the active editor. If this
            // doesn't match we take the first TS document.
            let uri = undefined;
            const editor = vscode_1.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                if (document && this.modeIds.indexOf(document.languageId) >= 0) {
                    uri = document.uri;
                }
            }
            if (!uri) {
                const documents = vscode_1.workspace.textDocuments;
                for (const document of documents) {
                    if (this.modeIds.indexOf(document.languageId) >= 0) {
                        uri = document.uri;
                        break;
                    }
                }
            }
            if (!uri) {
                return [];
            }
            const filepath = this.client.normalizePath(uri);
            if (!filepath) {
                return [];
            }
            const args = {
                file: filepath,
                searchValue: search
            };
            const response = yield this.client.execute('navto', args, token);
            const result = [];
            const data = response.body;
            if (data) {
                for (const item of data) {
                    if (!item.containerName && item.kind === '别名') {
                        continue;
                    }
                    const range = convert_1.tsTextSpanToVsRange(item);
                    let label = item.name;
                    if (item.kind === '方法' || item.kind === '函数') {
                        label += '()';
                    }
                    result.push(new vscode_1.SymbolInformation(label, getSymbolKind(item), item.containerName || '', new vscode_1.Location(this.client.asUrl(item.file), range)));
                }
            }
            return result;
        });
    }
}
exports.default = TypeScriptWorkspaceSymbolProvider;
