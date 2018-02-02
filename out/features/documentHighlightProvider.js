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
class TypeScriptDocumentHighlightProvider {
    constructor(client) {
        this.client = client;
    }
    provideDocumentHighlights(resource, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = this.client.normalizePath(resource.uri);
            if (!filepath) {
                return [];
            }
            const args = convert_1.vsPositionToTsFileLocation(filepath, position);
            try {
                const response = yield this.client.execute('occurrences', args, token);
                const data = response.body;
                if (data && data.length) {
                    // Workaround for https://github.com/Microsoft/TypeScript/issues/12780
                    // Don't highlight string occurrences
                    const firstOccurrence = data[0];
                    if (this.client.apiVersion.has213Features() && firstOccurrence.start.offset > 1) {
                        // Check to see if contents around first occurrence are string delimiters
                        const contents = resource.getText(new vscode_1.Range(firstOccurrence.start.line - 1, firstOccurrence.start.offset - 1 - 1, firstOccurrence.end.line - 1, firstOccurrence.end.offset - 1 + 1));
                        const stringDelimiters = ['"', '\'', '`'];
                        if (contents && contents.length > 2 && stringDelimiters.indexOf(contents[0]) >= 0 && contents[0] === contents[contents.length - 1]) {
                            return [];
                        }
                    }
                    return data.map(item => new vscode_1.DocumentHighlight(convert_1.tsTextSpanToVsRange(item), item.isWriteAccess ? vscode_1.DocumentHighlightKind.Write : vscode_1.DocumentHighlightKind.Read));
                }
                return [];
            }
            catch (_a) {
                return [];
            }
        });
    }
}
exports.default = TypeScriptDocumentHighlightProvider;
//# sourceMappingURL=documentHighlightProvider.js.map