
import * as fs from "fs";
import * as os from "os";
import * as crypto from "crypto";

export const 系统 = 文件系统()

const enum 文件系统条目分类 {
    文件,
    目录
}

function 写文件(文件名: string, 数据: string, 写字节序标记?: boolean): void {
    // If a BOM is required, emit one
    if (写字节序标记) {
        数据 = "\uFEFF" + 数据;
    }

    let fd: number = 0;

    try {
        fd = fs.openSync(文件名, "w");
        fs.writeSync(fd, 数据, /*position*/ undefined, "utf8");
    }
    finally {
        if (fd !== undefined) {
            fs.closeSync(fd);
        }
    }
}

function 取系统临时文件目录() {
    return os.tmpdir()
}

function 读文件(文件名: string): string | undefined {
    if (!文件存在(文件名)) {
        return undefined;
    }
    const buffer = fs.readFileSync(文件名);
    let len = buffer.length;
    if (len >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
        // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
        // flip all byte pairs and treat as little endian.
        len &= ~1; // Round down to a multiple of 2
        for (let i = 0; i < len; i += 2) {
            const temp = buffer[i];
            buffer[i] = buffer[i + 1];
            buffer[i + 1] = temp;
        }
        return buffer.toString("utf16le", 2);
    }
    if (len >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        // Little endian UTF-16 byte order mark detected
        return buffer.toString("utf16le", 2);
    }
    if (len >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        // UTF-8 byte order mark detected
        return buffer.toString("utf8", 3);
    }
    // Default is UTF-8 with no byte order mark
    return buffer.toString("utf8");
}

function 文件系统条目存在(路径: string, 条目分类: 文件系统条目分类): boolean {
    try {
        const stat = fs.statSync(路径);
        switch (条目分类) {
            case 文件系统条目分类.文件: return stat.isFile();
            case 文件系统条目分类.目录: return stat.isDirectory();
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

function 文件存在(路径: string): boolean {
    return 文件系统条目存在(路径, 文件系统条目分类.文件);
}

function 目录存在(路径: string): boolean {
    return 文件系统条目存在(路径, 文件系统条目分类.目录);
}

function 创建目录(目录名: string) {
    if (!目录存在(目录名)) {
        fs.mkdirSync(目录名);
    }
}

function 创建哈希(data: string) {
    const hash = crypto.createHash("md5");
    hash.update(data);
    return hash.digest("hex");
}

function 文件系统() {
    return {
        写文件,
        读文件,
        文件存在,
        目录存在,
        创建目录,
        取系统临时文件目录,
        创建哈希,
    }
}