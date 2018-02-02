"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class 格式化词典语句命令 {
    constructor() { }
    格式化词典语句命令(位置) {
        let 当前文档 = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
        let 当前行对象 = 当前文档 && 当前文档.lineAt(位置.line);
        if (当前行对象 && !当前行对象.isEmptyOrWhitespace) {
            let 文本 = 当前行对象.text;
            let 选择翻译体内 = 文本.match(/(\s+)?\/\/(#|##)(\s+)?{(.+)?}#/) || [];
            if (选择翻译体内.length >= 4) {
                let 词典体 = 选择翻译体内[4];
                let 新的词典体 = "";
                let 新的词典语句 = "";
                if (词典体) {
                    let 词典键值对组 = 词典体.split(",");
                    let 整理后的键值对组 = [];
                    词典键值对组.forEach(v => {
                        if (v.trim() !== "") {
                            整理后的键值对组.push(v.replace(/\s*/g, ""));
                        }
                    });
                    新的词典体 = 整理后的键值对组.join(", ");
                    if (选择翻译体内[2] === "##") {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//##{ " + 新的词典体 + " }#" : "//##{ " + 新的词典体 + " }#";
                    }
                    else {
                        新的词典语句 = 选择翻译体内[1] ? 选择翻译体内[1] + "//#{ " + 新的词典体 + " }#" : "//#{ " + 新的词典体 + " }#";
                    }
                }
                let 当前窗口编辑器 = vscode_1.window.activeTextEditor;
                if (当前窗口编辑器) {
                    当前窗口编辑器.edit(编辑 => {
                        编辑.replace(new vscode_1.Range(位置.line, 0, 位置.line, 文本.length), 新的词典语句);
                    });
                    let 文档行 = 当前文档 && 当前文档.lineAt(位置.line);
                    if (文档行) {
                        let 选择点 = new vscode_1.Position(位置.line, 文档行.range.end.character);
                        当前窗口编辑器.selection = new vscode_1.Selection(选择点, 选择点);
                    }
                }
            }
        }
    }
}
格式化词典语句命令.__ctsscript_格式化词典语句命令 = 'ctsscript.格式化词典语句命令';
exports.格式化词典语句命令 = 格式化词典语句命令;
//# sourceMappingURL=格式化词典语句.js.map