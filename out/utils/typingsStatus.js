"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_nls_1 = require("vscode-nls");
const localize = vscode_nls_1.loadMessageBundle();
const typingsInstallTimeout = 30 * 1000;
class TypingsStatus extends vscode_1.Disposable {
    constructor(client) {
        super(() => this.dispose());
        this._acquiringTypings = Object.create({});
        this._subscriptions = [];
        this._client = client;
        this._subscriptions.push(this._client.onDidBeginInstallTypings(event => this.onBeginInstallTypings(event.eventId)));
        this._subscriptions.push(this._client.onDidEndInstallTypings(event => this.onEndInstallTypings(event.eventId)));
    }
    dispose() {
        this._subscriptions.forEach(x => x.dispose());
        for (const eventId of Object.keys(this._acquiringTypings)) {
            clearTimeout(this._acquiringTypings[eventId]);
        }
    }
    get isAcquiringTypings() {
        return Object.keys(this._acquiringTypings).length > 0;
    }
    onBeginInstallTypings(eventId) {
        if (this._acquiringTypings[eventId]) {
            return;
        }
        this._acquiringTypings[eventId] = setTimeout(() => {
            this.onEndInstallTypings(eventId);
        }, typingsInstallTimeout);
    }
    onEndInstallTypings(eventId) {
        const timer = this._acquiringTypings[eventId];
        if (timer) {
            clearTimeout(timer);
        }
        delete this._acquiringTypings[eventId];
    }
}
exports.default = TypingsStatus;
class AtaProgressReporter {
    constructor(client) {
        this._promises = new Map();
        this._disposable = vscode_1.Disposable.from(client.onDidBeginInstallTypings(e => this._onBegin(e.eventId)), client.onDidEndInstallTypings(e => this._onEndOrTimeout(e.eventId)), client.onTypesInstallerInitializationFailed(_ => this.onTypesInstallerInitializationFailed()));
    }
    dispose() {
        this._disposable.dispose();
        this._promises.forEach(value => value());
    }
    _onBegin(eventId) {
        const handle = setTimeout(() => this._onEndOrTimeout(eventId), typingsInstallTimeout);
        const promise = new Promise(resolve => {
            this._promises.set(eventId, () => {
                clearTimeout(handle);
                resolve();
            });
        });
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Window,
            title: localize('installingPackages', "Fetching data for better TypeScript IntelliSense")
        }, () => promise);
    }
    _onEndOrTimeout(eventId) {
        const resolve = this._promises.get(eventId);
        if (resolve) {
            this._promises.delete(eventId);
            resolve();
        }
    }
    onTypesInstallerInitializationFailed() {
        if (vscode_1.workspace.getConfiguration('ctsscript').get('check.npmIsInstalled', true)) {
            vscode_1.window.showWarningMessage(localize('typesInstallerInitializationFailed.title', "Could not install typings files for JavaScript language features. Please ensure that NPM is installed or configure 'typescript.npm' in your user settings"), {
                title: localize('typesInstallerInitializationFailed.moreInformation', "More Information"),
                id: 1
            }, {
                title: localize('typesInstallerInitializationFailed.doNotCheckAgain', "Don't Check Again"),
                id: 2
            }, {
                title: localize('typesInstallerInitializationFailed.close', 'Close'),
                id: 3,
                isCloseAffordance: true
            }).then(selected => {
                if (!selected || selected.id === 3) {
                    return;
                }
                switch (selected.id) {
                    case 1:
                        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=847635'));
                        break;
                    case 2:
                        const tsConfig = vscode_1.workspace.getConfiguration('ctsescript');
                        tsConfig.update('check.npmIsInstalled', false, true);
                        break;
                }
            });
        }
    }
}
exports.AtaProgressReporter = AtaProgressReporter;
//# sourceMappingURL=typingsStatus.js.map