import { window, Range, Position, workspace, TextDocumentChangeEvent, Disposable, TextEdit, commands } from "vscode";

export class 输入法上屏命令 {
    static __ctsscript_输入法上屏命令 = 'ctsscript.输入法上屏命令';
    清理: Disposable
    需要删除上屏字符 = false
    清理字符: string
    constructor() {
        let 处理垃圾: Disposable[] = []
        workspace.onDidChangeTextDocument(this.监听输入, this, 处理垃圾)
        this.清理 = Disposable.from(...处理垃圾)
    }

    public 输入法上屏命令(文本: string) {
        if (文本) {
            commands.executeCommand("vsc.保存用户词典", 文本)
        }
        this.需要删除上屏字符 = true
    }

    dispose() {
        this.清理.dispose();
    }

    监听输入(事件: TextDocumentChangeEvent) {
        if (this.需要删除上屏字符 && 事件) {
            if (/^\s+$/g.test(事件.contentChanges[0].text)) {
                window.activeTextEditor.edit(编辑 => {
                    编辑.delete(new Range(事件.contentChanges[0].range.start,
                        new Position(事件.contentChanges[0].range.end.line, 事件.contentChanges[0].range.end.character + 事件.contentChanges[0].text.length)))
                })
            }
            this.需要删除上屏字符 = false
        }
    }

}
