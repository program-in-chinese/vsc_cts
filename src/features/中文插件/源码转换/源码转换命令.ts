
import {
    window, Range, Position
} from 'vscode';

import { ITypeScriptServiceClient } from '../../../typescriptService';

import { Command } from '../../../utils/commandManager';


export class 源码转换命令 implements Command {
    readonly id = 'ctsscript.源码转换命令';
    constructor(
        private readonly lazyClientHost: () => ITypeScriptServiceClient
    ) { }
    public async execute() {
        const 编辑器 = window.activeTextEditor
        if (编辑器) {
            let 文档 = 编辑器 && 编辑器.document
            if (文档 && 文档.languageId === "ctsscript") {
                let 文档路径 = this.lazyClientHost().normalizePath(文档.uri)
                if (文档路径 && this.扩展名是(文档路径, ".cts")) {
                    let 源码文本 = await this.lazyClientHost().execute("转为CTS", { file: 文档路径 })
                    if (源码文本 && 源码文本.body) {
                        let 范围 = new Range(new Position(0, 0), 文档.lineAt(文档.lineCount - 1).range.end)
                        编辑器.edit(E => {
                            E.replace(范围, 源码文本.body)
                        })
                    }
                } else {
                    window.showErrorMessage('转换前请先将文件扩展名改为: ".cts", 声明文件扩展名改为: ".d.cts"')
                }
            }
        }
    }
    private 扩展名是(路径: string, 比较名: string) {
        let 位置 = 路径.lastIndexOf(".")
        if (位置 !== -1) {
            let 扩展名 = 路径.substr(-位置)
            if (扩展名 === 比较名) {
                return true
            }
        }
        return false
    }
}
