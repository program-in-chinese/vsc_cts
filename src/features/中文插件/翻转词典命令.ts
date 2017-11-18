import {
    window, workspace, TextEdit, WorkspaceEdit, commands
} from 'vscode';

import { ITypeScriptServiceClient } from '../../typescriptService';

import { 编辑文档集词典语句命令 } from './编辑文档集词典语句命令';
import * as 工具 from './工具';

export class 翻转词典命令 {
    static _CHTSC_翻转词典命令 = 'chtsc.翻转词典命令';
    constructor(
        private lazyClient: () => ITypeScriptServiceClient
    ) { }
    public 翻转词典命令() {
        const 编辑器 = window.activeTextEditor
        if (编辑器) {
            let 文档 = window.activeTextEditor.document
            let 编辑组: TextEdit[] = []
            if (文档.languageId === "chtypescript" && this.lazyClient().normalizePath(文档.uri).lastIndexOf(".d.cts")) {
                for (let i = 0; i < 文档.lineCount; i++) {
                    let 行对象 = 文档.lineAt(i)
                    let 行文本 = 行对象.text
                    let 匹配 = 行文本.match(/^(\s*\/\/\s?)(@|@@){(.+)}@(\s+)?$/)
                    if (匹配 && 匹配.length > 3) {
                        let 前缀 = 匹配[1]
                        let 性质字符 = 匹配[2]
                        let 词典主体 = 匹配[3]
                        if (词典主体.trim()) {
                            let 词典分组 = 词典主体.split(",")
                            let 新的键值组: string[] = []
                            词典分组.forEach(词典键值 => {
                                let 词典键值组 = 词典键值.split(":")
                                let 新键值 = ""
                                if (词典键值组.length === 2) {
                                    let 原来的键 = 词典键值组[0].trim()
                                    let 原来的值 = 词典键值组[1].trim()
                                    新键值 = [原来的值, 原来的键].join(":")
                                }
                                新的键值组.push(新键值)
                            })
                            let 新词典语句 = 新的键值组.join(", ")
                            let 输出的语句 = 前缀 + 性质字符 + "{ " + 新词典语句 + " }"
                            let 新建编辑 = new TextEdit(行对象.range, 输出的语句)
                            编辑组.push(新建编辑)
                        }else{
                            let 新建编辑 = new TextEdit(行对象.rangeIncludingLineBreak, undefined)
                            编辑组.push(新建编辑)
                        }
                    }
                }
            }
            if (编辑组 && 编辑组[0]) {
                let 群体编辑器 = new WorkspaceEdit()
                群体编辑器.set(文档.uri, 编辑组)
                workspace.applyEdit(群体编辑器).then(B => {
                    let 映射集 = 工具.创建映射<工具.词典编辑[]>()
                    映射集["_chtsc.执行所有缓存的编辑命令"] = [工具.创建词典编辑指令()]
                    commands.executeCommand(编辑文档集词典语句命令._CHTSC_编辑文档集词典语句命令, 映射集)
                })
            }
        }
    }
}
