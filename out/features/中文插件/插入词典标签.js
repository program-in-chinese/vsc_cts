"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function 尝试插入词典标签(标签名) {
    if (vscode_1.window.activeTextEditor) {
        let 当前编辑器 = vscode_1.window.activeTextEditor;
        let 当前文档 = vscode_1.window.activeTextEditor.document;
        let 选择 = 当前编辑器.selection;
        let 当前行对象 = 当前文档.lineAt(选择.isReversed ? 选择.anchor.line : 选择.active.line);
        let 行 = 选择.isReversed ? 选择.anchor.line : 选择.active.line;
        let 前部空格 = 当前行对象.text.substring(0, 当前行对象.firstNonWhitespaceCharacterIndex);
        let 词典头 = 前部空格 + 标签名 + "\n";
        let 位置 = new vscode_1.Position(行, 0);
        if (当前行对象.isEmptyOrWhitespace) {
            词典头 = 前部空格 + 标签名;
        }
        if (/^\s*\/\/+\s?(@|@@)\{.+$/.test(当前行对象.text)) {
            位置 = new vscode_1.Position(行 + 1, 0);
        }
        当前编辑器.edit(E => {
            E.replace(位置, 词典头);
        });
        let 新位置 = new vscode_1.Position(位置.line, 词典头.lastIndexOf("{") + 1);
        let 新选择 = new vscode_1.Selection(新位置, 新位置);
        当前编辑器.selection = 新选择;
    }
}
exports.尝试插入词典标签 = 尝试插入词典标签;
