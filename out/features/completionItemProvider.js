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
        if (entry.replacementSpan) {
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
                return vscode_1.CompletionItemKind.Keyword;
            case PConst.Kind.const:
                return vscode_1.CompletionItemKind.Constant;
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.alias:
                return vscode_1.CompletionItemKind.Variable;
            case PConst.Kind.memberVariable:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
                return vscode_1.CompletionItemKind.Field;
            case PConst.Kind.function:
                return vscode_1.CompletionItemKind.Function;
            case PConst.Kind.memberFunction:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
                return vscode_1.CompletionItemKind.Method;
            case PConst.Kind.enum:
                return vscode_1.CompletionItemKind.Enum;
            case PConst.Kind.module:
            case PConst.Kind.externalModuleName:
                return vscode_1.CompletionItemKind.Module;
            case PConst.Kind.class:
            case PConst.Kind.type:
                return vscode_1.CompletionItemKind.Class;
            case PConst.Kind.interface:
                return vscode_1.CompletionItemKind.Interface;
            case PConst.Kind.warning:
            case PConst.Kind.file:
            case PConst.Kind.script:
                return vscode_1.CompletionItemKind.File;
            case PConst.Kind.directory:
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
                if (!line.match(/\b(from|import)\s*["']$/) && !line.match(/\b(import|require)\(['"]$/)) {
                    return [];
                }
            }
            if (context.triggerCharacter === '/') {
                if (!config.quickSuggestionsForPaths) {
                    return [];
                }
                // make sure we are in something that looks like an import path
                const line = document.lineAt(position.line).text.slice(0, position.character);
                if (!line.match(/\b(from|import)\s*["'][^'"]*$/) && !line.match(/\b(import|require)\(['"][^'"]*$/)) {
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
                const completionItems = [];
                const body = msg.body;
                if (body) {
                    // Only enable dot completions in TS files for now
                    let enableDotCompletions = document && (document.languageId === languageModeIds.typescript || document.languageId === languageModeIds.typescriptreact);
                    // TODO: Workaround for https://github.com/Microsoft/TypeScript/issues/13456
                    // Only enable dot completions when previous character is an identifier.
                    // Prevents incorrectly completing while typing spread operators.
                    if (position.character > 1) {
                        const preText = document.getText(new vscode_1.Range(position.line, 0, position.line, position.character - 1));
                        enableDotCompletions = preText.match(/[a-z_$\)\]\}]\s*$/ig) !== null;
                    }
                    for (const element of body) {
                        if (element.kind === PConst.Kind.warning && !config.nameSuggestions) {
                            continue;
                        }
                        if (!config.autoImportSuggestions && element.hasAction) {
                            continue;
                        }
                        const item = new MyCompletionItem(position, document, element, enableDotCompletions, config.useCodeSnippetsOnMethodSuggest);
                        completionItems.push(item);
                    }
                }
                return completionItems;
            }
            catch (_a) {
                return [];
            }
        });
    }
    resolveCompletionItem(item, token) {
        if (!(item instanceof MyCompletionItem)) {
            return null;
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
            item.detail = Previewer.plain(detail.displayParts);
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
