"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Includes code from typescript-sublime-plugin project, obtained from
 * https://github.com/Microsoft/TypeScript-Sublime-Plugin/blob/master/TypeScript%20Indent.tmPreferences
 * ------------------------------------------------------------------------------------------ */
const vscode_1 = require("vscode");
// This must be the first statement otherwise modules might got loaded with
// the wrong locale.
const nls = require("vscode-nls");
nls.config({ locale: vscode_1.env.language });
const localize = nls.loadMessageBundle();
const path_1 = require("path");
const PConst = require("./protocol.const");
const typescriptServiceClient_1 = require("./typescriptServiceClient");
const bufferSyncSupport_1 = require("./features/bufferSyncSupport");
const taskProvider_1 = require("./features/taskProvider");
const ProjectStatus = require("./utils/projectStatus");
const typingsStatus_1 = require("./utils/typingsStatus");
const versionStatus_1 = require("./utils/versionStatus");
const plugins_1 = require("./utils/plugins");
const tsconfig_1 = require("./utils/tsconfig");
const convert_1 = require("./utils/convert");
const formattingConfigurationManager_1 = require("./features/formattingConfigurationManager");
const languageModeIds = require("./utils/languageModeIds");
const languageConfigurations = require("./utils/languageConfigurations");
const commandManager_1 = require("./utils/commandManager");
const diagnostics_1 = require("./features/diagnostics");
const ______1 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u6E90\u7801\u8F6C\u6362/\u6E90\u7801\u8F6C\u6362\u547D\u4EE4");
const _______1 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u6E90\u7801\u8F6C\u6362/\u58F0\u660E\u8BCD\u5178\u683C\u5F0F\u5316");
const ___1 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u8F93\u5165\u6CD5\u6A21\u5757/\u8F93\u5165\u6CD5");
const ________1 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u8BCD\u5178\u6807\u7B7E\u63D2\u5165\u547D\u4EE4");
const ________2 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u5168\u5C40\u8BCD\u5178\u63D2\u5165\u547D\u4EE4");
const ________3 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u5C40\u90E8\u8BCD\u5178\u63D2\u5165\u547D\u4EE4");
const _______2 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u683C\u5F0F\u5316\u8BCD\u5178\u8BED\u53E5");
const ___________1 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u7F16\u8F91\u6587\u6863\u96C6\u8BCD\u5178\u8BED\u53E5\u547D\u4EE4");
const ______2 = require("./features/\u4E2D\u6587\u63D2\u4EF6/\u7FFB\u8F6C\u8BCD\u5178\u547D\u4EE4");
const standardLanguageDescriptions = [
    {
        id: 'ctsscript',
        diagnosticSource: 'ts',
        modeIds: [languageModeIds.ctsscript, languageModeIds.ctsscriptreact],
        configFile: 'tsconfig.json'
    }
];
class ReloadTypeScriptProjectsCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.reloadProjects';
    }
    execute() {
        this.lazyClientHost().reloadProjects();
    }
}
class SelectTypeScriptVersionCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.selectTypeScriptVersion';
    }
    execute() {
        this.lazyClientHost().serviceClient.onVersionStatusClicked();
    }
}
class OpenTsServerLogCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.openTsServerLog';
    }
    execute() {
        this.lazyClientHost().serviceClient.openTsServerLogFile();
    }
}
class RestartTsServerCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.restartTsServer';
    }
    execute() {
        this.lazyClientHost().serviceClient.restartTsServer();
    }
}
class TypeScriptGoToProjectConfigCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.goToProjectConfig';
    }
    execute() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            this.lazyClientHost().goToProjectConfig(true, editor.document.uri);
        }
    }
}
function activate(context) {
    const plugins = plugins_1.getContributedTypeScriptServerPlugins();
    const commandManager = new commandManager_1.CommandManager();
    context.subscriptions.push(commandManager);
    const lazyClientHost = (() => {
        let clientHost;
        return () => {
            if (!clientHost) {
                clientHost = new TypeScriptServiceClientHost(standardLanguageDescriptions, context.workspaceState, plugins, commandManager);
                context.subscriptions.push(clientHost);
                const host = clientHost;
                clientHost.serviceClient.onReady().then(() => {
                    context.subscriptions.push(ProjectStatus.create(host.serviceClient, host.serviceClient.telemetryReporter, path => new Promise(resolve => setTimeout(() => resolve(host.handles(path)), 750)), context.workspaceState));
                }, () => {
                    // Nothing to do here. The client did show a message;
                });
            }
            return clientHost;
        };
    })();
    commandManager.register(new ReloadTypeScriptProjectsCommand(lazyClientHost));
    commandManager.register(new SelectTypeScriptVersionCommand(lazyClientHost));
    commandManager.register(new OpenTsServerLogCommand(lazyClientHost));
    commandManager.register(new RestartTsServerCommand(lazyClientHost));
    commandManager.register(new TypeScriptGoToProjectConfigCommand(lazyClientHost));
    context.subscriptions.push(new taskProvider_1.default(() => lazyClientHost().serviceClient));
    let 转换为Cts命令 = new ______1.源码转换命令(() => lazyClientHost().serviceClient);
    context.subscriptions.push(vscode_1.commands.registerCommand('ctsscript.源码转换命令', 转换为Cts命令.execute, 转换为Cts命令));
    let 声明词典格命令 = new _______1.声明词典格式化(() => lazyClientHost().serviceClient);
    context.subscriptions.push(vscode_1.commands.registerCommand('ctsscript.声明词典格式化', 声明词典格命令.execute, 声明词典格命令));
    let 输入法上屏 = new ___1.输入法上屏命令();
    context.subscriptions.push(vscode_1.commands.registerCommand('ctsscript.输入法上屏命令', 输入法上屏.输入法上屏命令, 输入法上屏));
    const 词典标签插入换命令 = new ________1.词典标签插入命令();
    const 全局词典标签插入换命令 = new ________2.全局词典标签插入命令();
    const 局部词典标签插入换命令 = new ________3.局部词典标签插入命令();
    const 格式化词典语句执行命令 = new _______2.格式化词典语句命令();
    const 词典值替换命令 = new ___________1.编辑文档集词典语句命令(() => lazyClientHost().serviceClient);
    const 词典翻转命令 = new ______2.翻转词典命令(() => lazyClientHost().serviceClient);
    context.subscriptions.push(vscode_1.commands.registerCommand(_______2.格式化词典语句命令.__ctsscript_格式化词典语句命令, 格式化词典语句执行命令.格式化词典语句命令, 格式化词典语句执行命令));
    context.subscriptions.push(vscode_1.commands.registerCommand(________1.词典标签插入命令.__ctsscript_词典标签插入命令, 词典标签插入换命令.尝试插入词典标签, 词典标签插入换命令));
    context.subscriptions.push(vscode_1.commands.registerCommand(________3.局部词典标签插入命令.__ctsscript_局部词典标签插入命令, 局部词典标签插入换命令.尝试插入局部词典标签));
    context.subscriptions.push(vscode_1.commands.registerCommand(________2.全局词典标签插入命令.__ctsscript_全局词典标签插入命令, 全局词典标签插入换命令.尝试插入全局词典标签));
    context.subscriptions.push(vscode_1.commands.registerCommand(___________1.编辑文档集词典语句命令.__ctsscript_编辑文档集词典语句命令, 词典值替换命令.尝试插入全局词典标签, 词典值替换命令));
    context.subscriptions.push(vscode_1.commands.registerCommand(______2.翻转词典命令.__ctsscript_翻转词典命令, 词典翻转命令.翻转词典命令, 词典翻转命令));
    context.subscriptions.push(vscode_1.languages.setLanguageConfiguration(languageModeIds.jsxTags, languageConfigurations.jsxTags));
    const supportedLanguage = [].concat.apply([], standardLanguageDescriptions.map(x => x.modeIds).concat(plugins.map(x => x.languages)));
    function didOpenTextDocument(textDocument) {
        if (supportedLanguage.indexOf(textDocument.languageId) >= 0) {
            openListener.dispose();
            // Force activation
            void lazyClientHost();
            return true;
        }
        return false;
    }
    const openListener = vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
    for (let textDocument of vscode_1.workspace.textDocuments) {
        if (didOpenTextDocument(textDocument)) {
            break;
        }
    }
}
exports.activate = activate;
const validateSetting = 'validate.enable';
class LanguageProvider {
    constructor(client, description, commandManager, typingsStatus) {
        this.client = client;
        this.description = description;
        this.toUpdateOnConfigurationChanged = [];
        this._validate = true;
        this.disposables = [];
        this.versionDependentDisposables = [];
        this.formattingOptionsManager = new formattingConfigurationManager_1.default(client);
        this.bufferSyncSupport = new bufferSyncSupport_1.default(client, description.modeIds, {
            delete: (file) => {
                this.diagnosticsManager.delete(file);
            }
        }, this._validate);
        this.diagnosticsManager = new diagnostics_1.default(description.id, this.client);
        vscode_1.workspace.onDidChangeConfiguration(this.configurationChanged, this, this.disposables);
        this.configurationChanged();
        client.onReady().then(() => __awaiter(this, void 0, void 0, function* () {
            yield this.registerProviders(client, commandManager, typingsStatus);
            this.bufferSyncSupport.listen();
        }), () => {
            // Nothing to do here. The client did show a message;
        });
    }
    dispose() {
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        while (this.versionDependentDisposables.length) {
            const obj = this.versionDependentDisposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        this.diagnosticsManager.dispose();
        this.bufferSyncSupport.dispose();
        this.formattingOptionsManager.dispose();
    }
    registerProviders(client, commandManager, typingsStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const selector = this.description.modeIds;
            const config = vscode_1.workspace.getConfiguration(this.id);
            this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new (yield Promise.resolve().then(() => require('./features/completionItemProvider'))).default(client, typingsStatus, commandManager), '.', '"', '\'', '/', '@', "a", "o", "e", "i", "u", "v", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "z", "c", "s", "r", "y", "w", "+", "-"));
            //this.disposables.push(languages.registerCompletionItemProvider(selector, new (await import('./features/directiveCommentCompletionProvider')).default(client), '@'));
            this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new (yield Promise.resolve().then(() => require('./features/中文插件/词典完成提供者'))).default(client), ' '));
            const { TypeScriptFormattingProvider, FormattingProviderManager } = yield Promise.resolve().then(() => require('./features/formattingProvider'));
            const formattingProvider = new TypeScriptFormattingProvider(client, this.formattingOptionsManager);
            formattingProvider.updateConfiguration(config);
            this.disposables.push(vscode_1.languages.registerOnTypeFormattingEditProvider(selector, formattingProvider, ';', '}', '\n'));
            const formattingProviderManager = new FormattingProviderManager(this.description.id, formattingProvider, selector);
            formattingProviderManager.updateConfiguration();
            this.disposables.push(formattingProviderManager);
            this.toUpdateOnConfigurationChanged.push(formattingProviderManager);
            this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new (yield Promise.resolve().then(() => require('./features/jsDocCompletionProvider'))).default(client, commandManager), '*'));
            this.disposables.push(vscode_1.languages.registerHoverProvider(selector, new (yield Promise.resolve().then(() => require('./features/hoverProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerDefinitionProvider(selector, new (yield Promise.resolve().then(() => require('./features/definitionProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerDocumentHighlightProvider(selector, new (yield Promise.resolve().then(() => require('./features/documentHighlightProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerReferenceProvider(selector, new (yield Promise.resolve().then(() => require('./features/referenceProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerDocumentSymbolProvider(selector, new (yield Promise.resolve().then(() => require('./features/documentSymbolProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerSignatureHelpProvider(selector, new (yield Promise.resolve().then(() => require('./features/signatureHelpProvider'))).default(client), '(', ','));
            this.disposables.push(vscode_1.languages.registerRenameProvider(selector, new (yield Promise.resolve().then(() => require('./features/renameProvider'))).default(client)));
            this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, new (yield Promise.resolve().then(() => require('./features/quickFixProvider'))).default(client, this.formattingOptionsManager)));
            this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, new (yield Promise.resolve().then(() => require('./features/refactorProvider'))).default(client, this.formattingOptionsManager, commandManager)));
            this.registerVersionDependentProviders();
            const referenceCodeLensProvider = new (yield Promise.resolve().then(() => require('./features/referencesCodeLensProvider'))).default(client, this.description.id);
            referenceCodeLensProvider.updateConfiguration();
            this.toUpdateOnConfigurationChanged.push(referenceCodeLensProvider);
            this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, referenceCodeLensProvider));
            const implementationCodeLensProvider = new (yield Promise.resolve().then(() => require('./features/implementationsCodeLensProvider'))).default(client, this.description.id);
            implementationCodeLensProvider.updateConfiguration();
            this.toUpdateOnConfigurationChanged.push(implementationCodeLensProvider);
            this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, implementationCodeLensProvider));
            this.disposables.push(vscode_1.languages.registerWorkspaceSymbolProvider(new (yield Promise.resolve().then(() => require('./features/workspaceSymbolProvider'))).default(client, this.description.modeIds)));
            if (!this.description.isExternal) {
                for (const modeId of this.description.modeIds) {
                    this.disposables.push(vscode_1.languages.setLanguageConfiguration(modeId, languageConfigurations.jsTsLanguageConfiguration));
                }
            }
        });
    }
    configurationChanged() {
        const config = vscode_1.workspace.getConfiguration(this.id);
        this.updateValidate(config.get(validateSetting, true));
        for (const toUpdate of this.toUpdateOnConfigurationChanged) {
            toUpdate.updateConfiguration();
        }
    }
    handles(file, doc) {
        if (doc && this.description.modeIds.indexOf(doc.languageId) >= 0) {
            return true;
        }
        if (this.bufferSyncSupport.handles(file)) {
            return true;
        }
        const base = path_1.basename(file);
        return !!base && base === this.description.configFile;
    }
    get id() {
        return this.description.id;
    }
    get diagnosticSource() {
        return this.description.diagnosticSource;
    }
    updateValidate(value) {
        if (this._validate === value) {
            return;
        }
        this._validate = value;
        this.bufferSyncSupport.validate = value;
        this.diagnosticsManager.validate = value;
        if (value) {
            this.triggerAllDiagnostics();
        }
    }
    reInitialize() {
        this.diagnosticsManager.reInitialize();
        this.bufferSyncSupport.reOpenDocuments();
        this.bufferSyncSupport.requestAllDiagnostics();
        this.formattingOptionsManager.reset();
        this.registerVersionDependentProviders();
    }
    registerVersionDependentProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.versionDependentDisposables.length) {
                const obj = this.versionDependentDisposables.pop();
                if (obj) {
                    obj.dispose();
                }
            }
            if (!this.client) {
                return;
            }
            const selector = this.description.modeIds;
            if (this.client.apiVersion.has220Features()) {
                this.versionDependentDisposables.push(vscode_1.languages.registerImplementationProvider(selector, new (yield Promise.resolve().then(() => require('./features/implementationProvider'))).default(this.client)));
            }
            if (this.client.apiVersion.has213Features()) {
                this.versionDependentDisposables.push(vscode_1.languages.registerTypeDefinitionProvider(selector, new (yield Promise.resolve().then(() => require('./features/typeDefinitionProvider'))).default(this.client)));
            }
        });
    }
    triggerAllDiagnostics() {
        this.bufferSyncSupport.requestAllDiagnostics();
    }
    syntaxDiagnosticsReceived(file, syntaxDiagnostics) {
        this.diagnosticsManager.syntaxDiagnosticsReceived(file, syntaxDiagnostics);
    }
    semanticDiagnosticsReceived(file, semanticDiagnostics) {
        this.diagnosticsManager.semanticDiagnosticsReceived(file, semanticDiagnostics);
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.diagnosticsManager.configFileDiagnosticsReceived(file, diagnostics);
    }
}
// Style check diagnostics that can be reported as warnings
const styleCheckDiagnostics = [
    6133,
    6138,
    7027,
    7028,
    7029,
    7030 // not all code paths return a value
];
class TypeScriptServiceClientHost {
    constructor(descriptions, workspaceState, plugins, commandManager) {
        this.commandManager = commandManager;
        this.languages = [];
        this.languagePerId = new Map();
        this.disposables = [];
        const handleProjectCreateOrDelete = () => {
            this.client.execute('reloadProjects', null, false);
            this.triggerAllDiagnostics();
        };
        const handleProjectChange = () => {
            setTimeout(() => {
                this.triggerAllDiagnostics();
            }, 1500);
        };
        const configFileWatcher = vscode_1.workspace.createFileSystemWatcher('**/[tj]sconfig.json');
        this.disposables.push(configFileWatcher);
        configFileWatcher.onDidCreate(handleProjectCreateOrDelete, this, this.disposables);
        configFileWatcher.onDidDelete(handleProjectCreateOrDelete, this, this.disposables);
        configFileWatcher.onDidChange(handleProjectChange, this, this.disposables);
        this.versionStatus = new versionStatus_1.default();
        this.disposables.push(this.versionStatus);
        this.client = new typescriptServiceClient_1.default(this, workspaceState, this.versionStatus, plugins);
        this.disposables.push(this.client);
        this.typingsStatus = new typingsStatus_1.default(this.client);
        this.ataProgressReporter = new typingsStatus_1.AtaProgressReporter(this.client);
        for (const description of descriptions) {
            const manager = new LanguageProvider(this.client, description, this.commandManager, this.typingsStatus);
            this.languages.push(manager);
            this.disposables.push(manager);
            this.languagePerId.set(description.id, manager);
        }
        this.client.onReady().then(() => {
            if (!this.client.apiVersion.has230Features()) {
                return;
            }
            const languages = new Set();
            for (const plugin of plugins) {
                for (const language of plugin.languages) {
                    languages.add(language);
                }
            }
            if (languages.size) {
                const description = {
                    id: 'cts-plugins',
                    modeIds: Array.from(languages.values()),
                    diagnosticSource: 'Cts-plugins',
                    isExternal: true
                };
                const manager = new LanguageProvider(this.client, description, this.commandManager, this.typingsStatus);
                this.languages.push(manager);
                this.disposables.push(manager);
                this.languagePerId.set(description.id, manager);
            }
        });
        this.client.onTsServerStarted(() => {
            this.triggerAllDiagnostics();
        });
    }
    dispose() {
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        this.typingsStatus.dispose();
        this.ataProgressReporter.dispose();
    }
    get serviceClient() {
        return this.client;
    }
    reloadProjects() {
        this.client.execute('reloadProjects', null, false);
        this.triggerAllDiagnostics();
    }
    handles(file) {
        return !!this.findLanguage(file);
    }
    goToProjectConfig(isTypeScriptProject, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const rootPath = this.client.getWorkspaceRootForResource(resource);
            if (!rootPath) {
                vscode_1.window.showInformationMessage(localize('typescript.projectConfigNoWorkspace', 'Please open a folder in VS Code to use a TypeScript or JavaScript project'));
                return;
            }
            const file = this.client.normalizePath(resource);
            // TSServer errors when 'projectInfo' is invoked on a non js/ts file
            if (!file || !this.handles(file)) {
                vscode_1.window.showWarningMessage(localize('typescript.projectConfigUnsupportedFile', 'Could not determine TypeScript or JavaScript project. Unsupported file type'));
                return;
            }
            let res = undefined;
            try {
                res = yield this.client.execute('projectInfo', { file, needFileNameList: false });
            }
            catch (_a) {
                // noop
            }
            if (!res || !res.body) {
                vscode_1.window.showWarningMessage(localize('typescript.projectConfigCouldNotGetInfo', 'Could not determine TypeScript or JavaScript project'));
                return;
            }
            const { configFileName } = res.body;
            if (configFileName && !tsconfig_1.isImplicitProjectConfigFile(configFileName)) {
                const doc = yield vscode_1.workspace.openTextDocument(configFileName);
                vscode_1.window.showTextDocument(doc, vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.viewColumn : undefined);
                return;
            }
            let ProjectConfigAction;
            (function (ProjectConfigAction) {
                ProjectConfigAction[ProjectConfigAction["None"] = 0] = "None";
                ProjectConfigAction[ProjectConfigAction["CreateConfig"] = 1] = "CreateConfig";
                ProjectConfigAction[ProjectConfigAction["LearnMore"] = 2] = "LearnMore";
            })(ProjectConfigAction || (ProjectConfigAction = {}));
            const selected = yield vscode_1.window.showInformationMessage((isTypeScriptProject
                ? localize('typescript.noTypeScriptProjectConfig', 'File is not part of a TypeScript project')
                : localize('typescript.noJavaScriptProjectConfig', 'File is not part of a JavaScript project')), {
                title: isTypeScriptProject
                    ? localize('typescript.configureTsconfigQuickPick', 'Configure tsconfig.json')
                    : localize('typescript.configureJsconfigQuickPick', 'Configure jsconfig.json'),
                id: ProjectConfigAction.CreateConfig
            }, {
                title: localize('typescript.projectConfigLearnMore', 'Learn More'),
                id: ProjectConfigAction.LearnMore
            });
            switch (selected && selected.id) {
                case ProjectConfigAction.CreateConfig:
                    tsconfig_1.openOrCreateConfigFile(isTypeScriptProject, rootPath, this.client.configuration);
                    return;
                case ProjectConfigAction.LearnMore:
                    if (isTypeScriptProject) {
                        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=841896'));
                    }
                    else {
                        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=759670'));
                    }
                    return;
            }
        });
    }
    findLanguage(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield vscode_1.workspace.openTextDocument(this.client.asUrl(file));
                return this.languages.find(language => language.handles(file, doc));
            }
            catch (_a) {
                return undefined;
            }
        });
    }
    triggerAllDiagnostics() {
        for (const language of this.languagePerId.values()) {
            language.triggerAllDiagnostics();
        }
    }
    /* internal */ populateService() {
        // See https://github.com/Microsoft/TypeScript/issues/5530
        vscode_1.workspace.saveAll(false).then(() => {
            for (const language of this.languagePerId.values()) {
                language.reInitialize();
            }
        });
    }
    /* internal */ syntaxDiagnosticsReceived(event) {
        const body = event.body;
        if (body && body.diagnostics) {
            this.findLanguage(body.file).then(language => {
                if (language) {
                    language.syntaxDiagnosticsReceived(this.client.asUrl(body.file), this.createMarkerDatas(body.diagnostics, language.diagnosticSource));
                }
            });
        }
    }
    /* internal */ semanticDiagnosticsReceived(event) {
        const body = event.body;
        if (body && body.diagnostics) {
            this.findLanguage(body.file).then(language => {
                if (language) {
                    language.semanticDiagnosticsReceived(this.client.asUrl(body.file), this.createMarkerDatas(body.diagnostics, language.diagnosticSource));
                }
            });
        }
    }
    /* internal */ configFileDiagnosticsReceived(event) {
        // See https://github.com/Microsoft/TypeScript/issues/10384
        const body = event.body;
        if (!body || !body.diagnostics || !body.configFile) {
            return;
        }
        (this.findLanguage(body.configFile)).then(language => {
            if (!language) {
                return;
            }
            if (body.diagnostics.length === 0) {
                language.configFileDiagnosticsReceived(this.client.asUrl(body.configFile), []);
            }
            else if (body.diagnostics.length >= 1) {
                vscode_1.workspace.openTextDocument(vscode_1.Uri.file(body.configFile)).then((document) => {
                    let curly = undefined;
                    let nonCurly = undefined;
                    let diagnostic;
                    for (let index = 0; index < document.lineCount; index++) {
                        const line = document.lineAt(index);
                        const text = line.text;
                        const firstNonWhitespaceCharacterIndex = line.firstNonWhitespaceCharacterIndex;
                        if (firstNonWhitespaceCharacterIndex < text.length) {
                            if (text.charAt(firstNonWhitespaceCharacterIndex) === '{') {
                                curly = [index, firstNonWhitespaceCharacterIndex, firstNonWhitespaceCharacterIndex + 1];
                                break;
                            }
                            else {
                                const matches = /\s*([^\s]*)(?:\s*|$)/.exec(text.substr(firstNonWhitespaceCharacterIndex));
                                if (matches && matches.length >= 1) {
                                    nonCurly = [index, firstNonWhitespaceCharacterIndex, firstNonWhitespaceCharacterIndex + matches[1].length];
                                }
                            }
                        }
                    }
                    const match = curly || nonCurly;
                    if (match) {
                        diagnostic = new vscode_1.Diagnostic(new vscode_1.Range(match[0], match[1], match[0], match[2]), body.diagnostics[0].text);
                    }
                    else {
                        diagnostic = new vscode_1.Diagnostic(new vscode_1.Range(0, 0, 0, 0), body.diagnostics[0].text);
                    }
                    if (diagnostic) {
                        diagnostic.source = language.diagnosticSource;
                        language.configFileDiagnosticsReceived(this.client.asUrl(body.configFile), [diagnostic]);
                    }
                }, _error => {
                    language.configFileDiagnosticsReceived(this.client.asUrl(body.configFile), [new vscode_1.Diagnostic(new vscode_1.Range(0, 0, 0, 0), body.diagnostics[0].text)]);
                });
            }
        });
    }
    createMarkerDatas(diagnostics, source) {
        const result = [];
        for (let diagnostic of diagnostics) {
            const { start, end, text } = diagnostic;
            const range = new vscode_1.Range(convert_1.tsLocationToVsPosition(start), convert_1.tsLocationToVsPosition(end));
            const converted = new vscode_1.Diagnostic(range, text);
            converted.severity = this.getDiagnosticSeverity(diagnostic);
            converted.source = diagnostic.source || source;
            if (diagnostic.code) {
                converted.code = diagnostic.code;
            }
            result.push(converted);
        }
        return result;
    }
    getDiagnosticSeverity(diagnostic) {
        if (this.reportStyleCheckAsWarnings() && this.isStyleCheckDiagnostic(diagnostic.code)) {
            return vscode_1.DiagnosticSeverity.Warning;
        }
        switch (diagnostic.category) {
            case PConst.DiagnosticCategory.error:
            case PConst.DiagnosticCategory.errorEn:
                return vscode_1.DiagnosticSeverity.Error;
            case PConst.DiagnosticCategory.warning:
            case PConst.DiagnosticCategory.warningEn:
                return vscode_1.DiagnosticSeverity.Warning;
            default:
                return vscode_1.DiagnosticSeverity.Error;
        }
    }
    isStyleCheckDiagnostic(code) {
        return code ? styleCheckDiagnostics.indexOf(code) !== -1 : false;
    }
    reportStyleCheckAsWarnings() {
        const config = vscode_1.workspace.getConfiguration('ctsscript');
        return config.get('reportStyleChecksAsWarnings', true);
    }
}
//# sourceMappingURL=typescriptMain.js.map