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
const Previewer = require("./previewer");
const convert_1 = require("../utils/convert");
class TypeScriptSignatureHelpProvider {
    constructor(client) {
        this.client = client;
    }
    provideSignatureHelp(document, position, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve(null);
        }
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        return this.client.execute('signatureHelp', args, token).then((response) => {
            const info = response.body;
            if (!info) {
                return null;
            }
            const result = new vscode_1.SignatureHelp();
            result.activeSignature = info.selectedItemIndex;
            result.activeParameter = info.argumentIndex;
            info.items.forEach((item, i) => __awaiter(this, void 0, void 0, function* () {
                if (!info) {
                    return;
                }
                // keep active parameter in bounds
                if (i === info.selectedItemIndex && item.isVariadic) {
                    result.activeParameter = Math.min(info.argumentIndex, item.parameters.length - 1);
                }
                const signature = new vscode_1.SignatureInformation('');
                signature.label += yield Previewer.plain(item.prefixDisplayParts);
                item.parameters.forEach((p, i, a) => __awaiter(this, void 0, void 0, function* () {
                    const parameter = new vscode_1.ParameterInformation(yield Previewer.plain(p.displayParts), yield Previewer.plain(p.documentation));
                    signature.label += parameter.label;
                    signature.parameters.push(parameter);
                    if (i < a.length - 1) {
                        signature.label += yield Previewer.plain(item.separatorDisplayParts);
                    }
                }));
                signature.label += yield Previewer.plain(item.suffixDisplayParts);
                signature.documentation = (yield Previewer.markdownDocumentation(item.documentation, item.tags)).value;
                result.signatures.push(signature);
            }));
            return result;
        }, () => {
            return null;
        });
    }
}
exports.default = TypeScriptSignatureHelpProvider;
//# sourceMappingURL=signatureHelpProvider.js.map