/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const convert_1 = require("../utils/convert");
class ApplyRefactoringCommand {
    constructor(client, formattingOptionsManager) {
        this.client = client;
        this.formattingOptionsManager = formattingOptionsManager;
        this.id = ApplyRefactoringCommand.ID;
    }
    execute(document, file, refactor, action, range) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.formattingOptionsManager.ensureFormatOptionsForDocument(document, undefined);
            const args = Object.assign({}, convert_1.vsRangeToTsFileRange(file, range), { refactor,
                action });
            const response = yield this.client.execute('getEditsForRefactor', args);
            if (!response || !response.body || !response.body.edits.length) {
                return false;
            }
            const edit = this.toWorkspaceEdit(response.body.edits);
            if (!(yield vscode.workspace.applyEdit(edit))) {
                return false;
            }
            const renameLocation = response.body.renameLocation;
            if (renameLocation) {
                if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath === file) {
                    const pos = convert_1.tsLocationToVsPosition(renameLocation);
                    vscode.window.activeTextEditor.selection = new vscode.Selection(pos, pos);
                    yield vscode.commands.executeCommand('editor.action.rename');
                }
            }
            return true;
        });
    }
    toWorkspaceEdit(edits) {
        const workspaceEdit = new vscode.WorkspaceEdit();
        for (const edit of edits) {
            for (const textChange of edit.textChanges) {
                workspaceEdit.replace(this.client.asUrl(edit.fileName), convert_1.tsTextSpanToVsRange(textChange), textChange.newText);
            }
        }
        return workspaceEdit;
    }
}
ApplyRefactoringCommand.ID = '_ctsscript.applyRefactoring';
class SelectRefactorCommand {
    constructor(doRefactoring) {
        this.doRefactoring = doRefactoring;
        this.id = SelectRefactorCommand.ID;
    }
    execute(document, file, info, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const selected = yield vscode.window.showQuickPick(info.actions.map((action) => ({
                label: action.name,
                description: action.description
            })));
            if (!selected) {
                return false;
            }
            return this.doRefactoring.execute(document, file, info.name, selected.label, range);
        });
    }
}
SelectRefactorCommand.ID = '_ctsscript.selectRefactoring';
class TypeScriptRefactorProvider {
    constructor(client, formattingOptionsManager, commandManager) {
        this.client = client;
        const doRefactoringCommand = commandManager.register(new ApplyRefactoringCommand(this.client, formattingOptionsManager));
        commandManager.register(new SelectRefactorCommand(doRefactoringCommand));
    }
    provideCodeActions() {
        return __awaiter(this, void 0, void 0, function* () {
            // Uses provideCodeActions2 instead
            return [];
        });
    }
    provideCodeActions2(document, _range, _context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.apiVersion.has240Features()) {
                return [];
            }
            if (!vscode.window.activeTextEditor) {
                return [];
            }
            const editor = vscode.window.activeTextEditor;
            const file = this.client.normalizePath(document.uri);
            if (!file || editor.document.uri.fsPath !== document.uri.fsPath) {
                return [];
            }
            const range = editor.selection;
            const args = convert_1.vsRangeToTsFileRange(file, range);
            try {
                const response = yield this.client.execute('getApplicableRefactors', args, token);
                if (!response || !response.body) {
                    return [];
                }
                const actions = [];
                for (const info of response.body) {
                    if (info.inlineable === false) {
                        actions.push({
                            title: info.description,
                            command: {
                                title: info.description,
                                command: SelectRefactorCommand.ID,
                                arguments: [document, file, info, range]
                            }
                        });
                    }
                    else {
                        for (const action of info.actions) {
                            actions.push({
                                title: action.description,
                                command: {
                                    title: action.description,
                                    command: ApplyRefactoringCommand.ID,
                                    arguments: [document, file, info.name, action.name, range]
                                }
                            });
                        }
                    }
                }
                return actions;
            }
            catch (_a) {
                return [];
            }
        });
    }
}
exports.default = TypeScriptRefactorProvider;
