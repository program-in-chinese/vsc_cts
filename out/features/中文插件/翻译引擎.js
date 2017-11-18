"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const crypto = require("crypto");
const q = require("querystring");
const vscode_1 = require("vscode");
const 有道id = vscode_1.workspace.getConfiguration('ctsscript').get("有道翻译");
const 有道密码 = vscode_1.workspace.getConfiguration('ctsscript').get("有道翻译密码");
const 百度id = vscode_1.workspace.getConfiguration('ctsscript').get("百度翻译");
const 百度密码 = vscode_1.workspace.getConfiguration('ctsscript').get("百度翻译密码");
var 翻译主站;
(function (翻译主站) {
    翻译主站["\u767E\u5EA6"] = "http://api.fanyi.baidu.com/api/trans/vip/translate?";
    翻译主站["\u6709\u9053"] = "http://openapi.youdao.com/api?";
})(翻译主站 = exports.翻译主站 || (exports.翻译主站 = {}));
var 百度错误代码;
(function (百度错误代码) {
    百度错误代码[百度错误代码["\u6210\u529F"] = 52000] = "\u6210\u529F";
    百度错误代码[百度错误代码["\u8BF7\u6C42\u8D85\u65F6"] = 52001] = "\u8BF7\u6C42\u8D85\u65F6";
    百度错误代码[百度错误代码["\u7CFB\u7EDF\u9519\u8BEF"] = 52002] = "\u7CFB\u7EDF\u9519\u8BEF";
    百度错误代码[百度错误代码["\u672A\u6388\u6743\u7528\u6237"] = 52003] = "\u672A\u6388\u6743\u7528\u6237";
    百度错误代码[百度错误代码["\u5FC5\u586B\u53C2\u6570\u4E3A\u7A7A"] = 54000] = "\u5FC5\u586B\u53C2\u6570\u4E3A\u7A7A";
    百度错误代码[百度错误代码["\u7B7E\u540D\u9519\u8BEF"] = 54001] = "\u7B7E\u540D\u9519\u8BEF";
    百度错误代码[百度错误代码["\u8BBF\u95EE\u9891\u7387\u53D7\u9650"] = 54003] = "\u8BBF\u95EE\u9891\u7387\u53D7\u9650";
    百度错误代码[百度错误代码["\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3"] = 54004] = "\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3";
    百度错误代码[百度错误代码["\u8BF7\u6C42\u592A\u957F"] = 54005] = "\u8BF7\u6C42\u592A\u957F";
    百度错误代码[百度错误代码["\u5BA2\u6237\u7AEFIP\u975E\u6CD5"] = 58000] = "\u5BA2\u6237\u7AEFIP\u975E\u6CD5";
    百度错误代码[百度错误代码["\u8BD1\u6587\u8BED\u8A00\u65B9\u5411\u4E0D\u652F\u6301"] = 58001] = "\u8BD1\u6587\u8BED\u8A00\u65B9\u5411\u4E0D\u652F\u6301";
})(百度错误代码 = exports.百度错误代码 || (exports.百度错误代码 = {}));
var 有道错误代码;
(function (有道错误代码) {
    有道错误代码[有道错误代码["\u6210\u529F"] = 0] = "\u6210\u529F";
    有道错误代码[有道错误代码["\u7F3A\u5C11\u5FC5\u586B\u7684\u53C2\u6570"] = 101] = "\u7F3A\u5C11\u5FC5\u586B\u7684\u53C2\u6570";
    有道错误代码[有道错误代码["\u4E0D\u652F\u6301\u7684\u8BED\u8A00\u7C7B\u578B"] = 102] = "\u4E0D\u652F\u6301\u7684\u8BED\u8A00\u7C7B\u578B";
    有道错误代码[有道错误代码["\u7FFB\u8BD1\u6587\u672C\u8FC7\u957F"] = 103] = "\u7FFB\u8BD1\u6587\u672C\u8FC7\u957F";
    有道错误代码[有道错误代码["\u4E0D\u652F\u6301\u7684API\u7C7B\u578B"] = 104] = "\u4E0D\u652F\u6301\u7684API\u7C7B\u578B";
    有道错误代码[有道错误代码["\u4E0D\u652F\u6301\u7684\u7B7E\u540D\u7C7B\u578B"] = 105] = "\u4E0D\u652F\u6301\u7684\u7B7E\u540D\u7C7B\u578B";
    有道错误代码[有道错误代码["\u4E0D\u652F\u6301\u7684\u54CD\u5E94\u7C7B\u578B"] = 106] = "\u4E0D\u652F\u6301\u7684\u54CD\u5E94\u7C7B\u578B";
    有道错误代码[有道错误代码["\u4E0D\u652F\u6301\u7684\u4F20\u8F93\u52A0\u5BC6\u7C7B\u578B"] = 107] = "\u4E0D\u652F\u6301\u7684\u4F20\u8F93\u52A0\u5BC6\u7C7B\u578B";
    有道错误代码[有道错误代码["\u5E94\u7528ID"] = 108] = "\u5E94\u7528ID";
    有道错误代码[有道错误代码["\u7F16\u7801\u683C\u5F0F\u4E0D\u6B63\u786E"] = 109] = "\u7F16\u7801\u683C\u5F0F\u4E0D\u6B63\u786E";
    有道错误代码[有道错误代码["\u65E0\u76F8\u5173\u670D\u52A1\u7684\u6709\u6548\u5B9E\u4F8B"] = 110] = "\u65E0\u76F8\u5173\u670D\u52A1\u7684\u6709\u6548\u5B9E\u4F8B";
    有道错误代码[有道错误代码["\u5F00\u53D1\u8005\u8D26\u53F7\u65E0\u6548"] = 111] = "\u5F00\u53D1\u8005\u8D26\u53F7\u65E0\u6548";
    有道错误代码[有道错误代码["\u89E3\u5BC6\u5931\u8D25"] = 201] = "\u89E3\u5BC6\u5931\u8D25";
    有道错误代码[有道错误代码["\u7B7E\u540D\u68C0\u9A8C\u5931\u8D25"] = 202] = "\u7B7E\u540D\u68C0\u9A8C\u5931\u8D25";
    有道错误代码[有道错误代码["\u8BBF\u95EEIP\u5730\u5740\u4E0D\u5728"] = 203] = "\u8BBF\u95EEIP\u5730\u5740\u4E0D\u5728";
    有道错误代码[有道错误代码["\u8F9E\u5178\u67E5\u8BE2\u5931\u8D25"] = 301] = "\u8F9E\u5178\u67E5\u8BE2\u5931\u8D25";
    有道错误代码[有道错误代码["\u7FFB\u8BD1\u67E5\u8BE2\u5931\u8D25"] = 302] = "\u7FFB\u8BD1\u67E5\u8BE2\u5931\u8D25";
    有道错误代码[有道错误代码["\u670D\u52A1\u7AEF\u7684\u5176\u5B83\u5F02\u5E38"] = 303] = "\u670D\u52A1\u7AEF\u7684\u5176\u5B83\u5F02\u5E38";
    有道错误代码[有道错误代码["\u8D26\u6237\u5DF2\u7ECF\u6B20\u8D39\u505C"] = 401] = "\u8D26\u6237\u5DF2\u7ECF\u6B20\u8D39\u505C";
})(有道错误代码 = exports.有道错误代码 || (exports.有道错误代码 = {}));
exports.翻译器 = 翻译标识符({ 有道设置: { id: 有道id + "", 秘钥: 有道密码 + "" }, 百度设置: { id: 百度id + "", 秘钥: 百度密码 + "" }, 原文代码: "EN", 目标代码: "zh_CHS" });
function 是有道结果(结果) {
    if (Object.prototype.hasOwnProperty.call(结果, 'errorCode')) {
        return true;
    }
    return false;
}
exports.是有道结果 = 是有道结果;
function 是有道词典结果(结果) {
    if (Object.prototype.hasOwnProperty.call(结果, 'basic')) {
        return true;
    }
    return false;
}
exports.是有道词典结果 = 是有道词典结果;
function 是百度结果(结果) {
    if (Object.prototype.hasOwnProperty.call(结果, 'trans_result')) {
        return true;
    }
    return false;
}
exports.是百度结果 = 是百度结果;
function 是百度错误(结果) {
    if (Object.prototype.hasOwnProperty.call(结果, 'error_code')) {
        if (+结果.error_code > 1000) {
            return true;
        }
    }
    return false;
}
exports.是百度错误 = 是百度错误;
function 是有道错误(结果) {
    if (Object.prototype.hasOwnProperty.call(结果, 'error_code')) {
        if (+结果.error_code < 1000) {
            return true;
        }
    }
    return false;
}
exports.是有道错误 = 是有道错误;
function 转为半角(文本) {
    let 结果 = "";
    for (let i = 0; i < 文本.length; i++) {
        let ch = 文本.charCodeAt(i);
        if (ch >= 0xFF01 && ch <= 0xFF5E) {
            ch = (ch - 65248);
        }
        else if (ch >= 0x3000 && ch <= 0x303f) {
            ch = (ch - 12244);
        }
        else if (ch == 0x03000) {
            ch = 0x0020;
        }
        else if (ch == 0x201c || ch == 0x201d) {
            ch = 0x60;
        }
        结果 += String.fromCharCode(ch);
    }
    return 结果;
}
exports.转为半角 = 转为半角;
function createHash(data) {
    const hash = crypto.createHash("md5");
    hash.update(data);
    return hash.digest("hex");
}
function 翻译标识符(设置) {
    return 翻译api().设置翻译环境(设置);
}
function 翻译api() {
    let 主站设置;
    let 需翻译的内容;
    let 不需要翻译的内容组 = new Map();
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
    };
    function 生成参数(主站) {
        let 地址;
        let id;
        let 密码;
        let 链接 = "";
        let 组合秘钥;
        let md5;
        let 原文 = 主站设置.原文代码 || "EN";
        let 目标 = 主站设置.目标代码 || "zh_CHS";
        let 时间戳 = (new Date).getTime();
        if (主站 === 翻译主站.有道 && 主站设置.有道设置) {
            地址 = 翻译主站.有道;
            id = 主站设置.有道设置.id;
            密码 = 主站设置.有道设置.秘钥;
            原文 = 确保为有道语言代码(原文);
            目标 = 确保为有道语言代码(目标);
            需翻译的内容 = (typeof 需翻译的内容 !== "string" ? 需翻译的内容.join(" ") : 需翻译的内容).trim();
            组合秘钥 = id + 需翻译的内容 + 时间戳 + 密码;
            md5 = createHash(组合秘钥);
            链接 = `${地址}q=${q.escape(需翻译的内容)}&from=${原文}&to=${目标}&appKey=${id}&salt=${时间戳}&sign=${md5}`;
        }
        else if (主站设置.百度设置) {
            地址 = 翻译主站.百度;
            id = 主站设置.百度设置.id;
            密码 = 主站设置.百度设置.秘钥;
            原文 = 确保为百度语言代码(原文);
            目标 = 确保为百度语言代码(目标);
            组合秘钥 = id + 需翻译的内容 + 时间戳 + 密码;
            md5 = createHash(组合秘钥);
            需翻译的内容 = (typeof 需翻译的内容 !== "string" ? 需翻译的内容.join(" ") : 需翻译的内容).trim();
            链接 = `${地址}q=${q.escape(需翻译的内容)}&from=${原文}&to=${目标}&appid=${id}&salt=${时间戳}&sign=${md5}`;
        }
        return 链接;
    }
    function 预处理翻译文本(文本) {
        if (typeof 文本 === "string") {
            文本 = [文本];
        }
        for (let i = 0; i < 文本.length; i++) {
            let 结果 = /^[\x00-\xff]*$/g.test(文本[i]);
            if (!结果) {
                不需要翻译的内容组.set(`(${i})`, 文本[i].trim());
                文本[i] = `(${i})`;
            }
        }
        return 文本;
    }
    function 填充未翻译文本(文本) {
        if (!文本) {
            return "";
        }
        文本 = 转为半角(文本);
        if (不需要翻译的内容组.size > 0) {
            不需要翻译的内容组.forEach((v, k) => {
                文本 = 文本.replace(k, v);
            });
        }
        return 文本;
    }
    function 确保为有道语言代码(语言代码) {
        switch (语言代码) {
            case "auto":
            case "en":
                return "EN";
            case "zh":
                return "zh_CHS";
            default:
                return 语言代码;
        }
    }
    function 确保为百度语言代码(语言代码) {
        switch (语言代码) {
            case "EN":
                return "en";
            case "zh_CHS":
                return "zh";
            default:
                return 语言代码;
        }
    }
    function 取翻译环境设置() {
        return 主站设置;
    }
    function 设置翻译环境(设置) {
        if (!主站设置 && 设置) {
            主站设置 = 设置;
        }
        if (主站设置) {
            return 翻译;
        }
        return;
    }
    function 执行翻译(链接) {
        return new Promise((成功, 失败) => {
            try {
                let rsq = http.get(链接, (res) => {
                    let 数据 = "";
                    res.on("data", (d) => {
                        数据 += d;
                    });
                    res.on("end", () => {
                        let 结果 = JSON.parse(数据);
                        if (是有道结果(结果)) {
                            if ((+结果.errorCode) !== 有道错误代码.成功) {
                                成功({ error_code: 结果.errorCode, error_msg: 错误元数据[结果.errorCode] });
                                rsq.end();
                            }
                            else {
                                if (结果.translation && 结果.translation[0]) {
                                    结果.translation[0] = 填充未翻译文本(结果.translation[0]);
                                }
                            }
                            delete 结果["dict"];
                            delete 结果["web"];
                            delete 结果["webdict"];
                            delete 结果["basic"];
                        }
                        else if (是百度错误(结果)) {
                            成功({ error_code: 结果.error_code, error_msg: 错误元数据[结果.error_code] });
                            rsq.end();
                        }
                        else if (是百度结果(结果)) {
                            if (结果.trans_result && 结果.trans_result[0]) {
                                结果.trans_result[0].dst = 填充未翻译文本(结果.trans_result[0].dst);
                            }
                        }
                        成功(结果);
                        rsq.end();
                    });
                });
                rsq.end();
            }
            catch (err) {
                失败(err);
            }
        });
    }
    function 翻译(文本) {
        需翻译的内容 = 预处理翻译文本(文本);
        return 执行翻译(生成参数(翻译主站.有道)).then(值 => {
            return 值;
        }).catch(() => {
            return 执行翻译(生成参数(翻译主站.百度)).then(值2 => {
                return 值2;
            });
        }).catch(() => {
            return;
        });
    }
    return {
        取翻译环境设置,
        设置翻译环境,
    };
}
