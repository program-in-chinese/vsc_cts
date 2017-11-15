/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position, Range, CompletionItemProvider, CompletionItemKind, TextDocument, CancellationToken, CompletionItem, window, Uri, ProviderResult, TextEditor, SnippetString, workspace } from 'vscode';

import { ITypeScriptServiceClient } from '../typescriptService';
import { DocCommandTemplateResponse } from '../protocol';

import * as nls from 'vscode-nls';
import { vsPositionToTsFileLocation } from '../utils/convert';
import { Command, CommandManager } from '../utils/commandManager';
const localize = nls.loadMessageBundle();

const configurationNamespace = 'jsDocCompletion';

namespace Configuration {
	export const enabled = 'enabled';
}

class JsDocCompletionItem extends CompletionItem {
	constructor(
		document: TextDocument,
		position: Position,
		shouldGetJSDocFromTSServer: boolean,
	) {
		super('/** */', CompletionItemKind.Snippet);
		this.detail = localize('typescript.jsDocCompletionItem.documentation', 'JSDoc comment');
		this.insertText = '';
		this.sortText = '\0';

		const line = document.lineAt(position.line).text;
		const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
		const suffix = line.slice(position.character).match(/^\s*\**\//);
		const start = position.translate(0, prefix ? -prefix[0].length : 0);
		this.range = new Range(
			start,
			position.translate(0, suffix ? suffix[0].length : 0));

		this.command = {
			title: 'Try Complete JSDoc',
			command: TryCompleteJsDocCommand.COMMAND_NAME,
			arguments: [document.uri, start, shouldGetJSDocFromTSServer]
		};
	}
}

export default class JsDocCompletionProvider implements CompletionItemProvider {

	constructor(
		private client: ITypeScriptServiceClient,
		commandManager: CommandManager
	) {
		commandManager.register(new TryCompleteJsDocCommand(client));
	}

	public provideCompletionItems(
		document: TextDocument,
		position: Position,
		_token: CancellationToken
	): ProviderResult<CompletionItem[]> {
		const file = this.client.normalizePath(document.uri);
		if (!file) {
			return [];
		}

		// Only show the JSdoc completion when the everything before the cursor is whitespace
		// or could be the opening of a comment
		const line = document.lineAt(position.line).text;
		const prefix = line.slice(0, position.character);
		if (prefix.match(/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/)) {
			const enableJsDocCompletions = workspace.getConfiguration(configurationNamespace, document.uri).get<boolean>(Configuration.enabled, true);
			return [new JsDocCompletionItem(document, position, enableJsDocCompletions)];
		}
		return [];
	}

	public resolveCompletionItem(item: CompletionItem, _token: CancellationToken) {
		return item;
	}
}

class TryCompleteJsDocCommand implements Command {
	public static readonly COMMAND_NAME = '_typeScript.tryCompleteJsDoc';
	public readonly id = TryCompleteJsDocCommand.COMMAND_NAME;

	constructor(
		private readonly client: ITypeScriptServiceClient
	) { }

	/**
	 * Try to insert a jsdoc comment, using a template provide by typescript
	 * if possible, otherwise falling back to a default comment format.
	 */
	public async execute(resource: Uri, start: Position, shouldGetJSDocFromTSServer: boolean): Promise<boolean> {
		const file = this.client.normalizePath(resource);
		if (!file) {
			return false;
		}

		const editor = window.activeTextEditor;
		if (!editor || editor.document.uri.fsPath !== resource.fsPath) {
			return false;
		}

		if (!shouldGetJSDocFromTSServer) {
			return this.tryInsertDefaultDoc(editor, start);
		}

		const didInsertFromTemplate = await this.tryInsertJsDocFromTemplate(editor, file, start);
		if (didInsertFromTemplate) {
			return true;
		}
		return this.tryInsertDefaultDoc(editor, start);
	}

	private tryInsertJsDocFromTemplate(editor: TextEditor, file: string, position: Position): Promise<boolean> {
		const args = vsPositionToTsFileLocation(file, position);
		return Promise.race([
			this.client.execute('docCommentTemplate', args),
			new Promise<DocCommandTemplateResponse>((_, reject) => setTimeout(reject, 250))
		]).then((res: DocCommandTemplateResponse) => {
			if (!res || !res.body) {
				return false;
			}
			return editor.insertSnippet(
				this.templateToSnippet(res.body.newText),
				position,
				{ undoStopBefore: false, undoStopAfter: true });
		}, () => false);
	}

	private templateToSnippet(template: string): SnippetString {
		let snippetIndex = 1;
		template = template.replace(/^\s*(?=(\/|[ ]\*))/gm, '');
		template = template.replace(/^(\/\*\*\s*\*[ ]*)$/m, (x) => x + `\$0`);
		template = template.replace(/\* @param([ ]\{\S+\})?\s+(\S+)\s*$/gm, (_param, type, post) => {
			let out = '* @param ';
			if (type === ' {any}' || type === ' {*}') {
				out += `{*\$\{${snippetIndex++}\}} `;
			} else if (type) {
				out += type + ' ';
			}
			out += post + ` \${${snippetIndex++}}`;
			return out;
		});
		return new SnippetString(template);
	}

	/**
	 * Insert the default JSDoc
	 */
	private tryInsertDefaultDoc(editor: TextEditor, position: Position): Thenable<boolean> {
		const snippet = new SnippetString(`/**\n * $0\n */`);
		return editor.insertSnippet(snippet, position, { undoStopBefore: false, undoStopAfter: true });
	}
}
