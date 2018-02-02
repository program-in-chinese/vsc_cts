/// <reference types="node" />

import { 系统 } from "../系统"
import { 读一行 } from "./\u52A0\u8F7D\u8BCD\u5178";
import { 结合路径 } from "../\u7FFB\u8BD1\u6807\u8BC6\u7B26";
interface 位置 {
    起: number
    尾: number
}
let 注释索引: Map<string, 位置[]>
let 注释数据: Buffer

function 取注释索引文件全名(文件名: string): string {
    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")
    return 结合路径(路径, 文件名)
}

function 创建目录及文件(文件名: string, 读缓存 = false) {

    let 路径 = 结合路径(系统.取系统临时文件目录(), "cts_扩展")

    if (!系统.目录存在(路径)) {
        系统.创建目录(路径)
    }

    if (!系统.文件存在(文件名)) {
        系统.写文件(结合路径(路径, 文件名), "")
    }
    if (读缓存) {
        return 系统.读文件缓存(文件名)
    }
    return 系统.读文件(文件名)

}

function 加载数据(): Buffer {
    function 加载() {
        注释数据 = 创建目录及文件("CTS_注释缓存.utf8", true) as Buffer
        return 注释数据

    }
    return 注释数据 || 加载()
}

function 加载索引(): Map<string, 位置[]> {
    function 加载() {
        注释索引 = new Map()
        let 索引内容 = 创建目录及文件("CTS_注释索引.utf8") as string
        let 行迭代 = 读一行(索引内容)
        while (true) {
            let 行内容 = 行迭代.next().value
            if (行内容) {
                break
            }

            let 分割组 = 行内容.split(":")
            let 键 = 分割组[0]
            let 位置内容 = 分割组[1]
            let 内容组 = 位置内容.split(";")
            let 位置组: 位置[] = []

            for (let v of 内容组) {
                let 位置 = v.split(",")
                let 起 = +位置[0]
                let 尾 = +位置[1]
                位置组.push({ 起, 尾 })
            }

            if (!注释索引.has(键)) {
                注释索引.set(键, 位置组)
            } else {
                注释索引.get(键).push(...位置组)
            }

        }
        return 注释索引

    }
    return 注释索引 || 加载()
}

export function 读注释缓存(键: string) {
    let 索引 = 加载索引()
    let 数据 = 加载数据()
    let 位置组 = 索引.get(键)
    let 返回值: string[] = []
    if (!位置组) {
        return
    } else {
        for (let v of 位置组) {
            let 数据成员 = 数据.slice(v.起, v.尾)
            返回值.push(数据成员.toString())
        }
    }
    if (返回值.length) {
        return 返回值
    }
    return
}

export function 写注释缓存(键: string, 值: string) {
    let 缓存 = Buffer.from(值)
    let 总数据 = 加载数据()
    let 起 = 总数据.byteLength
    总数据 = Buffer.concat([总数据, 缓存])
    let 尾 = 总数据.byteLength
    let 总索引 = 加载索引()
    if (总索引.has(键)) {
        总索引.get(键).push({ 起, 尾 })

    } else {
        总索引.set(键, [{ 起, 尾 }])
    }

}

export function 保存注释数据() {
    let 总数据 = 加载数据()
    系统.写文件(取注释索引文件全名("CTS_注释缓存.utf8"), 总数据.toString())
    let 总索引 = 加载索引()
    let 索引数据: string[] = []
    总索引.forEach((v, k) => {
        let 数据: string[] = []
        for (let vv of v) {
            数据.push(`${vv.起},${vv.尾}`)

        }
        let 行数据 = `${k}:${数据.join(";")}`
        索引数据.push(行数据)

    })
    系统.写文件(取注释索引文件全名("CTS_注释索引.utf8"), 索引数据.join(系统.新行))

}
