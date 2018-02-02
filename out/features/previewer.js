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
const _____1 = require("./\u4E2D\u6587\u63D2\u4EF6/\u7FFB\u8BD1\u6807\u8BC6\u7B26");
function plain(parts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!parts) {
            return '';
        }
        return parts.map((part) => __awaiter(this, void 0, void 0, function* () { return yield _____1.翻译注释(part.text); })).join('');
    });
}
exports.plain = plain;
function 不翻译部件(parts) {
    if (!parts) {
        return '';
    }
    return parts.map(part => part.text).join('');
}
exports.不翻译部件 = 不翻译部件;
function tagsMarkdownPreview(tags) {
    return __awaiter(this, void 0, void 0, function* () {
        let 返回的预设 = (tags || []).map((tag) => __awaiter(this, void 0, void 0, function* () {
            let 标签名 = yield _____1.翻译注释(tag.name);
            const 标签 = `*@${标签名}*`;
            if (!tag.text) {
                return 标签;
            }
            let JsDoc文档 = tag.text.match(/\r\n|\n/g) ? '  \n' + (yield _____1.翻译注释(tag.text)) : ` — ` + (yield _____1.翻译注释(tag.text));
            return 标签 + JsDoc文档;
        }));
        let 返回值 = [];
        for (var i = 0; i < 返回的预设.length; i++) {
            let 值 = yield 返回的预设[i];
            返回值.push(值);
        }
        return 返回值.join('  \n\n');
    });
}
exports.tagsMarkdownPreview = tagsMarkdownPreview;
function 不翻译标签(tags) {
    let 返回的预设 = (tags || []).map(tag => {
        let 标签名 = tag.name;
        const 标签 = `*@${标签名}*`;
        if (!tag.text) {
            return 标签;
        }
        let JsDoc文档 = tag.text.match(/\r\n|\n/g) ? '  \n' + tag.text : ` — ` + tag.text;
        return 标签 + JsDoc文档;
    });
    let 返回值 = [];
    for (var i = 0; i < 返回的预设.length; i++) {
        let 值 = 返回的预设[i];
        返回值.push(值);
    }
    return 返回值.join('  \n\n');
}
exports.不翻译标签 = 不翻译标签;
function markdownDocumentation(documentation, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        const out = new vscode_1.MarkdownString();
        out.appendMarkdown(yield plain(documentation));
        const tagsPreview = yield tagsMarkdownPreview(tags);
        if (tagsPreview) {
            out.appendMarkdown('\n\n' + tagsPreview);
        }
        return out;
    });
}
exports.markdownDocumentation = markdownDocumentation;
function addmarkdownDocumentation(out, documentation, tags) {
    out.appendMarkdown(不翻译部件(documentation));
    const tagsPreview = 不翻译标签(tags);
    if (tagsPreview) {
        out.appendMarkdown('\n\n' + tagsPreview);
    }
    return out;
}
exports.addmarkdownDocumentation = addmarkdownDocumentation;
//# sourceMappingURL=previewer.js.map