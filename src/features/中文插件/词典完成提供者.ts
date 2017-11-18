/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
    Position, CompletionItemProvider, CompletionItemKind, TextDocument,
    CancellationToken, CompletionItem, TextEdit, ProviderResult, Range, window,  Selection, commands
} from 'vscode';

import { 词典完成请求参数 } from '../../protocol';
import { ITypeScriptServiceClient } from '../../typescriptService';

import { 编辑文档集词典语句命令 } from "./编辑文档集词典语句命令"
import * as 工具 from "./工具"
import { 翻译标识符, 标识符别名, 插入标识符别名数据缓存 } from "./翻译标识符"
import {格式化词典语句命令 }from "./格式化词典语句"

export enum 词典自动完成种类 {
    词典键自动完成项目 = 1,
    词典值自动完成项目 = 1 << 1,
    词典分部值自动完成项目 = 1 << 2,
    词典完成替换后更新范围项目 = 1 << 3,
    词典模式切换项目 = 1 << 4,
    跳过当前键项目 = 1 << 5,
}

export function 是词典键自动完成项目(项目: 词典自动完成项目): 项目 is 词典键自动完成项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.词典键自动完成项目)
}

export function 是词典值自动完成项目(项目: 词典自动完成项目): 项目 is 词典值自动完成项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.词典值自动完成项目)
}

export function 是词典分部值自动完成项目(项目: 词典自动完成项目): 项目 is 词典分部值自动完成项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.词典分部值自动完成项目)
}

export function 是词典完成替换后更新范围项目(项目: 词典自动完成项目): 项目 is 词典完成替换后更新范围项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.词典完成替换后更新范围项目)
}
export function 是跳过当前键项目(项目: 词典自动完成项目): 项目 is 跳过当前键项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.跳过当前键项目)
}
export function 是词典模式切换项目(项目: 词典自动完成项目): 项目 is 词典模式切换项目 {
    return 项目 && (项目.种类 === 词典自动完成种类.词典模式切换项目)
}

export abstract class 词典自动完成项目 extends CompletionItem {
    种类: 词典自动完成种类
}

export class 词典键自动完成项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.词典键自动完成项目
    是字面量键: boolean
    constructor(标签名: string, 是字面量: boolean) {
        super(标签名, CompletionItemKind.Enum)
        if (是字面量) {
            this.label += " :=> 是字面量"
        }
        this.insertText = ""
        this.是字面量键 = 是字面量
    }
}

export class 词典值自动完成项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.词典值自动完成项目
    标识符: 标识符别名
    constructor(标签名: string, 标识符: 标识符别名) {
        super(标签名, CompletionItemKind.Enum)
        this.insertText = ""
        this.标识符 = 标识符
    }
}

export class 词典模式切换项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.词典模式切换项目
    模式: 工具.词典语句种类
    constructor(是全局词典请求: boolean, 规范的文档名: string, 当前位置: Position, 键名: string) {
        super(是全局词典请求 ? "切换到 :=> 全局标签" : "切换到 :=> 局部标签", CompletionItemKind.Function)
        this.insertText = ""
        let range = new Range(new Position(当前位置.line + 1, 0), new Position(当前位置.line + 1, 0))

        let 格式化命令 = 工具.创建格式化词典语句(当前位置.line)
        // 

        let 执行命令 = 工具.创建插入词典键语句(range, 是全局词典请求 ? 工具.词典语句种类.全局 : 工具.词典语句种类.局部, 键名)

        this.模式 = 是全局词典请求 ? 工具.词典语句种类.全局 : 工具.词典语句种类.局部
        let 词典编辑映射 = 工具.创建映射<工具.词典编辑[]>()
        词典编辑映射[规范的文档名] = [格式化命令, 执行命令]
        // TODO 这里除了局部 词典需要手工排除的问题
        this.command = {
            title: "替换词典范围",
            command: 编辑文档集词典语句命令._CHTSC_编辑文档集词典语句命令,
            arguments: [词典编辑映射]
        }
    }
}

export class 跳过当前键项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.跳过当前键项目
    排除名称: string
    constructor(当前位置: Position, 排除名称: string) {
        super("跳过此键 :=> 加入排除", CompletionItemKind.Function)

        let 文档 = window.activeTextEditor && window.activeTextEditor.document
        if (文档) {
            let 前点 = Math.max(文档.lineAt(当前位置.line).text.lastIndexOf(","), 文档.lineAt(当前位置.line).text.lastIndexOf("{"))
            let 位置1 = new Position(当前位置.line, 前点)
            let 取消范围 = new Range(位置1, 当前位置)
            工具.创建取消词典键(取消范围)
            this.排除名称 = 排除名称
        }
    }
}

export class 词典分部值自动完成项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.词典分部值自动完成项目
    父项目: 词典值自动完成项目
    部分暂定输出: string
    标识符: 标识符别名
    constructor(标签名: string, 标识符: 标识符别名, 父项目: 词典值自动完成项目) {
        super(标签名, CompletionItemKind.EnumMember)
        this.insertText = ""
        this.父项目 = 父项目
        this.标识符 = 标识符
    }
}

export class 词典完成替换后更新范围项目 extends 词典自动完成项目 {
    种类: 词典自动完成种类 = 词典自动完成种类.词典完成替换后更新范围项目
    编辑: TextEdit[] = []
    重启词典: 工具.词典语句种类
    constructor(名称: "新行全局" | "新行局部" | "自动完成" | "结束目前", 客户端: ITypeScriptServiceClient, 完成范围: protocol.RangeMap, 替换文本: string, 请求文本: string, 当前位置: Position, 当前匹配文本: string) {
        super(名称 === "结束目前" ? "结束目前 :=> 格式化语句" : 名称 === "自动完成" ? "自动完成 :=> 替换标识符" : 名称 === "新行全局" ? "切换到 :=> 全局标签" : "切换到 :=> 局部标签", CompletionItemKind.Function)
        if (名称 === "新行全局") {
            this.重启词典 = 工具.词典语句种类.全局
        } else if (名称 === "新行局部") {
            this.重启词典 = 工具.词典语句种类.局部
        }

        let 当前文件名 = window.activeTextEditor&&window.activeTextEditor.document.fileName
        当前文件名 = 客户端.normalizePath(客户端.asUrl(当前文件名))

        this.insertText = ""

        let 值插入范围 = new Range(new Position(当前位置.line, 当前位置.character - 工具.计算空格数量(当前匹配文本)), new Position(当前位置.line, 当前位置.character))
        let 插入的字符 = this.重启词典 ? "" : ","
        let 词典编辑映射 = 工具.创建映射<工具.词典编辑[]>() as 工具.插入词典数据

        let 插入字符 = 工具.创建词典字符输出(值插入范围, 插入的字符)
        词典编辑映射[当前文件名] = [插入字符]
        if (this.重启词典) {
            词典编辑映射[当前文件名].push(工具.创建插入词典标签(this.重启词典))
        }
        if (完成范围) {
            for (let 文件名 in 完成范围) {
                文件名 = 客户端.normalizePath(客户端.asUrl(文件名))
                let 编辑区域 = 完成范围[文件名]
                let 文件编辑数组: 工具.词典编辑[] = []

                编辑区域.forEach(服务器数据 => {
                    if (服务器数据.start && 服务器数据.end) {
                        let 位置: Position
                        if (服务器数据.parent) {
                            位置 = new Position(服务器数据.parent.line, 0)
                        } else {
                            位置 = new Position(服务器数据.start.line, 0)
                        }
                        let 父范围 = new Range(位置, 位置)
                        let 前位置 = new Position(服务器数据.start.line, 服务器数据.start.character)
                        let 后位置 = new Position(服务器数据.end.line, 服务器数据.end.character)
                        let 范围 = new Range(前位置, 后位置)
                        文件编辑数组.push(工具.创建替换词典值(范围, 替换文本, 服务器数据.isStringLiteral))
                        if (当前文件名 !== 文件名) {
                            文件编辑数组.push(工具.创建插入词典语句(父范围, 服务器数据.isStringLiteral ? 工具.词典语句种类.局部 : 工具.词典语句种类.全局, 替换文本, 请求文本, 服务器数据.isStringLiteral || undefined))
                        }
                    }
                })

                let 已经存在 = 词典编辑映射 && 词典编辑映射[文件名]
                if (已经存在) {
                    已经存在.push(...文件编辑数组)
                } else {
                    词典编辑映射[文件名] = 文件编辑数组
                }
            }
        }
        this.command = {
            title: "替换词典范围",
            command: 编辑文档集词典语句命令._CHTSC_编辑文档集词典语句命令,
            arguments: [词典编辑映射]
        }
    }
}

export enum 请求事项 {
    无 = 0,
    请求键完成项目 = 1,
    请求值完成项目 = 1 << 1,
    请求值分部完成项目 = 1 << 2,
    请求替换范围数据 = 1 << 3,
    键以输入后又重新请求 = 1 << 4,
    值以输入后又重新请求 = 1 << 5,
    完成替换动作后更新范围 = 1 << 6,
}
export function 是请求键完成(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.请求键完成项目) !== 0)
}
export function 是请求值完成(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.请求值完成项目) !== 0)
}
export function 是请求值分部完成(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.请求值分部完成项目) !== 0)
}
export function 是请求替换范围数据(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.请求替换范围数据) !== 0)
}
export function 是键以输入后又重新请求(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.键以输入后又重新请求) !== 0)
}
export function 是值以输入后又重新请求(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.值以输入后又重新请求) !== 0)
}
export function 是完成替换动作后更新范围(请求: 请求事项) {
    return 请求 && ((请求 & 请求事项.完成替换动作后更新范围) !== 0)
}

export default class 词典自动完成命令提供者 implements CompletionItemProvider {
    储存的成功请求: protocol.词典完成条目
    储存的失败请求: boolean
    储存的最后一个应用的项目: 词典自动完成项目
    储存的积累分部输入: string
    储存临时的分部索引: 标识符别名[] = []
    当前文件名: string
    当前文档: TextDocument
    当前行文本: string
    当前位置: Position
    当前取消令牌: CancellationToken
    当前标记: string
    当前空标记: string
    当前词典请求参数: 词典完成请求参数
    当前值自动完成项目: 词典值自动完成项目
    当前有效输入: string

    上次有效输入: string
    是全局词典请求: boolean = false    
    光标前文本: string
    
    constructor(private client: ITypeScriptServiceClient) { }

    provideCompletionItems(document: TextDocument, position: Position, _token: CancellationToken): ProviderResult<CompletionItem[]> {
       
        
        let 事项 = this.初始(document, position, _token)
        if (!事项) {
            return [];
        }
        if (是词典完成替换后更新范围项目(this.储存的最后一个应用的项目)) {
            let 标签 = this.储存的最后一个应用的项目.label
            if (标签 === "结束目前 :=> 格式化语句") {
                commands.executeCommand(格式化词典语句命令._CHTSC_格式化词典语句命令, this.当前位置)
                this.储存的最后一个应用的项目.label = "已经完成了命令"
            }
        }
        

        if (是词典分部值自动完成项目(this.储存的最后一个应用的项目)) {
            this.储存临时的分部索引.push(this.储存的最后一个应用的项目.标识符)
        }
        if (是词典模式切换项目(this.储存的最后一个应用的项目)) {
            this.是全局词典请求 = (this.储存的最后一个应用的项目.模式 === 工具.词典语句种类.全局)
            this.重新请求词典键数据()
        }
        if (是跳过当前键项目(this.储存的最后一个应用的项目)) {
            return this.请求词典键数据跳过指定标识符(this.储存的最后一个应用的项目.排除名称)
        }
        if (是请求替换范围数据(事项)) {
            const 结果 = this.完成替换后请求词典键数据()
            this.当前值自动完成项目 = undefined
            if (!(结果 && 结果[0])) {
                this.当前词典请求参数 = {
                    file: this.当前文件名,
                    line: this.当前位置.line + 1,
                    offset: this.当前位置.character + 1,
                    ignoreName: undefined
                }
                return this.请求词典键数据()
            }
            return 结果
        }
        if (是完成替换动作后更新范围(事项)) {
            let 参数 = {
                file: this.当前文件名,
                键名称: this.储存的成功请求.name
            }
            const RM = this.储存的成功请求.rangeMap || undefined
            
            let 项目组: 词典自动完成项目[] = []
            if (RM) {
                if (this.是全局词典请求) {
                    let 项目 = new 词典完成替换后更新范围项目("自动完成", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本)
                    项目.sortText = "1"
                    项目组.push(项目)
                }
                let 项目20 = new 词典完成替换后更新范围项目("结束目前", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本)
                项目20.sortText = "10"
                let 项目50 = new 词典完成替换后更新范围项目("新行局部", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本)
                项目50.sortText = "50"
                let 项目100 = new 词典完成替换后更新范围项目("新行全局", this.client, RM, this.当前有效输入, 参数.键名称, this.当前位置, this.光标前文本)
                项目100.sortText = "100"
                项目组.push(项目20, 项目50, 项目100)
            }
            return 项目组
        }
        if (是请求键完成(事项)) {
            this.当前词典请求参数 = {
                file: this.当前文件名,
                line: this.当前位置.line + 1,
                offset: this.当前位置.character + 1,
                ignoreName: undefined
            }
            if (是词典值自动完成项目(this.当前值自动完成项目)) {
                if (是词典完成替换后更新范围项目(this.储存的最后一个应用的项目) && this.储存的最后一个应用的项目.label !== "自动完成 :=> 替换标识符") {
                    this.储存标识符(/** 使用上次的 */true)
                } else {
                    this.储存标识符()
                }
            }
            let 返回值 = this.请求词典键数据()
            return 返回值
        }
        if (是请求值完成(事项) && 是请求值分部完成(事项)) {
            return this.请求词典值属性().then(v => {
                return v
            })
        }
        if (!是请求值完成(事项) && 是请求值分部完成(事项)) {
            this.储存单词()
            return this.相关单词组生成分部标签组(this.当前值自动完成项目)
        }
        if (是键以输入后又重新请求(事项)) {
            return []
        }
    }
    resolveCompletionItem(item: 词典自动完成项目, _token: CancellationToken) {
        if (是词典键自动完成项目(item)) {
            item.insertText = item.是字面量键 ? ' "' + item.label + '"' : " " + item.label + ":"
            item.range = new Range(new Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new Position(this.当前位置.line, this.当前位置.character))
        }
        if (是词典分部值自动完成项目(item)) {
            item.insertText = item.部分暂定输出
            item.range = new Range(new Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new Position(this.当前位置.line, this.当前位置.character));

        } else if (是词典值自动完成项目(item)) {
            item.insertText = item.label
            item.range = new Range(new Position(this.当前位置.line, this.当前位置.character - 工具.计算空格数量(this.光标前文本)), new Position(this.当前位置.line, this.当前位置.character))

        } else if (是词典完成替换后更新范围项目(item)) {
            item.insertText = ""
        } else if (是跳过当前键项目(item)) {
            item.insertText = ""
        }
        this.储存的最后一个应用的项目 = item
        return item
    }
    private 初始(document: TextDocument, position: Position, _token: CancellationToken) {
        let 返回的请求事项: 请求事项
        this.当前文件名 = this.client.normalizePath(document.uri);
        if (!this.当前文件名) {
            this.清理()
            return 请求事项.无;
        }
        this.当前位置 = position
        this.当前取消令牌 = _token
        this.当前文档 = document
        this.当前行文本 = document.lineAt(this.当前位置.line).text;
        if (!(/^\s*\/\/+\s?(@|@@)\{.+}@$/g.test(this.当前行文本))) {
            return 请求事项.无;
        }
        this.光标前文本 = this.当前行文本.slice(0, this.当前位置.character);
        const 当前输入匹配 = this.光标前文本.match(/^\s*\/\/+\s?(@|@@)\{.+$/);
        //这个用的时候在初始化
        if (当前输入匹配.length > 1) {
            if (当前输入匹配[1] === "@@") {
                this.是全局词典请求 = true
            } else if (当前输入匹配[1] == "@") {
                this.是全局词典请求 = false
            }
            this.当前标记 = 当前输入匹配[0].trim().substr(-1)
            let 最后一个字符 = 当前输入匹配[0].substr(-1)
            this.当前空标记 = /^\s$/g.test(最后一个字符) ? 最后一个字符 : undefined
            let 之前的有效标记位置 = Math.max(当前输入匹配[0].lastIndexOf("{"), 当前输入匹配[0].lastIndexOf(","), 当前输入匹配[0].lastIndexOf(":"))
            let 之前的有效标记 = 当前输入匹配[0].substring(之前的有效标记位置, 之前的有效标记位置 + 1)

            if (this.当前空标记 && this.当前标记 && this.当前标记 !== "{" && this.当前标记 !== "," && this.当前标记 !== ":") {
                //是分部请求
                if (之前的有效标记 === ":") {
                    this.上次有效输入 = this.当前有效输入
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf(":") + 1).trim()

                    // 分部请求  不包括值项目
                    if (this.储存的最后一个应用的项目 && 是词典分部值自动完成项目(this.储存的最后一个应用的项目)) {
                        if (this.储存临时的分部索引.length === this.储存的最后一个应用的项目.父项目.标识符.组成索引.length) {
                            return 请求事项.完成替换动作后更新范围
                        }
                        // this.储存的积累分部输入 = this.当前有效输入
                        return 返回的请求事项 |= 请求事项.请求值分部完成项目

                    } else {
                        return 请求事项.完成替换动作后更新范围
                    }

                } if (之前的有效标记 === ",") {
                    this.上次有效输入 = this.当前有效输入
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf(",") + 1).trim()
                    return 返回的请求事项 |= 请求事项.键以输入后又重新请求

                } if (之前的有效标记 === "{") {
                    this.上次有效输入 = this.当前有效输入
                    this.当前有效输入 = 当前输入匹配[0].substr(当前输入匹配[0].lastIndexOf("{") + 1).trim()
                    return 返回的请求事项 |= 请求事项.键以输入后又重新请求
                }
            } else if (this.当前标记 === ":") {
                //是值完成请求
                let 前位置 = Math.max(当前输入匹配[0].lastIndexOf("{") + 1, 当前输入匹配[0].lastIndexOf(",") + 1)

                this.上次有效输入 = this.当前有效输入
                this.当前有效输入 = 当前输入匹配[0].substring(前位置 + 1, 当前输入匹配[0].lastIndexOf(":")).trim()
                //值请求 包含 分部项目
                返回的请求事项 |= 请求事项.请求值完成项目

                return 返回的请求事项 |= 请求事项.请求值分部完成项目

            } else if (this.当前标记 === ",") {
                //是键完成请求
                let 前位置 = 当前输入匹配[0].lastIndexOf(":")
                if (前位置 === -1) {
                    this.清理()
                    return 请求事项.无;
                }
                this.上次有效输入 = this.当前有效输入
                this.当前有效输入 = this.光标前文本.substring(前位置 + 1, this.光标前文本.lastIndexOf(",")).trim()
                返回的请求事项 |= 请求事项.请求键完成项目
                if (!是词典完成替换后更新范围项目(this.储存的最后一个应用的项目)) {
                    this.当前有效输入 = this.光标前文本.substring(前位置 + 1, this.光标前文本.lastIndexOf(",")).trim()
                    return 返回的请求事项 |= 请求事项.请求替换范围数据
                }
            } else if (this.当前标记 === "{") {
                this.上次有效输入 = this.当前有效输入
                this.当前有效输入 = ""
                return 返回的请求事项 |= 请求事项.请求键完成项目
            }
            return 返回的请求事项
        }
        return 请求事项.无;
    }

    private 清理() {
        this.储存的成功请求 = undefined
        this.储存的失败请求 = undefined
        this.储存的积累分部输入 = undefined
        this.储存临时的分部索引 = []
        this.光标前文本 = undefined
        this.当前文档 = undefined
        this.当前行文本 = undefined
        this.当前位置 = undefined
        this.当前取消令牌 = undefined
        this.当前有效输入 = undefined
        this.上次有效输入 = undefined
    }
    private 请求替换范围数据() {
        this.储存的成功请求.rangeMap
    }
    private 完成替换后请求词典键数据() {
        if (this.储存的成功请求) {
            let 项目组: 词典自动完成项目[] = []
            this.储存临时的分部索引 = []
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral)
            项目.sortText = "0"
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目20.sortText = "20"
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目50.sortText = "50"
            let 项目80: 跳过当前键项目
            项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name)
            项目80.sortText = "80"
            项目组.push(项目, 项目20, 项目50, 项目80)
            return 项目组
        }
        return this.请求词典键数据()
    }
    private 储存单词(是否清除?: boolean) {
        if (是词典分部值自动完成项目(this.储存的最后一个应用的项目) && this.储存的积累分部输入 !== this.当前有效输入) {
            let 标识符 = this.储存的最后一个应用的项目.标识符
            let 用户输入 = ""
            if (!this.储存的积累分部输入) {
                用户输入 = this.当前有效输入
            } else {
                用户输入 = this.当前有效输入.substring(this.储存的积累分部输入.length)
            }
            if (!标识符.用户选择文本) {
                标识符.用户选择文本 = []
            }
            if (标识符.用户选择文本.indexOf(用户输入) === -1) {
                标识符.用户选择文本.push(用户输入)
            }
            this.储存的积累分部输入 = this.当前有效输入
            插入标识符别名数据缓存(标识符, true)
        }
    }
    private 储存标识符(储存上次的?: boolean) {
        let 别名用户选择 = 储存上次的 ? this.上次有效输入 : this.当前有效输入
        if (this.当前值自动完成项目) {
            let 标识符 = this.当前值自动完成项目.标识符;
            if (!标识符.用户选择文本) {
                标识符.用户选择文本 = []
            }
            if (标识符.用户选择文本.indexOf(别名用户选择) === -1) {
                标识符.用户选择文本.push(别名用户选择)
            }
            插入标识符别名数据缓存(标识符, true)
        }
    }
    private 请求词典键数据跳过指定标识符(标识符名称: string) {
        this.当前词典请求参数.ignoreName = 标识符名称
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body
            if (!(this.储存的成功请求 && this.储存的成功请求)) {
                this.格式化词典语句()
                this.清理()
                return []
            }
            let 项目组: 词典自动完成项目[] = []
            this.储存临时的分部索引 = []
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral)
            项目.sortText = "0"
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目20.sortText = "20"
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目50.sortText = "50"
            let 项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name)
            项目80.sortText = "80"
            项目组.push(项目, 项目20, 项目80, 项目50)
            return 项目组
        }, (err) => {
            this.格式化词典语句()
            this.清理()
            return []
        })
    }
    private 重新请求词典键数据() {
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body
            if (!(this.储存的成功请求)) {
                this.格式化词典语句()
                this.清理()
                return []
            }
        })
    }
    private 请求词典键数据() {
        if ((!this.是全局词典请求) && this.上次有效输入 && this.上次有效输入 !== "{" && this.上次有效输入 !== "," && this.上次有效输入 !== "," && this.上次有效输入 !== " ") {
            this.当前词典请求参数.ignoreName = this.上次有效输入
        }
        return this.client.execute("词典自动完成", this.当前词典请求参数, this.当前取消令牌).then(回应 => {
            this.储存的成功请求 = 回应.body
            if (!this.储存的成功请求 || !this.储存的成功请求.name) {
                this.格式化词典语句()
                this.清理()
                return []
            }
            let 项目组: 词典自动完成项目[] = []
            this.储存临时的分部索引 = []
            let 项目 = new 词典键自动完成项目(this.储存的成功请求.name, this.储存的成功请求.isStringLiteral)
            项目.sortText = "0"
            let 项目20 = new 词典模式切换项目(true, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目20.sortText = "20"
            let 项目50 = new 词典模式切换项目(false, this.client.normalizePath(this.client.asUrl(this.当前文件名)), this.当前位置, this.储存的成功请求.name)
            项目50.sortText = "50"
            let 项目80: 跳过当前键项目
            项目80 = new 跳过当前键项目(this.当前位置, this.储存的成功请求.name)
            项目80.sortText = "80"
            项目组.push(项目, 项目20, 项目50, 项目80)
            return 项目组

        }, (err) => {
            this.格式化词典语句()
            this.清理()
            return []
        })
    }
    private 格式化词典语句() {
        let 当前行对象 = this.当前文档.lineAt(this.当前位置.line)
        if (!当前行对象.isEmptyOrWhitespace) {
            let 文本 = this.当前行文本
            let 选择翻译体内 = 文本.match(/(\s+)?\/\/(@|@@)(\s+)?{(.+)?}/) || [];
            if (选择翻译体内.length >= 4) {
                let 词典体 = 选择翻译体内[4]
                let 新的词典体 = ""
                let 新的词典语句 = ""
                if (词典体) {
                    let 词典键值对组 = 词典体.split(",")
                    let 整理后的键值对组 = []
                    词典键值对组.forEach(v => {
                        if (v.trim() !== "") {
                            整理后的键值对组.push(v.replace(/ /g, ""))
                        }
                    })
                    新的词典体 = 整理后的键值对组.join(", ")
                    if (this.是全局词典请求) {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//@@{ " + 新的词典体 + " }@" : "//@@{ " + 新的词典体 + " }@"
                    } else {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//@{ " + 新的词典体 + " }@" : "//@{ " + 新的词典体 + " }@"
                    }
                }
                let 当前窗口编辑器 = window.activeTextEditor
                当前窗口编辑器.edit(编辑 => {
                    编辑.replace(new Range(this.当前位置.line, 0, this.当前位置.line, this.当前行文本.length), 新的词典语句)
                })
                let 文档行 = this.当前文档.lineAt(this.当前位置.line)
                let 选择点 = new Position(this.当前位置.line, 文档行.range.end.character)
                当前窗口编辑器.selection = new Selection(选择点, 选择点)
            }
        }
    }
    private async 请求词典值属性() {
        let 标识符 = 工具.创建对象<标识符别名>()
        标识符.文本 = this.储存的成功请求.name
        标识符 = await 翻译标识符(标识符)
        let { 文本 } = 标识符
        let 项目组: 词典自动完成项目[] = []
        let 前缀 = "", 后缀 = ""
        if (工具.全是大写或下划线(文本)) {
            前缀 = "_"; 后缀 = "_"
        }
        if (工具.是大驼峰(文本)) {
            后缀 = "类"
        } else {
            if (标识符.整体译文.substr(-1) === "类") {
                后缀 = ""
            }
        }
        let 主译标签项目: 词典值自动完成项目
        if (标识符.用户选择文本 && 标识符.用户选择文本[0]) {
            标识符.用户选择文本.forEach(v => {
                主译标签项目 = new 词典值自动完成项目(v, 标识符)
                主译标签项目.sortText = "1"
                项目组.push(主译标签项目)
            })
        }
        let 项目标签 = 前缀 + 标识符.整体译文 + 后缀

        let 项目: 词典值自动完成项目
        if (主译标签项目 && 主译标签项目.label === 项目标签) {
            项目 = 主译标签项目
        } else {
            项目 = new 词典值自动完成项目(项目标签, 标识符)
            this.当前值自动完成项目 = 项目
            项目.sortText = "111"
            项目组.push(项目)
        }

        项目组.push(...this.相关单词组生成分部标签组(项目))

        return 项目组
    }
    private 相关单词组生成分部标签组(父项目: 词典值自动完成项目) {
        let { 标识符 } = 父项目
        let 项目组: 词典分部值自动完成项目[] = []
        let 排序基数 = 1111
        for (let v of 标识符.组成索引) {
            if (this.储存临时的分部索引.lastIndexOf(v) === -1) {
                let 子标签名 = v.用户选择文本 && v.用户选择文本[0] || v.整体译文 || v.组合译文 || v.文本
                let 子项目 = new 词典分部值自动完成项目(v.文本 + " :=> " + 子标签名, v, 父项目)
                子项目.部分暂定输出 = 子标签名
                子项目.sortText = (排序基数++) + ""
                项目组.push(子项目)
            }
        }
        return 项目组
    }
}
