/* tslint:disable: no-unused-expression */
import { assert, expect, should } from 'chai';
import { ObjectPath } from '@/protocol/ObjectPath';

describe('ObjectPath', () => {
	describe('parse', () => {
		it('parses the identity path', () => {
			const path = ObjectPath.compile('.');
			should().exist(path);
			expect(path.toString()).to.be.equal('.');
		});

		it('parses an path with properties', () => {
			const path = ObjectPath.compile('a.b.c');
			should().exist(path);
			expect(path.toString()).to.be.equal('a.b.c');
		});

		it('parses an path with array indices', () => {
			const path = ObjectPath.compile('a.0.c');
			should().exist(path);
			expect(path.toString()).to.be.equal('a.0.c');
		});

		it('throws an exception for an empty path', () => {
			expect(() => ObjectPath.compile('')).to.throw('Invalid object path: \'\'');
		});
	});

	describe('isSame', () => {
		it('returns true when called with the identity', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('.');
			expect(first.isSame(second)).to.be.true;
		});

		it('returns true when called with the same path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b.c');
			expect(first.isSame(second)).to.be.true;
		});

		it('returns false when called with a different path than the identity', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('x.b.c');
			expect(first.isSame(second)).to.be.false;
		});

		it('returns false when called with a different path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('x.b.c');
			expect(first.isSame(second)).to.be.false;
		});

		it('returns false when called with a prefix path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b');
			expect(first.isSame(second)).to.be.false;
		});

		it('returns false when called with a child path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('b.b.c.d');
			expect(first.isSame(second)).to.be.false;
		});
	});

	describe('isChildOf', () => {
		it('returns false when called with the identity', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('.');
			expect(first.isChildOf(second)).to.be.false;
		});

		it('returns false when called with the identity as suffix', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('a.b.c');
			expect(first.isChildOf(second)).to.be.false;
		});

		it('returns false when called with the same path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b.c');
			expect(first.isChildOf(second)).to.be.false;
		});

		it('returns false when called with a different path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('x.b.c');
			expect(first.isChildOf(second)).to.be.false;
		});

		it('returns true when called with the identity as prefix', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('.');
			expect(first.isChildOf(second)).to.be.true;
		});

		it('returns true when called with a prefix path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b');
			expect(first.isChildOf(second)).to.be.true;
		});

		it('returns false when called with a child path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('b.b.c.d');
			expect(first.isChildOf(second)).to.be.false;
		});
	});

	describe('isChildOfOrSame', () => {
		it('returns true when called with the same identity', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('.');
			expect(first.isChildOfOrSame(second)).to.be.true;
		});

		it('returns true when called with the identity as parent', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('.');
			expect(first.isChildOfOrSame(second)).to.be.true;
		});

		it('returns false when called with the identity as child', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('a.b.c');
			expect(first.isChildOfOrSame(second)).to.be.false;
		});

		it('returns true when called with the same path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b.c');
			expect(first.isChildOfOrSame(second)).to.be.true;
		});

		it('returns false when called with a different path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('x.b.c');
			expect(first.isChildOfOrSame(second)).to.be.false;
		});

		it('returns true when called with a prefix path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('a.b');
			expect(first.isChildOfOrSame(second)).to.be.true;
		});

		it('returns false when called with a child path', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('b.b.c.d');
			expect(first.isChildOfOrSame(second)).to.be.false;
		});
	});

	describe('append', () => {
		it('returns a the suffix when called with the identity as prefix', () => {
			const first = ObjectPath.compile('.');
			const second = ObjectPath.compile('a.b.c');
			const result = first.append(second);
			expect(result.isSame(second));
		});

		it('returns a the prefix when called with the identity as suffix', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('.');
			const result = first.append(second);
			expect(result.isSame(first));
		});

		it('returns a new ObjectPath with the concatenated segments', () => {
			const first = ObjectPath.compile('a.b.c');
			const second = ObjectPath.compile('1.e.f');
			const result = first.append(second);
			expect(result.toString()).to.be.equal('a.b.c.1.e.f');
			assert.notStrictEqual(result, first);
			assert.notStrictEqual(result, second);
		});

	});

	describe('get', () => {
		it('returns the identity', () => {
			const object = {
				a: {
					b: {
						c: 'test value',
					},
				},
			};
			const path = ObjectPath.compile('.');
			expect(path.get(object)).to.be.equals(object);
		});

		it('returns the value of a property', () => {
			const object = {
				a: {
					b: {
						c: 'test value',
					},
				},
			};
			const path = ObjectPath.compile('a.b.c');
			expect(path.get(object)).to.be.equal('test value');
		});

		it('returns the value of an array', () => {
			const object = {
				a: {
					b: [
						undefined,
						'test value',
					],
				},
			};
			const path = ObjectPath.compile('a.b.1');
			expect(path.get(object)).to.be.equal('test value');
		});

		it('returns the value of a property within an array', () => {
			const object = {
				a: {
					b: [
						undefined,
						{
							c: 'test value',
						},
					],
				},
			};
			const path = ObjectPath.compile('a.b.1.c');
			expect(path.get(object)).to.be.equal('test value');
		});

		it('returns undefined when the path does not match', () => {
			const object = {
				a: {
					b: [
						undefined,
						'test value',
					],
				},
			};
			const path = ObjectPath.compile('a.b.22');
			expect(path.get(object)).to.be.undefined;
		});
	});

	describe('set', () => {
		it('sets the value of property', () => {
			const object = {
				a: {
					b: {
						c: 'change me',
					},
				},
			};
			const path = ObjectPath.compile('a.b.c');
			path.set(object, 'test value');
			expect(object.a.b.c).to.be.equal('test value');
		});

		it('sets the value of an array', () => {
			const object = {
				a: {
					b: [
						undefined,
						'change me',
					],
				},
			};
			const path = ObjectPath.compile('a.b.1');
			path.set(object, 'test value');
			expect(object.a.b[1]).to.be.equal('test value');
		});

		it('sets the value of a property within an array', () => {
			const object = {
				a: {
					b: [
						undefined,
						{ c: 'change me' },
					],
				},
			};
			const path = ObjectPath.compile('a.b.1.c');
			path.set(object, 'test value');
			expect((object as any).a.b[1].c).to.be.equal('test value');
		});

		it('creates missing properties and sets the value of property', () => {
			const object: any = {};
			const path = ObjectPath.compile('a.b.c');
			path.set(object, 'test value');
			expect(object.a.b.c).to.be.equal('test value');
		});

		it('creates missing arrays and sets the value of an array', () => {
			const object: any = {};
			const path = ObjectPath.compile('a.b.1');
			path.set(object, 'test value');
			expect(object.a.b[1]).to.be.equal('test value');
		});

		it('creates missing arrays and properties, and sets the value of a property within an array', () => {
			const object: any = {};
			const path = ObjectPath.compile('a.b.1.c');
			path.set(object, 'test value');
			expect((object as any).a.b[1].c).to.be.equal('test value');
		});
	});

	describe('unset', () => {
		it('should remove a property', () => {
			const object: any = {
				a: {
					b: {
						c: 'should not exists',
					},
				},
			};
			const path = ObjectPath.compile('a.b.c');
			path.unset(object);
			expect(object.a.b.c).to.be.undefined;
		});

		it('should remove an array value', () => {
			const object: any = {
				a: {
					b: [
						'index 0',
						'should not exists',
						'index 2',
					],
				},
			};
			const path = ObjectPath.compile('a.b.1');
			path.unset(object);
			expect(object.a.b).to.be.deep.equal(['index 0', 'index 2']);
		});

		it('should remove a property with an array', () => {
			const object: any = {
				a: {
					b: [
						'index 0',
						{
							c: 'should not exists',
						},
					],
				},
			};
			const path = ObjectPath.compile('a.b.1.c');
			path.unset(object);
			expect(object.a.b[1].c).to.be.undefined;
		});

		it('should do nothing when the property does not exist', () => {
			const object: any = {
				a: {
					b: [
						'index 0',
						{
							c: 'any value',
						},
					],
				},
			};
			const path = ObjectPath.compile('a.b.1.d');
			path.unset(object);
			expect(object).to.be.deep.equal({
				a: {
					b: [
						'index 0',
						{
							c: 'any value',
						},
					],
				},
			});
		});

		it('should do nothing when the array value does not exist', () => {
			const object: any = {
				a: {
					b: [
						'index 0',
						{
							c: 'any value',
						},
					],
				},
			};
			const path = ObjectPath.compile('a.b.2');
			path.unset(object);
			expect(object).to.be.deep.equal({
				a: {
					b: [
						'index 0',
						{
							c: 'any value',
						},
					],
				},
			});
		});
	});
});
