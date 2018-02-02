"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const ______1 = require("./\u63D2\u5165\u8BCD\u5178\u6807\u7B7E");
const 工具 = require("./\u5DE5\u5177");
class 编辑文档集词典语句命令 {
    constructor(lazyClient) {
        this.lazyClient = lazyClient;
        this.全局编辑器 = new vscode_1.WorkspaceEdit();
    }
    尝试插入全局词典标签(词典数据) {
        return __awaiter(this, void 0, void 0, function* () {
            if (词典数据 && vscode_1.window.activeTextEditor) {
                let 当前文件名 = this.lazyClient().normalizePath(this.lazyClient().asUrl(vscode_1.window.activeTextEditor.document.fileName));
                let 当前文件词典标签重置指令;
                let 新的选择位置;
                for (let 文件名 in 词典数据) {
                    if (文件名 === "_ctsscript.执行所有缓存的编辑命令") {
                        let 指令数组 = 词典数据[文件名];
                        let 指令 = 指令数组[0];
                        if (工具.是词典编辑指令(指令)) {
                            let { 指令名称 } = 指令;
                            if (指令名称 === "_ctsscript.输出全部缓存编辑") {
                                return this.全部输出();
                            }
                        }
                    }
                    文件名 = this.lazyClient().normalizePath(this.lazyClient().asUrl(文件名));
                    let 只限当前文件 = (当前文件名 === 文件名);
                    let 执行编辑的文档;
                    vscode_1.workspace.textDocuments.forEach((文档) => __awaiter(this, void 0, void 0, function* () {
                        if (this.lazyClient().normalizePath(this.lazyClient().asUrl(文档.fileName)) === 文件名) {
                            if (文档.isClosed) {
                                执行编辑的文档 = yield vscode_1.workspace.openTextDocument(文档.fileName);
                            }
                            else {
                                执行编辑的文档 = 文档;
                            }
                        }
                    }));
                    if (!执行编辑的文档) {
                        执行编辑的文档 = yield vscode_1.workspace.openTextDocument(文件名);
                    }
                    if (执行编辑的文档) {
                        let 应该输出;
                        let 编辑参数综合体 = 词典数据[文件名];
                        let 当前文件编辑数组 = [];
                        编辑参数综合体.forEach((编辑参数, i) => {
                            let 编辑组 = [];
                            if (只限当前文件) {
                                if (工具.是词典字符输出(编辑参数)) {
                                    let { 插入的范围, 插入的字符 } = 编辑参数;
                                    当前文件编辑数组.push(new vscode_1.TextEdit(插入的范围, 插入的字符));
                                }
                                else if (工具.是取消词典键(编辑参数)) {
                                    let { 取消范围 } = 编辑参数;
                                    当前文件编辑数组.push(new vscode_1.TextEdit(取消范围, ""));
                                }
                                else if (工具.是插入词典值(编辑参数)) {
                                    let { 插入范围, 词典值, 是字面量 } = 编辑参数;
                                    当前文件编辑数组.push(new vscode_1.TextEdit(插入范围, 是字面量 ? `"${词典值}"` : 词典值));
                                }
                                else if (工具.是插入词典标签(编辑参数)) {
                                    let { 标签种类 } = 编辑参数;
                                    当前文件词典标签重置指令 = 标签种类;
                                }
                                else if (工具.是格式化词典语句(编辑参数)) {
                                    let { 行 } = 编辑参数;
                                    let 行对象 = 执行编辑的文档.lineAt(行);
                                    let 行文本 = 行对象.text;
                                    if (!行对象.isEmptyOrWhitespace) {
                                        let 文本 = 行文本;
                                        let 选择翻译体内 = 文本.match(/(\s+)?\/\/(#|##)(\s+)?{(.+)?}/) || [];
                                        if (选择翻译体内.length >= 4) {
                                            let 词典体 = 选择翻译体内[4];
                                            let 新的词典体 = "";
                                            let 新的词典语句 = "";
                                            if (词典体) {
                                                let 词典键值对组 = 词典体.split(",");
                                                let 整理后的键值对组 = [];
                                                词典键值对组.forEach(v => {
                                                    if (v.trim() !== "") {
                                                        整理后的键值对组.push(v.replace(/ /g, ""));
                                                    }
                                                });
                                                新的词典体 = 整理后的键值对组.join(", ");
                                                新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//" + 选择翻译体内[2] + "{ " + 新的词典体 + " }#" : "//" + 选择翻译体内[2] + "{ " + 新的词典体 + " }#";
                                            }
                                            当前文件编辑数组.push(new vscode_1.TextEdit(new vscode_1.Range(行, 0, 行, 文本.length), 新的词典语句));
                                            let 位置1 = new vscode_1.Position(行 + 1, 行对象.range.end.character);
                                            新的选择位置 = 行 + 1;
                                        }
                                    }
                                }
                                else if (工具.是插入词典键语句(编辑参数)) {
                                    let { 语句种类, 插入语句范围, 语句预设键 } = 编辑参数;
                                    let 行对象 = 执行编辑的文档.lineAt(插入语句范围.start.line);
                                    let 缩进 = 行对象.text.substr(0, 行对象.firstNonWhitespaceCharacterIndex);
                                    当前文件编辑数组.push(new vscode_1.TextEdit(插入语句范围, 语句种类 === 工具.词典语句种类.全局 ? `${缩进}//##{ ${语句预设键}: }#\n` : `${缩进}//#{ ${语句预设键}: }#\n`));
                                }
                                else if (工具.是替换词典值(编辑参数)) {
                                    let { 替换词典值范围, 词典值, 是字面量 } = 编辑参数;
                                    当前文件编辑数组.push(new vscode_1.TextEdit(替换词典值范围, 是字面量 ? 词典值.slice(1, -1) : 词典值));
                                }
                                if (当前文件编辑数组 && 当前文件编辑数组[0]) {
                                    this.全局编辑器.set(this.lazyClient().asUrl(当前文件名), 当前文件编辑数组);
                                }
                            }
                            else {
                                if (工具.是替换词典值(编辑参数)) {
                                    let { 替换词典值范围, 词典值, 是字面量 } = 编辑参数;
                                    if (是字面量) {
                                        let 位置 = new vscode_1.Position(替换词典值范围.start.line, 替换词典值范围.start.character + 1);
                                        let 位置2 = new vscode_1.Position(替换词典值范围.end.line, 替换词典值范围.end.character - 1);
                                        替换词典值范围 = new vscode_1.Range(位置, 位置2);
                                    }
                                    编辑组.push(new vscode_1.TextEdit(替换词典值范围, 词典值));
                                }
                                else if (工具.是插入词典语句(编辑参数)) {
                                    let { 语句种类, 插入语句范围, 词典值, 词典键, 是字面量 } = 编辑参数;
                                    let 行对象 = 执行编辑的文档.lineAt(插入语句范围.start.line);
                                    let 缩进 = 行对象.text.substr(0, 行对象.firstNonWhitespaceCharacterIndex);
                                    let 位置 = new vscode_1.Position(插入语句范围.start.line, 0);
                                    let 范围 = new vscode_1.Range(位置, 位置);
                                    let 词典头 = 语句种类 === 工具.词典语句种类.全局 ? "//##" : "//#";
                                    let 编辑 = new vscode_1.TextEdit(范围, 是字面量 ? `${缩进}${词典头}{ "${词典键}":"${词典值}" }#\n` : `${缩进}${词典头}{ ${词典键}:${词典值} }#\n`);
                                    编辑组.push(编辑);
                                }
                            }
                            let 已存在的 = this.全局编辑器.get(this.lazyClient().asUrl(文件名));
                            if (已存在的) {
                                if (编辑组 && 编辑组[0]) {
                                    已存在的.push(...编辑组);
                                }
                            }
                            else {
                                if (编辑组 && 编辑组[0]) {
                                    this.全局编辑器.set(this.lazyClient().asUrl(文件名), 编辑组);
                                }
                            }
                        });
                    }
                }
                vscode_1.workspace.applyEdit(this.全局编辑器).then(B => {
                    if (当前文件词典标签重置指令 === 工具.词典语句种类.全局) {
                        ______1.尝试插入词典标签("//##{}#");
                    }
                    if (当前文件词典标签重置指令 === 工具.词典语句种类.局部) {
                        ______1.尝试插入词典标签("//#{}#");
                    }
                    if (新的选择位置) {
                        let 文档 = vscode_1.window.activeTextEditor.document;
                        let 行对象 = 文档.lineAt(新的选择位置);
                        let 行文本 = 行对象.text;
                        let 位置 = new vscode_1.Position(新的选择位置, 行文本.lastIndexOf(":") + 1);
                        vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(位置, 位置);
                    }
                    this.全局编辑器 = new vscode_1.WorkspaceEdit();
                    let 完成时间 = new Date();
                }, (err) => {
                    console.log(err);
                    this.全局编辑器 = new vscode_1.WorkspaceEdit();
                });
            }
        });
    }
    全部输出() {
    }
}
编辑文档集词典语句命令.__ctsscript_编辑文档集词典语句命令 = '_ctsscript.编辑文档集词典语句命令';
exports.编辑文档集词典语句命令 = 编辑文档集词典语句命令;
//# sourceMappingURL=编辑文档集词典语句命令.js.map