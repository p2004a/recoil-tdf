import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Lua } from 'wasmoon-lua5.1';
import * as fs from 'node:fs/promises';

import { parse, serialize, TDFObj } from './index.js';

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
			if (exampleName.startsWith('ok-')) {
				assert.notEqual(actual, null, 'OK test must suceed');
			} else {
				assert.equal(actual, null, 'FAIL test must fail');
			}
		});
	}
});

test('serialization', async (t) => {
	await t.test('number', () => {
		assert.equal(serialize({ 'a': 1.3 }), 'a = 1.3;\n');
		assert.equal(serialize({ 'a': -3 }), 'a = -3;\n');
	});

	await t.test('boolean', () => {
		assert.equal(serialize({ 'a': true }), 'a = true;\n');
	});

	await t.test('strings', () => {
		assert.equal(serialize({ 'a;': 'asdasd' }), 'a; = asdasd;\n');
		assert.equal(serialize({ 'a"': ' sd' }), 'a" = " sd";\n');
		assert.equal(serialize({ 'a]': 'a;a' }), 'a] = "a;a";\n');
		assert.equal(serialize({ 'a': 'a"a' }), 'a = a"a;\n');
		assert.equal(serialize({ 'a': '' }), 'a = ;\n');
	});

	await t.test('sections', () => {
		assert.equal(serialize({ 'a': { 'b': { 'c': { 'x': 1 } } } }), `[a]
{
	[b]
	{
		[c]
		{
			x = 1;
		}
	}
}
`);
	});

	await t.test('map type', () => {
		const m = new Map();
		m.set('a', 1);
		m.set('b', 'asd');
		assert.equal(serialize(m), 'a = 1;\nb = asd;\n');
	});

	await t.test('invalid section name', () => {
		assert.throws(() => { serialize({ 'asd]': { 'a': 1 } }); });
		assert.throws(() => { serialize({ '': { 'a': 1 } }); });
	});

	await t.test('invalid entry key name', () => {
		assert.throws(() => { serialize({ 'asd asd': 1 }); });
		assert.throws(() => { serialize({ '//asdasd': 1 }); });
		assert.throws(() => { serialize({ '/*asdasd': 1 }); });
		assert.throws(() => { serialize({ '[asd': 1 }); });
		assert.throws(() => { serialize({ 'as==d': 1 }); });
		assert.throws(() => { serialize({ '': 1 }); });
	});

	await t.test('invalid value', () => {
		assert.throws(() => { serialize({ 'a': '";' }); });
		assert.throws(() => { serialize({ 'a': 'asd\nasd' }); });
	});

	await t.test('catch duplicate keys', () => {
		assert.throws(() => { serialize({ 'a': 'asd', 'A': 'bcd' }); });
	});
});
