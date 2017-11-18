"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_nls_1 = require("vscode-nls");
const path_1 = require("path");
const tsconfig_1 = require("./tsconfig");
const languageModeIds = require("../utils/languageModeIds");
const localize = vscode_nls_1.loadMessageBundle();
const selector = [languageModeIds.javascript, languageModeIds.javascriptreact];
const fileLimit = 500;
class ExcludeHintItem {
    constructor(telemetryReporter) {
        this.telemetryReporter = telemetryReporter;
        this._item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
        this._item.command = 'js.projectStatus.command';
    }
    getCurrentHint() {
        return this._currentHint;
    }
    hide() {
        this._item.hide();
    }
    show(largeRoots) {
        this._currentHint = {
            message: largeRoots
                ? localize('hintExclude', "To enable project-wide JavaScript/TypeScript language features, exclude folders with many files, like: {0}", largeRoots)
                : localize('hintExclude.generic', "To enable project-wide JavaScript/TypeScript language features, exclude large folders with source files that you do not work on.")
        };
        this._item.tooltip = this._currentHint.message;
        this._item.text = localize('large.label', "Configure Excludes");
        this._item.tooltip = localize('hintExclude.tooltip', "To enable project-wide JavaScript/TypeScript language features, exclude large folders with source files that you do not work on.");
        this._item.color = '#A5DF3B';
        this._item.show();
        /* __GDPR__
            "js.hintProjectExcludes" : {}
        */
        this.telemetryReporter.logTelemetry('js.hintProjectExcludes');
    }
}
function createLargeProjectMonitorForProject(item, client, isOpen, memento) {
    const toDispose = [];
    const projectHinted = Object.create(null);
    const projectHintIgnoreList = memento.get('projectHintIgnoreList', []);
    for (let path of projectHintIgnoreList) {
        if (path === null) {
            path = 'undefined';
        }
        projectHinted[path] = true;
    }
    function onEditor(editor) {
        if (!editor
            || !vscode.languages.match(selector, editor.document)
            || !client.normalizePath(editor.document.uri)) {
            item.hide();
            return;
        }
        const file = client.normalizePath(editor.document.uri);
        if (!file) {
            return;
        }
        isOpen(file).then(value => {
            if (!value) {
                return;
            }
            return client.execute('projectInfo', { file, needFileNameList: true }).then(res => {
                if (!res.body) {
                    return;
                }
                let { configFileName, fileNames } = res.body;
                if (projectHinted[configFileName] === true || !fileNames) {
                    return;
                }
                if (fileNames.length > fileLimit || res.body.languageServiceDisabled) {
                    let largeRoots = computeLargeRoots(configFileName, fileNames).map(f => `'/${f}/'`).join(', ');
                    item.show(largeRoots);
                    projectHinted[configFileName] = true;
                }
                else {
                    item.hide();
                }
            });
        }).catch(err => {
            client.logger.warn(err);
        });
    }
    toDispose.push(vscode.workspace.onDidChangeTextDocument(e => {
        delete projectHinted[e.document.fileName];
    }));
    toDispose.push(vscode.window.onDidChangeActiveTextEditor(onEditor));
    onEditor(vscode.window.activeTextEditor);
    return toDispose;
}
function createLargeProjectMonitorFromTypeScript(item, client) {
    return client.onProjectLanguageServiceStateChanged(body => {
        if (body.languageServiceEnabled) {
            item.hide();
        }
        else {
            item.show();
            const configFileName = body.projectName;
            if (configFileName) {
                item.configFileName = configFileName;
                vscode.window.showWarningMessage(item.getCurrentHint().message, {
                    title: localize('large.label', "Configure Excludes"),
                    index: 0
                }).then(selected => {
                    if (selected && selected.index === 0) {
                        onConfigureExcludesSelected(client, configFileName);
                    }
                });
            }
        }
    });
}
function onConfigureExcludesSelected(client, configFileName) {
    if (!tsconfig_1.isImplicitProjectConfigFile(configFileName)) {
        vscode.workspace.openTextDocument(configFileName)
            .then(vscode.window.showTextDocument);
    }
    else {
        const root = client.getWorkspaceRootForResource(vscode.Uri.file(configFileName));
        if (root) {
            tsconfig_1.openOrCreateConfigFile(configFileName.match(/tsconfig\.?.*\.json/) !== null, root, client.configuration);
        }
    }
}
function create(client, telemetryReporter, isOpen, memento) {
    const toDispose = [];
    const item = new ExcludeHintItem(telemetryReporter);
    toDispose.push(vscode.commands.registerCommand('js.projectStatus.command', () => {
        if (item.configFileName) {
            onConfigureExcludesSelected(client, item.configFileName);
        }
        let { message } = item.getCurrentHint();
        return vscode.window.showInformationMessage(message);
    }));
    if (client.apiVersion.has213Features()) {
        toDispose.push(createLargeProjectMonitorFromTypeScript(item, client));
    }
    else {
        toDispose.push(...createLargeProjectMonitorForProject(item, client, isOpen, memento));
    }
    return vscode.Disposable.from(...toDispose);
}
exports.create = create;
function computeLargeRoots(configFileName, fileNames) {
    let roots = Object.create(null);
    let dir = path_1.dirname(configFileName);
    // console.log(dir, fileNames);
    for (let fileName of fileNames) {
        if (fileName.indexOf(dir) === 0) {
            let first = fileName.substring(dir.length + 1);
            first = first.substring(0, first.indexOf('/'));
            if (first) {
                roots[first] = (roots[first] || 0) + 1;
            }
        }
    }
    let data = [];
    for (let key in roots) {
        data.push({ root: key, count: roots[key] });
    }
    data
        .sort((a, b) => b.count - a.count)
        .filter(s => s.root === 'src' || s.root === '源码' || s.root === 'test' || s.root === '测试' || s.root === 'tests' || s.root === '测试集');
    let result = [];
    let sum = 0;
    for (let e of data) {
        sum += e.count;
        result.push(e.root);
        if (fileNames.length - sum < fileLimit) {
            break;
        }
    }
    return result;
}
