"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function getContributedTypeScriptServerPlugins() {
    const plugins = [];
    for (const extension of vscode_1.extensions.all) {
        const pack = extension.packageJSON;
        if (pack.contributes && pack.id === "Htwx.ctsscript") {
            plugins.push({
                name: pack.name,
                path: extension.extensionPath,
                languages: Array.isArray(pack.contributes.languages) ? pack.contributes.languages : [],
            });
        }
    }
    return plugins;
}
exports.getContributedTypeScriptServerPlugins = getContributedTypeScriptServerPlugins;
//# sourceMappingURL=plugins.js.map