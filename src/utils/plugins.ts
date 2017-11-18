/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { extensions } from 'vscode';


export interface TypeScriptServerPlugin {
	path: string;
	name: string;
	languages: string[];
}

export function getContributedTypeScriptServerPlugins(): TypeScriptServerPlugin[] {
	const plugins: TypeScriptServerPlugin[] = [];
	for (const extension of extensions.all) {
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
