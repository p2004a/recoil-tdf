import test from 'node:test';
import assert from 'node:assert/strict';

import { hello } from './index.js';

test('hello', () => {
	assert.equal(hello(), 'hello');
});
