/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HoverProvider, Hover, TextDocument, Position, CancellationToken } from 'vscode';

import * as Proto from '../protocol';
import { ITypeScriptServiceClient } from '../typescriptService';
import { tagsMarkdownPreview } from './previewer';
import { tsTextSpanToVsRange, vsPositionToTsFileLocation } from '../utils/convert';
import { 翻译注释 } from "./中文插件/翻译标识符"

export default class TypeScriptHoverProvider implements HoverProvider {

	public constructor(
		private client: ITypeScriptServiceClient) { }

	public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
		const filepath = this.client.normalizePath(document.uri);
		if (!filepath) {
			return undefined;
		}
		const args = vsPositionToTsFileLocation(filepath, position);
		try {
			const response = await this.client.execute('quickinfo', args, token);
			if (response && response.body) {
				const data = response.body;
				return new Hover(
					await TypeScriptHoverProvider.getContents(data),
					tsTextSpanToVsRange(data));
			}
		} catch (e) {
			// noop
		}
		return undefined;
	}

	private static async getContents(data: Proto.QuickInfoResponseBody) {
		const parts = [];

		if (data.displayString) {
			parts.push({ language: 'ctsscript', value: data.displayString });
		}

		const tags = await tagsMarkdownPreview(data.tags);
		parts.push(await 翻译注释(data.documentation) + (tags ? '\n\n' + tags : ''));
		return parts;
	}
}