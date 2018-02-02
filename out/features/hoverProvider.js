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
const previewer_1 = require("./previewer");
const convert_1 = require("../utils/convert");
const _____1 = require("./\u4E2D\u6587\u63D2\u4EF6/\u7FFB\u8BD1\u6807\u8BC6\u7B26");
class TypeScriptHoverProvider {
    constructor(client) {
        this.client = client;
    }
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = this.client.normalizePath(document.uri);
            if (!filepath) {
                return undefined;
            }
            const args = convert_1.vsPositionToTsFileLocation(filepath, position);
            try {
                const response = yield this.client.execute('quickinfo', args, token);
                if (response && response.body) {
                    const data = response.body;
                    return new vscode_1.Hover(yield TypeScriptHoverProvider.getContents(data), convert_1.tsTextSpanToVsRange(data));
                }
            }
            catch (e) {
                // noop
            }
            return undefined;
        });
    }
    static getContents(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const parts = [];
            if (data.displayString) {
                parts.push({ language: 'ctsscript', value: data.displayString });
            }
            const tags = yield previewer_1.tagsMarkdownPreview(data.tags);
            parts.push((yield _____1.翻译注释(data.documentation)) + (tags ? '\n\n' + tags : ''));
            return parts;
        });
    }
}
exports.default = TypeScriptHoverProvider;
//# sourceMappingURL=hoverProvider.js.map