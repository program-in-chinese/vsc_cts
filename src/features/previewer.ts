/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as Proto from '../protocol';
import { MarkdownString } from 'vscode';
import { 翻译注释 } from "./中文插件/翻译标识符"

export async function plain(parts: Proto.SymbolDisplayPart[]): Promise<string> {
	if (!parts) {
		return '';
	}
	return parts.map(async part => await 翻译注释(part.text)).join('');
}

export  function 不翻译部件(parts: Proto.SymbolDisplayPart[]): string {
	if (!parts) {
		return '';
	}
	return parts.map(part => part.text).join('');
}

export async function tagsMarkdownPreview(tags: Proto.JSDocTagInfo[]): Promise<string> {
	let 返回的预设 = (tags || []).map(async tag => {
		let 标签名 = await 翻译注释(tag.name)
		const 标签 = `*@${标签名}*`;
		if (!tag.text) {
			return 标签;
		}
		let JsDoc文档 = tag.text.match(/\r\n|\n/g) ? '  \n' + await 翻译注释(tag.text) : ` — ` + await 翻译注释(tag.text)
		return 标签 + JsDoc文档;
	})

	let 返回值: string[] = []
	for (var i = 0; i < 返回的预设.length; i++) {
		let 值 = await 返回的预设[i]
		返回值.push(值)
	}
	return 返回值.join('  \n\n')
}

export  function 不翻译标签(tags: Proto.JSDocTagInfo[]): string {
	let 返回的预设 = (tags || []).map( tag => {
		let 标签名 =  tag.name
		const 标签 = `*@${标签名}*`;
		if (!tag.text) {
			return 标签;
		}
		let JsDoc文档 = tag.text.match(/\r\n|\n/g) ? '  \n' +  tag.text : ` — ` +  tag.text
		return 标签 + JsDoc文档;
	})

	let 返回值: string[] = []
	for (var i = 0; i < 返回的预设.length; i++) {
		let 值 =  返回的预设[i]
		返回值.push(值)
	}
	return 返回值.join('  \n\n')
}

export async function markdownDocumentation(
	documentation: Proto.SymbolDisplayPart[],
	tags: Proto.JSDocTagInfo[]
): Promise<MarkdownString> {
	const out = new MarkdownString();
	out.appendMarkdown(await plain(documentation));
	const tagsPreview = await tagsMarkdownPreview(tags);
	if (tagsPreview) {
		out.appendMarkdown('\n\n' + tagsPreview);
	}
	return out;
}


export function addmarkdownDocumentation(
	out: MarkdownString,
	documentation: Proto.SymbolDisplayPart[],
	tags: Proto.JSDocTagInfo[]
): MarkdownString {
	out.appendMarkdown(不翻译部件(documentation));
	const tagsPreview = 不翻译标签(tags);
	if (tagsPreview) {
		out.appendMarkdown('\n\n' + tagsPreview);
	}
	return out;
}