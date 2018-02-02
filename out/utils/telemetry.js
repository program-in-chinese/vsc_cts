"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
class TelemetryReporter {
    constructor(clientVersionDelegate) {
        this.clientVersionDelegate = clientVersionDelegate;
    }
    dispose() {
        if (this._reporter) {
            this._reporter.dispose();
            this._reporter = null;
        }
    }
    logTelemetry(eventName, properties) {
        if (this.reporter) {
            if (!properties) {
                properties = {};
            }
            properties['version'] = this.clientVersionDelegate();
            this.reporter.sendTelemetryEvent(eventName, properties);
        }
    }
    get reporter() {
        if (typeof this._reporter !== 'undefined') {
            return this._reporter;
        }
        if (this.packageInfo && this.packageInfo.aiKey) {
            this._reporter = new vscode_extension_telemetry_1.default(this.packageInfo.name, this.packageInfo.version, this.packageInfo.aiKey);
        }
        else {
            this._reporter = null;
        }
        return this._reporter;
    }
    get packageInfo() {
        if (this._packageInfo !== undefined) {
            return this._packageInfo;
        }
        const packagePath = path.join(__dirname, '..', '..', 'package.json');
        const extensionPackage = require(packagePath);
        if (extensionPackage) {
            this._packageInfo = {
                name: extensionPackage.name,
                version: extensionPackage.version,
                aiKey: extensionPackage.aiKey
            };
        }
        else {
            this._packageInfo = null;
        }
        return this._packageInfo;
    }
}
exports.default = TelemetryReporter;
//# sourceMappingURL=telemetry.js.map