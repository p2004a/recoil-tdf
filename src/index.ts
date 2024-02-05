import { parse as tdfParse, TDFObj } from './tdf.peg.js';

export type { TDFObj };

export function parse(tdf: string): TDFObj {
	const result = tdfParse(tdf);
	if (!result.ast) {
		throw new Error(`Failed to parse TDF: ${result.errs[0]!.toString()}`);
	}
	return result.ast.root.value;
}
