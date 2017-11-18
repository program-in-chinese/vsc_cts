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
const vscode_1 = require("vscode");
const ___________1 = require("./\u7F16\u8F91\u6587\u6863\u96C6\u8BCD\u5178\u8BED\u53E5\u547D\u4EE4");
const 工具 = require("./\u5DE5\u5177");
const _____1 = require("./\u7FFB\u8BD1\u6807\u8BC6\u7B26");
const _______1 = require("./\u683C\u5F0F\u5316\u8BCD\u5178\u8BED\u53E5");
var 词典自动完成种类;
(function (词典自动完成种类) {
    词典自动完成种类[词典自动完成种类["\u8BCD\u5178\u952E\u81EA\u52A8\u5B8C\u6210\u9879\u76EE"] = 1] = "\u8BCD\u5178\u952E\u81EA\u52A8\u5B8C\u6210\u9879\u76EE";
    词典自动完成种类[词典自动完成种类["\u8BCD\u5178\u503C\u81EA\u52A8\u5B8C\u6210\u9879\u76EE"] = 2] = "\u8BCD\u5178\u503C\u81EA\u52A8\u5B8C\u6210\u9879\u76EE";
    词典自动完成种类[词典自动完成种类["\u8BCD\u5178\u5206\u90E8\u503C\u81EA\u52A8\u5B8C\u6210\u9879\u76EE"] = 4] = "\u8BCD\u5178\u5206\u90E8\u503C\u81EA\u52A8\u5B8C\u6210\u9879\u76EE";
    词典自动完成种类[词典自动完成种类["\u8BCD\u5178\u5B8C\u6210\u66FF\u6362\u540E\u66F4\u65B0\u8303\u56F4\u9879\u76EE"] = 8] = "\u8BCD\u5178\u5B8C\u6210\u66FF\u6362\u540E\u66F4\u65B0\u8303\u56F4\u9879\u76EE";
    词典自动完成种类[词典自动完成种类["\u8BCD\u5178\u6A21\u5F0F\u5207\u6362\u9879\u76EE"] = 16] = "\u8BCD\u5178\u6A21\u5F0F\u5207\u6362\u9879\u76EE";
    词典自动完成种类[词典自动完成种类["\u8DF3\u8FC7\u5F53\u524D\u952E\u9879\u76EE"] = 32] = "\u8DF3\u8FC7\u5F53\u524D\u952E\u9879\u76EE";
})(词典自动完成种类 = exports.词典自动完成种类 || (exports.词典自动完成种类 = {}));
function 是词典键自动完成项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.词典键自动完成项目);
}
exports.是词典键自动完成项目 = 是词典键自动完成项目;
function 是词典值自动完成项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.词典值自动完成项目);
}
exports.是词典值自动完成项目 = 是词典值自动完成项目;
function 是词典分部值自动完成项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.词典分部值自动完成项目);
}
exports.是词典分部值自动完成项目 = 是词典分部值自动完成项目;
function 是词典完成替换后更新范围项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.词典完成替换后更新范围项目);
}
exports.是词典完成替换后更新范围项目 = 是词典完成替换后更新范围项目;
function 是跳过当前键项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.跳过当前键项目);
}
exports.是跳过当前键项目 = 是跳过当前键项目;
function 是词典模式切换项目(项目) {
    return 项目 && (项目.种类 === 词典自动完成种类.词典模式切换项目);
}
exports.是词典模式切换项目 = 是词典模式切换项目;
class 词典自动完成项目 extends vscode_1.CompletionItem {
}
exports.词典自动完成项目 = 词典自动完成项目;
class 词典键自动完成项目 extends 词典自动完成项目 {
    constructor(标签名, 是字面量) {
        super(标签名, vscode_1.CompletionItemKind.Enum);
        this.种类 = 词典自动完成种类.词典键自动完成项目;
        if (是字面量) {
            this.label += " :=> 是字面量";
        }
        this.insertText = "";
        this.是字面量键 = 是字面量;
    }
}
exports.词典键自动完成项目 = 词典键自动完成项目;
class 词典值自动完成项目 extends 词典自动完成项目 {
    constructor(标签名, 标识符) {
        super(标签名, vscode_1.CompletionItemKind.Enum);
        this.种类 = 词典自动完成种类.词典值自动完成项目;
        this.insertText = "";
        this.标识符 = 标识符;
    }
}
exports.词典值自动完成项目 = 词典值自动完成项目;
class 词典模式切换项目 extends 词典自动完成项目 {
    constructor(是全局词典请求, 规范的文档名, 当前位置, 键名) {
        super(是全局词典请求 ? "切换到 :=> 全局标签" : "切换到 :=> 局部标签", vscode_1.CompletionItemKind.Function);
        this.种类 = 词典自动完成种类.词典模式切换项目;
        this.insertText = "";
        let range = new vscode_1.Range(new vscode_1.Position(当前位置.line + 1, 0), new vscode_1.Position(当前位置.line + 1, 0));
        let 格式化命令 = 工具.创建格式化词典语句(当前位置.line);
        // 
        let 执行命令 = 工具.创建插入词典键语句(range, 是全局词典请求 ? 工具.词典语句种类.全局 : 工具.词典语句种类.局部, 键名);
        this.模式 = 是全局词典请求 ? 工具.词典语句种类.全局 : 工具.词典语句种类.局部;
        let 词典编辑映射 = 工具.创建映射();
        词典编辑映射[规范的文档名] = [格式化命令, 执行命令];
        // TODO 这里除了局部 词典需要手工排除的问题
        this.command = {
            title: "替换词典范围",
            command: ___________1.编辑文档集词典语句命令._CHTSC_编辑文档集词典语句命令,
            arguments: [词典编辑映射]
        };
    }
}
exports.词典模式切换项目 = 词典模式切换项目;
class 跳过当前键项目 extends 词典自动完成项目 {
    constructor(当前位置, 排除名称) {
        super("跳过此键 :=> 加入排除", vscode_1.CompletionItemKind.Function);
        this.种类 = 词典自动完成种类.跳过当前键项目;
        let 文档 = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
        if (文档) {
            let 前点 = Math.max(文档.lineAt(当前位置.line).text.lastIndexOf(","), 文档.lineAt(当前位置.line).text.lastIndexOf("{"));
            let 位置1 = new vscode_1.Position(当前位置.line, 前点);
            let 取消范围 = new vscode_1.Range(位置1, 当前位置);
            工具.创建取消词典键(取消范围);
            this.排除名称 = 排除名称;
        }
    }
}
exports.跳过当前键项目 = 跳过当前键项目;
class 词典分部值自动完成项目 extends 词典自动完成项目 {
    constructor(标签名, 标识符, 父项目) {
        super(标签名, vscode_1.CompletionItemKind.EnumMember);
        this.种类 = 词典自动完成种类.词典分部值自动完成项目;
        this.insertText = "";
        this.父项目 = 父项目;
        this.标识符 = 标识符;
    }
}
exports.词典分部值自动完成项目 = 词典分部值自动完成项目;
class 词典完成替换后更新范围项目 extends 词典自动完成项目 {
    constructor(名称, 客户端, 完成范围, 替换文本, 请求文本, 当前位置, 当前匹配文本) {
        super(名称 === "结束目前" ? "结束目前 :=> 格式化语句" : 名称 === "自动完成" ? "自动完成 :=> 替换标识符" : 名称 === "新行全局" ? "切换到 :=> 全局标签" : "切换到 :=> 局部标签", vscode_1.CompletionItemKind.Function);
        this.种类 = 词典自动完成种类.词典完成替换后更新范围项目;
        this.编辑 = [];
        if (名称 === "新行全局") {
            this.重启词典 = 工具.词典语句种类.全局;
        }
        else if (名称 === "新行局部") {
            this.重启词典 = 工具.词典语句种类.局部;
        }
        let 当前文件名 = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document.fileName;
        当前文件名 = 客户端.normalizePath(客户端.asUrl(当前文件名));
        this.insertText = "";
        let 值插入范围 = new vscode_1.Range(new vscode_1.Position(当前位置.line, 当前位置.character - 工具.计算空格数量(当前匹配文本)), new vscode_1.Position(当前位置.line, 当前位置.character));
        let 插入的字符 = this.重启词典 ? "" : ",";
        let 词典编辑映射 = 工具.创建映射();
        let 插入字符 = 工具.创建词典字符输出(值插入范围, 插入的字符);
        词典编辑映射[当前文件名] = [插入字符];
        if (this.重启词典) {
            词典编辑映射[当前文件名].push(工具.创建插入词典标签(this.重启词典));
        }
        if (完成范围) {
            for (let 文件名 in 完成范围) {
                文件名 = 客户端.normalizePath(客户端.asUrl(文件名));
                let 编辑区域 = 完成范围[文件名];
                let 文件编辑数组 = [];
                编辑区域.forEach(服务器数据 => {
                    if (服务器数据.start && 服务器数据.end) {
                        let 位置;
                        if (服务器数据.parent) {
                            位置 = new vscode_1.Position(服务器数据.parent.line, 0);
                        }
                        else {
                            位置 = new vscode_1.Position(服务器数据.start.line, 0);
                        }
                        let 父范围 = new vscode_1.Range(位置, 位置);
                        let 前位置 = new vscode_1.Position(服务器数据.start.line, 服务器数据.start.character);
                        let 后位置 = new vscode_1.Position(服务器数据.end.line, 服务器数据.end.character);
                        let 范围 = new vscode_1.Range(前位置, 后位置);
                        文件编辑数组.push(工具.创建替换词典值(范围, 替换文本, 服务器数据.isStringLiteral));
                        if (当前文件名 !== 文件名) {
                            文件编辑数组.push(工具.创建插入词典语句(父范围, 服务器数据.isStringLiteral ? 工具.词典语句种类.局部 : 工具.词典语句种类.全局, 替换文本, 请求文本, 服务器数据.isStringLiteral || undefined));
                        }
                    }
                });
                let 已经存在 = 词典编辑映射 && 词典编辑映射[文件名];
                if (已经存在) {
                    已经存在.push(...文件编辑数组);
                }
                else {
                    词典编辑映射[文件名] = 文件编辑数组;
                }
            }
        }
        this.command = {
            title: "替换词典范围",
            command: ___________1.编辑文档集词典语句命令._CHTSC_编辑文档集词典语句命令,
            arguments: [词典编辑映射]
        };
    }
}
exports.词典完成替换后更新范围项目 = 词典完成替换后更新范围项目;
var 请求事项;
(function (请求事项) {
    请求事项[请求事项["\u65E0"] = 0] = "\u65E0";
    请求事项[请求事项["\u8BF7\u6C42\u952E\u5B8C\u6210\u9879\u76EE"] = 1] = "\u8BF7\u6C42\u952E\u5B8C\u6210\u9879\u76EE";
    请求事项[请求事项["\u8BF7\u6C42\u503C\u5B8C\u6210\u9879\u76EE"] = 2] = "\u8BF7\u6C42\u503C\u5B8C\u6210\u9879\u76EE";
    请求事项[请求事项["\u8BF7\u6C42\u503C\u5206\u90E8\u5B8C\u6210\u9879\u76EE"] = 4] = "\u8BF7\u6C42\u503C\u5206\u90E8\u5B8C\u6210\u9879\u76EE";
    请求事项[请求事项["\u8BF7\u6C42\u66FF\u6362\u8303\u56F4\u6570\u636E"] = 8] = "\u8BF7\u6C42\u66FF\u6362\u8303\u56F4\u6570\u636E";
    请求事项[请求事项["\u952E\u4EE5\u8F93\u5165\u540E\u53C8\u91CD\u65B0\u8BF7\u6C42"] = 16] = "\u952E\u4EE5\u8F93\u5165\u540E\u53C8\u91CD\u65B0\u8BF7\u6C42";
    请求事项[请求事项["\u503C\u4EE5\u8F93\u5165\u540E\u53C8\u91CD\u65B0\u8BF7\u6C42"] = 32] = "\u503C\u4EE5\u8F93\u5165\u540E\u53C8\u91CD\u65B0\u8BF7\u6C42";
    请求事项[请求事项["\u5B8C\u6210\u66FF\u6362\u52A8\u4F5C\u540E\u66F4\u65B0\u8303\u56F4"] = 64] = "\u5B8C\u6210\u66FF\u6362\u52A8\u4F5C\u540E\u66F4\u65B0\u8303\u56F4";
})(请求事项 = exports.请求事项 || (exports.请求事项 = {}));
function 是请求键完成(请求) {
    return 请求 && ((请求 & 请求事项.请求键完成项目) !== 0);
}
exports.是请求键完成 = 是请求键完成;
function 是请求值完成(请求) {
    return 请求 && ((请求 & 请求事项.请求值完成项目) !== 0);
}
exports.是请求值完成 = 是请求值完成;
function 是请求值分部完成(请求) {
    return 请求 && ((请求 & 请求事项.请求值分部完成项目) !== 0);
}
exports.是请求值分部完成 = 是请求值分部完成;
function 是请求替换范围数据(请求) {
    return 请求 && ((请求 & 请求事项.请求替换范围数据) !== 0);
}
exports.是请求替换范围数据 = 是请求替换范围数据;
function 是键以输入后又重新请求(请求) {
    return 请求 && ((请求 & 请求事项.键以输入后又重新请求) !== 0);
}
exports.是键以输入后又重新请求 = 是键以输入后又重新请求;
function 是值以输入后又重新请求(请求) {
    return 请求 && ((请求 & 请求事项.值以输入后又重新请求) !== 0);
}
exports.是值以输入后又重新请求 = 是值以输入后又重新请求;
function 是完成替换动作后更新范围(请求) {
    return 请求 && ((请求 & 请求事项.完成替换动作后更新范围) !== 0);
}
exports.是完成替换动作后更新范围 = 是完成替换动作后更新范围;
class 词典自动完成命令提供者 {
    constructor(client) {
        this.client = client;
        this.储存临时的分部索引 = [];
        this.是全局词典请求 = false;
    }
    provideCompletionItems(document, position, _token) {
        let 事项 = this.初始(document, position, _token);
        if (!事项) {
            return [];
        }
        if (是词典完成替换后更新范围项目(this.储存的最后一个应用的项目)) {
            let 标签 = this.储存的最后一个应用的项目.label;
            if (标签 === "结束目前 :=> 格式化语句") {
                vscode_1.commands.executeCommand(_______1.格式化词典语句命令._CHTSC_格式化词典语句命令, this.当前位置);
                this.储存的最后一个应用的项目.label = "已经完成了命令";
            }
        }
        if (是词典分部值自动完成项目(this.储存的最后一个应用的项目)) {
            this.储存临时的分部索引.push(this.储存的最后一个应用的项目.标识符);
        }
        if (是词典模式切换项目(this.储存的最后一个应用的项目)) {
            this.是全局词典请求 = (this.储存的最后一个应用的项目.模式 === 工具.词典语句种类.全局);
            this.重新请求词典键数据();
        }
        if (是跳过当前键项目(this.储存的最后一个应用的项目)) {
            return this.请求词典键数据跳过指定标识符(this.储存的最后一个应用的项目.排除名称);
        }
        if (是请求替换范围数据(事项)) {
            const 结果 = this.完成替换后请求词典键数据();
            this.当前值自动完成项目 = undefined;
            if (!(结果 && 结果[0])) {
                this.当前词典请求参数 = {
                    file: this.当前文件名,
                    line: this.当前位置.line + 1,
                    offset: this.当前位置.character + 1,
                    ignoreName: undefined
                };
                return this.请求词典键数据();
            }
            return 结果;
        }
        if (是完成替换动作后更新范围(事项)) {
            let 参数 = {
                file: this.当前文件名,
                键名称: this.储存的成功请求.name
            };
            const RM = this.储存的成功请求.rangeMap || undefined;
            let 项目组 = [];
            if (RM) {
                if (this.是全局词典请求) {
                    let 项目 = new 词典完成替换后更新范围项目("自动完成", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本);
                    项目.sortText = "1";
                    项目组.push(项目);
                }
                let 项目20 = new 词典完成替换后更新范围项目("结束目前", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本);
                项目20.sortText = "10";
                let 项目50 = new 词典完成替换后更新范围项目("新行局部", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本);
                项目50.sortText = "50";
                let 项目100 = new 词典完成替换后更新范围项目("新行全局", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本);
                项目100.sortText = "100";
                项目组.push(项目20, 项目50, 项目100);
            }
            return 项目组;
        }
        if (是请求键完成(事项)) {
            this.当前词典请求参数 = {
                file: this.当前文件名,
                line: this.当前位置.line + 1,
                offset: this.当前位置.character + 1,
                ignoreName: undefined
            };
            if (是词典值自动完成项目(this.当前值自动完成项目)) {
                if (是词典完成替换后更新范围项目(this.储存的最后一个应用的项目) && this.储存的最后一个应用的项目.label !== "自动完成 :=> 替换标识符") {
                    this.储存标识符(/** 使用上次的 */ true);
                }
                else {
                    this.储存标识符();
                }
            }
            let 返回值 = this.请求词典键数据();
            return 返回值;
        }
        if (是请求值完成(事项) && 是请求值分部完成(事项)) {
            return this.请求词典值属性().then(v => {
                return v;
            });
        }
        if (!是请求值完成(事项) && 是请求值分部完成(事项)) {
            this.储存单词();
            return this.相关单词组生成分部标签组(this.当前值自动完成项目);
        }
        if (是键以输入后又重新请求(事项)) {
            return [];
        }
    }
    resolveCompletionItem(item, _token) {
        if (是词典键自动完成项目(item)) {
            item.insertText = item.是字面量键 ? ' "' + item.label + '"' : " " + item.label + ":";
            item.range = new vscode_1.Range(new vscode_1.Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new vscode_1.Position(this.当前位置.line, this.当前位置.character));
        }
        if (是词典分部值自动完成项目(item)) {
            item.insertText = item.部分暂定输出;
            item.range = new vscode_1.Range(new vscode_1.Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new vscode_1.Position(this.当前位置.line, this.当前位置.character));
        }
        else if (是词典值自动完成项目(item)) {
            item.insertText = item.label;
            item.range = new vscode_1.Range(new vscode_1.Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new vscode_1.Position(this.当前位置.line, this.当前位置.character));
        }
        else if (是词典完成替换后更新范围项目(item)) {
            item.insertText = "";
        }
        else if (是跳过当前键项目(item)) {
            item.insertText = "";
        }
        this.储存的最后一个应用的项目 = item;
        return item;
    }
    初始(document, position, _token) {
        let 返回的请求事项;
        this.当前文件名 = this.client.normalizePath(document.uri);
        if (!this.当前文件名) {
            this.清理();
            return 请求事项.无;
        }
        this.当前位置 = position;
        this.当前取消令牌 = _token;
        this.当前文档 = document;
        this.当前行文本 = document.lineAt(this.当前位置.line).text;
        if (!(/^\s*\/\/+\s?(@|@@)\{.+}@$/g.test(this.当前行文本))) {
            return 请求事项.无;
        }
        this.光标前文本 = this.当前行文本.slice(0, this.当前位置.character);
        const 当前输入匹配 = this.光标前文本.match(/^\s*\/\/+\s?(@|@@)\{.+$/);
        //这个用的时候在初始化
        if (当前输入匹配.length > 1) {
            if (当前输入匹配[1] === "@@") {
                this.是全局词典请求 = true;
            }
            else if (当前输入匹配[1] == "@") {
                this.是全局词典请求 = false;
            }
            this.当前标记 = 当前输入匹配[0].trim().substr(-1);
            let 最后一个字符 = 当前输入匹配[0].substr(-1);
            this.当前空标记 = /^\s$/g.test(最后一个字符) ? 最后一个字符 : undefined;
            let 之前的有效标记位置 = Math.max(当前输入匹配[0].lastIndexOf("{"), 当前输入匹配[0].lastIndexOf(","), 当前输入匹配[0].lastIndexOf(":"));
            let 之前的有效标记 = 当前输入匹配[0].substring(之前的有效标记位置, 之前的有效标记位置 + 1);
            if (this.当前空标记 && this.当前标记 && this.当前标记 !== "{" && this.当前标记 !== "," && this.当前标记 !== ":") {
                //是分部请求
                if (之前的有效标记 === ":") {
                    this.上次有效输入 = this.当前有效输入;
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf(":") + 1).trim();
                    // 分部请求  不包括值项目
                    if (this.储存的最后一个应用的项目 && 是词典分部值自动完成项目(this.储存的最后一个应用的项目)) {
                        if (this.储存临时的分部索引.length === this.储存的最后一个应用的项目.父项目.标识符.组成索引.length) {
                            return 请求事项.完成替换动作后更新范围;
                        }
                        // this.储存的积累分部输入 = this.当前有效输入
                        return 返回的请求事项 |= 请求事项.请求值分部完成项目;
                    }
                    else {
                        return 请求事项.完成替换动作后更新范围;
                    }
                }
                if (之前的有效标记 === ",") {
                    this.上次有效输入 = this.当前有效输入;
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf(",") + 1).trim();
                    return 返回的请求事项 |= 请求事项.键以输入后又重新请求;
                }
                if (之前的有效标记 === "{") {
                    this.上次有效输入 = this.当前有效输入;
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf("{") + 1).trim();
                    return 返回的请求事项 |= 请求事项.键以输入后又重新请求;
                }
            }
            else if (this.当前标记 === ":") {
                //是值完成请求
                let 前位置 = Math.max(当前输入匹配[0].lastIndexOf("{") + 1, 当前输入匹配[0].lastIndexOf(",") + 1);
                this.上次有效输入 = this.当前有效输入;
                this.当前有效输入 = 当前输入匹配[0].substring(前位置 + 1, 当前输入匹配[0].lastIndexOf(":")).trim();
                //值请求 包含 分部项目
                返回的请求事项 |= 请求事项.请求值完成项目;
                return 返回的请求事项 |= 请求事项.请求值分部完成项目;
            }
            else if (this.当前标记 === ",") {
                //是键完成请求
                let 前位置 = 当前输入匹配[0].lastIndexOf(":");
                if (前位置 === -1) {
                    this.清理();
                    return 请求事项.无;
                }
                this.上次有效输入 = this.当前有效输入;
                this.当前有效输入 = this.光标前文本.substring(前位置 + 1, this.光标前文本.lastIndexOf(",")).trim();
                返回的请求事项 |= 请求事项.请求键完成项目;
                if (!是词典完成替换后更新范围项目(this.储存的最后一个应用的项目)) {
                    this.当前有效输入 = this.光标前文本.substring(前位置 + 1, this.光标前文本.lastIndexOf(",")).trim();
                    return 返回的请求事项 |= 请求事项.请求替换范围数据;
                }
            }
            else if (this.当前标记 === "{") {
                this.上次有效输入 = this.当前有效输入;
                this.当前有效输入 = "";
                return 返回的请求事项 |= 请求事项.请求键完成项目;
            }
            return 返回的请求事项;
        }
        return 请求事项.无;
    }
    清理() {
        this.储存的成功请求 = undefined;
        this.储存的失败请求 = undefined;
        this.储存的积累分部输入 = undefined;
        this.储存临时的分部索引 = [];
        this.光标前文本 = undefined;
        this.当前文档 = undefined;
        this.当前行文本 = undefined;
        this.当前位置 = undefined;
        this.当前取消令牌 = undefined;
        this.当前有效输入 = undefined;
        this.上次有效输入 = undefined;
    }
    请求替换范围数据() {
        this.储存的成功请求.rangeMap;
    }
    完成替换后请求词典键数据() {
        if (this.储存的成功请求) {
            let 项目组 = [];
            this.储存临时的分部索引 = [];
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral);
            项目.sortText = "0";
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目20.sortText = "20";
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目50.sortText = "50";
            let 项目80;
            项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name);
            项目80.sortText = "80";
            项目组.push(项目, 项目20, 项目50, 项目80);
            return 项目组;
        }
        return this.请求词典键数据();
    }
    储存单词(是否清除) {
        if (是词典分部值自动完成项目(this.储存的最后一个应用的项目) && this.储存的积累分部输入 !== this.当前有效输入) {
            let 标识符 = this.储存的最后一个应用的项目.标识符;
            let 用户输入 = "";
            if (!this.储存的积累分部输入) {
                用户输入 = this.当前有效输入;
            }
            else {
                用户输入 = this.当前有效输入.substring(this.储存的积累分部输入.length);
            }
            if (!标识符.用户选择文本) {
                标识符.用户选择文本 = [];
            }
            if (标识符.用户选择文本.indexOf(用户输入) === -1) {
                标识符.用户选择文本.push(用户输入);
            }
            this.储存的积累分部输入 = this.当前有效输入;
            _____1.插入标识符别名数据缓存(标识符, true);
        }
    }
    储存标识符(储存上次的) {
        let 别名用户选择 = 储存上次的 ? this.上次有效输入 : this.当前有效输入;
        if (this.当前值自动完成项目) {
            let 标识符 = this.当前值自动完成项目.标识符;
            if (!标识符.用户选择文本) {
                标识符.用户选择文本 = [];
            }
            if (标识符.用户选择文本.indexOf(别名用户选择) === -1) {
                标识符.用户选择文本.push(别名用户选择);
            }
            _____1.插入标识符别名数据缓存(标识符, true);
        }
    }
    请求词典键数据跳过指定标识符(标识符名称) {
        this.当前词典请求参数.ignoreName = 标识符名称;
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body;
            if (!(this.储存的成功请求 && this.储存的成功请求)) {
                this.格式化词典语句();
                this.清理();
                return [];
            }
            let 项目组 = [];
            this.储存临时的分部索引 = [];
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral);
            项目.sortText = "0";
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目20.sortText = "20";
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目50.sortText = "50";
            let 项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name);
            项目80.sortText = "80";
            项目组.push(项目, 项目20, 项目80, 项目50);
            return 项目组;
        }, (err) => {
            this.格式化词典语句();
            this.清理();
            return [];
        });
    }
    重新请求词典键数据() {
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body;
            if (!(this.储存的成功请求)) {
                this.格式化词典语句();
                this.清理();
                return [];
            }
        });
    }
    请求词典键数据() {
        if ((!this.是全局词典请求) && this.上次有效输入 && this.上次有效输入 !== "{" && this.上次有效输入 !== "," && this.上次有效输入 !== "," && this.上次有效输入 !== " ") {
            this.当前词典请求参数.ignoreName = this.上次有效输入;
        }
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body;
            if (!this.储存的成功请求 || !this.储存的成功请求.name) {
                this.格式化词典语句();
                this.清理();
                return [];
            }
            let 项目组 = [];
            this.储存临时的分部索引 = [];
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral);
            项目.sortText = "0";
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目20.sortText = "20";
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name);
            项目50.sortText = "50";
            let 项目80;
            项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name);
            项目80.sortText = "80";
            项目组.push(项目, 项目20, 项目50, 项目80);
            return 项目组;
        }, (err) => {
            this.格式化词典语句();
            this.清理();
            return [];
        });
    }
    格式化词典语句() {
        let 当前行对象 = this.当前文档.lineAt(this.当前位置.line);
        if (!当前行对象.isEmptyOrWhitespace) {
            let 文本 = this.当前行文本;
            let 选择翻译体内 = 文本.match(/(\s+)?\/\/(@|@@)(\s+)?{(.+)?}/) || [];
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
                    if (this.是全局词典请求) {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//@@{ " + 新的词典体 + " }@" : "//@@{ " + 新的词典体 + " }@";
                    }
                    else {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//@{ " + 新的词典体 + " }@" : "//@{ " + 新的词典体 + " }@";
                    }
                }
                let 当前窗口编辑器 = vscode_1.window.activeTextEditor;
                当前窗口编辑器.edit(编辑 => {
                    编辑.replace(new vscode_1.Range(this.当前位置.line, 0, this.当前位置.line, this.当前行文本.length), 新的词典语句);
                });
                let 文档行 = this.当前文档.lineAt(this.当前位置.line);
                let 选择点 = new vscode_1.Position(this.当前位置.line, 文档行.range.end.character);
                当前窗口编辑器.selection = new vscode_1.Selection(选择点, 选择点);
            }
        }
    }
    请求词典值属性() {
        return __awaiter(this, void 0, void 0, function* () {
            let 标识符 = 工具.创建对象();
            标识符.文本 = this.储存的成功请求.name;
            标识符 = yield _____1.翻译标识符(标识符);
            let { 文本 } = 标识符;
            let 项目组 = [];
            let 前缀 = "", 后缀 = "";
            if (工具.全是大写或下划线(文本)) {
                前缀 = "_";
                后缀 = "_";
            }
            if (工具.是大驼峰(文本)) {
                后缀 = "类";
            }
            else {
                if (标识符.整体译文.substr(-1) === "类") {
                    后缀 = "";
                }
            }
            let 主译标签项目;
            if (标识符.用户选择文本 && 标识符.用户选择文本[0]) {
                标识符.用户选择文本.forEach(v => {
                    主译标签项目 = new 词典值自动完成项目(v, 标识符);
                    主译标签项目.sortText = "1";
                    项目组.push(主译标签项目);
                });
            }
            let 项目标签 = 前缀 + 标识符.整体译文 + 后缀;
            let 项目;
            if (主译标签项目 && 主译标签项目.label === 项目标签) {
                项目 = 主译标签项目;
            }
            else {
                项目 = new 词典值自动完成项目(项目标签, 标识符);
                this.当前值自动完成项目 = 项目;
                项目.sortText = "111";
                项目组.push(项目);
            }
            项目组.push(...this.相关单词组生成分部标签组(项目));
            return 项目组;
        });
    }
    相关单词组生成分部标签组(父项目) {
        let { 标识符 } = 父项目;
        let 项目组 = [];
        let 排序基数 = 1111;
        for (let v of 标识符.组成索引) {
            if (this.储存临时的分部索引.lastIndexOf(v) === -1) {
                let 子标签名 = v.用户选择文本 && v.用户选择文本[0] || v.整体译文 || v.组合译文 || v.文本;
                let 子项目 = new 词典分部值自动完成项目(v.文本 + " :=> " + 子标签名, v, 父项目);
                子项目.部分暂定输出 = 子标签名;
                子项目.sortText = (排序基数++) + "";
                项目组.push(子项目);
            }
        }
        return 项目组;
    }
}
exports.default = 词典自动完成命令提供者;
