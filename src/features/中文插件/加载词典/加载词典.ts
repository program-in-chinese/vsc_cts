
import { 系统 } from "../系统"
import { 结合路径 } from "../\u7FFB\u8BD1\u6807\u8BC6\u7B26";

interface 库词典 {
    译文: Map<string, number>,
    属性: number
}

let 总库: Map<string, 库词典>

function 取词典库文件全名(): string {
    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")
    let 文件名 = "CTS_翻译词典\.utf8"
    return 结合路径(路径, 文件名)
}

function 创建词典库目录及文件() {

    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")
    let 文件名 = "cts_翻译词典\.utf8"

    if (!系统.目录存在(路径)) {
        系统.创建目录(路径)
    }

    if (!系统.文件存在(文件名)) {
        系统.写文件(结合路径(路径, 文件名), "")
    }

}

function 加载词库() {

    function 加载() {

        总库 = new Map()

        try {

            let 文件内容 = 系统.读文件(取词典库文件全名())
            if (!文件内容) {
                创建词典库目录及文件()
                return 总库

            }

            let 行数据 = 读一行(文件内容)

            while (true) {

                let 数据 = 行数据.next().value
                if (!数据) {
                    break
                }

                let 分割组 = 数据.split(":")

                if (总库.has(分割组[0])) {

                    let 存在 = 总库.get(分割组[0])

                    if (!存在.译文) {
                        存在.译文 = new Map()

                    }

                    let 文字组 = 分割组[1].split(",")

                    for (let v of 文字组) {

                        let 分开系数 = v.split("|")

                        if (!存在.译文.has(分开系数[0])) {
                            存在.译文.set(v, +分开系数[1])

                        }

                    }

                    存在.属性 = +分割组[2]

                } else {

                    let 映射: Map<string, number> = new Map()

                    let 文字组 = 分割组[1].split(",")

                    for (let v of 文字组) {

                        let 分开系数 = v.split("|")
                        if (!映射.has(分开系数[0])) {
                            映射.set(v, +分开系数[1])

                        }

                    }

                    总库.set(分割组[0], { 译文: 映射, 属性: +分割组[2] })

                }


            }
            return 总库

        } catch (err) {
            return 总库
        }

    }

    return 总库 || 加载()
}

export function* 读一行(文字: string) {

    let 行数据 = 文字.split("\n")

    for (let v of 行数据) {
        let 值 = v.trim()
        if (值) {
            yield 值
        }
    }

}

export interface 标识符 {
    文本: string
    组成: 标识符元素[],
    属性: number
}

export interface 标识符元素 {
    内容: string,
    次数: number
}

export function 读词典数据(标识符: 标识符) {
    let 整体返回 = 加载词库().get(标识符.文本)

    if (整体返回) {
        let 返回结果: 标识符元素[] = []
        整体返回.译文.forEach((v, k) => {
            let 组合 = { 内容: k, 次数: +k }
            返回结果.push(组合)
        })

        标识符.组成 = 返回结果
        标识符.属性 = 整体返回.属性
    }

    return 标识符

}

export function 插入词典数据(内容: 标识符) {
    try {
        if (加载词库().has(内容.文本)) {
            let 存在 = 加载词库().get(内容.文本)
            let 组成 = 内容.组成
            for (let v of 组成) {
                if (!存在.译文.has(v.内容)) {
                    存在.译文.set(v.内容, 1)
                } else {
                    let i = 存在.译文.get(v.内容)
                    存在.译文.set(v.内容, i += 1)
                }
            }
        } else {
            let 映射: Map<string, number> = new Map()
            let 组成 = 内容.组成
            for (let v of 组成) {
                映射.set(v.内容, 1)
            }
            加载词库().set(内容.文本, { 译文: 映射, 属性: 内容.属性 })
        }
        return true
    } catch (err) {
        return false
    }

}

export function 保存词典(): boolean {
    try {

        let 新总库 = 加载词库()
        let 内容: string[] = []

        新总库.forEach((v, k) => {

            let 组合: string[] = []

            v.译文.forEach((vv, kk) => {

                组合.push(`${kk}|${vv}`)

            })

            内容.push(`${k}:${组合.join(",")}:${v.属性}`)

        })

        系统.写文件(取词典库文件全名(), 内容.join(系统.新行))

    } catch (err) {
        return false

    }

    return true

}

function 重新组词(多翻译重组: 标识符元素[][]): 标识符元素[] {

    let 结果数组: 标识符元素[] = []
    let 临时: 标识符元素[] = []

    function 多音词分裂组合(多翻译重组: 标识符元素[][], 过度: 标识符元素[] = [], 当前层: number = 0) {
        if (多翻译重组.length === 当前层 + 1) {

            for (let i = 0; i < 多翻译重组[当前层].length; i++) {
                临时 = 过度.slice(0);
                临时.push(多翻译重组[当前层][i])
                let 内容: string = ""
                let 次数 = 0

                临时.forEach(v => {
                    内容 += v.内容
                    次数 += v.次数
                })

                结果数组.push({ 内容, 次数 })
            }

        } else {

            for (let i = 0; i < 多翻译重组[当前层].length; i++) {

                临时 = 过度.slice(0)
                临时.push(多翻译重组[当前层][i])
                多音词分裂组合(多翻译重组, 临时, 当前层 + 1, )

            }

        }

    }

    多音词分裂组合(多翻译重组)
    临时 = undefined

    return 结果数组

}
