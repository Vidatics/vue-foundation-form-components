import { ObjectPath } from '../../protocol';
import { DateTime } from 'luxon';

type ForeignFetch = (id: unknown) => object | null;

export interface PrimitiveOrderBy {
	type: 'string' | 'date' | 'number' | 'boolean';
	path: ObjectPath;
	order: 'asc' | 'desc';
}

export interface FunctionOrderBy {
	type: 'function';
	path: ObjectPath;
	compare: (a: any, b: any) => number;
	order: 'asc' | 'desc';
}

type BasicOrderBy = PrimitiveOrderBy | FunctionOrderBy;

export interface ForeignOrderBy {
	type: 'foreign';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	orderBy: BasicOrderBy;
}

export type EntityOrderBy = PrimitiveOrderBy | FunctionOrderBy | ForeignOrderBy;

export function compareEntities<T extends object>(a: T, b: T, orderBy: ReadonlyArray<EntityOrderBy>) {
	if (orderBy.length === 0) {
		return 0;
	}
	for (const o of orderBy) {
		const cmp = compareEntityOrderBy(a, b, o);
		if (cmp !== 0) {
			return cmp;
		}
	}
	return 0;
}

function compareEntityOrderBy<T extends object>(a: T, b: T, orderBy: EntityOrderBy) {
	switch (orderBy.type) {
		case 'string':
		case 'number':
		case 'boolean':
		case 'date':
		case 'function':
			return compareBasicOrderBy(a, b, orderBy);
		case 'foreign': {
			const aValue = orderBy.path.get(a);
			const bValue = orderBy.path.get(b);
			const refA = aValue != null
				? orderBy.foreignFetch(aValue)
				: null;
			const refB = bValue != null
				? orderBy.foreignFetch(bValue)
				: null;
			if (refA == null || refB == null) {
				return 0;
			} else if (refA == null) {
				return 1;
			} else if (refB == null) {
				return -1;
			}
			return compareBasicOrderBy(refA, refB, orderBy.orderBy);
		}
	}
}


function compareBasicOrderBy<T extends object>(a: T, b: T, orderBy: BasicOrderBy) {
	const aValue = orderBy.path.get(a);
	const bValue = orderBy.path.get(b);
	let result: number = 0;
	if (a == null && b == null) {
		result = 0;
	} else if (a == null) {
		result = 1;
	} else if (b == null) {
		result = -1;
	} else {
		switch (orderBy.type) {
			case 'string':
			case 'number':
			case 'boolean':
				const aString = `${aValue}`;
				const bString = `${bValue}`;
				result = aString < bString ? -1 : aString > bString ? 1 : 0;
				break;
			case 'date':
				const dateA = DateTime.fromISO(aValue as string);
				const dateB = DateTime.fromISO(bValue as string);
				result = dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
				break;
			case 'function':
				result = orderBy.compare(aValue, bValue);
				break;
		}
	}
	return (orderBy.order === 'desc' ? -1 : 1) * result;
}
