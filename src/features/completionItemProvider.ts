/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CompletionItem, TextDocument, Position, CompletionItemKind, CompletionItemProvider, CancellationToken, TextEdit, Range, SnippetString, workspace, ProviderResult, CompletionContext, Uri, MarkdownString, window, TextDocumentChangeEvent, commands } from 'vscode';

import { ITypeScriptServiceClient } from '../typescriptService';
import TypingsStatus from '../utils/typingsStatus';

import * as PConst from '../protocol.const';
import { CompletionEntry, CompletionsRequestArgs, CompletionDetailsRequestArgs, CompletionEntryDetails, CodeAction, ScriptElementKind } from '../protocol';
import * as Previewer from './previewer';
import { tsTextSpanToVsRange, vsPositionToTsFileLocation } from '../utils/convert';

import * as nls from 'vscode-nls';
import { applyCodeAction } from '../utils/codeAction';
import * as languageModeIds from '../utils/languageModeIds';
import { CommandManager, Command } from '../utils/commandManager';
import { 创建对象, 映射连接 } from './\u4E2D\u6587\u63D2\u4EF6/\u5DE5\u5177';
import { Charas } from './\u4E2D\u6587\u63D2\u4EF6/\u7FFB\u8BD1\u6807\u8BC6\u7B26';

let localize = nls.loadMessageBundle();

export interface 库内词 {
	文本: string
	频率: number
	拼音: string
	剩余输入?: string
}

class MyCompletionItem extends CompletionItem {
	public readonly source: string | undefined;
	public readonly 是中文: boolean
	public readonly 上屏字符: string[]
	public readonly 是输入法结果: boolean
	public readonly 是关键字结果: boolean
	constructor(
		public readonly position: Position,
		public readonly document: TextDocument,
		entry: CompletionEntry,
		enableDotCompletions: boolean,
		public readonly useCodeSnippetsOnMethodSuggest: boolean
	) {
		super(entry.name);
		this.source = entry.source;
		this.sortText = entry.sortText;
		this.kind = MyCompletionItem.convertKind(entry.kind);
		this.position = position;

		this.commitCharacters = MyCompletionItem.getCommitCharacters(enableDotCompletions, !useCodeSnippetsOnMethodSuggest, entry.kind);
		if (entry.是库内中文结果) {
			this.是中文 = true
			this.是输入法结果 = false
			this.是关键字结果 = true
			this.filterText = entry.过滤文本
			this.commitCharacters = entry.上屏字符
			this.上屏字符 = entry.上屏字符
		}
		if (entry.是输入法结果) {
			this.是中文 = true
			this.是输入法结果 = true
			this.是关键字结果 = false
			this.上屏字符 = entry.上屏字符
			this.commitCharacters = entry.上屏字符
			this.insertText = entry.插入文本
			this.filterText = entry.过滤文本
			this.range = entry.范围
		} else if (entry.replacementSpan) {
			let span: protocol.TextSpan = entry.replacementSpan;
			// The indexing for the range returned by the server uses 1-based indexing.
			// We convert to 0-based indexing.
			this.textEdit = TextEdit.replace(tsTextSpanToVsRange(span), entry.name);
		} else {
			// Try getting longer, prefix based range for completions that span words
			const wordRange = document.getWordRangeAtPosition(position);
			const text = document.getText(new Range(position.line, Math.max(0, position.character - entry.name.length), position.line, position.character)).toLowerCase();
			const entryName = entry.name.toLowerCase();
			for (let i = entryName.length; i >= 0; --i) {
				if (text.endsWith(entryName.substr(0, i)) && (!wordRange || wordRange.start.character > position.character - i)) {
					this.range = new Range(position.line, Math.max(0, position.character - i), position.line, position.character);
					break;
				}
			}
		}
	}

	private static convertKind(kind: string): CompletionItemKind {
		switch (kind) {
			case PConst.Kind.primitiveType:
			case PConst.Kind.keyword:
			case PConst.Kind.primitiveTypeEn:
			case PConst.Kind.keywordEn:
				return CompletionItemKind.Keyword;
			case PConst.Kind.const:
			case PConst.Kind.constEn:
				return CompletionItemKind.Constant;
			case PConst.Kind.let:
			case PConst.Kind.variable:
			case PConst.Kind.localVariable:
			case PConst.Kind.alias:
			case PConst.Kind.letEn:
			case PConst.Kind.variableEn:
			case PConst.Kind.localVariableEn:
			case PConst.Kind.aliasEn:
				return CompletionItemKind.Variable;
			case PConst.Kind.memberVariable:
			case PConst.Kind.memberGetAccessor:
			case PConst.Kind.memberSetAccessor:
			case PConst.Kind.memberVariableEn:
			case PConst.Kind.memberGetAccessorEn:
			case PConst.Kind.memberSetAccessorEn:
				return CompletionItemKind.Field;
			case PConst.Kind.function:
			case PConst.Kind.functionEn:
				return CompletionItemKind.Function;
			case PConst.Kind.memberFunction:
			case PConst.Kind.constructSignature:
			case PConst.Kind.callSignature:
			case PConst.Kind.indexSignature:
			case PConst.Kind.memberFunctionEn:
			case PConst.Kind.constructSignatureEn:
			case PConst.Kind.callSignatureEn:
			case PConst.Kind.indexSignatureEn:
				return CompletionItemKind.Method;
			case PConst.Kind.enum:
			case PConst.Kind.enumEn:
				return CompletionItemKind.Enum;
			case PConst.Kind.module:
			case PConst.Kind.moduleEn:
			case PConst.Kind.externalModuleName:
			case PConst.Kind.externalModuleNameEn:
				return CompletionItemKind.Module;
			case PConst.Kind.class:
			case PConst.Kind.type:
			case PConst.Kind.classEn:
			case PConst.Kind.typeEn:
				return CompletionItemKind.Class;
			case PConst.Kind.interface:
			case PConst.Kind.interfaceEn:
				return CompletionItemKind.Interface;
			case PConst.Kind.warning:
			case PConst.Kind.file:
			case PConst.Kind.script:
			case PConst.Kind.warningEn:
			case PConst.Kind.fileEn:
			case PConst.Kind.scriptEn:
				return CompletionItemKind.File;
			case PConst.Kind.directory:
			case PConst.Kind.directoryEn:
				return CompletionItemKind.Folder;
		}
		return CompletionItemKind.Property;
	}

	private static getCommitCharacters(enableDotCompletions: boolean, enableCallCompletions: boolean, kind: string): string[] | undefined {

		switch (kind) {
			case PConst.Kind.memberGetAccessor:
			case PConst.Kind.memberSetAccessor:
			case PConst.Kind.constructSignature:
			case PConst.Kind.callSignature:
			case PConst.Kind.indexSignature:
			case PConst.Kind.enum:
			case PConst.Kind.interface:
			case PConst.Kind.memberGetAccessorEn:
			case PConst.Kind.memberSetAccessorEn:
			case PConst.Kind.constructSignatureEn:
			case PConst.Kind.callSignatureEn:
			case PConst.Kind.indexSignatureEn:
			case PConst.Kind.enumEn:
			case PConst.Kind.interfaceEn:
				return enableDotCompletions ? ['.'] : undefined;

			case PConst.Kind.module:
			case PConst.Kind.alias:
			case PConst.Kind.const:
			case PConst.Kind.let:
			case PConst.Kind.variable:
			case PConst.Kind.localVariable:
			case PConst.Kind.memberVariable:
			case PConst.Kind.class:
			case PConst.Kind.function:
			case PConst.Kind.memberFunction:
			case PConst.Kind.moduleEn:
			case PConst.Kind.aliasEn:
			case PConst.Kind.constEn:
			case PConst.Kind.letEn:
			case PConst.Kind.variableEn:
			case PConst.Kind.localVariableEn:
			case PConst.Kind.memberVariableEn:
			case PConst.Kind.classEn:
			case PConst.Kind.functionEn:
			case PConst.Kind.memberFunctionEn:
				return enableDotCompletions ? (enableCallCompletions ? ['.', '('] : ['.']) : undefined;
		}

		return undefined;
	}
}

class ApplyCompletionCodeActionCommand implements Command {
	public static readonly ID = '_ctsscript.applyCompletionCodeAction';
	public readonly id = ApplyCompletionCodeActionCommand.ID;

	public constructor(
		private readonly client: ITypeScriptServiceClient
	) { }

	public async execute(file: string, codeActions: CodeAction[]): Promise<boolean> {
		for (const action of codeActions) {
			if (!(await applyCodeAction(this.client, action, file))) {
				return false;
			}
		}
		return true;
	}
}

interface Configuration {
	useCodeSnippetsOnMethodSuggest: boolean;
	nameSuggestions: boolean;
	quickSuggestionsForPaths: boolean;
	autoImportSuggestions: boolean;
}

namespace Configuration {
	export const useCodeSnippetsOnMethodSuggest = 'useCodeSnippetsOnMethodSuggest';
	export const nameSuggestions = 'nameSuggestions';
	export const quickSuggestionsForPaths = 'quickSuggestionsForPaths';
	export const autoImportSuggestions = 'autoImportSuggestions.enabled';

}


export default class TypeScriptCompletionItemProvider implements CompletionItemProvider {
	输入匹配 = /(([\u4E00-\u9FA5A-Za-z_\$]*?)|([\u4E00-\u9FA5A-Za-z_\$]+?[\u4E00-\u9FA5A-Za-z0-9_\$]*?))(([a-z]+?[\+\-]*)|([a-z]+?[']*?[a-z]+?[\+\-]*?))$/
	constructor(
		private client: ITypeScriptServiceClient,
		private readonly typingsStatus: TypingsStatus,
		commandManager: CommandManager
	) {
		commandManager.register(new ApplyCompletionCodeActionCommand(this.client));
	}


	public async provideCompletionItems(
		document: TextDocument,
		position: Position,
		token: CancellationToken,
		context: CompletionContext
	): Promise<CompletionItem[]> {
		if (this.typingsStatus.isAcquiringTypings) {
			return Promise.reject<CompletionItem[]>({
				label: localize(
					{ key: 'acquiringTypingsLabel', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] },
					'Acquiring typings...'),
				detail: localize(
					{ key: 'acquiringTypingsDetail', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] },
					'Acquiring typings definitions for IntelliSense.')
			});
		}

		const file = this.client.normalizePath(document.uri);
		if (!file) {
			return [];
		}
		const config = this.getConfiguration(document.uri);

		if (context.triggerCharacter === '"' || context.triggerCharacter === '\'') {
			if (!config.quickSuggestionsForPaths) {
				return [];
			}

			// make sure we are in something that looks like the start of an import
			const line = document.lineAt(position.line).text.slice(0, position.character);
			if (!line.match(/\b(from|来自|导入|import)\s*["']$/) && !line.match(/\b(import|导入|需要|require)\(['"]$/)) {
				return [];
			}
		}

		if (context.triggerCharacter === '/') {
			if (!config.quickSuggestionsForPaths) {
				return [];
			}

			// make sure we are in something that looks like an import path
			const line = document.lineAt(position.line).text.slice(0, position.character);
			if (!line.match(/\b(from|来自|导入|import)\s*["'][^'"]*$/) && !line.match(/\b(import|导入|需要|require)\(['"][^'"]*$/)) {
				return [];
			}
		}

		if (context.triggerCharacter === '@') {
			// make sure we are in something that looks like the start of a jsdoc comment
			const line = document.lineAt(position.line).text.slice(0, position.character);
			if (!line.match(/^\s*\*[ ]?@/) && !line.match(/\/\*\*+[ ]?@/)) {
				return [];
			}
		}

		try {
			const args = {
				...vsPositionToTsFileLocation(file, position),
				includeExternalModuleExports: config.autoImportSuggestions
			} as CompletionsRequestArgs;
			const msg = await this.client.execute('completions', args, token);

			// This info has to come from the tsserver. See https://github.com/Microsoft/TypeScript/issues/2831
			// let isMemberCompletion = false;
			// let requestColumn = position.character;
			// if (wordAtPosition) {
			// 	requestColumn = wordAtPosition.startColumn;
			// }
			// if (requestColumn > 0) {
			// 	let value = model.getValueInRange({
			// 		startLineNumber: position.line,
			// 		startColumn: requestColumn - 1,
			// 		endLineNumber: position.line,
			// 		endColumn: requestColumn
			// 	});
			// 	isMemberCompletion = value === '.';
			// }

			let completionItems: CompletionItem[] = [];
			const body = msg.body;
			if (body) {
				// Only enable dot completions in TS files for now
				let enableDotCompletions = document && (document.languageId === languageModeIds.typescript || document.languageId === languageModeIds.ctsscript || document.languageId === languageModeIds.typescriptreact || document.languageId === languageModeIds.ctsscriptreact);

				// TODO: Workaround for https://github.com/Microsoft/TypeScript/issues/13456
				// Only enable dot completions when previous character is an identifier.
				// Prevents incorrectly completing while typing spread operators.
				if (position.character > 1) {
					const preText = document.getText(new Range(
						position.line, 0,
						position.line, position.character - 1));
					enableDotCompletions = preText.match(/[a-z_$\)\]\}]\s*$/ig) !== null;
				}
				let 中文名组: string[] = []

				for (const element of body) {
					if (element.kind === PConst.Kind.warning && !config.nameSuggestions) {
						continue;
					}
					if (!config.autoImportSuggestions && element.hasAction) {
						continue;
					}
					if (this.是中文条目(element)) {
						中文名组.push(element.name)
						element.是库内中文结果 = true
						element.上屏字符 = [" "]
					}

					let item = new MyCompletionItem(position, document, element, enableDotCompletions, config.useCodeSnippetsOnMethodSuggest);
					completionItems.push(item);

				}

				if (中文名组 && 中文名组.length) {
					let 拼音对象 = await commands.executeCommand<映射连接<string>>("vsc.取汉字拼音", 中文名组)
					completionItems.forEach(v => {
						if ((<MyCompletionItem>v).是关键字结果) {
							let 拼音 = 拼音对象[v.label]
							v.filterText = 拼音
						}
					})
				}
			}

			if (this.是拼音启动(context.triggerCharacter)) {
				const line = document.lineAt(position.line).text.slice(0, position.character)
				let { 开启中文提示, 项目集, 已经输入的, 输入的拼音, 替换起始位置, 替换结束位置 } = this.计算启动条件(document, position, context.triggerCharacter, completionItems)

				if (开启中文提示) {
					const 库内词组 = await commands.executeCommand<库内词[]>("vsc.拼音输入法", 输入的拼音.toLowerCase())
					if (库内词组 && 库内词组.length) {
						let 位数 = 库内词组.length.toString().length
						for (let i = 0; i < 库内词组.length; i++) {
							const 词 = 库内词组[i]
							const 条目: CompletionEntry = <any>{
								name: `${i + 1}:${词.文本}`,
								插入文本: `${已经输入的}${词.文本}`,
								是输入法结果: true,
								过滤文本: `${已经输入的}${词.拼音}${词.剩余输入 ? 词.剩余输入 : ""}${i + 1}`,
								上屏字符: [" "],
								范围: new Range(new Position(position.line, 替换起始位置), new Position(position.line, 替换结束位置)),
								kindModifiers: "",
								sortText: `0`,
								kind: "文件"
							}
							const 项目 = new MyCompletionItem(position, document, 条目, false, config.useCodeSnippetsOnMethodSuggest);
							completionItems.push(项目)
						}
					}
				} else {
					completionItems = 项目集
				}
			}
			return completionItems;
		} catch {
			return [];
		}
	}

	public 计算启动条件(文档: TextDocument, 位置: Position, 启动字符: string, 已有项目: CompletionItem[]) {
		const line = 文档.lineAt(位置.line).text.slice(0, 位置.character)
		let { 输入的拼音, 已经输入的 } = this.分割输入(line)
		if (输入的拼音) {
			let 替换起始位置 = 位置.character - 输入的拼音.length - (已经输入的 ? 已经输入的.length : 0)
			let 替换结束位置 = 位置.character
			return { 开启中文提示: true, 项目集: null, 已经输入的, 输入的拼音, 替换起始位置, 替换结束位置 }
		}
		return { 开启中文提示: false, 项目集: 已有项目, 已经输入的: null, 输入的拼音: null, 替换起始位置: null, 替换结束位置: null }
	}

	public 分割输入(文本: string) {
		let 匹配 = 文本.match(this.输入匹配)
		if (匹配) {
			let 输入的拼音 = 匹配[4]
			let 已经输入的 = 匹配[1]
			return { 输入的拼音, 已经输入的 }
		}
	}

	public 是拼音启动(启动字符: string) {
		switch (启动字符) {
			case "a":
			case "o":
			case "e":
			case "i":
			case "u":
			case "v":
			case "b":
			case "p":
			case "m":
			case "f":
			case "d":
			case "t":
			case "n":
			case "l":
			case "g":
			case "k":
			case "h":
			case "j":
			case "q":
			case "x":
			case "z":
			case "c":
			case "s":
			case "r":
			case "y":
			case "w":
			case "+":
			case "-":
				return true
			default:
				false
		}
	}

	public 是中文条目(项目: CompletionEntry) {
		for (let i = 0; i < 项目.name.length; i++) {
			let ch = 项目.name.charCodeAt(i)
			if (ch >= 0x4E00 && ch <= 0x9FA5) {
				return true
			}
		}
		return false
	}

	public resolveCompletionItem(item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem> {
		if (!(item instanceof MyCompletionItem)) {
			return null;
		}

		if ((<MyCompletionItem>item).是中文) {
			if (item.是输入法结果) {
				item.command = {
					title: "输入法上屏",
					command: "ctsscript.输入法上屏命令",
					arguments: [undefined]
				}
				return item
			} else {
				item.command = {
					title: "输入法上屏",
					command: "ctsscript.输入法上屏命令",
					arguments: [item.label]
				}
			}

		}

		const filepath = this.client.normalizePath(item.document.uri);
		if (!filepath) {
			return null;
		}
		const args: CompletionDetailsRequestArgs = {
			...vsPositionToTsFileLocation(filepath, item.position),
			entryNames: [
				item.source ? { name: item.label, source: item.source } : item.label
			]
		};
		return this.client.execute('completionEntryDetails', args, token).then((response) => {
			const details = response.body;
			if (!details || !details.length || !details[0]) {
				return item;
			}
			const detail = details[0];
			item.detail = Previewer.不翻译部件(detail.displayParts);
			const documentation = new MarkdownString();
			if (item.source) {
				let importPath = `'${item.source}'`;
				// Try to resolve the real import name that will be added
				if (detail.codeActions && detail.codeActions[0]) {
					const action = detail.codeActions[0];
					if (action.changes[0] && action.changes[0].textChanges[0]) {
						const textChange = action.changes[0].textChanges[0];
						const matchedImport = textChange.newText.match(/(['"])(.+?)\1/);
						if (matchedImport) {
							importPath = matchedImport[0];
							item.detail += ` — from ${matchedImport[0]}`;
						}
					}
				}
				documentation.appendMarkdown(localize('autoImportLabel', 'Auto import from {0}', importPath));
				documentation.appendMarkdown('\n\n');
			}

			Previewer.addmarkdownDocumentation(documentation, detail.documentation, detail.tags);
			item.documentation = documentation;

			if (detail.codeActions && detail.codeActions.length) {
				item.command = {
					title: '',
					command: ApplyCompletionCodeActionCommand.ID,
					arguments: [filepath, detail.codeActions]
				};
			}

			if (detail && item.useCodeSnippetsOnMethodSuggest && (item.kind === CompletionItemKind.Function || item.kind === CompletionItemKind.Method)) {
				return this.isValidFunctionCompletionContext(filepath, item.position).then(shouldCompleteFunction => {
					if (shouldCompleteFunction) {
						item.insertText = this.snippetForFunctionCall(detail);
					}
					return item;
				});
			}

			return item;
		}, () => {
			return item;
		});
	}

	private isValidFunctionCompletionContext(filepath: string, position: Position): Promise<boolean> {
		const args = vsPositionToTsFileLocation(filepath, position);
		// Workaround for https://github.com/Microsoft/TypeScript/issues/12677
		// Don't complete function calls inside of destructive assigments or imports
		return this.client.execute('quickinfo', args).then(infoResponse => {
			const info = infoResponse.body;
			switch (info && info.kind as string) {
				case 'var':
				case 'let':
				case 'const':
				case 'alias':
					return false;
				default:
					return true;
			}
		}, () => {
			return true;
		});
	}

	private snippetForFunctionCall(detail: CompletionEntryDetails): SnippetString {
		const suggestionArgumentNames: string[] = [];
		let parenCount = 0;
		for (let i = 0; i < detail.displayParts.length; ++i) {
			const part = detail.displayParts[i];
			// Only take top level paren names
			if (part.kind === 'parameterName' && parenCount === 1) {
				suggestionArgumentNames.push(`\${${i + 1}:${part.text}}`);
			} else if (part.kind === 'punctuation') {
				if (part.text === '(') {
					++parenCount;
				} else if (part.text === ')') {
					--parenCount;
				}
			}
		}

		let codeSnippet = detail.name;
		if (suggestionArgumentNames.length > 0) {
			codeSnippet += '(' + suggestionArgumentNames.join(', ') + ')$0';
		} else {
			codeSnippet += '()';
		}

		return new SnippetString(codeSnippet);
	}

	private getConfiguration(resource: Uri): Configuration {
		// Use shared setting for js and ts
		const typeScriptConfig = workspace.getConfiguration('ctsscript', resource);
		return {
			useCodeSnippetsOnMethodSuggest: typeScriptConfig.get<boolean>(Configuration.useCodeSnippetsOnMethodSuggest, false),
			quickSuggestionsForPaths: typeScriptConfig.get<boolean>(Configuration.quickSuggestionsForPaths, true),
			autoImportSuggestions: typeScriptConfig.get<boolean>(Configuration.autoImportSuggestions, true),
			nameSuggestions: workspace.getConfiguration('javascript', resource).get(Configuration.nameSuggestions, true)
		};
	}

}
