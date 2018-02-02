"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class 输入法上屏命令 {
    constructor() {
        this.需要删除上屏字符 = false;
        let 处理垃圾 = [];
        vscode_1.workspace.onDidChangeTextDocument(this.监听输入, this, 处理垃圾);
        this.清理 = vscode_1.Disposable.from(...处理垃圾);
    }
    输入法上屏命令(文本) {
        if (文本) {
            vscode_1.commands.executeCommand("vsc.保存用户词典", 文本);
        }
        this.需要删除上屏字符 = true;
    }
    dispose() {
        this.清理.dispose();
    }
    监听输入(事件) {
        if (this.需要删除上屏字符 && 事件) {
            if (/^\s+$/g.test(事件.contentChanges[0].text)) {
                vscode_1.window.activeTextEditor.edit(编辑 => {
                    编辑.delete(new vscode_1.Range(事件.contentChanges[0].range.start, new vscode_1.Position(事件.contentChanges[0].range.end.line, 事件.contentChanges[0].range.end.character + 事件.contentChanges[0].text.length)));
                });
            }
            this.需要删除上屏字符 = false;
        }
    }
}
输入法上屏命令.__ctsscript_输入法上屏命令 = 'ctsscript.输入法上屏命令';
exports.输入法上屏命令 = 输入法上屏命令;
//# sourceMappingURL=输入法.js.map