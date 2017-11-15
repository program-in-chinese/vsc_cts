/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DocumentRangeFormattingEditProvider, OnTypeFormattingEditProvider, FormattingOptions, TextDocument, Position, Range, CancellationToken, TextEdit, WorkspaceConfiguration, Disposable, languages, workspace } from 'vscode';

import * as Proto from '../protocol';
import { ITypeScriptServiceClient } from '../typescriptService';
import { tsTextSpanToVsRange } from '../utils/convert';
import FormattingConfigurationManager from './formattingConfigurationManager';

export class TypeScriptFormattingProvider implements DocumentRangeFormattingEditProvider, OnTypeFormattingEditProvider {
	private enabled: boolean = true;

	public constructor(
		private readonly client: ITypeScriptServiceClient,
		private readonly formattingOptionsManager: FormattingConfigurationManager
	) { }

	public updateConfiguration(config: WorkspaceConfiguration): void {
		this.enabled = config.get('format.enable', true);
	}

	public isEnabled(): boolean {
		return this.enabled;
	}

	private async doFormat(
		document: TextDocument,
		options: FormattingOptions,
		args: Proto.FormatRequestArgs,
		token: CancellationToken
	): Promise<TextEdit[]> {
		await this.formattingOptionsManager.ensureFormatOptions(document, options, token);
		try {
			const response = await this.client.execute('format', args, token);
			if (response.body) {
				return response.body.map(this.codeEdit2SingleEditOperation);
			}
		} catch {
			// noop
		}
		return [];
	}

	public async provideDocumentRangeFormattingEdits(
		document: TextDocument,
		range: Range,
		options: FormattingOptions,
		token: CancellationToken
	): Promise<TextEdit[]> {
		const absPath = this.client.normalizePath(document.uri);
		if (!absPath) {
			return [];
		}
		const args: Proto.FormatRequestArgs = {
			file: absPath,
			line: range.start.line + 1,
			offset: range.start.character + 1,
			endLine: range.end.line + 1,
			endOffset: range.end.character + 1
		};
		return this.doFormat(document, options, args, token);
	}

	public async provideOnTypeFormattingEdits(
		document: TextDocument,
		position: Position,
		ch: string,
		options: FormattingOptions,
		token: CancellationToken
	): Promise<TextEdit[]> {
		const filepath = this.client.normalizePath(document.uri);
		if (!filepath) {
			return [];
		}
		let args: Proto.FormatOnKeyRequestArgs = {
			file: filepath,
			line: position.line + 1,
			offset: position.character + 1,
			key: ch
		};

		await this.formattingOptionsManager.ensureFormatOptions(document, options, token);
		return this.client.execute('formatonkey', args, token).then((response): TextEdit[] => {
			let edits = response.body;
			let result: TextEdit[] = [];
			if (!edits) {
				return result;
			}
			for (let edit of edits) {
				let textEdit = this.codeEdit2SingleEditOperation(edit);
				let range = textEdit.range;
				// Work around for https://github.com/Microsoft/TypeScript/issues/6700.
				// Check if we have an edit at the beginning of the line which only removes white spaces and leaves
				// an empty line. Drop those edits
				if (range.start.character === 0 && range.start.line === range.end.line && textEdit.newText === '') {
					let lText = document.lineAt(range.start.line).text;
					// If the edit leaves something on the line keep the edit (note that the end character is exclusive).
					// Keep it also if it removes something else than whitespace
					if (lText.trim().length > 0 || lText.length > range.end.character) {
						result.push(textEdit);
					}
				} else {
					result.push(textEdit);
				}
			}
			return result;
		}, () => {
			return [];
		});
	}

	private codeEdit2SingleEditOperation(edit: Proto.CodeEdit): TextEdit {
		return new TextEdit(tsTextSpanToVsRange(edit), edit.newText);
	}
}

export class FormattingProviderManager {
	private formattingProviderRegistration: Disposable | undefined;

	constructor(
		private readonly modeId: string,
		private readonly formattingProvider: TypeScriptFormattingProvider,
		private readonly selector: string[]
	) { }

	public dispose() {
		if (this.formattingProviderRegistration) {
			this.formattingProviderRegistration.dispose();
			this.formattingProviderRegistration = undefined;
		}
	}

	public updateConfiguration(): void {
		const config = workspace.getConfiguration(this.modeId);
		this.formattingProvider.updateConfiguration(config);

		if (!this.formattingProvider.isEnabled() && this.formattingProviderRegistration) {
			this.formattingProviderRegistration.dispose();
			this.formattingProviderRegistration = undefined;
		} else if (this.formattingProvider.isEnabled() && !this.formattingProviderRegistration) {
			this.formattingProviderRegistration = languages.registerDocumentRangeFormattingEditProvider(this.selector, this.formattingProvider);
		}
	}
}