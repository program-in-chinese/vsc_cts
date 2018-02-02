
import * as 工具 from "./工具"
import * as 引擎 from "./翻译引擎"
import { 系统 } from "./系统"
import { CompletionItemKind } from "vscode";
import { 读词典数据, 库内标识符, 新标识符 } from "./\u52A0\u8F7D\u8BCD\u5178/\u52A0\u8F7D\u8BCD\u5178";
import { 读注释缓存, 写注释缓存 } from "./\u52A0\u8F7D\u8BCD\u5178/\u52A0\u8F7D\u6CE8\u91CA\u7F13\u5B58";
 
const 网址正则 = /((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*[\.。])+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?$/
//const 括号对正则 = /(({.+?})|(\[.+?\])|(\(.+?\))|('.+?')|(".+?")|(<.+?>)|(《.+?》)|(`.+?`)|(_.+?_)|(~.+?~)|(\*.+?\*))/g
const 正则正则 = /\/[^\*].+\/(g*)/
//const 星号行正则 = /\*.*\*/g
// 工具结巴分词.
export function 转为大写(文本: string) {
    return 文本.toUpperCase()
}

export function 转为小写(文本: string) {
    return 文本.toLowerCase()
}

export function 字符是空白(ch: number): boolean {
    return 字符是单行空白(ch) || 字符是换行符(ch);
}

export function 字符是单行空白(ch: number): boolean {
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

export function 字符是换行符(ch: number): boolean {
    return ch === Charas.lineFeed ||
        ch === Charas.carriageReturn ||
        ch === Charas.lineSeparator ||
        ch === Charas.paragraphSeparator;
}
export function 字符是大写(ch: number) {
    return ch <= Charas.Z && ch >= Charas.A
}

export function 字符是小写(ch: number) {
    return ch <= Charas.z && ch >= Charas.a
}

export function 字符是数字(ch: number) {
    return ch <= Charas._9 && ch >= Charas._0
}

export function 字符是下划线(ch: number) {
    return ch === Charas._
}

export function 字符是字母(ch: number) {
    return 字符是小写(ch) || 字符是大写(ch)
}

export function 字符是标点符号(ch: number) {
    return !字符是大写(ch) && !字符是小写(ch) && !字符是数字(ch) && !字符是下划线(ch)
}

export function 文本全为小写(文本: string) {
    return 文本全为字母(文本) && 文本.toLowerCase() === 文本
}

export function 文本全为大写(文本: string) {
    return 文本全为字母(文本) && 文本.toUpperCase() === 文本
}

export function 文本第一个字母为大写(文本: string) {
    return 文本 && 文本.length > 1 && 字符是大写(文本.charCodeAt(0))
}

export function 文本除首字母后无大写(文本: string) {
    return 文本第一个字母为大写(文本) && 文本全为小写(文本.substr(1, 文本.length - 1))
}

export function 文本全为符号或数字(文本: string) {
    return !文本全为字母(文本)
}

export function 文本全为数字(文本: string) {
    return !isNaN(+文本)
}

export function 文本全为字母(文本: string) {
    for (let i = 0; i < 文本.length; i++) {
        let ch = 文本.charCodeAt(i);
        if (ch < Charas.A) {
            return false
        } else if (ch > Charas.z) {
            return false
        } else if (ch < Charas.a && ch > Charas.Z) {
            return false
        }
    }
    return true
}

export function 文本是空白文字(文本: string) {
    return !文本.trim()
}

export function 文本首单词为(文本: string) {
    if (文本全为小写(文本)) {
        return 文本
    }
    let 结果: string = ""
    for (var i = 0; i < 文本.length; i++) {
        var ch = 文本.charCodeAt(i);
        if (字符是小写(ch)) {
            结果 += String.fromCharCode(ch)
        } else {
            break
        }
    }
    return 结果
}

export function 文本尾字母为(文本: string, 指定尾字母: string) {
    let 值 = 文本.lastIndexOf(指定尾字母)
    return 值 !== -1 && 文本.length - 指定尾字母.length === 值
}

export function 文本是接口(文本: string) {
    return 文本.length > 2 && Charas.I === 文本.charCodeAt(0) && (文本.charCodeAt(1) > Charas.A && 文本.charCodeAt(1) < Charas.Z)
}


export function 字符是开括号(ch: number) {
    return ch === Charas.openBrace || ch === Charas.openBracket || ch === Charas.openParen
}


export function 字符是闭括号(ch: number) {
    return ch === Charas.closeBrace || ch === Charas.closeBracket || ch === Charas.closeParen
}

export function 字符是类似引号(ch: number) {
    return ch === Charas._ || ch === Charas.asterisk || ch === Charas.backtick || ch === Charas.doubleQuote || ch === Charas.singleQuote || ch === Charas.tilde
}

export function 字符是符号(ch: number) {
    return ch === Charas._ || ch === Charas.ampersand || ch === Charas.asterisk || ch === Charas.at || ch === Charas.backslash || ch === Charas.backtick
        || ch === Charas.bar || ch === Charas.closeBrace || ch === Charas.closeBracket || ch === Charas.closeParen || ch === Charas.colon
        || ch === Charas.doubleQuote || ch === Charas.equals || ch === Charas.exclamation || ch === Charas.greaterThan || ch === Charas.hash
        || ch === Charas.lessThan || ch === Charas.minus || ch === Charas.openBrace || ch === Charas.openBracket || ch === Charas.openParen || ch === Charas.percent
        || ch === Charas.plus || ch === Charas.question || ch === Charas.semicolon || ch === Charas.singleQuote || ch === Charas.slash || ch === Charas.tilde
}

export function 字符是成对符号(ch: number) {
    return ch === Charas.backtick || ch === Charas.doubleQuote || ch === Charas.singleQuote
}

export enum Charas {
    nullCharacter = 0,
    maxAsciiCharacter = 0x7F,
    lineFeed = 0x0A,              // \n
    carriageReturn = 0x0D,        // \r
    lineSeparator = 0x2028,
    paragraphSeparator = 0x2029,
    nextLine = 0x0085,

    // Unicode 3.0 space characters
    space = 0x0020,   // " "
    nonBreakingSpace = 0x00A0,   //
    enQuad = 0x2000,
    emQuad = 0x2001,
    enSpace = 0x2002,
    emSpace = 0x2003,
    threePerEmSpace = 0x2004,
    fourPerEmSpace = 0x2005,
    sixPerEmSpace = 0x2006,
    figureSpace = 0x2007,
    punctuationSpace = 0x2008,
    thinSpace = 0x2009,
    hairSpace = 0x200A,
    zeroWidthSpace = 0x200B,
    narrowNoBreakSpace = 0x202F,
    ideographicSpace = 0x3000,
    mathematicalSpace = 0x205F,
    ogham = 0x1680,

    _ = 0x5F,
    $ = 0x24,

    _0 = 0x30,
    _1 = 0x31,
    _2 = 0x32,
    _3 = 0x33,
    _4 = 0x34,
    _5 = 0x35,
    _6 = 0x36,
    _7 = 0x37,
    _8 = 0x38,
    _9 = 0x39,

    a = 0x61,
    b = 0x62,
    c = 0x63,
    d = 0x64,
    e = 0x65,
    f = 0x66,
    g = 0x67,
    h = 0x68,
    i = 0x69,
    j = 0x6A,
    k = 0x6B,
    l = 0x6C,
    m = 0x6D,
    n = 0x6E,
    o = 0x6F,
    p = 0x70,
    q = 0x71,
    r = 0x72,
    s = 0x73,
    t = 0x74,
    u = 0x75,
    v = 0x76,
    w = 0x77,
    x = 0x78,
    y = 0x79,
    z = 0x7A,

    A = 0x41,
    B = 0x42,
    C = 0x43,
    D = 0x44,
    E = 0x45,
    F = 0x46,
    G = 0x47,
    H = 0x48,
    I = 0x49,
    J = 0x4A,
    K = 0x4B,
    L = 0x4C,
    M = 0x4D,
    N = 0x4E,
    O = 0x4F,
    P = 0x50,
    Q = 0x51,
    R = 0x52,
    S = 0x53,
    T = 0x54,
    U = 0x55,
    V = 0x56,
    W = 0x57,
    X = 0x58,
    Y = 0x59,
    Z = 0x5a,

    ampersand = 0x26,             // &
    /** * */
    asterisk = 0x2A,              // *
    at = 0x40,                    // @
    backslash = 0x5C,             // \
    /** ` */
    backtick = 0x60,              // `
    bar = 0x7C,                   // |
    caret = 0x5E,                 // ^
    /** 大关闭 } */
    closeBrace = 0x7D,            // }
    closeBracket = 0x5D,          // ]
    closeParen = 0x29,            // )
    /**冒号 : */
    colon = 0x3A,                 // :
    /**逗号 , */
    comma = 0x2C,                 // ,
    /** 点 . */
    dot = 0x2E,                   // .
    /**双引号 " */
    doubleQuote = 0x22,           // "
    equals = 0x3D,                // =
    exclamation = 0x21,           // !
    greaterThan = 0x3E,           // >
    hash = 0x23,                  // #
    lessThan = 0x3C,              // <
    minus = 0x2D,                 // -
    /**大打开 { */
    openBrace = 0x7B,             // {
    openBracket = 0x5B,           // [
    openParen = 0x28,             // (
    percent = 0x25,               // %
    plus = 0x2B,                  // +
    question = 0x3F,              // ?
    /** 分号 ; */
    semicolon = 0x3B,             // ;
    /** 单引号  ' */
    singleQuote = 0x27,           // '
    slash = 0x2F,                 // /
    tilde = 0x7E,                 // ~

    backspace = 0x08,             // \b
    formFeed = 0x0C,              // \f
    byteOrderMark = 0xFEFF,
    tab = 0x09,                   // \t
    verticalTab = 0x0B,           // \v
}

interface 成对符号 {
    键: string,
    值: string,
    延后?: boolean,
    匹配组?: string[],
}


export type 使用记录 = {
    yw: string,
    yuw?: string,
    nu?: number
}

export enum ScriptElementKind {
    unknown = "",
    warning = "警告",
    /** predefined type (void) or keyword (class) */
    keyword = "关键字",
    /** top level script node */
    scriptElement = "脚本",
    /** module foo {} */
    moduleElement = "模块",
    /** class X {} */
    classElement = "类别",
    classElementEn = "class",
    /** var x = class X {} */
    localClassElement = "本地类别",
    /** interface Y {} */
    interfaceElement = "接口",
    interfaceElementEn = "interface",
    /** type T = ... */
    typeElement = "类型",
    /** enum E */
    enumElement = "枚举",
    enumElementEn = "enum",
    enumMemberElement = "枚举成员",
    /**
     * Inside module and script only
     * const v = ..
     */
    variableElement = "值量",
    variableElementEn = "var",
    /** Inside function */
    localVariableElement = "本地变量",
    /**
     * Inside module and script only
     * function f() { }
     */
    functionElement = "函数",
    functionElementEn = "function",
    /** Inside function */
    localFunctionElement = "本地函数",
    /** class X { [public|private]* foo() {} } */
    memberFunctionElement = "方法",
    memberFunctionElementEn = "method",
    /** class X { [public|private]* [get|set] foo:number; } */
    memberGetAccessorElement = "获取",
    memberSetAccessorElement = "设置",
    /**
     * class X { [public|private]* foo:number; }
     * interface Y { foo:number; }
     */
    memberVariableElement = "属性",
    /** class X { constructor() { } } */
    constructorImplementationElement = "构造方法",
    /** interface Y { ():number; } */
    callSignatureElement = "调用",
    /** interface Y { []:number; } */
    indexSignatureElement = "索引",
    /** interface Y { new():Y; } */
    constructSignatureElement = "construct",
    /** function foo(*Y*: string) */
    parameterElement = "参数",
    typeParameterElement = "类型参数元素",
    primitiveType = "参数类型",
    label = "标签",
    alias = "别名",
    constElement = "常量",
    letElement = "变量",
    directory = "目录",
    externalModuleName = "外部模块名称",
    /**
     * <JsxTagName attribute1 attribute2={0} />
     */
    jsxAttribute = "JSX特性",

}

export enum 标识符种类 {
    保持原文本,     //对 应: 小驼峰          方法名
    后缀_,         //对 应:  大驼峰          标识符_
    前缀_,         //对 应:  属性           _属性名
    前后_,         //系统常量:              _套接字退出信号_    或    _套接字_退出_信号_ 
    前缀_T,        //类型参数: 大写           T 以后的字母开头     T_类型参数
    前缀_R,        //React 自定义标签          R_自定义标签
    形参缩写尾____, // 形参              错误__   选项____
    全局变量_g,     // 全局变量                   g_全局变量
    程序集变量_v,   // 程序集变量  模块范围变量        c_变量
    枚举_E,        // 枚举                          E_枚举
    枚举成员_e,    // 枚举成员    e_枚举成员
    复数_s,        // 复数       复数单词_s
    get_前缀,      // get_方法  取
    set_前缀,      // set_方法  置
    is_前缀,       // is_方法   是
    on_前缀,       // on_方法   正在
    at_前缀,       // at_方法   在
    to_前缀,       // to_方法   转为
    Of_尾方法,     // indexOf   索引_位于

}

export interface 标识符别名 extends 翻译别名 {
    kind?: 标识符种类
}


export interface 翻译别名 extends 库内标识符 {
    文本: string
    属性:单词属性
}

export interface 库内标识符别名 extends 翻译别名 {
    zc?: string[]
}

export type 标识符译文 = {
    zuh?: string,
    zht?: string,
}

export enum 单词属性 {
    无 = 0,
    全为小写 = 1,
    全为大写 = 1 << 1,
    全为数字 = 1 << 2,
    全为字母 = 1 << 3,
    全为符号或数字 = 1 << 4,
    第一个字母为大写 = 1 << 5,
    除首字母后无大写 = 1 << 6,
    包含符号或数字 = 1 << 7,
    是复数 = 1 << 8,
    是空白 = 1 << 20,
    不需要翻译 = 全为数字 | 全为符号或数字,
    需要范围检查 = 全为小写 | 除首字母后无大写,
}

/*
export function 插入标识符别名数据缓存(标识符组: 标识符别名 | 标识符别名[], 是否写入库?: boolean) {
    if (!是数组(标识符组)) {
        标识符组 = [标识符组]
    }
    let 总库存 = 读取别名库文件()
    let 标识符库 = 总库存.zk
    for (let 标识符 of 标识符组) {
        let 原内容 = 标识符库[标识符.t]
        if (!原内容) {
            标识符库[标识符.t] = 标识符别名入库转换(标识符)
        } else {
            标识符库[标识符.t] = ({ ...原内容, ...标识符别名入库转换(标识符) } as 翻译别名)
        }
    }
    if (是否写入库) {
        写入词典库文件()
    }
}

export function 标识符别名入库转换(标识符: 标识符别名): 库内标识符别名 {
    if (!是库内标识符别名(标识符)) {
        if (标识符.zc) {
            let 组: string[] = []
            for (let i = 0; i < 标识符.zc.length; i++) {
                let v = 标识符.zc[i];
                组.push(v.t)
            }
            标识符 = { ...标识符, 组成索引: 组 } as 翻译别名
            return (标识符 as any) as 库内标识符别名

        } else {
            return 标识符 as 翻译别名
        }
    } else {
        return 标识符 as 翻译别名
    }
}

export function 标识符别名出库转换(标识符: 库内标识符别名): 标识符别名 {
    if (是库内标识符别名(标识符)) {
        if (标识符.zc) {
            let 组: 标识符别名[] = []
            for (let i = 0; i < 标识符.zc.length; i++) {
                let v = 标识符.zc[i];
                组.push(取标识符别名库储存(v))
            }
            标识符 = ({ ...标识符, 组成索引: 组 } as 翻译别名)
            return (标识符 as any) as 标识符别名

        } else {
            return 标识符 as 翻译别名
        }
    } else {
        return 标识符 as 翻译别名
    }
}

export function 是库内标识符别名(标识符: 标识符别名 | 库内标识符别名): 标识符 is 库内标识符别名 {
    if (标识符 && 标识符.zc && (typeof 标识符.zc[0] === "string")) {
        return true
    }
    return false
}

export function 取标识符别名库储存(标识符: 标识符别名 | string) {
    let 索引 = 标识符
    if (typeof 标识符 !== "string") {
        索引 = 标识符.t
    }
    let 值 = 读取别名库文件().zk[索引 as string]
    return 标识符别名出库转换(值)
}
*/

export async function 翻译标识符(标识符: 标识符别名) {
    let 库内存在 = 读词典数据(标识符.文本)

    if (库内存在) {
        return { 键: 标识符.文本, 库内存在 }
    } else {
        let 值 = await 标识符分组翻译(标识符)
        return 值
    }

}

export async function 翻译注释(文本: string): Promise<string> {
    let 缓存 = 系统.创建哈希(文本)
    let 库内内容 = 读注释缓存(缓存)
    if (!库内内容) {

        let 结果 = await 处理注释文本(文本)
        let { 新组, 键值映射 } = 结果
        let 输出数组: string[] = []
        for (let i = 0; i < 新组.length; i++) {
            let 行值 = 新组[i];
            if (行值) {
                行值 = await 翻译长文本(分割为可翻译文本([行值]))
                行值 = 行值.replace(/(\[.+?\])|(\(\d+?\))/g, S => {
                    S = S.replace(/\s+/g, "").replace(/\(/g, "[").replace(/\)/g, "]")
                    let 库内 = 键值映射.get(S)
                    if (库内) {
                        return 库内.值
                    } else {
                        return S
                    }
                })
            }
            输出数组.push(行值)
        }
        let 返回值 = 输出数组.join(" \n")
        写注释缓存(缓存, 返回值)
        return 返回值
    } else if (库内内容.length = 1) {
        return 库内内容[0]
    } else {
        let 基础长度 = 文本.length

        库内内容.forEach(v => {
            return v
        })
        
    }
}

async function 标识符分组翻译(标识符: 标识符别名) {

    let 分割组: 标识符别名[] = 分割文本(标识符.文本)
    let 组索引: 标识符别名[] = []

    if (分割组) {
        
        for (let i = 0; i < 分割组.length; i++) {
            let 库内存在 = 读词典数据(分割组[i].文本)

            if (库内存在) {
                分割组[i] ={文本: 分割组[i].文本,...库内存在}

            } else if (不需要翻译(分割组[i])) {
                分割组[i].整体 = 分割组[i].文本
                分割组[i].组合 = 分割组[i].文本
                插入标识符别名数据缓存(分割组[i])
            } else if (分割组[i].文本.length < 3) {
                let 库内 = 内置英汉键值映射.get(分割组[i].文本)
                let 大写: string
                if ((分割组[i].属性 & 单词属性.全为字母) !== 0) {
                    大写 = 分割组[i].文本.toUpperCase()
                }
                分割组[i].整体 = 库内 || 大写 || 分割组[i].文本
                分割组[i].组合 = 分割组[i].整体
                插入标识符别名数据缓存(分割组[i])
            } else {
                分割组[i] = await 翻译结果(分割组[i])
                插入标识符别名数据缓存(分割组[i])
            }
            if (分割组[i].文本 !== 标识符.文本) {
                组索引.push(分割组[i])
            }
        }

    }

    if (!标识符.整体) {
        let 翻译 = await 翻译结果(分割组, 标识符.文本) as 标识符别名
        标识符.整体 = 工具.筛选标识符文本(翻译.整体)
        标识符.属性 = 翻译.属性
        标识符.组合 = 工具.筛选标识符文本(翻译.组合)
    }
    标识符.zc = 组索引
    return 标识符
}

async function 翻译长文本(文本组: string[][]) {
    let 译文: string = ""
    if (!文本组) {
        return ""
    }
    for (let i = 0; i < 文本组.length; i++) {
        let v = 文本组[i]
        let 结果 = await 引擎.翻译器(v)
        if (结果) {
            if (引擎.是有道错误(结果) || 引擎.是百度错误(结果)) {
                译文 = ""
            } else if (引擎.是百度结果(结果)) {
                if (结果.trans_result && 结果.trans_result[0]) {
                    译文 += 结果.trans_result[0].dst
                }

            } else if (引擎.是有道结果(结果)) {
                if (结果.translation && 结果.translation[0]) {
                    译文 += 结果.translation[0]
                }
            }
        }
    }
    return 译文
}

async function 翻译结果(单词: 标识符别名 | 标识符别名[], 文本?: string): Promise<标识符别名> {

    let 文本数组: string[] = []
    let 标识符属性: 单词属性 = 单词属性.无
    if (!是数组(单词)) {
        单词 = [单词]
    }
    let 值 = ""
    let 前 = ""
    let 中 = ""
    let 分 = ""
    let 后 = ""
    单词.forEach((v, i) => {
        标识符属性 |= v.属性
        文本数组.push(v.文本)
        if (i === 0) {
            switch (v.文本) {
                case "is":
                    前 += "是"
                    break
                case "on":
                    前 += "正在"
                    break
                case "in":
                case "at":
                case "At":
                    前 += "在"
                    break
                case "to":
                    前 += "转为"
                    break
                case "get":
                    前 += "取"
                    break
                case "set":
                    前 += "置"
                    break
            }
            if (!前) {
                中 += v.整体 || v.组合 || v.up && v.up[0] || v.文本
            }
        } else if (v.文本 === "Of") {
            分 = "的"
        } else {
            if ((v.属性 & 单词属性.是复数) !== 0) {
                if (!v.整体) {
                    v.整体 = v.组合 || v.up && v.up[0] || v.文本
                }
                if (!v.整体.endsWith("组")) v.整体 += "组"
            }
            if (分 === "的") {
                后 += v.整体 || v.组合 || v.up && v.up[0] || v.文本
            }
            if (!分 && !后) {
                中 += v.整体 || v.组合 || v.up && v.up[0] || v.文本
            }
        }
    })
    if (分 && 后) {
        值 = 前 + 后 + 分 + 中
    } else {
        值 = 前 + 中 + 后 + 分 === "的" ? "位于" : ""
    }
    let 主译 = await 引擎.翻译器(文本数组)

    let 整体译文 = 分析单词翻译结果(主译 ? 主译 : undefined, 文本数组.join(""))

    let 结果 = 工具.创建对象<标识符别名>()
    结果.文本 = 文本 || 单词[0].元素
    结果.属性 = 标识符属性
    结果.组合 = 值
    结果.整体 = 整体译文 && 整体译文[0] && 整体译文[0].yw
    return 结果

}

function 分析单词翻译结果(结果: 引擎.翻译结果, 原文: string) {
    if (!结果) {
        return []
    }
    let 译文组: 使用记录[] = []
    if (引擎.是百度结果(结果)) {
        let 数组值 = 结果.trans_result
        if (数组值 && 数组值[0]) {
            数组值.forEach((值, i) => {
                let 译文: 使用记录 = 工具.创建对象<使用记录>()
                译文.yuw = 原文
                译文.yw = 值.dst
                if (i === 0) {
                    译文.nu = 1
                }
                译文组.push(译文)
            })
        }
    } else if (引擎.是有道结果(结果)) {
        let 数组值 = 结果.translation
        if (数组值 && 数组值.length > 0) {
            数组值.forEach((值, i) => {
                let 译文: 使用记录 = 工具.创建对象<使用记录>()
                译文.yuw = 原文
                译文.yw = 值
                if (i === 0) {
                    译文.nu = 1
                }
                译文组.push(译文)
            })
        }
    }
    if (译文组[0]) {
        return 译文组
    }
}

function 创建词典库目录及文件() {
    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")
    let 文件名 = "cts_翻译词典\.json"
    if (!系统.目录存在(路径)) {
        系统.创建目录(路径)
    }
    if (!系统.文件存在(文件名)) {
        系统.写文件(结合路径(路径, 文件名), `{"zk":{}}`)
    }
}

export function 结合路径(path1: string, path2: string) {
    if (!(path1 && path1.length)) return path2;
    if (!(path2 && path2.length)) return path1;
    if (取路径根长度(path2) !== 0) return path2;
    if (path1.charAt(path1.length - 1) === "/") return path1 + path2;
    return path1 + "/" + path2;
}

function 取路径根长度(path: string): number {
    if (path.charCodeAt(0) === Charas.slash) {
        if (path.charCodeAt(1) !== Charas.slash) return 1;
        const p1 = path.indexOf("/", 2);
        if (p1 < 0) return 2;
        const p2 = path.indexOf("/", p1 + 1);
        if (p2 < 0) return p1 + 1;
        return p2 + 1;
    }
    if (path.charCodeAt(1) === Charas.colon) {
        if (path.charCodeAt(2) === Charas.slash) return 3;
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
/*
function 取词典库文件全名(): string {
    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")
    let 文件名 = "CTS_翻译词典\.json"
    return 结合路径(路径, 文件名)
}

function 读取别名库文件(): 库文件 {
    if (!_CTS_已有词典库缓存) {
        try {
            let 内容 = 系统.读文件(取词典库文件全名())
            if (!内容) {
                创建词典库目录及文件()
                内容 = 系统.读文件(取词典库文件全名())
            }
            _CTS_已有词典库缓存 = JSON.parse(内容) as 库文件
        } catch (err) {
            _CTS_已有词典库缓存 = {
                zk: {}
            }
        } finally {
            return _CTS_已有词典库缓存
        }
    }
    return _CTS_已有词典库缓存
}

function 写入词典库文件() {
    系统.写文件(取词典库文件全名(), JSON.stringify(_CTS_已有词典库缓存))
}
*/
function 取对应括号(ch: number) {
    switch (ch) {
        case Charas.openBrace:
            return Charas.closeBrace
        case Charas.openBracket:
            return Charas.closeBracket
        case Charas.openParen:
            return Charas.closeParen
        case Charas.closeBrace:
            return Charas.openBrace
        case Charas.closeBracket:
            return Charas.openBracket
        case Charas.closeParen:
            return Charas.openParen
        default:
            return
    }
}
async function 分割翻译注释括号内文本(文本: string) {
    let 结果 = 分割文本(文本)
    let 返回结果 = ""
    if (结果) {
        let 半路结果 = ""
        for (let i = 0; i < 结果.length; i++) {
            let 单词 = 结果[i];
            if (((单词.属性 & 单词属性.全为字母) || (单词.属性 & 单词属性.是空白)) && 单词.文本 !== "e" && 单词.文本 !== "g" && !(单词.属性 & 单词属性.全为大写)) {
                半路结果 += (单词.属性 & 单词属性.是空白) ? 单词.文本 : " " + 单词.文本
            } else {
                if (半路结果) {
                    返回结果 += await 翻译普通文本(半路结果)
                    半路结果 = ""
                }
                返回结果 += 单词.文本
            }
        }
        if (半路结果) {
            返回结果 += await 翻译普通文本(半路结果)
            半路结果 = ""
        }
    }
    return 返回结果
}
async function 翻译普通文本(文本: string) {
    let 返回结果 = ""
    let 翻译结果 = await 引擎.翻译器(文本)
    if (翻译结果) {
        if (引擎.是有道错误(翻译结果) || 引擎.是百度错误(翻译结果)) {
        } else if (引擎.是百度结果(翻译结果)) {
            if (翻译结果.trans_result && 翻译结果.trans_result[0]) {
                返回结果 += 翻译结果.trans_result[0].dst
            }

        } else if (引擎.是有道结果(翻译结果)) {
            if (翻译结果.translation && 翻译结果.translation[0]) {
                返回结果 += 翻译结果.translation[0]
            }
        }
    }
    return 返回结果
}
async function 处理注释文本(文本: string) {
    文本 = 文本.replace(/\n\r/g, "\n")
    let 行组 = 文本.split("\n")
    let 总映射 = new Map<string, 成对符号>()
    let 基础键值 = 1114112 + 100;
    let 新行组: string[] = []
    let 继续进行: boolean = false
    行组.forEach(H => {
        if (H) {
            let { 映射, 原始组, 键值 } = 循环分割(H, 基础键值)
            新行组.push((原始组 && 原始组.join("")) || H)
            映射.forEach((v, k) => {
                总映射.set(k, v)
            })
            基础键值 = 键值
        } else {
            新行组.push(H)
        }
    })
    for (let vv of 总映射) {
        let k = vv[0]
        let v = vv[1]
        if (v) {
            if (v.值.length > 1) {
                let 原始组: string[] = []
                if (正则正则.test(v.值)) {
                    原始组.push(v.值)
                } else {
                    let 首 = v.值.charCodeAt(0)
                    let 尾 = v.值.charCodeAt(v.值.length - 1)
                    let 中 = v.值.substring(1, v.值.length - 1)
                    let 首键 = 首 === 42 ? "`" : String.fromCharCode(首)
                    原始组.push(首键)
                    if (!网址正则.test(中)) {
                        let 翻译 = await 分割翻译注释括号内文本(中)
                        原始组.push(翻译)
                    } else {
                        原始组.push(中);
                    }
                    let 尾键 = 尾 === 42 ? "`" : String.fromCharCode(尾)
                    原始组.push(尾键);
                }
                总映射.set(k, { 键: k, 值: 原始组 && 原始组.join("") || v.值 });
            } else {
                if (v.值 === "-") {
                    v.值 = "- "
                }
                总映射.set(k, v)
            }
        }
    }

    return { 新组: 新行组, 键值映射: 总映射 }

    function 循环分割(H: string, 键值: number) {
        let pos: number = 0
        let end: number = 0
        let ch: number = 0
        let 字母空格 = ""
        let 原始组: string[] = []
        let 映射 = new Map<string, 成对符号>()
        let 括号没有闭合: boolean = false
        let 符号没有闭合: boolean = false
        let 临时括号组: number[] = []
        while (true) {
            if (pos >= H.length) {
                break
            }
            ch = H.charCodeAt(pos)
            if (字符是字母(ch) || 字符是单行空白(ch)) {
                字母空格 += String.fromCharCode(ch)
                pos++
            } else {
                if (字母空格) {
                    原始组.push(字母空格)
                    字母空格 = ""
                }
                if (字符是开括号(ch)) {
                    括号没有闭合 = false
                    临时括号组.push(ch)
                    let 嵌套深度 = 0
                    end = pos
                    pos++
                    while (true) {
                        if (pos >= H.length) {
                            括号没有闭合 = true
                            break
                        } else if (字符是开括号(H.charCodeAt(pos))) {
                            临时括号组.push(H.charCodeAt(pos))
                        } else if (字符是闭括号(H.charCodeAt(pos))) {
                            if (临时括号组.length > 1) {
                                let 最后一个 = 临时括号组.pop()
                                if (取对应括号(最后一个) !== H.charCodeAt(pos)) {
                                    括号没有闭合 = true
                                }
                            } else {
                                let 第一个 = 临时括号组[0]
                                if (取对应括号(第一个) === H.charCodeAt(pos)) {
                                    临时括号组 = []
                                    break
                                } else {
                                    括号没有闭合 = true
                                    break
                                }
                            }
                        }
                        pos++
                    }
                    if (括号没有闭合) {
                        pos++
                        let LH = String.fromCharCode(ch)
                        let 键 = `[${ch}]`
                        原始组.push(键)
                        原始组.push(H.substring(end + 1, pos))
                        映射.set(键, { 键, 值: LH })
                        字母空格 = ""
                        括号没有闭合 = false
                        end = pos
                    } else {
                        pos++
                        let LH = H.substring(end, pos)
                        let 键 = `[${键值 += 1}]`
                        原始组.push(键)
                        映射.set(键, { 键, 值: LH })
                        end = pos
                    }

                } else if (字符是符号(ch) || (ch === Charas.dot && (字符是单行空白(H.charCodeAt(pos + 1)) || isNaN(H.charCodeAt(pos + 1))))) {
                    if (字符是成对符号(ch)) {
                        符号没有闭合 = false
                        end = pos
                        pos++
                        while (true) {
                            if (pos >= H.length) {
                                符号没有闭合 = true
                                break
                            } else if (H.charCodeAt(pos) === ch) {
                                break
                            }
                            pos++
                        }
                        if (符号没有闭合) {
                            pos++
                            let LH = String.fromCharCode(ch)
                            let 键 = `[${ch}]`
                            原始组.push(键)
                            原始组.push(H.substring(end + 1, pos))
                            映射.set(键, { 键, 值: LH })
                            字母空格 = ""
                            符号没有闭合 = false
                            end = pos
                        } else {
                            pos++
                            let LH = H.substring(end, pos)
                            let 键 = `[${键值 += 1}]`
                            原始组.push(键)
                            映射.set(键, { 键, 值: LH })
                            end = pos
                        }
                    } else {
                        if (ch === Charas.slash) {
                            let 正则文本 = H.substr(pos)
                            if (正则正则.test(正则文本)) {
                                let 数组 = 正则文本.match(正则正则)
                                if (数组 && 数组[0]) {
                                    let 内容 = 数组[0]
                                    let 键 = `[${键值 += 1}]`
                                    映射.set(键, { 键, 值: 内容 })
                                    pos += 内容.length
                                    原始组.push(键)
                                }
                            } else {
                                pos++
                            }
                        } else {
                            let LH = String.fromCharCode(ch)
                            let 键 = `[${ch}]`
                            原始组.push(键)
                            映射.set(键, { 键, 值: LH })
                            pos++
                        }
                    }
                } else {
                    字母空格 += String.fromCharCode(ch)
                    pos++
                }
            }
        }
        if (字母空格) {
            原始组.push(字母空格)
        }
        return { 映射, 原始组, 键值 }
    }
}
function 分割文本(文本: string): 标识符别名[] {
    let 数组 = 驼峰名称扫描分组().扫描分组(文本)
    let 结果集: string[] = []
    if (数组) {
        for (let i = 0; i < 数组.length; i++) {
            if (i !== 数组.length - 1 && 文本全为大写(数组[i])) {
                if (文本全为小写(数组[i + 1])) {
                    if (数组[i].length > 0) {
                        let 尾部大写字母 = 数组[i].substr(-1)
                        数组[i + 1] = 尾部大写字母 + 数组[i + 1]
                        数组[i] = 数组[i].substr(0, 数组[i].length - 1)
                    }
                }
            }
            if (数组[i] !== "") {
                结果集.push(数组[i])
            }
        }
    }
    if (!结果集[0]) {
        结果集[0] = 文本
    }

    let 单词组: 标识符别名[] = []

    for (let i = 0; i < 结果集.length; i++) {
        let 单词值: 标识符别名 = 工具.创建对象<标识符别名>()
        单词值.文本 = 结果集[i]
        单词值.属性 = 单词属性.无

        if (文本全为字母(结果集[i])) {
            单词值.属性 |= 单词属性.全为字母
            if (文本全为小写(结果集[i])) {
                单词值.属性 |= 单词属性.全为小写
            } else if (文本全为大写(结果集[i])) {
                单词值.属性 |= 单词属性.全为大写
            }
        } else if (文本全为数字(结果集[i])) {
            单词值.属性 |= 单词属性.全为数字
        } else if (文本全为符号或数字(结果集[i])) {
            单词值.属性 |= 单词属性.全为符号或数字
        }
        if (文本第一个字母为大写(结果集[i])) {
            单词值.属性 |= 单词属性.第一个字母为大写
            if (文本除首字母后无大写(结果集[i])) {
                单词值.属性 |= 单词属性.除首字母后无大写
            }
        }
        if (文本是空白文字(结果集[i])) {
            单词值.属性 |= 单词属性.是空白
        }
        if ((文本尾字母为(结果集[i], "s") && 结果集[i].length > 3 && !(文本尾字母为(结果集[i], "fves") || 文本尾字母为(结果集[i], "ss") || 文本尾字母为(结果集[i], "xs")
            || 文本尾字母为(结果集[i], "chs") || 文本尾字母为(结果集[i], "shs") || 文本尾字母为(结果集[i], "zhs")))) {
            单词值.属性 |= 单词属性.是复数
        }
        单词组.push(单词值)
    }

    return 单词组.length ? 单词组 : undefined
}
function 驼峰名称扫描分组() {
    let 当前文本: string
    let pos: number
    let end: number
    let str: number
    function 扫描分组(文本: string) {
        当前文本 = 文本
        end = 当前文本.length
        pos = 0
        str = 0
        return 取文本组()
    }
    function 取字符(增加?: number) {
        增加 = 增加 || 0
        if (pos + 增加 < end) {
            return 当前文本.charCodeAt(pos += 增加)
        } else {
            return 1
        }
    }
    function 前进(步幅?: number) {
        步幅 = 步幅 || 1
        if (pos + 步幅 < end) {
            pos += 步幅
        } else {
            pos = end
        }
    }
    function 取文本() {
        let 返回值 = 当前文本.substring(str, pos)
        str = pos
        return 返回值
    }
    function 取文本组() {
        if (当前文本 === null) {
            return []
        }
        let ch
        let 临时集: string[] = []
        while (true) {
            ch = 取字符()
            if (pos > end || ch === 1) {
                break
            }
            if (字符是小写(ch)) {
                while (字符是小写(ch)) {
                    前进()
                    ch = 取字符()
                }
                临时集.push(取文本())
            } else if (字符是大写(ch)) {
                while (字符是大写(ch)) {
                    前进()
                    ch = 取字符()
                }
                临时集.push(取文本())

            } else {
                while (!字符是小写(ch) && !字符是大写(ch) && ch !== 1) {
                    前进()
                    ch = 取字符()
                }
                临时集.push(取文本())
            }
        }
        return 临时集[0] ? 临时集 : [当前文本]
    }

    return {
        扫描分组
    }
}
function 分割为可翻译文本(文本组: string[]) {
    let 总组: string[][] = []
    if (!(文本组 || 文本组[0])) {
        return
    }
    文本组.forEach(文本 => {
        let 结果 = 分割文本(文本)
        let 总: string[] = []
        结果.forEach(v => {
            总.push(v.文本)
        })
        总组.push(总)
    })
    return 总组
}
function 分割长文本(文本: string, 长度 = 1900) {
    if (!文本) {
        return
    }
    let 位置 = 0
    let 文本组: string[] = []
    function 分割(文本: string) {
        if (文本.length > 长度) {
            let 分割位 = 文本.substr(0, 长度).lastIndexOf(" ")
            位置 = 分割位 > 0 ? 分割位 : 长度
            return 文本.substr(0, 位置)
        } else {
            位置 = 文本.length
            return 文本
        }
    }
    while (文本) {
        文本组.push(分割(文本))
        文本 = 文本.substr(位置)
    }
    return 文本组
}

function 不需要翻译(单词: 标识符别名) {
    return (单词.属性 & 单词属性.不需要翻译) !== 0
}

function 是数组(value: any): value is ReadonlyArray<any> {
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
})

function 创建内置词典(参数: any) {
    let 值 = new Map<string, string>()
    for (let 键 in 参数) {
        值.set(键, 参数[键])
    }
    return 值
}
