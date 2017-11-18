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
class TypeScriptDefinitionProviderBase {
    constructor(client) {
        this.client = client;
    }
    getSymbolLocations(definitionType, document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = this.client.normalizePath(document.uri);
            if (!filepath) {
                return undefined;
            }
            const args = convert_1.vsPositionToTsFileLocation(filepath, position);
            try {
                const response = yield this.client.execute(definitionType, args, token);
                const locations = (response && response.body) || [];
                if (!locations || locations.length === 0) {
                    return [];
                }
                return locations.map(location => {
                    const resource = this.client.asUrl(location.file);
                    return resource
                        ? new vscode_1.Location(resource, convert_1.tsTextSpanToVsRange(location))
                        : undefined;
                }).filter(x => x);
            }
            catch (_a) {
                return [];
            }
        });
    }
}
exports.default = TypeScriptDefinitionProviderBase;
