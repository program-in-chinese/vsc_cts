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
const PConst = require("../protocol.const");
const Previewer = require("./previewer");
const convert_1 = require("../utils/convert");
const nls = require("vscode-nls");
const codeAction_1 = require("../utils/codeAction");
const languageModeIds = require("../utils/languageModeIds");
let localize = nls.loadMessageBundle();
class MyCompletionItem extends vscode_1.CompletionItem {
    constructor(position, document, entry, enableDotCompletions, useCodeSnippetsOnMethodSuggest) {
        super(entry.name);
        this.position = position;
        this.document = document;
        this.useCodeSnippetsOnMethodSuggest = useCodeSnippetsOnMethodSuggest;
        this.source = entry.source;
        this.sortText = entry.sortText;
        this.kind = MyCompletionItem.convertKind(entry.kind);
        this.position = position;
        this.commitCharacters = MyCompletionItem.getCommitCharacters(enableDotCompletions, !useCodeSnippetsOnMethodSuggest, entry.kind);
        if (entry.是库内中文结果) {
            this.是中文 = true;
            this.是输入法结果 = false;
            this.是关键字结果 = true;
            this.filterText = entry.过滤文本;
            this.commitCharacters = entry.上屏字符;
            this.上屏字符 = entry.上屏字符;
        }
        if (entry.是输入法结果) {
            this.是中文 = true;
            this.是输入法结果 = true;
            this.是关键字结果 = false;
            this.上屏字符 = entry.上屏字符;
            this.commitCharacters = entry.上屏字符;
            this.insertText = entry.插入文本;
            this.filterText = entry.过滤文本;
            this.range = entry.范围;
        }
        else if (entry.replacementSpan) {
            let span = entry.replacementSpan;
            // The indexing for the range returned by the server uses 1-based indexing.
            // We convert to 0-based indexing.
            this.textEdit = vscode_1.TextEdit.replace(convert_1.tsTextSpanToVsRange(span), entry.name);
        }
        else {
            // Try getting longer, prefix based range for completions that span words
            const wordRange = document.getWordRangeAtPosition(position);
            const text = document.getText(new vscode_1.Range(position.line, Math.max(0, position.character - entry.name.length), position.line, position.character)).toLowerCase();
            const entryName = entry.name.toLowerCase();
            for (let i = entryName.length; i >= 0; --i) {
                if (text.endsWith(entryName.substr(0, i)) && (!wordRange || wordRange.start.character > position.character - i)) {
                    this.range = new vscode_1.Range(position.line, Math.max(0, position.character - i), position.line, position.character);
                    break;
                }
            }
        }
    }
    static convertKind(kind) {
        switch (kind) {
            case PConst.Kind.primitiveType:
            case PConst.Kind.keyword:
            case PConst.Kind.primitiveTypeEn:
            case PConst.Kind.keywordEn:
                return vscode_1.CompletionItemKind.Keyword;
            case PConst.Kind.const:
            case PConst.Kind.constEn:
                return vscode_1.CompletionItemKind.Constant;
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.alias:
            case PConst.Kind.letEn:
            case PConst.Kind.variableEn:
            case PConst.Kind.localVariableEn:
            case PConst.Kind.aliasEn:
                return vscode_1.CompletionItemKind.Variable;
            case PConst.Kind.memberVariable:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
            case PConst.Kind.memberVariableEn:
            case PConst.Kind.memberGetAccessorEn:
            case PConst.Kind.memberSetAccessorEn:
                return vscode_1.CompletionItemKind.Field;
            case PConst.Kind.function:
            case PConst.Kind.functionEn:
                return vscode_1.CompletionItemKind.Function;
            case PConst.Kind.memberFunction:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
            case PConst.Kind.memberFunctionEn:
            case PConst.Kind.constructSignatureEn:
            case PConst.Kind.callSignatureEn:
            case PConst.Kind.indexSignatureEn:
                return vscode_1.CompletionItemKind.Method;
            case PConst.Kind.enum:
            case PConst.Kind.enumEn:
                return vscode_1.CompletionItemKind.Enum;
            case PConst.Kind.module:
            case PConst.Kind.moduleEn:
            case PConst.Kind.externalModuleName:
            case PConst.Kind.externalModuleNameEn:
                return vscode_1.CompletionItemKind.Module;
            case PConst.Kind.class:
            case PConst.Kind.type:
            case PConst.Kind.classEn:
            case PConst.Kind.typeEn:
                return vscode_1.CompletionItemKind.Class;
            case PConst.Kind.interface:
            case PConst.Kind.interfaceEn:
                return vscode_1.CompletionItemKind.Interface;
            case PConst.Kind.warning:
            case PConst.Kind.file:
            case PConst.Kind.script:
            case PConst.Kind.warningEn:
            case PConst.Kind.fileEn:
            case PConst.Kind.scriptEn:
                return vscode_1.CompletionItemKind.File;
            case PConst.Kind.directory:
            case PConst.Kind.directoryEn:
                return vscode_1.CompletionItemKind.Folder;
        }
        return vscode_1.CompletionItemKind.Property;
    }
    static getCommitCharacters(enableDotCompletions, enableCallCompletions, kind) {
        switch (kind) {
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
            case PConst.Kind.enum:
            case PConst.Kind.interface:
            case PConst.Kind.memberGetAccessorEn:
            case PConst.Kind.memberSetAccessorEn:
            case PConst.Kind.constructSignatureEn:
            case PConst.Kind.callSignatureEn:
            case PConst.Kind.indexSignatureEn:
            case PConst.Kind.enumEn:
            case PConst.Kind.interfaceEn:
                return enableDotCompletions ? ['.'] : undefined;
            case PConst.Kind.module:
            case PConst.Kind.alias:
            case PConst.Kind.const:
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.memberVariable:
            case PConst.Kind.class:
            case PConst.Kind.function:
            case PConst.Kind.memberFunction:
            case PConst.Kind.moduleEn:
            case PConst.Kind.aliasEn:
            case PConst.Kind.constEn:
            case PConst.Kind.letEn:
            case PConst.Kind.variableEn:
            case PConst.Kind.localVariableEn:
            case PConst.Kind.memberVariableEn:
            case PConst.Kind.classEn:
            case PConst.Kind.functionEn:
            case PConst.Kind.memberFunctionEn:
                return enableDotCompletions ? (enableCallCompletions ? ['.', '('] : ['.']) : undefined;
        }
        return undefined;
    }
}
class ApplyCompletionCodeActionCommand {
    constructor(client) {
        this.client = client;
        this.id = ApplyCompletionCodeActionCommand.ID;
    }
    execute(file, codeActions) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const action of codeActions) {
                if (!(yield codeAction_1.applyCodeAction(this.client, action, file))) {
                    return false;
                }
            }
            return true;
        });
    }
}
ApplyCompletionCodeActionCommand.ID = '_ctsscript.applyCompletionCodeAction';
var Configuration;
(function (Configuration) {
    Configuration.useCodeSnippetsOnMethodSuggest = 'useCodeSnippetsOnMethodSuggest';
    Configuration.nameSuggestions = 'nameSuggestions';
    Configuration.quickSuggestionsForPaths = 'quickSuggestionsForPaths';
    Configuration.autoImportSuggestions = 'autoImportSuggestions.enabled';
})(Configuration || (Configuration = {}));
class TypeScriptCompletionItemProvider {
    constructor(client, typingsStatus, commandManager) {
        this.client = client;
        this.typingsStatus = typingsStatus;
        this.输入匹配 = /(([\u4E00-\u9FA5A-Za-z_\$]*?)|([\u4E00-\u9FA5A-Za-z_\$]+?[\u4E00-\u9FA5A-Za-z0-9_\$]*?))(([a-z]+?[\+\-]*)|([a-z]+?[']*?[a-z]+?[\+\-]*?))$/;
        commandManager.register(new ApplyCompletionCodeActionCommand(this.client));
    }
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.typingsStatus.isAcquiringTypings) {
                return Promise.reject({
                    label: localize({ key: 'acquiringTypingsLabel', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings...'),
                    detail: localize({ key: 'acquiringTypingsDetail', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings definitions for IntelliSense.')
                });
            }
            const file = this.client.normalizePath(document.uri);
            if (!file) {
                return [];
            }
            const config = this.getConfiguration(document.uri);
            if (context.triggerCharacter === '"' || context.triggerCharacter === '\'') {
                if (!config.quickSuggestionsForPaths) {
                    return [];
                }
                // make sure we are in something that looks like the start of an import
                const line = document.lineAt(position.line).text.slice(0, position.character);
                if (!line.match(/\b(from|来自|导入|import)\s*["']$/) && !line.match(/\b(import|导入|需要|require)\(['"]$/)) {
                    return [];
                }
            }
            if (context.triggerCharacter === '/') {
                if (!config.quickSuggestionsForPaths) {
                    return [];
                }
                // make sure we are in something that looks like an import path
                const line = document.lineAt(position.line).text.slice(0, position.character);
                if (!line.match(/\b(from|来自|导入|import)\s*["'][^'"]*$/) && !line.match(/\b(import|导入|需要|require)\(['"][^'"]*$/)) {
                    return [];
                }
            }
            if (context.triggerCharacter === '@') {
                // make sure we are in something that looks like the start of a jsdoc comment
                const line = document.lineAt(position.line).text.slice(0, position.character);
                if (!line.match(/^\s*\*[ ]?@/) && !line.match(/\/\*\*+[ ]?@/)) {
                    return [];
                }
            }
            try {
                const args = Object.assign({}, convert_1.vsPositionToTsFileLocation(file, position), { includeExternalModuleExports: config.autoImportSuggestions });
                const msg = yield this.client.execute('completions', args, token);
                // This info has to come from the tsserver. See https://github.com/Microsoft/TypeScript/issues/2831
                // let isMemberCompletion = false;
                // let requestColumn = position.character;
                // if (wordAtPosition) {
                // 	requestColumn = wordAtPosition.startColumn;
                // }
                // if (requestColumn > 0) {
                // 	let value = model.getValueInRange({
                // 		startLineNumber: position.line,
                // 		startColumn: requestColumn - 1,
                // 		endLineNumber: position.line,
                // 		endColumn: requestColumn
                // 	});
                // 	isMemberCompletion = value === '.';
                // }
                let completionItems = [];
                const body = msg.body;
                if (body) {
                    // Only enable dot completions in TS files for now
                    let enableDotCompletions = document && (document.languageId === languageModeIds.typescript || document.languageId === languageModeIds.ctsscript || document.languageId === languageModeIds.typescriptreact || document.languageId === languageModeIds.ctsscriptreact);
                    // TODO: Workaround for https://github.com/Microsoft/TypeScript/issues/13456
                    // Only enable dot completions when previous character is an identifier.
                    // Prevents incorrectly completing while typing spread operators.
                    if (position.character > 1) {
                        const preText = document.getText(new vscode_1.Range(position.line, 0, position.line, position.character - 1));
                        enableDotCompletions = preText.match(/[a-z_$\)\]\}]\s*$/ig) !== null;
                    }
                    let 中文名组 = [];
                    for (const element of body) {
                        if (element.kind === PConst.Kind.warning && !config.nameSuggestions) {
                            continue;
                        }
                        if (!config.autoImportSuggestions && element.hasAction) {
                            continue;
                        }
                        if (this.是中文条目(element)) {
                            中文名组.push(element.name);
                            element.是库内中文结果 = true;
                            element.上屏字符 = [" "];
                        }
                        let item = new MyCompletionItem(position, document, element, enableDotCompletions, config.useCodeSnippetsOnMethodSuggest);
                        completionItems.push(item);
                    }
                    if (中文名组 && 中文名组.length) {
                        let 拼音对象 = yield vscode_1.commands.executeCommand("vsc.取汉字拼音", 中文名组);
                        completionItems.forEach(v => {
                            if (v.是关键字结果) {
                                let 拼音 = 拼音对象[v.label];
                                v.filterText = 拼音;
                            }
                        });
                    }
                }
                if (this.是拼音启动(context.triggerCharacter)) {
                    const line = document.lineAt(position.line).text.slice(0, position.character);
                    let { 开启中文提示, 项目集, 已经输入的, 输入的拼音, 替换起始位置, 替换结束位置 } = this.计算启动条件(document, position, context.triggerCharacter, completionItems);
                    if (开启中文提示) {
                        const 库内词组 = yield vscode_1.commands.executeCommand("vsc.拼音输入法", 输入的拼音.toLowerCase());
                        if (库内词组 && 库内词组.length) {
                            let 位数 = 库内词组.length.toString().length;
                            for (let i = 0; i < 库内词组.length; i++) {
                                const 词 = 库内词组[i];
                                const 条目 = {
                                    name: `${i + 1}:${词.文本}`,
                                    插入文本: `${已经输入的}${词.文本}`,
                                    是输入法结果: true,
                                    过滤文本: `${已经输入的}${词.拼音}${词.剩余输入 ? 词.剩余输入 : ""}${i + 1}`,
                                    上屏字符: [" "],
                                    范围: new vscode_1.Range(new vscode_1.Position(position.line, 替换起始位置), new vscode_1.Position(position.line, 替换结束位置)),
                                    kindModifiers: "",
                                    sortText: `0`,
                                    kind: "文件"
                                };
                                const 项目 = new MyCompletionItem(position, document, 条目, false, config.useCodeSnippetsOnMethodSuggest);
                                completionItems.push(项目);
                            }
                        }
                    }
                    else {
                        completionItems = 项目集;
                    }
                }
                return completionItems;
            }
            catch (_a) {
                return [];
            }
        });
    }
    计算启动条件(文档, 位置, 启动字符, 已有项目) {
        const line = 文档.lineAt(位置.line).text.slice(0, 位置.character);
        let { 输入的拼音, 已经输入的 } = this.分割输入(line);
        if (输入的拼音) {
            let 替换起始位置 = 位置.character - 输入的拼音.length - (已经输入的 ? 已经输入的.length : 0);
            let 替换结束位置 = 位置.character;
            return { 开启中文提示: true, 项目集: null, 已经输入的, 输入的拼音, 替换起始位置, 替换结束位置 };
        }
        return { 开启中文提示: false, 项目集: 已有项目, 已经输入的: null, 输入的拼音: null, 替换起始位置: null, 替换结束位置: null };
    }
    分割输入(文本) {
        let 匹配 = 文本.match(this.输入匹配);
        if (匹配) {
            let 输入的拼音 = 匹配[4];
            let 已经输入的 = 匹配[1];
            return { 输入的拼音, 已经输入的 };
        }
    }
    是拼音启动(启动字符) {
        switch (启动字符) {
            case "a":
            case "o":
            case "e":
            case "i":
            case "u":
            case "v":
            case "b":
            case "p":
            case "m":
            case "f":
            case "d":
            case "t":
            case "n":
            case "l":
            case "g":
            case "k":
            case "h":
            case "j":
            case "q":
            case "x":
            case "z":
            case "c":
            case "s":
            case "r":
            case "y":
            case "w":
            case "+":
            case "-":
                return true;
            default:
                false;
        }
    }
    是中文条目(项目) {
        for (let i = 0; i < 项目.name.length; i++) {
            let ch = 项目.name.charCodeAt(i);
            if (ch >= 0x4E00 && ch <= 0x9FA5) {
                return true;
            }
        }
        return false;
    }
    resolveCompletionItem(item, token) {
        if (!(item instanceof MyCompletionItem)) {
            return null;
        }
        if (item.是中文) {
            if (item.是输入法结果) {
                item.command = {
                    title: "输入法上屏",
                    command: "ctsscript.输入法上屏命令",
                    arguments: [undefined]
                };
                return item;
            }
            else {
                item.command = {
                    title: "输入法上屏",
                    command: "ctsscript.输入法上屏命令",
                    arguments: [item.label]
                };
            }
        }
        const filepath = this.client.normalizePath(item.document.uri);
        if (!filepath) {
            return null;
        }
        const args = Object.assign({}, convert_1.vsPositionToTsFileLocation(filepath, item.position), { entryNames: [
                item.source ? { name: item.label, source: item.source } : item.label
            ] });
        return this.client.execute('completionEntryDetails', args, token).then((response) => {
            const details = response.body;
            if (!details || !details.length || !details[0]) {
                return item;
            }
            const detail = details[0];
            item.detail = Previewer.不翻译部件(detail.displayParts);
            const documentation = new vscode_1.MarkdownString();
            if (item.source) {
                let importPath = `'${item.source}'`;
                // Try to resolve the real import name that will be added
                if (detail.codeActions && detail.codeActions[0]) {
                    const action = detail.codeActions[0];
                    if (action.changes[0] && action.changes[0].textChanges[0]) {
                        const textChange = action.changes[0].textChanges[0];
                        const matchedImport = textChange.newText.match(/(['"])(.+?)\1/);
                        if (matchedImport) {
                            importPath = matchedImport[0];
                            item.detail += ` — from ${matchedImport[0]}`;
                        }
                    }
                }
                documentation.appendMarkdown(localize('autoImportLabel', 'Auto import from {0}', importPath));
                documentation.appendMarkdown('\n\n');
            }
            Previewer.addmarkdownDocumentation(documentation, detail.documentation, detail.tags);
            item.documentation = documentation;
            if (detail.codeActions && detail.codeActions.length) {
                item.command = {
                    title: '',
                    command: ApplyCompletionCodeActionCommand.ID,
                    arguments: [filepath, detail.codeActions]
                };
            }
            if (detail && item.useCodeSnippetsOnMethodSuggest && (item.kind === vscode_1.CompletionItemKind.Function || item.kind === vscode_1.CompletionItemKind.Method)) {
                return this.isValidFunctionCompletionContext(filepath, item.position).then(shouldCompleteFunction => {
                    if (shouldCompleteFunction) {
                        item.insertText = this.snippetForFunctionCall(detail);
                    }
                    return item;
                });
            }
            return item;
        }, () => {
            return item;
        });
    }
    isValidFunctionCompletionContext(filepath, position) {
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        // Workaround for https://github.com/Microsoft/TypeScript/issues/12677
        // Don't complete function calls inside of destructive assigments or imports
        return this.client.execute('quickinfo', args).then(infoResponse => {
            const info = infoResponse.body;
            switch (info && info.kind) {
                case 'var':
                case 'let':
                case 'const':
                case 'alias':
                    return false;
                default:
                    return true;
            }
        }, () => {
            return true;
        });
    }
    snippetForFunctionCall(detail) {
        const suggestionArgumentNames = [];
        let parenCount = 0;
        for (let i = 0; i < detail.displayParts.length; ++i) {
            const part = detail.displayParts[i];
            // Only take top level paren names
            if (part.kind === 'parameterName' && parenCount === 1) {
                suggestionArgumentNames.push(`\${${i + 1}:${part.text}}`);
            }
            else if (part.kind === 'punctuation') {
                if (part.text === '(') {
                    ++parenCount;
                }
                else if (part.text === ')') {
                    --parenCount;
                }
            }
        }
        let codeSnippet = detail.name;
        if (suggestionArgumentNames.length > 0) {
            codeSnippet += '(' + suggestionArgumentNames.join(', ') + ')$0';
        }
        else {
            codeSnippet += '()';
        }
        return new vscode_1.SnippetString(codeSnippet);
    }
    getConfiguration(resource) {
        // Use shared setting for js and ts
        const typeScriptConfig = vscode_1.workspace.getConfiguration('ctsscript', resource);
        return {
            useCodeSnippetsOnMethodSuggest: typeScriptConfig.get(Configuration.useCodeSnippetsOnMethodSuggest, false),
            quickSuggestionsForPaths: typeScriptConfig.get(Configuration.quickSuggestionsForPaths, true),
            autoImportSuggestions: typeScriptConfig.get(Configuration.autoImportSuggestions, true),
            nameSuggestions: vscode_1.workspace.getConfiguration('javascript', resource).get(Configuration.nameSuggestions, true)
        };
    }
}
exports.default = TypeScriptCompletionItemProvider;
//# sourceMappingURL=completionItemProvider.js.map