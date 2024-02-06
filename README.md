Recoil RTS TDF parser and serializer
====================================

TypeScript parser and serializer of the Recoil/Spring RTS engine TDF format with focus on correctness.

[Recoil RTS](https://github.com/beyond-all-reason/spring) uses a custom TDF format for some configuration files like [start scripts](https://github.com/beyond-all-reason/spring/blob/4485472b5b60dc9bde45419dd2f01bf840c67a2a/doc/StartScriptFormat.txt#L4). This small, zero dependencies, library offers a parser and serializer of that format tested against the [official Lua parser](https://github.com/beyond-all-reason/spring/blob/4485472b5b60dc9bde45419dd2f01bf840c67a2a/cont/base/maphelper/maphelper/parse_tdf.lua#L4) from the engine. The parser is generated from [grammar](src/tdf.peg) using [tsPEG](https://github.com/EoinDavey/tsPEG), and serializer validates all values to make sure that they will always deserialize correctly.

Installation
------------

```sh
npm install --save recoil-tdf
```

Usage
-----

Below is an example of using parser and serializer.

```ts
import {parse, serialize} from 'recoil-tdf';

const tdfDoc = `
[SECTION1]
{
	key1 = 1;
	key2 = asd;
	[SUB] {
		x = y;
	}
}
globalKey = "a;b;c;d";
`;
console.log(parse(tdfDoc));
/* Output:
{
  section1: { key1: '1', key2: 'asd', sub: { x: 'y' } },
  globalkey: 'a;b;c;d'
}
*/

const obj = {
	'a': 1,
	'b': true,
	'SEC': {
		'c': 'asd;asd'
	}
};
console.log(serialize(obj));
/* Output:
a = 1;
b = true;
[SEC]
{
	c = "asd;asd";
}
*/
```
