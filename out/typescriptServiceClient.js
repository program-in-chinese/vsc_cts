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
const path = require("path");
const fs = require("fs");
const os = require("os");
const electron = require("./utils/electron");
const wireProtocol_1 = require("./utils/wireProtocol");
const vscode_1 = require("vscode");
const logger_1 = require("./utils/logger");
const is = require("./utils/is");
const telemetry_1 = require("./utils/telemetry");
const tracer_1 = require("./utils/tracer");
const api_1 = require("./utils/api");
const nls = require("vscode-nls");
const configuration_1 = require("./utils/configuration");
const versionProvider_1 = require("./utils/versionProvider");
const versionPicker_1 = require("./utils/versionPicker");
const localize = nls.loadMessageBundle();
class CallbackMap {
    constructor() {
        this.callbacks = new Map();
        this.pendingResponses = 0;
    }
    destroy(e) {
        for (const callback of this.callbacks.values()) {
            callback.e(e);
        }
        this.callbacks.clear();
        this.pendingResponses = 0;
    }
    add(seq, callback) {
        this.callbacks.set(seq, callback);
        ++this.pendingResponses;
    }
    fetch(seq) {
        const callback = this.callbacks.get(seq);
        this.delete(seq);
        return callback;
    }
    delete(seq) {
        if (this.callbacks.delete(seq)) {
            --this.pendingResponses;
        }
    }
}
class RequestQueue {
    constructor() {
        this.queue = [];
        this.sequenceNumber = 0;
    }
    get length() {
        return this.queue.length;
    }
    push(item) {
        this.queue.push(item);
    }
    shift() {
        return this.queue.shift();
    }
    tryCancelPendingRequest(seq) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].request.seq === seq) {
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    createRequest(command, args) {
        return {
            seq: this.sequenceNumber++,
            type: 'request',
            command: command,
            arguments: args
        };
    }
}
class TypeScriptServiceClient {
    constructor(host, workspaceState, versionStatus, plugins) {
        this.host = host;
        this.workspaceState = workspaceState;
        this.versionStatus = versionStatus;
        this.plugins = plugins;
        this.logger = new logger_1.default();
        this.tsServerLogFile = null;
        this.isRestarting = false;
        this.cancellationPipeName = null;
        this._onTsServerStarted = new vscode_1.EventEmitter();
        this._onProjectLanguageServiceStateChanged = new vscode_1.EventEmitter();
        this._onDidBeginInstallTypings = new vscode_1.EventEmitter();
        this._onDidEndInstallTypings = new vscode_1.EventEmitter();
        this._onTypesInstallerInitializationFailed = new vscode_1.EventEmitter();
        this.disposables = [];
        this.pathSeparator = path.sep;
        this.lastStart = Date.now();
        var p = new Promise((resolve, reject) => {
            this._onReady = { promise: p, resolve, reject };
        });
        this._onReady.promise = p;
        this.servicePromise = null;
        this.lastError = null;
        this.numberRestarts = 0;
        this.requestQueue = new RequestQueue();
        this.callbacks = new CallbackMap();
        this._configuration = configuration_1.TypeScriptServiceConfiguration.loadFromWorkspace();
        this.versionProvider = new versionProvider_1.TypeScriptVersionProvider(this._configuration);
        this.versionPicker = new versionPicker_1.TypeScriptVersionPicker(this.versionProvider, this.workspaceState);
        this._apiVersion = api_1.default.defaultVersion;
        this._tsserverVersion = undefined;
        this.tracer = new tracer_1.default(this.logger);
        vscode_1.workspace.onDidChangeConfiguration(() => {
            const oldConfiguration = this._configuration;
            this._configuration = configuration_1.TypeScriptServiceConfiguration.loadFromWorkspace();
            this.versionProvider.updateConfiguration(this._configuration);
            this.tracer.updateConfiguration();
            if (this.servicePromise) {
                if (this._configuration.checkJs !== oldConfiguration.checkJs
                    || this._configuration.experimentalDecorators !== oldConfiguration.experimentalDecorators) {
                    this.setCompilerOptionsForInferredProjects(this._configuration);
                }
                if (!this._configuration.isEqualTo(oldConfiguration)) {
                    this.restartTsServer();
                }
            }
        }, this, this.disposables);
        this.telemetryReporter = new telemetry_1.default(() => this._tsserverVersion || this._apiVersion.versionString);
        this.disposables.push(this.telemetryReporter);
        this.startService();
    }
    get configuration() {
        return this._configuration;
    }
    dispose() {
        if (this.servicePromise) {
            this.servicePromise.then(cp => {
                if (cp) {
                    cp.kill();
                }
            }).then(undefined, () => void 0);
        }
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
    }
    restartTsServer() {
        const start = () => {
            this.servicePromise = this.startService(true);
            return this.servicePromise;
        };
        if (this.servicePromise) {
            this.servicePromise = this.servicePromise.then(cp => {
                if (cp) {
                    this.info('Killing TS Server');
                    this.isRestarting = true;
                    cp.kill();
                    this.resetClientVersion();
                }
            }).then(start);
        }
        else {
            start();
        }
    }
    get onTsServerStarted() {
        return this._onTsServerStarted.event;
    }
    get onProjectLanguageServiceStateChanged() {
        return this._onProjectLanguageServiceStateChanged.event;
    }
    get onDidBeginInstallTypings() {
        return this._onDidBeginInstallTypings.event;
    }
    get onDidEndInstallTypings() {
        return this._onDidEndInstallTypings.event;
    }
    get onTypesInstallerInitializationFailed() {
        return this._onTypesInstallerInitializationFailed.event;
    }
    get apiVersion() {
        return this._apiVersion;
    }
    onReady() {
        return this._onReady.promise;
    }
    info(message, data) {
        this.logger.info(message, data);
    }
    warn(message, data) {
        this.logger.warn(message, data);
    }
    error(message, data) {
        this.logger.error(message, data);
    }
    logTelemetry(eventName, properties) {
        this.telemetryReporter.logTelemetry(eventName, properties);
    }
    service() {
        if (this.servicePromise) {
            return this.servicePromise;
        }
        if (this.lastError) {
            return Promise.reject(this.lastError);
        }
        this.startService();
        if (this.servicePromise) {
            return this.servicePromise;
        }
        return Promise.reject(new Error('Could not create CTS service'));
    }
    startService(resendModels = false) {
        let currentVersion = this.versionPicker.currentVersion;
        return this.servicePromise = new Promise((resolve, reject) => {
            this.info(`Using tsserver from: ${currentVersion.path}`);
            if (!fs.existsSync(currentVersion.tsServerPath)) {
                vscode_1.window.showWarningMessage(localize('noServerFound', 'The path {0} doesn\'t point to a valid tsserver install. Falling back to bundled TypeScript version.', currentVersion.path));
                this.versionPicker.useBundledVersion();
                currentVersion = this.versionPicker.currentVersion;
            }
            this._apiVersion = this.versionPicker.currentVersion.version || api_1.default.defaultVersion;
            this.versionStatus.onDidChangeTypeScriptVersion(currentVersion);
            this.requestQueue = new RequestQueue();
            this.callbacks = new CallbackMap();
            this.lastError = null;
            try {
                const options = {
                    execArgv: [] // [`--debug-brk=5859`]
                };
                electron.fork(currentVersion.tsServerPath, this.getTsServerArgs(currentVersion), options, this.logger, (err, childProcess) => {
                    if (err || !childProcess) {
                        this.lastError = err;
                        this.error('Starting TSServer failed with error.', err);
                        vscode_1.window.showErrorMessage(localize('serverCouldNotBeStarted', 'TypeScript language server couldn\'t be started. Error message is: {0}', err.message || err));
                        /* __GDPR__
                            "error" : {
                                "message": { "classification": "CustomerContent", "purpose": "PerformanceAndHealth" }
                            }
                        */
                        this.logTelemetry('error', { message: err.message });
                        this.resetClientVersion();
                        return;
                    }
                    this.info('Started TSServer');
                    this.lastStart = Date.now();
                    childProcess.on('error', (err) => {
                        this.lastError = err;
                        this.error('TSServer errored with error.', err);
                        if (this.tsServerLogFile) {
                            this.error(`TSServer log file: ${this.tsServerLogFile}`);
                        }
                        /* __GDPR__
                            "tsserver.error" : {}
                        */
                        this.logTelemetry('tsserver.error');
                        this.serviceExited(false);
                    });
                    childProcess.on('exit', (code) => {
                        if (code === null || typeof code === 'undefined') {
                            this.info('TSServer exited');
                        }
                        else {
                            this.error(`TSServer exited with code: ${code}`);
                            /* __GDPR__
                                "tsserver.exitWithCode" : {
                                    "code" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                                }
                            */
                            this.logTelemetry('tsserver.exitWithCode', { code: code });
                        }
                        if (this.tsServerLogFile) {
                            this.info(`TSServer log file: ${this.tsServerLogFile}`);
                        }
                        this.serviceExited(!this.isRestarting);
                        this.isRestarting = false;
                    });
                    // tslint:disable-next-line:no-unused-expression
                    new wireProtocol_1.Reader(childProcess.stdout, (msg) => { this.dispatchMessage(msg); }, error => { this.error('ReaderError', error); });
                    this._onReady.resolve();
                    resolve(childProcess);
                    this._onTsServerStarted.fire();
                    this.serviceStarted(resendModels);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    onVersionStatusClicked() {
        return this.showVersionPicker(false);
    }
    showVersionPicker(firstRun) {
        return this.versionPicker.show(firstRun).then(change => {
            if (firstRun || !change.newVersion || !change.oldVersion || change.oldVersion.path === change.newVersion.path) {
                return;
            }
            this.restartTsServer();
        });
    }
    openTsServerLogFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.apiVersion.has222Features()) {
                vscode_1.window.showErrorMessage(localize('typescript.openTsServerLog.notSupported', 'TS Server logging requires TS 2.2.2+'));
                return false;
            }
            if (this._configuration.tsServerLogLevel === configuration_1.TsServerLogLevel.Off) {
                vscode_1.window.showErrorMessage(localize('typescript.openTsServerLog.loggingNotEnabled', 'TS Server logging is off. Please set `typescript.tsserver.log` and restart the TS server to enable logging'), {
                    title: localize('typescript.openTsServerLog.enableAndReloadOption', 'Enable logging and restart TS server'),
                })
                    .then(selection => {
                    if (selection) {
                        return vscode_1.workspace.getConfiguration().update('ctsscript.tsserver.log', 'verbose', true).then(() => {
                            this.restartTsServer();
                        });
                    }
                    return undefined;
                });
                return false;
            }
            if (!this.tsServerLogFile) {
                vscode_1.window.showWarningMessage(localize('typescript.openTsServerLog.noLogFile', 'TS Server has not started logging.'));
                return false;
            }
            try {
                yield vscode_1.commands.executeCommand('_workbench.action.files.revealInOS', vscode_1.Uri.parse(this.tsServerLogFile));
                return true;
            }
            catch (_a) {
                vscode_1.window.showWarningMessage(localize('openTsServerLog.openFileFailedFailed', 'Could not open TS Server log file'));
                return false;
            }
        });
    }
    serviceStarted(resendModels) {
        let configureOptions = {
            hostInfo: 'vscode'
        };
        this.execute('configure', configureOptions);
        this.setCompilerOptionsForInferredProjects(this._configuration);
        if (resendModels) {
            this.host.populateService();
        }
    }
    setCompilerOptionsForInferredProjects(configuration) {
        if (!this.apiVersion.has206Features()) {
            return;
        }
        const args = {
            options: this.getCompilerOptionsForInferredProjects(configuration)
        };
        this.execute('compilerOptionsForInferredProjects', args, true);
    }
    getCompilerOptionsForInferredProjects(configuration) {
        const compilerOptions = {
            module: 'CommonJS',
            target: 'ES6',
            allowSyntheticDefaultImports: true,
            allowNonTsExtensions: true,
            allowJs: true,
            jsx: 'Preserve'
        };
        if (this.apiVersion.has230Features()) {
            compilerOptions.checkJs = configuration.checkJs;
            compilerOptions.experimentalDecorators = configuration.experimentalDecorators;
        }
        return compilerOptions;
    }
    serviceExited(restart) {
        let MessageAction;
        (function (MessageAction) {
            MessageAction[MessageAction["reportIssue"] = 0] = "reportIssue";
        })(MessageAction || (MessageAction = {}));
        this.servicePromise = null;
        this.tsServerLogFile = null;
        this.callbacks.destroy(new Error('Service died.'));
        this.callbacks = new CallbackMap();
        if (!restart) {
            this.resetClientVersion();
        }
        else {
            const diff = Date.now() - this.lastStart;
            this.numberRestarts++;
            let startService = true;
            if (this.numberRestarts > 5) {
                let prompt = undefined;
                this.numberRestarts = 0;
                if (diff < 10 * 1000 /* 10 seconds */) {
                    this.lastStart = Date.now();
                    startService = false;
                    prompt = vscode_1.window.showErrorMessage(localize('serverDiedAfterStart', 'The TypeScript language service died 5 times right after it got started. The service will not be restarted.'), {
                        title: localize('serverDiedReportIssue', 'Report Issue'),
                        id: MessageAction.reportIssue,
                        isCloseAffordance: true
                    });
                    /* __GDPR__
                        "serviceExited" : {}
                    */
                    this.logTelemetry('serviceExited');
                    this.resetClientVersion();
                }
                else if (diff < 60 * 1000 /* 1 Minutes */) {
                    this.lastStart = Date.now();
                    prompt = vscode_1.window.showWarningMessage(localize('serverDied', 'The TypeScript language service died unexpectedly 5 times in the last 5 Minutes.'), {
                        title: localize('serverDiedReportIssue', 'Report Issue'),
                        id: MessageAction.reportIssue,
                        isCloseAffordance: true
                    });
                }
                if (prompt) {
                    prompt.then(item => {
                        if (item && item.id === MessageAction.reportIssue) {
                            return vscode_1.commands.executeCommand('workbench.action.reportIssues');
                        }
                        return undefined;
                    });
                }
            }
            if (startService) {
                this.startService(true);
            }
        }
    }
    normalizePath(resource) {
        if (resource.scheme === TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME) {
            return resource.toString();
        }
        if (resource.scheme === 'untitled' && this._apiVersion.has213Features()) {
            return resource.toString();
        }
        if (resource.scheme !== 'file') {
            return null;
        }
        const result = resource.fsPath;
        if (!result) {
            return null;
        }
        // Both \ and / must be escaped in regular expressions
        return result.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/');
    }
    asUrl(filepath) {
        if (filepath.startsWith(TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME_COLON)
            || (filepath.startsWith('untitled:') && this._apiVersion.has213Features())) {
            return vscode_1.Uri.parse(filepath);
        }
        return vscode_1.Uri.file(filepath);
    }
    getWorkspaceRootForResource(resource) {
        const roots = vscode_1.workspace.workspaceFolders;
        if (!roots || !roots.length) {
            return undefined;
        }
        if (resource.scheme === 'file' || resource.scheme === 'untitled') {
            for (const root of roots.sort((a, b) => a.uri.fsPath.length - b.uri.fsPath.length)) {
                if (resource.fsPath.startsWith(root.uri.fsPath + path.sep)) {
                    return root.uri.fsPath;
                }
            }
        }
        return roots[0].uri.fsPath;
    }
    execute(command, args, expectsResultOrToken) {
        let token = undefined;
        let expectsResult = true;
        if (typeof expectsResultOrToken === 'boolean') {
            expectsResult = expectsResultOrToken;
        }
        else {
            token = expectsResultOrToken;
        }
        const request = this.requestQueue.createRequest(command, args);
        const requestInfo = {
            request: request,
            promise: null,
            callbacks: null
        };
        let result = Promise.resolve(null);
        if (expectsResult) {
            let wasCancelled = false;
            result = new Promise((resolve, reject) => {
                requestInfo.callbacks = { c: resolve, e: reject, start: Date.now() };
                if (token) {
                    token.onCancellationRequested(() => {
                        wasCancelled = true;
                        this.tryCancelRequest(request.seq);
                    });
                }
            }).catch((err) => {
                if (!wasCancelled) {
                    this.error(`'${command}' request failed with error.`, err);
                    const properties = this.parseErrorText(err && err.message, command);
                    this.logTelemetry('languageServiceErrorResponse', properties);
                }
                throw err;
            });
        }
        requestInfo.promise = result;
        this.requestQueue.push(requestInfo);
        this.sendNextRequests();
        return result;
    }
    /**
     * Given a `errorText` from a tsserver request indicating failure in handling a request,
     * prepares a payload for telemetry-logging.
     */
    parseErrorText(errorText, command) {
        const properties = Object.create(null);
        properties['command'] = command;
        if (errorText) {
            properties['errorText'] = errorText;
            const errorPrefix = 'Error processing request. ';
            if (errorText.startsWith(errorPrefix)) {
                const prefixFreeErrorText = errorText.substr(errorPrefix.length);
                const newlineIndex = prefixFreeErrorText.indexOf('\n');
                if (newlineIndex >= 0) {
                    // Newline expected between message and stack.
                    properties['message'] = prefixFreeErrorText.substring(0, newlineIndex);
                    properties['stack'] = prefixFreeErrorText.substring(newlineIndex + 1);
                }
            }
        }
        return properties;
    }
    sendNextRequests() {
        while (this.callbacks.pendingResponses === 0 && this.requestQueue.length > 0) {
            const item = this.requestQueue.shift();
            if (item) {
                this.sendRequest(item);
            }
        }
    }
    sendRequest(requestItem) {
        const serverRequest = requestItem.request;
        this.tracer.traceRequest(serverRequest, !!requestItem.callbacks, this.requestQueue.length);
        if (requestItem.callbacks) {
            this.callbacks.add(serverRequest.seq, requestItem.callbacks);
        }
        this.service()
            .then((childProcess) => {
            childProcess.stdin.write(JSON.stringify(serverRequest) + '\r\n', 'utf8');
        })
            .then(undefined, err => {
            const callback = this.callbacks.fetch(serverRequest.seq);
            if (callback) {
                callback.e(err);
            }
        });
    }
    tryCancelRequest(seq) {
        try {
            if (this.requestQueue.tryCancelPendingRequest(seq)) {
                this.tracer.logTrace(`TypeScript Service: canceled request with sequence number ${seq}`);
                return true;
            }
            if (this.apiVersion.has222Features() && this.cancellationPipeName) {
                this.tracer.logTrace(`TypeScript Service: trying to cancel ongoing request with sequence number ${seq}`);
                try {
                    fs.writeFileSync(this.cancellationPipeName + seq, '');
                }
                catch (_a) {
                    // noop
                }
                return true;
            }
            this.tracer.logTrace(`TypeScript Service: tried to cancel request with sequence number ${seq}. But request got already delivered.`);
            return false;
        }
        finally {
            const p = this.callbacks.fetch(seq);
            if (p) {
                p.e(new Error(`Cancelled Request ${seq}`));
            }
        }
    }
    dispatchMessage(message) {
        try {
            if (message.type === 'response') {
                const response = message;
                const p = this.callbacks.fetch(response.request_seq);
                if (p) {
                    this.tracer.traceResponse(response, p.start);
                    if (response.success) {
                        p.c(response);
                    }
                    else {
                        p.e(response);
                    }
                }
            }
            else if (message.type === 'event') {
                const event = message;
                this.tracer.traceEvent(event);
                this.dispatchEvent(event);
            }
            else {
                throw new Error('Unknown message type ' + message.type + ' recevied');
            }
        }
        finally {
            this.sendNextRequests();
        }
    }
    dispatchEvent(event) {
        switch (event.event) {
            case 'syntaxDiag':
                this.host.syntaxDiagnosticsReceived(event);
                break;
            case 'semanticDiag':
                this.host.semanticDiagnosticsReceived(event);
                break;
            case 'configFileDiag':
                this.host.configFileDiagnosticsReceived(event);
                break;
            case 'telemetry':
                const telemetryData = event.body;
                this.dispatchTelemetryEvent(telemetryData);
                break;
            case 'projectLanguageServiceState':
                if (event.body) {
                    this._onProjectLanguageServiceStateChanged.fire(event.body);
                }
                break;
            case 'beginInstallTypes':
                if (event.body) {
                    this._onDidBeginInstallTypings.fire(event.body);
                }
                break;
            case 'endInstallTypes':
                if (event.body) {
                    this._onDidEndInstallTypings.fire(event.body);
                }
                break;
            case 'typesInstallerInitializationFailed':
                if (event.body) {
                    this._onTypesInstallerInitializationFailed.fire(event.body);
                }
                break;
        }
    }
    dispatchTelemetryEvent(telemetryData) {
        const properties = Object.create(null);
        switch (telemetryData.telemetryEventName) {
            case 'typingsInstalled':
                const typingsInstalledPayload = telemetryData.payload;
                properties['installedPackages'] = typingsInstalledPayload.installedPackages;
                if (is.defined(typingsInstalledPayload.installSuccess)) {
                    properties['installSuccess'] = typingsInstalledPayload.installSuccess.toString();
                }
                if (is.string(typingsInstalledPayload.typingsInstallerVersion)) {
                    properties['typingsInstallerVersion'] = typingsInstalledPayload.typingsInstallerVersion;
                }
                break;
            default:
                const payload = telemetryData.payload;
                if (payload) {
                    Object.keys(payload).forEach((key) => {
                        try {
                            if (payload.hasOwnProperty(key)) {
                                properties[key] = is.string(payload[key]) ? payload[key] : JSON.stringify(payload[key]);
                            }
                        }
                        catch (e) {
                            // noop
                        }
                    });
                }
                break;
        }
        if (telemetryData.telemetryEventName === 'projectInfo') {
            this._tsserverVersion = properties['version'];
        }
        /* __GDPR__
            "typingsInstalled" : {
                "installedPackages" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "installSuccess": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "typingsInstallerVersion": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
            }
        */
        // __GDPR__COMMENT__: Other events are defined by TypeScript.
        this.logTelemetry(telemetryData.telemetryEventName, properties);
    }
    getTsServerArgs(currentVersion) {
        const args = [];
        if (this.apiVersion.has206Features()) {
            if (this.apiVersion.has250Features()) {
                args.push('--useInferredProjectPerProjectRoot');
            }
            else {
                args.push('--useSingleInferredProject');
            }
            if (this._configuration.disableAutomaticTypeAcquisition) {
                args.push('--disableAutomaticTypingAcquisition');
            }
        }
        if (this.apiVersion.has208Features()) {
            args.push('--enableTelemetry');
        }
        if (this.apiVersion.has222Features()) {
            this.cancellationPipeName = electron.getTempFile(`tscancellation-${electron.makeRandomHexString(20)}`);
            args.push('--cancellationPipeName', this.cancellationPipeName + '*');
        }
        if (this.apiVersion.has222Features()) {
            if (this._configuration.tsServerLogLevel !== configuration_1.TsServerLogLevel.Off) {
                try {
                    const logDir = fs.mkdtempSync(path.join(os.tmpdir(), `vscode-tsserver-log-`));
                    this.tsServerLogFile = path.join(logDir, `tsserver.log`);
                    this.info(`TSServer log file: ${this.tsServerLogFile}`);
                }
                catch (e) {
                    this.error('Could not create TSServer log directory');
                }
                if (this.tsServerLogFile) {
                    args.push('--logVerbosity', configuration_1.TsServerLogLevel.toString(this._configuration.tsServerLogLevel));
                    args.push('--logFile', this.tsServerLogFile);
                }
            }
        }
        if (this.apiVersion.has230Features()) {
            if (this.plugins.length) {
                args.push('--globalPlugins', this.plugins.map(x => x.name).join(','));
                if (currentVersion.path === this.versionProvider.defaultVersion.path) {
                    args.push('--pluginProbeLocations', this.plugins.map(x => x.path).join(','));
                }
            }
        }
        if (this.apiVersion.has234Features()) {
            if (this._configuration.npmLocation) {
                args.push('--npmLocation', `"${this._configuration.npmLocation}"`);
            }
        }
        if (this.apiVersion.has260Features()) {
            const tsLocale = getTsLocale(this._configuration);
            if (tsLocale) {
                args.push('--locale', tsLocale);
            }
        }
        return args;
    }
    resetClientVersion() {
        this._apiVersion = api_1.default.defaultVersion;
        this._tsserverVersion = undefined;
    }
}
TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME = 'walkThroughSnippet';
TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME_COLON = `${TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME}:`;
exports.default = TypeScriptServiceClient;
const getTsLocale = (configuration) => (configuration.locale
    ? configuration.locale
    : vscode_1.env.language);
//# sourceMappingURL=typescriptServiceClient.js.map