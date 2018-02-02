/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class Kind {
	public static readonly alias = '别名';
	public static readonly aliasEn = 'alias';
	public static readonly callSignature = '调用';
	public static readonly callSignatureEn = 'call';
	public static readonly class = '类别';
	public static readonly classEn = 'class';
	public static readonly const = '常量';
	public static readonly constEn = 'const';
	public static readonly constructorImplementation = '构造方法';
	public static readonly constructorImplementationEN = 'constructor';
	public static readonly constructSignature = '构造签名';
	public static readonly constructSignatureEn = 'construct';
	public static readonly directory = '目录';
	public static readonly directoryEn = 'directory';
	public static readonly enum = '枚举';
	public static readonly enumEn = 'enum';
	public static readonly externalModuleName = '外部模块名称';
	public static readonly externalModuleNameEn = 'external module name';
	public static readonly file = '文件';
	public static readonly fileEn = 'file';
	public static readonly function = '函数';
	public static readonly functionEn = 'function';
	public static readonly indexSignature = '索引';
	public static readonly indexSignatureEn = 'index';
	public static readonly interface = '接口';
	public static readonly interfaceEn = 'interface';
	public static readonly keyword = '关键字';
	public static readonly keywordEn = 'keyword';
	public static readonly let = '变量';
	public static readonly letEn = 'let';
	public static readonly localFunction = '本地函数';
	public static readonly localFunctionEn = 'local function';
	public static readonly localVariable = '本地变量';
	public static readonly localVariableEn = 'local var';
	public static readonly memberFunction = '方法';
	public static readonly memberFunctionEn = 'method';
	public static readonly memberGetAccessor = '获取';
	public static readonly memberGetAccessorEn = 'getter';
	public static readonly memberSetAccessor = '设置';
	public static readonly memberSetAccessorEn = 'setter';
	public static readonly memberVariable = '属性';
	public static readonly memberVariableEn = 'property';
	public static readonly module = '模块';
	public static readonly moduleEn = 'module';
	public static readonly primitiveType = '原始类型';
	public static readonly primitiveTypeEn = 'primitive type';
	public static readonly script = '脚本';
	public static readonly scriptEn = 'script';
	public static readonly type = '类型';
	public static readonly typeEn = 'type';
	public static readonly variable = '值量';
	public static readonly variableEn = 'var';
	public static readonly warning = '警告';
	public static readonly warningEn = 'warning';
}

export class DiagnosticCategory {
	public static readonly error = '错误';
	public static readonly errorEn = 'error';
	public static readonly warning = '警告';
	public static readonly warningEn = 'warning';
}