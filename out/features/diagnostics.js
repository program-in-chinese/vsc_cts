"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class DiagnosticsManager {
    constructor(language, client) {
        this.client = client;
        this._validate = true;
        this.syntaxDiagnostics = Object.create(null);
        this.semanticDiagnostics = Object.create(null);
        this.currentDiagnostics = vscode_1.languages.createDiagnosticCollection(language);
    }
    dispose() {
        this.currentDiagnostics.dispose();
    }
    reInitialize() {
        this.currentDiagnostics.clear();
        this.syntaxDiagnostics = Object.create(null);
        this.semanticDiagnostics = Object.create(null);
    }
    set validate(value) {
        if (this._validate === value) {
            return;
        }
        this._validate = value;
        if (!value) {
            this.currentDiagnostics.clear();
        }
    }
    syntaxDiagnosticsReceived(file, syntaxDiagnostics) {
        this.syntaxDiagnostics[this.key(file)] = syntaxDiagnostics;
        this.updateCurrentDiagnostics(file);
    }
    semanticDiagnosticsReceived(file, semanticDiagnostics) {
        this.semanticDiagnostics[this.key(file)] = semanticDiagnostics;
        this.updateCurrentDiagnostics(file);
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.currentDiagnostics.set(file, diagnostics);
    }
    delete(file) {
        this.currentDiagnostics.delete(this.client.asUrl(file));
    }
    key(file) {
        return file.toString(true);
    }
    updateCurrentDiagnostics(file) {
        if (!this._validate) {
            return;
        }
        const semanticDiagnostics = this.semanticDiagnostics[this.key(file)] || [];
        const syntaxDiagnostics = this.syntaxDiagnostics[this.key(file)] || [];
        this.currentDiagnostics.set(file, semanticDiagnostics.concat(syntaxDiagnostics));
    }
}
exports.default = DiagnosticsManager;
