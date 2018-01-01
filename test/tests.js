const assert = require('assert');
const javaDeserialization = require('../');

function testCase(b64data, checks) {
  return function() {
    const bytes = Buffer.from(b64data, 'base64');
    const res = javaDeserialization.parse(bytes);
    const begin = res[0];
    const end = res[res.length - 1];
    assert(begin[0] === 'Begin');
    assert(begin[1] === begin);
    assert(end[0] === end);
    assert(end[1] === 'End');
    assert(res.length === checks.length + 2);
    return checks.apply(null, res.slice(1, -1));
  };
}

describe('Deserialization of', () => {

  it('canaries only', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABdXEAfgAAAAAAAnEAfgADdAADRW5k',
    function() {
    }));

  it('string', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABdAAIc29tZXRleHR1cQB+AAAAAAACcQB+AAR0AANFbmQ=',
    function(itm) {
      assert(typeof itm === 'string');
      assert(itm === 'sometext');
    }));

  it('primitive fields', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABc3IAD1ByaW1pdGl2ZUZpZWxkcwAAEjRWeJq8AgAIWgACYm9CAAJieUMAAWNEAAFkRgAB' +
    'ZkkAAWlKAAFsUwABc3hwAesSNEAorhR64UeuQpkAAP///4X////////86/44dXEAfgAAAAAA' +
    'AnEAfgAFdAADRW5k',
    function(itm) {
      assert.strictEqual(itm.i, -123);
      assert.strictEqual(itm.s, -456);
      assert.strictEqual(String(itm.l), '-789');
      assert.strictEqual(itm.l.toNumber(), -789);
      assert(itm.l.equals(-789));
      assert.strictEqual(itm.by, -21);
      assert.strictEqual(itm.d, 12.34);
      assert.strictEqual(itm.f, 76.5);
      assert.strictEqual(itm.bo, true);
      assert.strictEqual(itm.c, '\u1234');
      assert.strictEqual(Object.keys(itm).length, 8);
      assert.strictEqual(itm.class.serialVersionUID, '0000123456789abc');
    }));

  it('boxed primitives', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABc3IAEWphdmEubGFuZy5JbnRlZ2VyEuKgpPeBhzgCAAFJAAV2YWx1ZXhyABBqYXZhLmxh' +
    'bmcuTnVtYmVyhqyVHQuU4IsCAAB4cP///4VzcgAPamF2YS5sYW5nLlNob3J0aE03EzRg2lIC' +
    'AAFTAAV2YWx1ZXhxAH4ABP44c3IADmphdmEubGFuZy5Mb25nO4vkkMyPI98CAAFKAAV2YWx1' +
    'ZXhxAH4ABP////////zrc3IADmphdmEubGFuZy5CeXRlnE5ghO5Q9RwCAAFCAAV2YWx1ZXhx' +
    'AH4ABOtzcgAQamF2YS5sYW5nLkRvdWJsZYCzwkopa/sEAgABRAAFdmFsdWV4cQB+AARAKK4U' +
    'euFHrnNyAA9qYXZhLmxhbmcuRmxvYXTa7cmi2zzw7AIAAUYABXZhbHVleHEAfgAEQpkAAHNy' +
    'ABFqYXZhLmxhbmcuQm9vbGVhbs0gcoDVnPruAgABWgAFdmFsdWV4cAFzcgATamF2YS5sYW5n' +
    'LkNoYXJhY3RlcjSLR9lrGiZ4AgABQwAFdmFsdWV4cBI0dXEAfgAAAAAAAnEAfgAUdAADRW5k',
    function(i, s, l, by, d, f, bo, c) {
      assert.strictEqual(i.value, -123);
      assert.strictEqual(s.value, -456);
      assert(l.value.equals(-789));
      assert.strictEqual(by.value, -21);
      assert.strictEqual(d.value, 12.34);
      assert.strictEqual(f.value, 76.5);
      assert.strictEqual(bo.value, true);
      assert.strictEqual(c.value, '\u1234');
      assert.strictEqual(i.class.name, 'java.lang.Integer');
      assert.strictEqual(s.class.name, 'java.lang.Short');
      assert.strictEqual(l.class.name, 'java.lang.Long');
      assert.strictEqual(by.class.name, 'java.lang.Byte');
      assert.strictEqual(d.class.name, 'java.lang.Double');
      assert.strictEqual(f.class.name, 'java.lang.Float');
      assert.strictEqual(bo.class.name, 'java.lang.Boolean');
      assert.strictEqual(c.class.name, 'java.lang.Character');
    }));

  it('inherited field', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABc3IAHERlcml2ZWRDbGFzc1dpdGhBbm90aGVyRmllbGQAAAAAAAAjRQIAAUkAA2Jhcnhy' +
    'ABJCYXNlQ2xhc3NXaXRoRmllbGQAAAAAAAASNAIAAUkAA2Zvb3hwAAAAewAAAOp1cQB+AAAA' +
    'AAACcQB+AAZ0AANFbmQ=',
    function(itm) {
      assert.strictEqual(itm.class.name, 'DerivedClassWithAnotherField');
      assert.strictEqual(itm.class.super.name, 'BaseClassWithField');
      assert.strictEqual(itm.class.super.super, null);
      assert.strictEqual(itm.extends.DerivedClassWithAnotherField.bar, 234);
      assert.strictEqual(itm.extends.DerivedClassWithAnotherField.foo, undefined);
      assert.strictEqual(itm.extends.BaseClassWithField.foo, 123);
      assert.strictEqual(itm.bar, 234);
      assert.strictEqual(itm.foo, 123);
    }));

  it('duplicate field', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABc3IAGURlcml2ZWRDbGFzc1dpdGhTYW1lRmllbGQAAAAAAAA0VgIAAUkAA2Zvb3hyABJC' +
    'YXNlQ2xhc3NXaXRoRmllbGQAAAAAAAASNAIAAUkAA2Zvb3hwAAAAewAAAVl1cQB+AAAAAAAC' +
    'cQB+AAZ0AANFbmQ=',
    function(itm) {
      assert.strictEqual(itm.class.name, 'DerivedClassWithSameField');
      assert.strictEqual(itm.class.super.name, 'BaseClassWithField');
      assert.strictEqual(itm.class.super.super, null);
      assert.strictEqual(itm.extends.DerivedClassWithSameField.foo, 345);
      assert.strictEqual(itm.extends.BaseClassWithField.foo, 123);
      assert.strictEqual(itm.foo, 345);
    }));

  it('enums', testCase(
    'rO0ABXVyABNbTGphdmEubGFuZy5PYmplY3Q7kM5YnxBzKWwCAAB4cAAAAAJ0AAVCZWdpbnEA' +
    'fgABfnIACFNvbWVFbnVtAAAAAAAAAAASAAB4cgAOamF2YS5sYW5nLkVudW0AAAAAAAAAABIA' +
    'AHhwdAADT05FfnEAfgADdAAFVEhSRUV1cQB+AAAAAAACcQB+AAl0AANFbmQ=',
    function(one, three) {
      assert.strictEqual(typeof one, 'object');
      assert(one instanceof String);
      assert.equal(one, 'ONE');
      assert.notStrictEqual(one, 'ONE');
      assert.strictEqual(one.class.name, 'SomeEnum');
      assert(one.class.isEnum);
      assert.strictEqual(one.class.super.name, 'java.lang.Enum');
      assert.strictEqual(one.class.super.super, null);
      assert.equal(three, 'THREE');
    }));

});
