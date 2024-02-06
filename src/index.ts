import { parse as tdfParse, TDFObj } from './tdf.peg.js';

export type { TDFObj };

export function parse(tdf: string): TDFObj {
	const result = tdfParse(tdf);
	if (!result.ast) {
		throw new Error(`Failed to parse TDF: ${result.errs[0]!.toString()}`);
	}
	return result.ast.root.value;
}

export type TDFSerializable = {
	[k: string]: (TDFSerializable | string | number | boolean)
} | Map<string, TDFSerializable | string | number | boolean>;

export function serialize(obj: TDFSerializable): string {
	return sObj('', '', obj);
}

function sObj(res: string, indent: string, obj: TDFSerializable): string {
	let entries;
	if (obj instanceof Map) {
		entries = obj.entries();
	} else {
		entries = Object.entries(obj);
	}
	const usedKeys = new Set<string>();
	for (const [key, value] of entries) {
		// Check if such key was already added to prevent overrides
		// due to parsing treating all keys as lowercase.
		const lowerKey = key.toLowerCase();
		if (usedKeys.has(lowerKey)) {
			throw new Error('Duplicate key');
		}
		usedKeys.add(lowerKey);

		switch (typeof value) {
			case 'object':
				res += `${indent}[${sSectionName(key)}]\n${indent}{\n`;
				res = sObj(res, indent + '\t', value);
				res += `${indent}}\n`;
				break;
			case 'boolean':
			case 'number':
				res += `${indent}${sEntryName(key)} = ${value};\n`;
				break;
			case 'string':
				res += `${indent}${sEntryName(key)} = ${sStrValue(value)};\n`;
				break;
			default: {
				const val: never = value;
				throw new Error(`Can't serialize value of type ${typeof value}: ${val}`);
			}
		}
	}
	return res;
}

function sEntryName(key: string) {
	if (/^(\[|\/\/|\/\*|$)|\s|=/.test(key)) {
		throw new Error('Invalid key name');
	}
	return key;
}

function sSectionName(key: string) {
	if (/]|^$/.test(key)) {
		throw new Error('Invalid section name');
	}
	return key;
}

function sStrValue(value: string) {
	if (/\n/.test(value)) {
		throw new Error('Value not serializable');
	}
	if (/;|^[ \t]/.test(value)) {
		if (/"/.test(value)) {
			throw new Error('Value not serializable');
		}
		return `"${value}"`;
	}
	return value;
}
