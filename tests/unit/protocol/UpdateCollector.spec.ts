import { expect } from 'chai';
import { ObjectPath } from '@/protocol/ObjectPath';
import { UpdateCollector } from '@/protocol/UpdateCollector';

describe('UpdateCollector', () => {
	describe('set', () => {
		it('adds a new value setter', () => {
			const collector = new UpdateCollector();
			collector.set(ObjectPath.compile('a.b'), 'new value 1');
			collector.set(ObjectPath.compile('a.c.1'), 'new value 2');
			expect(collector.createUpdates()).to.be.deep.equal({
				$set: [{
					'a.b': 'new value 1',
				}, {
					'a.c.1': 'new value 2',
				}],
			});
		});

		it('deletes sets overwrites', () => {
			const collector = new UpdateCollector();
			collector.set(ObjectPath.compile('a.b.2'), 'should be overwritten');
			collector.set(ObjectPath.compile('a.c.1'), 'should be overwritten');
			collector.set(ObjectPath.compile('a.c.1'), 'should overwrite 1');
			collector.set(ObjectPath.compile('a.b'), 'should overwrite 2');
			expect(collector.createUpdates()).to.be.deep.equal({
				$set: [{
					'a.c.1': 'should overwrite 1',
				}, {
					'a.b': 'should overwrite 2',
				}],
			});
		});

		it('deletes unsets overwrites', () => {
			const collector = new UpdateCollector();
			collector.unset(ObjectPath.compile('a.b.2'));
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.set(ObjectPath.compile('a.c.1'), 'should ovewrite 1');
			collector.set(ObjectPath.compile('a.b'), 'should overwrite 2');
			expect(collector.createUpdates()).to.be.deep.equal({
				$set: [{
					'a.c.1': 'should ovewrite 1',
				}, {
					'a.b': 'should overwrite 2',
				}],
			});
		});
	});

	describe('unset', () => {
		it('adds a new key unsetter', () => {
			const collector = new UpdateCollector();
			collector.unset(ObjectPath.compile('a.b'));
			collector.unset(ObjectPath.compile('a.c.1'));
			expect(collector.createUpdates()).to.be.deep.equal({
				$unset: [{
					'a.b': '',
				}, {
					'a.c.1': '',
				}],
			});
		});

		it('deletes sets overwrites', () => {
			const collector = new UpdateCollector();
			collector.set(ObjectPath.compile('a.b.2'), 'should be overwritten');
			collector.set(ObjectPath.compile('a.c.1'), 'should be overwritten');
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.unset(ObjectPath.compile('a.b'));
			expect(collector.createUpdates()).to.be.deep.equal({
				$unset: [{
					'a.c.1': '',
				}, {
					'a.b': '',
				}],
			});
		});

		it('deletes unsets overwrites', () => {
			const collector = new UpdateCollector();
			collector.unset(ObjectPath.compile('a.b.2'));
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.unset(ObjectPath.compile('a.b'));
			expect(collector.createUpdates()).to.be.deep.equal({
				$unset: [{
					'a.c.1': '',
				}, {
					'a.b': '',
				}],
			});
		});
	});


	describe('clear', () => {
		it('clears setter', () => {
			const collector = new UpdateCollector();
			collector.set(ObjectPath.compile('a.b'), 'new value');
			collector.set(ObjectPath.compile('a.c.1'), 'new value');
			collector.clear();
			expect(collector.createUpdates()).to.be.deep.equal({});
		});

		it('clear unsetters', () => {
			const collector = new UpdateCollector();
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.unset(ObjectPath.compile('a.b'));
			collector.clear();
			expect(collector.createUpdates()).to.be.deep.equal({});
		});

		it('is idempotent', () => {
			const collector = new UpdateCollector();
			collector.clear();
			expect(collector.createUpdates()).to.be.deep.equal({});
		});
	});

	describe('createUpdates', () => {
		it('collects setters', () => {
			const collector = new UpdateCollector();
			collector.set(ObjectPath.compile('a.b'), 'new value');
			collector.set(ObjectPath.compile('a.c.1'), 'new value');
			expect(collector.createUpdates()).to.be.deep.equal({
				$set: [{
					'a.b': 'new value',
				}, {
					'a.c.1': 'new value',
				}],
			});
		});

		it('collects unsetters', () => {
			const collector = new UpdateCollector();
			collector.unset(ObjectPath.compile('a.c.1'));
			collector.unset(ObjectPath.compile('a.b'));
			expect(collector.createUpdates()).to.be.deep.equal({
				$unset: [{
					'a.c.1': '',
				}, {
					'a.b': '',
				}],
			});
		});

		it('collects an empty collector', () => {
			const collector = new UpdateCollector();
			expect(collector.createUpdates()).to.be.deep.equal({});
		});
	});

});
