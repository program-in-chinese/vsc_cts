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
const 工具 = require("./\u5DE5\u5177");
const 引擎 = require("./\u7FFB\u8BD1\u5F15\u64CE");
const __1 = require("./\u7CFB\u7EDF");
// 全局缓存
let _CTS_已有词典库缓存;
const 网址正则 = /((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*[\.。])+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?$/;
//const 括号对正则 = /(({.+?})|(\[.+?\])|(\(.+?\))|('.+?')|(".+?")|(<.+?>)|(《.+?》)|(`.+?`)|(_.+?_)|(~.+?~)|(\*.+?\*))/g
const 正则正则 = /\/[^\*].+\/(g*)/;
//const 星号行正则 = /\*.*\*/g
// 工具结巴分词.
function 转为大写(文本) {
    return 文本.toUpperCase();
}
exports.转为大写 = 转为大写;
function 转为小写(文本) {
    return 文本.toLowerCase();
}
exports.转为小写 = 转为小写;
function 字符是空白(ch) {
    return 字符是单行空白(ch) || 字符是换行符(ch);
}
exports.字符是空白 = 字符是空白;
function 字符是单行空白(ch) {
    return ch === Charas.space ||
        ch === Charas.tab ||
        ch === Charas.verticalTab ||
        ch === Charas.formFeed ||
        ch === Charas.nonBreakingSpace ||
        ch === Charas.nextLine ||
        ch === Charas.ogham ||
        ch >= Charas.enQuad && ch <= Charas.zeroWidthSpace ||
        ch === Charas.narrowNoBreakSpace ||
        ch === Charas.mathematicalSpace ||
        ch === Charas.ideographicSpace ||
        ch === Charas.byteOrderMark;
}
exports.字符是单行空白 = 字符是单行空白;
function 字符是换行符(ch) {
    return ch === Charas.lineFeed ||
        ch === Charas.carriageReturn ||
        ch === Charas.lineSeparator ||
        ch === Charas.paragraphSeparator;
}
exports.字符是换行符 = 字符是换行符;
function 字符是大写(ch) {
    return ch <= Charas.Z && ch >= Charas.A;
}
exports.字符是大写 = 字符是大写;
function 字符是小写(ch) {
    return ch <= Charas.z && ch >= Charas.a;
}
exports.字符是小写 = 字符是小写;
function 字符是数字(ch) {
    return ch <= Charas._9 && ch >= Charas._0;
}
exports.字符是数字 = 字符是数字;
function 字符是下划线(ch) {
    return ch === Charas._;
}
exports.字符是下划线 = 字符是下划线;
function 字符是字母(ch) {
    return 字符是小写(ch) || 字符是大写(ch);
}
exports.字符是字母 = 字符是字母;
function 字符是标点符号(ch) {
    return !字符是大写(ch) && !字符是小写(ch) && !字符是数字(ch) && !字符是下划线(ch);
}
exports.字符是标点符号 = 字符是标点符号;
function 文本全为小写(文本) {
    return 文本全为字母(文本) && 文本.toLowerCase() === 文本;
}
exports.文本全为小写 = 文本全为小写;
function 文本全为大写(文本) {
    return 文本全为字母(文本) && 文本.toUpperCase() === 文本;
}
exports.文本全为大写 = 文本全为大写;
function 文本第一个字母为大写(文本) {
    return 文本 && 文本.length > 1 && 字符是大写(文本.charCodeAt(0));
}
exports.文本第一个字母为大写 = 文本第一个字母为大写;
function 文本除首字母后无大写(文本) {
    return 文本第一个字母为大写(文本) && 文本全为小写(文本.substr(1, 文本.length - 1));
}
exports.文本除首字母后无大写 = 文本除首字母后无大写;
function 文本全为符号或数字(文本) {
    return !文本全为字母(文本);
}
exports.文本全为符号或数字 = 文本全为符号或数字;
function 文本全为数字(文本) {
    return !isNaN(+文本);
}
exports.文本全为数字 = 文本全为数字;
function 文本全为字母(文本) {
    for (let i = 0; i < 文本.length; i++) {
        let ch = 文本.charCodeAt(i);
        if (ch < Charas.A) {
            return false;
        }
        else if (ch > Charas.z) {
            return false;
        }
        else if (ch < Charas.a && ch > Charas.Z) {
            return false;
        }
    }
    return true;
}
exports.文本全为字母 = 文本全为字母;
function 文本是空白文字(文本) {
    return !文本.trim();
}
exports.文本是空白文字 = 文本是空白文字;
function 文本首单词为(文本) {
    if (文本全为小写(文本)) {
        return 文本;
    }
    let 结果 = "";
    for (var i = 0; i < 文本.length; i++) {
        var ch = 文本.charCodeAt(i);
        if (字符是小写(ch)) {
            结果 += String.fromCharCode(ch);
        }
        else {
            break;
        }
    }
    return 结果;
}
exports.文本首单词为 = 文本首单词为;
function 文本尾字母为(文本, 指定尾字母) {
    let 值 = 文本.lastIndexOf(指定尾字母);
    return 值 != -1 && 文本.length - 指定尾字母.length === 值;
}
exports.文本尾字母为 = 文本尾字母为;
function 文本是接口(文本) {
    return 文本.length > 2 && Charas.I === 文本.charCodeAt(0) && (文本.charCodeAt(1) > Charas.A && 文本.charCodeAt(1) < Charas.Z);
}
exports.文本是接口 = 文本是接口;
function 字符是开括号(ch) {
    return ch === Charas.openBrace || ch === Charas.openBracket || ch === Charas.openParen;
}
exports.字符是开括号 = 字符是开括号;
function 字符是闭括号(ch) {
    return ch === Charas.closeBrace || ch === Charas.closeBracket || ch === Charas.closeParen;
}
exports.字符是闭括号 = 字符是闭括号;
function 字符是类似引号(ch) {
    return ch === Charas._ || ch === Charas.asterisk || ch === Charas.backtick || ch === Charas.doubleQuote || ch === Charas.singleQuote || ch === Charas.tilde;
}
exports.字符是类似引号 = 字符是类似引号;
function 字符是符号(ch) {
    return ch === Charas._ || ch === Charas.ampersand || ch === Charas.asterisk || ch === Charas.at || ch === Charas.backslash || ch === Charas.backtick
        || ch === Charas.bar || ch === Charas.closeBrace || ch === Charas.closeBracket || ch === Charas.closeParen || ch === Charas.colon
        || ch === Charas.doubleQuote || ch === Charas.equals || ch === Charas.exclamation || ch === Charas.greaterThan || ch === Charas.hash
        || ch === Charas.lessThan || ch === Charas.minus || ch === Charas.openBrace || ch === Charas.openBracket || ch === Charas.openParen || ch === Charas.percent
        || ch === Charas.plus || ch === Charas.question || ch === Charas.semicolon || ch === Charas.singleQuote || ch === Charas.slash || ch === Charas.tilde;
}
exports.字符是符号 = 字符是符号;
function 字符是成对符号(ch) {
    return ch === Charas.backtick || ch === Charas.doubleQuote || ch === Charas.singleQuote;
}
exports.字符是成对符号 = 字符是成对符号;
var Charas;
(function (Charas) {
    Charas[Charas["nullCharacter"] = 0] = "nullCharacter";
    Charas[Charas["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
    Charas[Charas["lineFeed"] = 10] = "lineFeed";
    Charas[Charas["carriageReturn"] = 13] = "carriageReturn";
    Charas[Charas["lineSeparator"] = 8232] = "lineSeparator";
    Charas[Charas["paragraphSeparator"] = 8233] = "paragraphSeparator";
    Charas[Charas["nextLine"] = 133] = "nextLine";
    // Unicode 3.0 space characters
    Charas[Charas["space"] = 32] = "space";
    Charas[Charas["nonBreakingSpace"] = 160] = "nonBreakingSpace";
    Charas[Charas["enQuad"] = 8192] = "enQuad";
    Charas[Charas["emQuad"] = 8193] = "emQuad";
    Charas[Charas["enSpace"] = 8194] = "enSpace";
    Charas[Charas["emSpace"] = 8195] = "emSpace";
    Charas[Charas["threePerEmSpace"] = 8196] = "threePerEmSpace";
    Charas[Charas["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
    Charas[Charas["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
    Charas[Charas["figureSpace"] = 8199] = "figureSpace";
    Charas[Charas["punctuationSpace"] = 8200] = "punctuationSpace";
    Charas[Charas["thinSpace"] = 8201] = "thinSpace";
    Charas[Charas["hairSpace"] = 8202] = "hairSpace";
    Charas[Charas["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
    Charas[Charas["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
    Charas[Charas["ideographicSpace"] = 12288] = "ideographicSpace";
    Charas[Charas["mathematicalSpace"] = 8287] = "mathematicalSpace";
    Charas[Charas["ogham"] = 5760] = "ogham";
    Charas[Charas["_"] = 95] = "_";
    Charas[Charas["$"] = 36] = "$";
    Charas[Charas["_0"] = 48] = "_0";
    Charas[Charas["_1"] = 49] = "_1";
    Charas[Charas["_2"] = 50] = "_2";
    Charas[Charas["_3"] = 51] = "_3";
    Charas[Charas["_4"] = 52] = "_4";
    Charas[Charas["_5"] = 53] = "_5";
    Charas[Charas["_6"] = 54] = "_6";
    Charas[Charas["_7"] = 55] = "_7";
    Charas[Charas["_8"] = 56] = "_8";
    Charas[Charas["_9"] = 57] = "_9";
    Charas[Charas["a"] = 97] = "a";
    Charas[Charas["b"] = 98] = "b";
    Charas[Charas["c"] = 99] = "c";
    Charas[Charas["d"] = 100] = "d";
    Charas[Charas["e"] = 101] = "e";
    Charas[Charas["f"] = 102] = "f";
    Charas[Charas["g"] = 103] = "g";
    Charas[Charas["h"] = 104] = "h";
    Charas[Charas["i"] = 105] = "i";
    Charas[Charas["j"] = 106] = "j";
    Charas[Charas["k"] = 107] = "k";
    Charas[Charas["l"] = 108] = "l";
    Charas[Charas["m"] = 109] = "m";
    Charas[Charas["n"] = 110] = "n";
    Charas[Charas["o"] = 111] = "o";
    Charas[Charas["p"] = 112] = "p";
    Charas[Charas["q"] = 113] = "q";
    Charas[Charas["r"] = 114] = "r";
    Charas[Charas["s"] = 115] = "s";
    Charas[Charas["t"] = 116] = "t";
    Charas[Charas["u"] = 117] = "u";
    Charas[Charas["v"] = 118] = "v";
    Charas[Charas["w"] = 119] = "w";
    Charas[Charas["x"] = 120] = "x";
    Charas[Charas["y"] = 121] = "y";
    Charas[Charas["z"] = 122] = "z";
    Charas[Charas["A"] = 65] = "A";
    Charas[Charas["B"] = 66] = "B";
    Charas[Charas["C"] = 67] = "C";
    Charas[Charas["D"] = 68] = "D";
    Charas[Charas["E"] = 69] = "E";
    Charas[Charas["F"] = 70] = "F";
    Charas[Charas["G"] = 71] = "G";
    Charas[Charas["H"] = 72] = "H";
    Charas[Charas["I"] = 73] = "I";
    Charas[Charas["J"] = 74] = "J";
    Charas[Charas["K"] = 75] = "K";
    Charas[Charas["L"] = 76] = "L";
    Charas[Charas["M"] = 77] = "M";
    Charas[Charas["N"] = 78] = "N";
    Charas[Charas["O"] = 79] = "O";
    Charas[Charas["P"] = 80] = "P";
    Charas[Charas["Q"] = 81] = "Q";
    Charas[Charas["R"] = 82] = "R";
    Charas[Charas["S"] = 83] = "S";
    Charas[Charas["T"] = 84] = "T";
    Charas[Charas["U"] = 85] = "U";
    Charas[Charas["V"] = 86] = "V";
    Charas[Charas["W"] = 87] = "W";
    Charas[Charas["X"] = 88] = "X";
    Charas[Charas["Y"] = 89] = "Y";
    Charas[Charas["Z"] = 90] = "Z";
    Charas[Charas["ampersand"] = 38] = "ampersand";
    /** * */
    Charas[Charas["asterisk"] = 42] = "asterisk";
    Charas[Charas["at"] = 64] = "at";
    Charas[Charas["backslash"] = 92] = "backslash";
    /** ` */
    Charas[Charas["backtick"] = 96] = "backtick";
    Charas[Charas["bar"] = 124] = "bar";
    Charas[Charas["caret"] = 94] = "caret";
    /** 大关闭 } */
    Charas[Charas["closeBrace"] = 125] = "closeBrace";
    Charas[Charas["closeBracket"] = 93] = "closeBracket";
    Charas[Charas["closeParen"] = 41] = "closeParen";
    /**冒号 : */
    Charas[Charas["colon"] = 58] = "colon";
    /**逗号 , */
    Charas[Charas["comma"] = 44] = "comma";
    /** 点 . */
    Charas[Charas["dot"] = 46] = "dot";
    /**双引号 " */
    Charas[Charas["doubleQuote"] = 34] = "doubleQuote";
    Charas[Charas["equals"] = 61] = "equals";
    Charas[Charas["exclamation"] = 33] = "exclamation";
    Charas[Charas["greaterThan"] = 62] = "greaterThan";
    Charas[Charas["hash"] = 35] = "hash";
    Charas[Charas["lessThan"] = 60] = "lessThan";
    Charas[Charas["minus"] = 45] = "minus";
    /**大打开 { */
    Charas[Charas["openBrace"] = 123] = "openBrace";
    Charas[Charas["openBracket"] = 91] = "openBracket";
    Charas[Charas["openParen"] = 40] = "openParen";
    Charas[Charas["percent"] = 37] = "percent";
    Charas[Charas["plus"] = 43] = "plus";
    Charas[Charas["question"] = 63] = "question";
    /** 分号 ; */
    Charas[Charas["semicolon"] = 59] = "semicolon";
    /** 单引号  ' */
    Charas[Charas["singleQuote"] = 39] = "singleQuote";
    Charas[Charas["slash"] = 47] = "slash";
    Charas[Charas["tilde"] = 126] = "tilde";
    Charas[Charas["backspace"] = 8] = "backspace";
    Charas[Charas["formFeed"] = 12] = "formFeed";
    Charas[Charas["byteOrderMark"] = 65279] = "byteOrderMark";
    Charas[Charas["tab"] = 9] = "tab";
    Charas[Charas["verticalTab"] = 11] = "verticalTab";
})(Charas = exports.Charas || (exports.Charas = {}));
var 单词属性;
(function (单词属性) {
    单词属性[单词属性["\u65E0"] = 0] = "\u65E0";
    单词属性[单词属性["\u5168\u4E3A\u5C0F\u5199"] = 1] = "\u5168\u4E3A\u5C0F\u5199";
    单词属性[单词属性["\u5168\u4E3A\u5927\u5199"] = 2] = "\u5168\u4E3A\u5927\u5199";
    单词属性[单词属性["\u5168\u4E3A\u6570\u5B57"] = 4] = "\u5168\u4E3A\u6570\u5B57";
    单词属性[单词属性["\u5168\u4E3A\u5B57\u6BCD"] = 8] = "\u5168\u4E3A\u5B57\u6BCD";
    单词属性[单词属性["\u5168\u4E3A\u7B26\u53F7\u6216\u6570\u5B57"] = 16] = "\u5168\u4E3A\u7B26\u53F7\u6216\u6570\u5B57";
    单词属性[单词属性["\u7B2C\u4E00\u4E2A\u5B57\u6BCD\u4E3A\u5927\u5199"] = 32] = "\u7B2C\u4E00\u4E2A\u5B57\u6BCD\u4E3A\u5927\u5199";
    单词属性[单词属性["\u9664\u9996\u5B57\u6BCD\u540E\u65E0\u5927\u5199"] = 64] = "\u9664\u9996\u5B57\u6BCD\u540E\u65E0\u5927\u5199";
    单词属性[单词属性["\u5305\u542B\u7B26\u53F7\u6216\u6570\u5B57"] = 128] = "\u5305\u542B\u7B26\u53F7\u6216\u6570\u5B57";
    单词属性[单词属性["\u662F\u590D\u6570"] = 256] = "\u662F\u590D\u6570";
    单词属性[单词属性["\u662F\u53CD\u4E49\u8BCD"] = 512] = "\u662F\u53CD\u4E49\u8BCD";
    单词属性[单词属性["\u662F\u63A5\u53E3"] = 131072] = "\u662F\u63A5\u53E3";
    单词属性[单词属性["\u662F\u7B80\u5199"] = 262144] = "\u662F\u7B80\u5199";
    单词属性[单词属性["React\u6807\u7B7E"] = 524288] = "React\u6807\u7B7E";
    单词属性[单词属性["\u662F\u7A7A\u767D"] = 1048576] = "\u662F\u7A7A\u767D";
    单词属性[单词属性["\u4E0D\u9700\u8981\u7FFB\u8BD1"] = 20] = "\u4E0D\u9700\u8981\u7FFB\u8BD1";
    单词属性[单词属性["\u9700\u8981\u7FFB\u8BD1\u65F6\u786E\u5B9A"] = 262912] = "\u9700\u8981\u7FFB\u8BD1\u65F6\u786E\u5B9A";
    单词属性[单词属性["\u9700\u8981\u524D\u7F00"] = 655362] = "\u9700\u8981\u524D\u7F00";
    单词属性[单词属性["\u9700\u8981\u540E\u7F00"] = 262178] = "\u9700\u8981\u540E\u7F00";
    单词属性[单词属性["\u9700\u8981\u8303\u56F4\u68C0\u67E5"] = 65] = "\u9700\u8981\u8303\u56F4\u68C0\u67E5";
    单词属性[单词属性["\u9700\u8981\u8BED\u8A00\u670D\u52A1\u652F\u6301"] = 524288] = "\u9700\u8981\u8BED\u8A00\u670D\u52A1\u652F\u6301";
})(单词属性 = exports.单词属性 || (exports.单词属性 = {}));
function 插入标识符别名数据缓存(标识符组, 是否写入库) {
    if (!是数组(标识符组)) {
        标识符组 = [标识符组];
    }
    let 总库存 = 读取别名库文件();
    let 标识符库 = 总库存.标识符别名库;
    for (let 标识符 of 标识符组) {
        let 原内容 = 标识符库[标识符.文本];
        if (!原内容) {
            标识符库[标识符.文本] = 标识符别名入库转换(标识符);
        }
        else {
            标识符库[标识符.文本] = Object.assign({}, 原内容, 标识符别名入库转换(标识符));
        }
    }
    if (是否写入库) {
        写入词典库文件();
    }
}
exports.插入标识符别名数据缓存 = 插入标识符别名数据缓存;
function 标识符别名入库转换(标识符) {
    if (!是库内标识符别名(标识符)) {
        if (标识符.组成索引) {
            let 组 = [];
            for (let i = 0; i < 标识符.组成索引.length; i++) {
                let v = 标识符.组成索引[i];
                组.push(v.文本);
            }
            标识符 = Object.assign({}, 标识符, { 组成索引: 组 });
            return 标识符;
        }
        else {
            return 标识符;
        }
    }
    else {
        return 标识符;
    }
}
exports.标识符别名入库转换 = 标识符别名入库转换;
function 标识符别名出库转换(标识符) {
    if (是库内标识符别名(标识符)) {
        if (标识符.组成索引) {
            let 组 = [];
            for (let i = 0; i < 标识符.组成索引.length; i++) {
                let v = 标识符.组成索引[i];
                组.push(取标识符别名库储存(v));
            }
            标识符 = Object.assign({}, 标识符, { 组成索引: 组 });
            return 标识符;
        }
        else {
            return 标识符;
        }
    }
    else {
        return 标识符;
    }
}
exports.标识符别名出库转换 = 标识符别名出库转换;
function 是库内标识符别名(标识符) {
    if (标识符 && 标识符.组成索引 && (typeof 标识符.组成索引[0] === "string")) {
        return true;
    }
    return false;
}
exports.是库内标识符别名 = 是库内标识符别名;
function 取标识符别名库储存(标识符) {
    let 索引 = 标识符;
    if (typeof 标识符 !== "string") {
        索引 = 标识符.文本;
    }
    let 值 = 读取别名库文件().标识符别名库[索引];
    return 标识符别名出库转换(值);
}
exports.取标识符别名库储存 = 取标识符别名库储存;
function 翻译标识符(标识符) {
    return __awaiter(this, void 0, void 0, function* () {
        let 库内存在 = 取标识符别名库储存(标识符);
        if (库内存在) {
            if (库内存在.组成索引 && 库内存在.组成索引[0]) {
                库内存在.整体译文 = 工具.筛选标识符文本(库内存在.整体译文);
                库内存在.组合译文 = 工具.筛选标识符文本(库内存在.组合译文);
            }
            return 库内存在;
        }
        else {
            let 值 = yield 标识符分组翻译(标识符);
            return 值;
        }
    });
}
exports.翻译标识符 = 翻译标识符;
function 翻译注释(文本) {
    return __awaiter(this, void 0, void 0, function* () {
        let 结果 = yield 处理注释文本(文本);
        let { 新组, 键值映射 } = 结果;
        for (let i = 0; i < 新组.length; i++) {
            let 行值 = 新组[i];
            if (行值) {
                行值 = yield 翻译长文本(分割为可翻译文本([行值]));
                行值 = 行值.replace(/\[.+?\]/g, S => {
                    S = S.replace(/\s+/g, "");
                    let 库内 = 键值映射.get(S);
                    if (库内) {
                        return 库内.值;
                    }
                    else {
                        return S;
                    }
                });
            }
            新组[i] = 行值;
        }
        return 新组.join(" \n");
    });
}
exports.翻译注释 = 翻译注释;
function 标识符分组翻译(标识符) {
    return __awaiter(this, void 0, void 0, function* () {
        let 分割组 = 分割文本(标识符.文本);
        let 组索引 = [];
        if (分割组) {
            for (let i = 0; i < 分割组.length; i++) {
                let 库内存在 = 取标识符别名库储存(分割组[i].文本);
                if (库内存在) {
                    分割组[i] = 库内存在;
                }
                else if (不需要翻译(分割组[i])) {
                    分割组[i].整体译文 = 分割组[i].文本;
                    分割组[i].组合译文 = 分割组[i].文本;
                    插入标识符别名数据缓存(分割组[i]);
                }
                else if (分割组[i].文本.length < 3) {
                    let 库内 = 内置英汉键值映射.get(分割组[i].文本);
                    let 大写;
                    if ((分割组[i].属性 & 单词属性.全为字母) !== 0) {
                        大写 = 分割组[i].文本.toUpperCase();
                    }
                    分割组[i].整体译文 = 库内 || 大写 || 分割组[i].文本;
                    分割组[i].组合译文 = 分割组[i].整体译文;
                    插入标识符别名数据缓存(分割组[i]);
                }
                else {
                    分割组[i] = yield 翻译结果(分割组[i]);
                    插入标识符别名数据缓存(分割组[i]);
                }
                if (分割组[i].文本 !== 标识符.文本) {
                    组索引.push(分割组[i]);
                }
            }
        }
        if (!标识符.整体译文) {
            let 翻译 = yield 翻译结果(分割组, 标识符.文本);
            标识符.整体译文 = 工具.筛选标识符文本(翻译.整体译文);
            标识符.属性 = 翻译.属性;
            标识符.组合译文 = 工具.筛选标识符文本(翻译.组合译文);
        }
        标识符.组成索引 = 组索引;
        return 标识符;
    });
}
function 翻译长文本(文本组) {
    return __awaiter(this, void 0, void 0, function* () {
        let 译文 = "";
        if (!文本组) {
            return "";
        }
        for (let i = 0; i < 文本组.length; i++) {
            let v = 文本组[i];
            let 结果 = yield 引擎.翻译器(v);
            if (结果) {
                if (引擎.是有道错误(结果) || 引擎.是百度错误(结果)) {
                    译文 = "";
                }
                else if (引擎.是百度结果(结果)) {
                    if (结果.trans_result && 结果.trans_result[0]) {
                        译文 += 结果.trans_result[0].dst;
                    }
                }
                else if (引擎.是有道结果(结果)) {
                    if (结果.translation && 结果.translation[0]) {
                        译文 += 结果.translation[0];
                    }
                }
            }
        }
        return 译文;
    });
}
function 翻译结果(单词, 文本) {
    return __awaiter(this, void 0, void 0, function* () {
        let 文本数组 = [];
        let 标识符属性 = 单词属性.无;
        if (!是数组(单词)) {
            单词 = [单词];
        }
        let 值 = "";
        let 前 = "";
        let 中 = "";
        let 分 = "";
        let 后 = "";
        单词.forEach((v, i) => {
            标识符属性 |= v.属性;
            文本数组.push(v.文本);
            if (i === 0) {
                switch (v.文本) {
                    case "is":
                        前 += "是";
                        break;
                    case "on":
                        前 += "正在";
                        break;
                    case "in":
                    case "at":
                    case "At":
                        前 += "在";
                        break;
                    case "to":
                        前 += "转成";
                        break;
                    case "get":
                        前 += "取";
                        break;
                    case "set":
                        前 += "置";
                        break;
                }
                if (!前) {
                    中 += v.整体译文 || v.组合译文 || v.用户选择文本 && v.用户选择文本[0] || v.文本;
                }
            }
            else if (v.文本 === "Of") {
                分 = "的";
            }
            else {
                if ((v.属性 & 单词属性.是复数) !== 0) {
                    if (!v.整体译文) {
                        v.整体译文 = v.组合译文 || v.用户选择文本 && v.用户选择文本[0] || v.文本;
                    }
                    v.整体译文 += "组";
                }
                if (分 === "的") {
                    后 += v.整体译文 || v.组合译文 || v.用户选择文本 && v.用户选择文本[0] || v.文本;
                }
                if (!分 && !后) {
                    中 += v.整体译文 || v.组合译文 || v.用户选择文本 && v.用户选择文本[0] || v.文本;
                }
            }
        });
        if (分 && 后) {
            值 = 前 + 后 + 分 + 中;
        }
        else {
            值 = 前 + 中 + 后 + 分;
        }
        let 主译 = yield 引擎.翻译器(文本数组);
        let 整体译文 = 分析单词翻译结果(主译 ? 主译 : undefined, 文本数组.join(""));
        let 结果 = 工具.创建对象();
        结果.文本 = 文本 || 单词[0].文本;
        结果.属性 = 标识符属性;
        结果.组合译文 = 值;
        结果.整体译文 = 整体译文 && 整体译文[0] && 整体译文[0].译文;
        return 结果;
    });
}
function 分析单词翻译结果(结果, 原文) {
    if (!结果) {
        return [];
    }
    let 译文组 = [];
    if (引擎.是百度结果(结果)) {
        let 数组值 = 结果.trans_result;
        if (数组值 && 数组值[0]) {
            数组值.forEach((值, i) => {
                let 译文 = 工具.创建对象();
                译文.原文 = 原文;
                译文.译文 = 值.dst;
                if (i === 0) {
                    译文.使用计数 = 1;
                }
                译文组.push(译文);
            });
        }
    }
    else if (引擎.是有道结果(结果)) {
        let 数组值 = 结果.translation;
        if (数组值 && 数组值.length > 0) {
            数组值.forEach((值, i) => {
                let 译文 = 工具.创建对象();
                译文.原文 = 原文;
                译文.译文 = 值;
                if (i === 0) {
                    译文.使用计数 = 1;
                }
                译文组.push(译文);
            });
        }
    }
    if (译文组[0]) {
        return 译文组;
    }
}
function 创建词典库目录及文件() {
    let 路径 = 结合路径(__1.系统.取系统临时文件目录(), "CHTypescript");
    let 文件名 = "CTS_词典自动翻译储存库.json";
    if (!__1.系统.目录存在(路径)) {
        __1.系统.创建目录(路径);
    }
    if (!__1.系统.文件存在(文件名)) {
        __1.系统.写文件(结合路径(路径, 文件名), `{"标识符别名库":{}}`);
    }
}
function 结合路径(path1, path2) {
    if (!(path1 && path1.length))
        return path2;
    if (!(path2 && path2.length))
        return path1;
    if (取路径根长度(path2) !== 0)
        return path2;
    if (path1.charAt(path1.length - 1) === "/")
        return path1 + path2;
    return path1 + "/" + path2;
}
function 取路径根长度(path) {
    if (path.charCodeAt(0) === Charas.slash) {
        if (path.charCodeAt(1) !== Charas.slash)
            return 1;
        const p1 = path.indexOf("/", 2);
        if (p1 < 0)
            return 2;
        const p2 = path.indexOf("/", p1 + 1);
        if (p2 < 0)
            return p1 + 1;
        return p2 + 1;
    }
    if (path.charCodeAt(1) === Charas.colon) {
        if (path.charCodeAt(2) === Charas.slash)
            return 3;
        return 2;
    }
    // Per RFC 1738 'file' URI schema has the shape file://<host>/<path>
    // if <host> is omitted then it is assumed that host value is 'localhost',
    // however slash after the omitted <host> is not removed.
    // file:///folder1/file1 - this is a correct URI
    // file://folder2/file2 - this is an incorrect URI
    if (path.lastIndexOf("file:///", 0) === 0) {
        return "file:///".length;
    }
    const idx = path.indexOf("://");
    if (idx !== -1) {
        return idx + "://".length;
    }
    return 0;
}
function 取词典库文件全名() {
    let 路径 = 结合路径(__1.系统.取系统临时文件目录(), "CHTypescript");
    let 文件名 = "CTS_词典自动翻译储存库.json";
    return 结合路径(路径, 文件名);
}
function 读取别名库文件() {
    if (!_CTS_已有词典库缓存) {
        try {
            let 内容 = __1.系统.读文件(取词典库文件全名());
            if (!内容) {
                创建词典库目录及文件();
                内容 = __1.系统.读文件(取词典库文件全名());
            }
            _CTS_已有词典库缓存 = JSON.parse(内容);
        }
        catch (err) {
            _CTS_已有词典库缓存 = {
                标识符别名库: {}
            };
        }
        finally {
            return _CTS_已有词典库缓存;
        }
    }
    return _CTS_已有词典库缓存;
}
function 写入词典库文件() {
    __1.系统.写文件(取词典库文件全名(), JSON.stringify(_CTS_已有词典库缓存));
}
function 取对应括号(ch) {
    switch (ch) {
        case Charas.openBrace:
            return Charas.closeBrace;
        case Charas.openBracket:
            return Charas.closeBracket;
        case Charas.openParen:
            return Charas.closeParen;
        case Charas.closeBrace:
            return Charas.openBrace;
        case Charas.closeBracket:
            return Charas.openBracket;
        case Charas.closeParen:
            return Charas.openParen;
        default:
            return;
    }
}
function 分割翻译注释括号内文本(文本) {
    return __awaiter(this, void 0, void 0, function* () {
        let 结果 = 分割文本(文本);
        let 返回结果 = "";
        if (结果) {
            let 半路结果 = "";
            for (let i = 0; i < 结果.length; i++) {
                let 单词 = 结果[i];
                if (((单词.属性 & 单词属性.全为字母) || (单词.属性 & 单词属性.是空白)) && 单词.文本 !== "e" && 单词.文本 !== "g" && !(单词.属性 & 单词属性.全为大写)) {
                    半路结果 += (单词.属性 & 单词属性.是空白) ? 单词.文本 : " " + 单词.文本;
                }
                else {
                    if (半路结果) {
                        返回结果 += yield 翻译普通文本(半路结果);
                        半路结果 = "";
                    }
                    返回结果 += 单词.文本;
                }
            }
            if (半路结果) {
                返回结果 += yield 翻译普通文本(半路结果);
                半路结果 = "";
            }
        }
        return 返回结果;
    });
}
function 翻译普通文本(文本) {
    return __awaiter(this, void 0, void 0, function* () {
        let 返回结果 = "";
        let 翻译结果 = yield 引擎.翻译器(文本);
        if (翻译结果) {
            if (引擎.是有道错误(翻译结果) || 引擎.是百度错误(翻译结果)) {
            }
            else if (引擎.是百度结果(翻译结果)) {
                if (翻译结果.trans_result && 翻译结果.trans_result[0]) {
                    返回结果 += 翻译结果.trans_result[0].dst;
                }
            }
            else if (引擎.是有道结果(翻译结果)) {
                if (翻译结果.translation && 翻译结果.translation[0]) {
                    返回结果 += 翻译结果.translation[0];
                }
            }
        }
        return 返回结果;
    });
}
function 处理注释文本(文本) {
    return __awaiter(this, void 0, void 0, function* () {
        文本 = 文本.replace(/\n\r/g, "\n");
        let 行组 = 文本.split("\n");
        let 总映射 = new Map();
        let 基础键值 = 1114112 + 100;
        let 新行组 = [];
        let 继续进行 = false;
        行组.forEach(H => {
            if (H) {
                let { 映射, 原始组, 键值 } = 循环分割(H, 基础键值);
                新行组.push((原始组 && 原始组.join("")) || H);
                映射.forEach((v, k) => {
                    总映射.set(k, v);
                });
                基础键值 = 键值;
            }
            else {
                新行组.push(H);
            }
        });
        for (let vv of 总映射) {
            let k = vv[0];
            let v = vv[1];
            if (v) {
                if (v.值.length > 1) {
                    let 原始组 = [];
                    if (正则正则.test(v.值)) {
                        原始组.push(v.值);
                    }
                    else {
                        let 首 = v.值.charCodeAt(0);
                        let 尾 = v.值.charCodeAt(v.值.length - 1);
                        let 中 = v.值.substring(1, v.值.length - 1);
                        let 首键 = 首 === 42 ? "`" : String.fromCharCode(首);
                        原始组.push(首键);
                        if (!网址正则.test(中)) {
                            let 翻译 = yield 分割翻译注释括号内文本(中);
                            原始组.push(翻译);
                        }
                        else {
                            原始组.push(中);
                        }
                        let 尾键 = 尾 === 42 ? "`" : String.fromCharCode(尾);
                        原始组.push(尾键);
                    }
                    总映射.set(k, { 键: k, 值: 原始组 && 原始组.join("") || v.值 });
                }
                else {
                    if (v.值 === "-") {
                        v.值 = "- ";
                    }
                    总映射.set(k, v);
                }
            }
        }
        return { 新组: 新行组, 键值映射: 总映射 };
        function 循环分割(H, 键值) {
            let pos = 0;
            let end = 0;
            let ch = 0;
            let 字母空格 = "";
            let 原始组 = [];
            let 映射 = new Map();
            let 括号没有闭合 = false;
            let 符号没有闭合 = false;
            let 临时括号组 = [];
            while (true) {
                if (pos >= H.length) {
                    break;
                }
                ch = H.charCodeAt(pos);
                if (字符是字母(ch) || 字符是单行空白(ch)) {
                    字母空格 += String.fromCharCode(ch);
                    pos++;
                }
                else {
                    if (字母空格) {
                        原始组.push(字母空格);
                        字母空格 = "";
                    }
                    if (字符是开括号(ch)) {
                        括号没有闭合 = false;
                        临时括号组.push(ch);
                        let 嵌套深度 = 0;
                        end = pos;
                        pos++;
                        while (true) {
                            if (pos >= H.length) {
                                括号没有闭合 = true;
                                break;
                            }
                            else if (字符是开括号(H.charCodeAt(pos))) {
                                临时括号组.push(H.charCodeAt(pos));
                            }
                            else if (字符是闭括号(H.charCodeAt(pos))) {
                                if (临时括号组.length > 1) {
                                    let 最后一个 = 临时括号组.pop();
                                    if (取对应括号(最后一个) !== H.charCodeAt(pos)) {
                                        括号没有闭合 = true;
                                    }
                                }
                                else {
                                    let 第一个 = 临时括号组[0];
                                    if (取对应括号(第一个) === H.charCodeAt(pos)) {
                                        临时括号组 = [];
                                        break;
                                    }
                                    else {
                                        括号没有闭合 = true;
                                        break;
                                    }
                                }
                            }
                            pos++;
                        }
                        if (括号没有闭合) {
                            pos++;
                            let LH = String.fromCharCode(ch);
                            let 键 = `[${ch}]`;
                            原始组.push(键);
                            原始组.push(H.substring(end + 1, pos));
                            映射.set(键, { 键, 值: LH });
                            字母空格 = "";
                            括号没有闭合 = false;
                            end = pos;
                        }
                        else {
                            pos++;
                            let LH = H.substring(end, pos);
                            let 键 = `[${键值 += 1}]`;
                            原始组.push(键);
                            映射.set(键, { 键, 值: LH });
                            end = pos;
                        }
                    }
                    else if (字符是符号(ch) || (ch === Charas.dot && (字符是单行空白(H.charCodeAt(pos + 1)) || isNaN(H.charCodeAt(pos + 1))))) {
                        if (字符是成对符号(ch)) {
                            符号没有闭合 = false;
                            end = pos;
                            pos++;
                            while (true) {
                                if (pos >= H.length) {
                                    符号没有闭合 = true;
                                    break;
                                }
                                else if (H.charCodeAt(pos) === ch) {
                                    break;
                                }
                                pos++;
                            }
                            if (符号没有闭合) {
                                pos++;
                                let LH = String.fromCharCode(ch);
                                let 键 = `[${ch}]`;
                                原始组.push(键);
                                原始组.push(H.substring(end + 1, pos));
                                映射.set(键, { 键, 值: LH });
                                字母空格 = "";
                                符号没有闭合 = false;
                                end = pos;
                            }
                            else {
                                pos++;
                                let LH = H.substring(end, pos);
                                let 键 = `[${键值 += 1}]`;
                                原始组.push(键);
                                映射.set(键, { 键, 值: LH });
                                end = pos;
                            }
                        }
                        else {
                            if (ch === Charas.slash) {
                                let 正则文本 = H.substr(pos);
                                if (正则正则.test(正则文本)) {
                                    let 数组 = 正则文本.match(正则正则);
                                    if (数组 && 数组[0]) {
                                        let 内容 = 数组[0];
                                        let 键 = `[${键值 += 1}]`;
                                        映射.set(键, { 键, 值: 内容 });
                                        pos += 内容.length;
                                        原始组.push(键);
                                    }
                                }
                                else {
                                    pos++;
                                }
                            }
                            else {
                                let LH = String.fromCharCode(ch);
                                let 键 = `[${ch}]`;
                                原始组.push(键);
                                映射.set(键, { 键, 值: LH });
                                pos++;
                            }
                        }
                    }
                    else {
                        字母空格 += String.fromCharCode(ch);
                        pos++;
                    }
                }
            }
            if (字母空格) {
                原始组.push(字母空格);
            }
            return { 映射, 原始组, 键值 };
        }
    });
}
function 分割文本(文本) {
    let 数组 = 驼峰名称扫描分组().扫描分组(文本);
    let 结果集 = [];
    if (数组) {
        for (let i = 0; i < 数组.length; i++) {
            if (i !== 数组.length - 1 && 文本全为大写(数组[i])) {
                if (文本全为小写(数组[i + 1])) {
                    if (数组[i].length > 0) {
                        let 尾部大写字母 = 数组[i].substr(-1);
                        数组[i + 1] = 尾部大写字母 + 数组[i + 1];
                        数组[i] = 数组[i].substr(0, 数组[i].length - 1);
                    }
                }
            }
            if (数组[i] !== "") {
                结果集.push(数组[i]);
            }
        }
    }
    if (!结果集[0]) {
        结果集[0] = 文本;
    }
    let 单词组 = [];
    for (let i = 0; i < 结果集.length; i++) {
        let 单词值 = 工具.创建对象();
        单词值.文本 = 结果集[i];
        单词值.属性 = 单词属性.无;
        if (文本全为字母(结果集[i])) {
            单词值.属性 |= 单词属性.全为字母;
            if (文本全为小写(结果集[i])) {
                单词值.属性 |= 单词属性.全为小写;
            }
            else if (文本全为大写(结果集[i])) {
                单词值.属性 |= 单词属性.全为大写;
            }
        }
        else if (文本全为数字(结果集[i])) {
            单词值.属性 |= 单词属性.全为数字;
        }
        else if (文本全为符号或数字(结果集[i])) {
            单词值.属性 |= 单词属性.全为符号或数字;
        }
        if (文本第一个字母为大写(结果集[i])) {
            单词值.属性 |= 单词属性.第一个字母为大写;
            if (文本除首字母后无大写(结果集[i])) {
                单词值.属性 |= 单词属性.除首字母后无大写;
            }
        }
        if (文本是空白文字(结果集[i])) {
            单词值.属性 |= 单词属性.是空白;
        }
        if ((文本尾字母为(结果集[i], "s") && 结果集[i].length > 3 && !(文本尾字母为(结果集[i], "fves") || 文本尾字母为(结果集[i], "ss") || 文本尾字母为(结果集[i], "xs")
            || 文本尾字母为(结果集[i], "chs") || 文本尾字母为(结果集[i], "shs") || 文本尾字母为(结果集[i], "zhs")))) {
            单词值.属性 |= 单词属性.是复数;
        }
        单词组.push(单词值);
    }
    return 单词组[0] !== null ? 单词组 : undefined;
}
function 驼峰名称扫描分组() {
    let 当前文本;
    let pos;
    let end;
    let str;
    function 扫描分组(文本) {
        当前文本 = 文本;
        end = 当前文本.length;
        pos = 0;
        str = 0;
        return 取文本组();
    }
    function 取字符(增加) {
        增加 = 增加 || 0;
        if (pos + 增加 < end) {
            return 当前文本.charCodeAt(pos += 增加);
        }
        else {
            return 1;
        }
    }
    function 前进(步幅) {
        步幅 = 步幅 || 1;
        if (pos + 步幅 < end) {
            pos += 步幅;
        }
        else {
            pos = end;
        }
    }
    function 取文本() {
        let 返回值 = 当前文本.substring(str, pos);
        str = pos;
        return 返回值;
    }
    function 取文本组() {
        if (当前文本 === null) {
            return [];
        }
        let ch;
        let 临时集 = [];
        while (true) {
            ch = 取字符();
            if (pos > end || ch === 1) {
                break;
            }
            if (字符是小写(ch)) {
                while (字符是小写(ch)) {
                    前进();
                    ch = 取字符();
                }
                临时集.push(取文本());
            }
            else if (字符是大写(ch)) {
                while (字符是大写(ch)) {
                    前进();
                    ch = 取字符();
                }
                临时集.push(取文本());
            }
            else {
                while (!字符是小写(ch) && !字符是大写(ch) && ch !== 1) {
                    前进();
                    ch = 取字符();
                }
                临时集.push(取文本());
            }
        }
        return 临时集[0] ? 临时集 : [当前文本];
    }
    return {
        扫描分组
    };
}
function 分割为可翻译文本(文本组) {
    let 总组 = [];
    if (!(文本组 || 文本组[0])) {
        return;
    }
    文本组.forEach(文本 => {
        let 结果 = 分割文本(文本);
        let 总 = [];
        结果.forEach(v => {
            总.push(v.文本);
        });
        总组.push(总);
    });
    return 总组;
}
function 分割长文本(文本, 长度 = 1900) {
    if (!文本) {
        return;
    }
    let 位置 = 0;
    let 文本组 = [];
    function 分割(文本) {
        if (文本.length > 长度) {
            let 分割位 = 文本.substr(0, 长度).lastIndexOf(" ");
            位置 = 分割位 > 0 ? 分割位 : 长度;
            return 文本.substr(0, 位置);
        }
        else {
            位置 = 文本.length;
            return 文本;
        }
    }
    while (文本) {
        文本组.push(分割(文本));
        文本 = 文本.substr(位置);
    }
    return 文本组;
}
function 不需要翻译(单词) {
    return (单词.属性 & 单词属性.不需要翻译) !== 0;
}
function 需要翻译时确定(单词) {
    return (单词.属性 & 单词属性.需要翻译时确定) !== 0;
}
function 需要前缀(单词) {
    return (单词.属性 & 单词属性.需要前缀) !== 0;
}
function 需要后缀(单词) {
    return (单词.属性 & 单词属性.需要后缀) !== 0;
}
function 需要范围检查(单词) {
    return (单词.属性 & 单词属性.需要范围检查) !== 0;
}
function 需要语言服务支持(单词) {
    return (单词.属性 & 单词属性.需要语言服务支持) !== 0;
}
function 是数组(value) {
    return Array.isArray ? Array.isArray(value) : value instanceof Array;
}
const 内置英汉键值映射 = 创建内置词典({
    "string": '文字',
    'number': '数字',
    'symbol': '符号',
    'function': '函数',
    'boolean': '真假',
    'null': '空',
    'true': '真',
    'false': '假',
    'void': '无值',
    'never': '不可及',
    'object': '基对象',
    '__type': '__类型',
    'unknown': '未知的',
    'untyped': `类型化`,
    '__resolving__': '__解决中__',
    'any': '通用型',
    'arguments': '增强参数集',
    '__computed': '__计算',
    '__object': '__基对象',
    '__function': '__函数',
    '__jsxAttributes': '__jsx属性',
    'arg': '参数',
    'export=': '导出=',
    '__export': '__导出',
    '__index': '__索引',
    '__new': '__新建',
    '__call': '__调用',
    '__constructor': '__构造器',
    '__global': '__全局',
    '__class': '__类',
    '__missing': '__失踪节点',
    'default': '默认',
    'prototype': '原型',
    'exports': '导出集',
    'ThisType': '本对象类型类',
    'Array': '数组类',
    'Object': '基对象类',
    'Function': '函数类',
    'String': '文字类',
    'Number': '数字类',
    'Boolean': '真假类',
    'RegExp': '正则表达式类',
    'abstract': '抽象',
    'as': '转为',
    'break': '跳出',
    'case': '为',
    'catch': '捕获',
    'class': '类',
    'continue': '继续',
    'const': '常量',
    'constructor': '构造器',
    'debugger': '调试',
    'declare': '声明',
    'delete': '删除',
    'do': '开始',
    'else': '否则',
    'enum': '枚举',
    'export': '导出',
    'extends': '扩展',
    'finally': '最后',
    'for': '循环',
    'from': '从',
    'get': '取',
    'if': '如果',
    'implements': '实现',
    'import': '引入',
    'in': '在',
    'instanceof': '类为',
    'interface': '接口',
    'is': '是',
    'keyof': '键为',
    'let': '变量',
    'module': '模块',
    'namespace': '名称空间',
    'new': '新建',
    'package': '包',
    'private': '私有',
    'protected': '保护',
    'public': '公开',
    'readonly': '只读',
    'require': '需要',
    'global': '全局',
    'return': '返回',
    'set': '置',
    'static': '静态',
    'super': '父构造器',
    'switch': '假如',
    'this': '本对象',
    'throw': '抛出',
    'try': '尝试',
    'type': '类型',
    'typeof': '类型为',
    'var': '自由变量',
    'while': '判断循环',
    'with': '外扩',
    'yield': '获得',
    'async': '异步',
    'await': '等待',
    'of': '属于',
    'IArguments': '所有参数接口',
    'ReadonlyArray': '只读数组类',
});
function 创建内置词典(参数) {
    let 值 = new Map();
    for (let 键 in 参数) {
        值.set(键, 参数[键]);
    }
    return 值;
}
