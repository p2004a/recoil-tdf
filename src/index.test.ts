import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Lua } from 'wasmoon-lua5.1';
import * as fs from 'node:fs/promises';

import { parse, TDFObj } from './index.js';

const lua = await Lua.create();

interface LuaTDFparser {
	ParseText(data: string): TDFObj | null;
}

lua.doStringSync(await fs.readFile('testdata/parse_tdf.lua', { encoding: 'utf-8' }));

const luaTDFParser = lua.global.get('TDFparser') as LuaTDFparser;

test('examples parsing', async (t) => {
	const examples = await fs.readdir('testdata/examples');
	for (const exampleName of examples) {
		await t.test(exampleName, async () => {
			const tdf = await fs.readFile(
				path.join('testdata/examples', exampleName),
				{ encoding: 'utf-8' });
			const expected = luaTDFParser.ParseText(tdf);
			let actual = null;
			try {
				actual = parse(tdf);
			} catch (e) {
				// pass
			}
			assert.deepEqual(actual, expected);
		});
	}
});
