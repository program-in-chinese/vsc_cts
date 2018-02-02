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
class 声明词典格式化 {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'ctsscript.声明词典格式化';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const 编辑器 = vscode_1.window.activeTextEditor;
            if (编辑器) {
                let 文档 = 编辑器 && 编辑器.document;
                if (文档 && 文档.languageId === "ctsscript") {
                    let 文档路径 = this.lazyClientHost().normalizePath(文档.uri);
                    if (文档路径 && this.扩展名是(文档路径, ".cts")) {
                        let 源码文本 = yield this.lazyClientHost().execute("格式化词典语句", { file: 文档路径 });
                        if (源码文本 && 源码文本.body) {
                            let 范围 = new vscode_1.Range(new vscode_1.Position(0, 0), 文档.lineAt(文档.lineCount - 1).range.end);
                            编辑器.edit(E => {
                                E.replace(范围, 源码文本.body);
                            });
                        }
                    }
                    else {
                        vscode_1.window.showErrorMessage('转换前请先将文件扩展名改为: ".cts", 声明文件扩展名改为: ".d.cts"。');
                    }
                }
            }
        });
    }
    扩展名是(路径, 比较名) {
        let 位置 = 路径.lastIndexOf(".");
        if (位置 !== -1) {
            let 扩展名 = 路径.substring(位置);
            if (扩展名 === 比较名) {
                return true;
            }
        }
        return false;
    }
}
exports.声明词典格式化 = 声明词典格式化;
//# sourceMappingURL=声明词典格式化.js.map