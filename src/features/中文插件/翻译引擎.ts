
import * as http from "http";
import * as crypto from "crypto";
import * as q from "querystring";
import { workspace } from "vscode"

const 有道id = workspace.getConfiguration('ctsscript').get("有道翻译") as string
const 有道密码 = workspace.getConfiguration('ctsscript').get("有道翻译密码") as string
const 百度id = workspace.getConfiguration('ctsscript').get("百度翻译") as string
const 百度密码 = workspace.getConfiguration('ctsscript').get("百度翻译密码") as string

export interface id及密码 {
    id: string,
    秘钥: string
}

export interface 翻译设置 {
    有道设置: id及密码
    百度设置: id及密码
    原文代码?: "EN" | "zh_CHS" | "en" | "zh",
    目标代码?: "EN" | "zh_CHS" | "en" | "zh",
}
export enum 翻译主站 {
    百度 = "http://api.fanyi.baidu.com/api/trans/vip/translate?",
    有道 = "http://openapi.youdao.com/api?"
}
export enum 百度错误代码 {
    成功 = 52000,
    请求超时 = 52001,
    系统错误 = 52002,
    未授权用户 = 52003,
    必填参数为空 = 54000,
    签名错误 = 54001,
    访问频率受限 = 54003,
    账户余额不足 = 54004,
    请求太长 = 54005,
    客户端IP非法 = 58000,
    译文语言方向不支持 = 58001
}

export enum 有道错误代码 {
    成功 = 0,
    缺少必填的参数 = 101,
    不支持的语言类型 = 102,
    翻译文本过长 = 103,
    不支持的API类型 = 104,
    不支持的签名类型 = 105,
    不支持的响应类型 = 106,
    不支持的传输加密类型 = 107,
    应用ID = 108,
    编码格式不正确 = 109,
    无相关服务的有效实例 = 110,
    开发者账号无效 = 111,
    解密失败 = 201,
    签名检验失败 = 202,
    访问IP地址不在 = 203,
    辞典查询失败 = 301,
    翻译查询失败 = 302,
    服务端的其它异常 = 303,
    账户已经欠费停 = 401
}

export type 百度结果 = {
    from: string,
    to: string,
    trans_result: 百度译文[]
}

export type 百度译文 = {
    src: string,
    dst: string
}

export type 错误结果 = {
    error_code: 百度错误代码 | 有道错误代码,
    error_msg: string
}

export type 有道结果 = {
    query: string,
    translation: string[],
    errorCode: 有道错误代码,
    l: "EN2zh-CHS" | "zh-CHS2EN"
}


export type 翻译结果 = 有道结果 | 百度结果 | 错误结果

export const 翻译器 = 翻译标识符({ 有道设置: { id: 有道id + "", 秘钥: 有道密码 + "" }, 百度设置: { id: 百度id + "", 秘钥: 百度密码 + "" }, 原文代码: "EN", 目标代码: "zh_CHS" })

export function 是有道结果(结果: 翻译结果): 结果 is 有道结果 {
    if (Object.prototype.hasOwnProperty.call(结果, 'errorCode')) {
        return true
    }
    return false
}

export function 是有道词典结果(结果: 翻译结果): 结果 is 有道结果 {
    if (Object.prototype.hasOwnProperty.call(结果, 'basic')) {
        return true
    }
    return false
}

export function 是百度结果(结果: 翻译结果): 结果 is 百度结果 {
    if (Object.prototype.hasOwnProperty.call(结果, 'trans_result')) {
        return true
    }
    return false
}

export function 是百度错误(结果: 翻译结果): 结果 is 错误结果 {
    if (Object.prototype.hasOwnProperty.call(结果, 'error_code')) {
        if (+(结果 as 错误结果).error_code > 1000) {
            return true
        }
    }
    return false
}

export function 是有道错误(结果: 翻译结果): 结果 is 错误结果 {
    if (Object.prototype.hasOwnProperty.call(结果, 'error_code')) {
        if (+(结果 as 错误结果).error_code < 1000) {
            return true
        }
    }
    return false
}

export function 转为半角(文本: string) {
    let 结果 = "";
    for (let i = 0; i < 文本.length; i++) {
        let ch = 文本.charCodeAt(i);
        if (ch >= 0xFF01 && ch <= 0xFF5E) {
            ch = (ch - 65248)
        } else if (ch >= 0x3000 && ch <= 0x303f) {
            ch = (ch - 12244)
        } else if (ch == 0x03000) {
            ch = 0x0020
        } else if (ch == 0x201c || ch == 0x201d) {
            ch = 0x60
        }

        结果 += String.fromCharCode(ch);
    }
    return 结果;
}

function createHash(data: string) {
    const hash = crypto.createHash("md5");
    hash.update(data);
    return hash.digest("hex");
}

function 翻译标识符(设置: 翻译设置) {
    return 翻译api().设置翻译环境(设置)
}

function 翻译api() {
    let 主站设置: 翻译设置
    let 需翻译的内容: string | string[]
    let 不需要翻译的内容组: Map<string, string> = new Map<string, string>()
    const 错误元数据 = {
        "0": "成功",
        "101": "缺少必填的参数",
        "102": "不支持的语言类型",
        "103": "翻译文本过长",
        "104": "不支持的API类型",
        "105": "不支持的签名类型",
        "106": "不支持的响应类型",
        "107": "不支持的传输加密类型",
        "108": "应用ID",
        "109": "编码格式不正确",
        "110": "无相关服务的有效实例",
        "111": "开发者账号无效",
        "201": "解密失败",
        "202": "签名检验失败",
        "203": "访问IP地址不在",
        "301": "辞典查询失败",
        "302": "翻译查询失败",
        "303": "服务端的其它异常",
        "401": "账户已经欠费停",
        "52000": "成功",
        "52001": "请求超时",
        "52002": "系统错误",
        "52003": "未授权用户",
        "54000": "必填参数为空",
        "54001": "签名错误",
        "54003": "访问频率受限",
        "54004": "账户余额不足",
        "54005": "请求太长",
        "58000": "客户端IP非法",
        "58001": "译文语言方向不支持"
    }
    function 生成参数(主站: 翻译主站) {
        let 地址: string
        let id: string
        let 密码: string
        let 链接: string=""
        let 组合秘钥: string
        let md5: string
        let 原文 = 主站设置.原文代码 || "EN";
        let 目标 = 主站设置.目标代码 || "zh_CHS";
        let 时间戳 = (new Date).getTime();
        if (主站 === 翻译主站.有道 && 主站设置.有道设置) {
            地址 = 翻译主站.有道
            id = 主站设置.有道设置.id
            密码 = 主站设置.有道设置.秘钥
            原文 = 确保为有道语言代码(原文)
            目标 = 确保为有道语言代码(目标)
            需翻译的内容 = (typeof 需翻译的内容 !== "string" ? 需翻译的内容.join(" ") : 需翻译的内容).trim()
            组合秘钥 = id + 需翻译的内容 + 时间戳 + 密码;
            md5 = createHash(组合秘钥)

            链接 = `${地址}q=${q.escape(需翻译的内容)}&from=${原文}&to=${目标}&appKey=${id}&salt=${时间戳}&sign=${md5}`
        } else if (主站设置.百度设置) {
            地址 = 翻译主站.百度
            id = 主站设置.百度设置.id
            密码 = 主站设置.百度设置.秘钥
            原文 = 确保为百度语言代码(原文)
            目标 = 确保为百度语言代码(目标)
            组合秘钥 = id + 需翻译的内容 + 时间戳 + 密码;
            md5 = createHash(组合秘钥)
            需翻译的内容 = (typeof 需翻译的内容 !== "string" ? 需翻译的内容.join(" ") : 需翻译的内容).trim()
            链接 = `${地址}q=${q.escape(需翻译的内容)}&from=${原文}&to=${目标}&appid=${id}&salt=${时间戳}&sign=${md5}`
        }
        return 链接

    }

    function 预处理翻译文本(文本: string | string[]) {
        if (typeof 文本 === "string") {
            文本 = [文本]
        }
        for (let i = 0; i < 文本.length; i++) {
            let 结果 = /^[\x00-\xff]*$/g.test(文本[i])
            if (!结果) {
                不需要翻译的内容组.set(`(${i})`, 文本[i].trim())
                文本[i] = `(${i})`
            }
        }
        return 文本
    }

    function 填充未翻译文本(文本: string) {
        if (!文本) {
            return ""
        }
        文本 = 转为半角(文本)
        if (不需要翻译的内容组.size > 0) {
            不需要翻译的内容组.forEach((v, k) => {
                文本 = 文本.replace(k, v)
            })
        }
        return 文本
    }

    function 确保为有道语言代码(语言代码: string): "EN" | "zh_CHS" | "en" | "zh" {
        switch (语言代码) {
            case "auto":
            case "en":
                return "EN"
            case "zh":
                return "zh_CHS"
            default:
                return 语言代码 as "EN" | "zh_CHS" | "en" | "zh"
        }
    }
    function 确保为百度语言代码(语言代码: string): "EN" | "zh_CHS" | "en" | "zh" {
        switch (语言代码) {
            case "EN":
                return "en"
            case "zh_CHS":
                return "zh"
            default:
                return 语言代码 as "EN" | "zh_CHS" | "en" | "zh"
        }
    }

    function 取翻译环境设置() {
        return 主站设置
    }

    function 设置翻译环境(设置?: 翻译设置) {
        if (!主站设置 && 设置) {
            主站设置 = 设置
        } if (主站设置) {
            return 翻译
        }
        return
    }

    function 执行翻译(链接: string) {
        return new Promise<翻译结果>((成功: (结果: 翻译结果) => void, 失败: any) => {
            try {
                let rsq = http.get(链接, (res: any) => {
                    let 数据 = ""
                    res.on("data", (d: any) => {
                        数据 += d
                    })
                    res.on("end", () => {
                        let 结果 = JSON.parse(数据) as any
                        if (是有道结果(结果)) {
                            if ((+结果.errorCode) !== 有道错误代码.成功) {
                                成功({ error_code: 结果.errorCode, error_msg: (<any>错误元数据)[结果.errorCode] })
                                rsq.end()
                            } else {
                                if (结果.translation && 结果.translation[0]) {
                                    结果.translation[0] = 填充未翻译文本(结果.translation[0])
                                }
                            }
                            delete (<any>结果)["dict"]
                            delete (<any>结果)["web"]
                            delete (<any>结果)["webdict"]
                            delete (<any>结果)["basic"]
                        } else if (是百度错误(结果)) {
                            成功({ error_code: 结果.error_code, error_msg: 错误元数据[结果.error_code] })
                            rsq.end()
                        } else if (是百度结果(结果)) {
                            if (结果.trans_result && 结果.trans_result[0]) {
                                结果.trans_result[0].dst = 填充未翻译文本(结果.trans_result[0].dst)
                            }
                        }
                        成功(<翻译结果>结果)
                        rsq.end()
                    })
                })
                rsq.end()
            } catch (err) {
                失败(err)
            }
        })
    }

    function 翻译(文本: string | string[]) {
        需翻译的内容 = 预处理翻译文本(文本)
        return 执行翻译(生成参数(翻译主站.有道)).then(值 => {
            return 值
        }).catch(() => {
            return 执行翻译(生成参数(翻译主站.百度)).then(值2 => {
                return 值2
            })
        }).catch(() => {
            return
        })
    }

    return {
        取翻译环境设置,
        设置翻译环境,
    }
}
