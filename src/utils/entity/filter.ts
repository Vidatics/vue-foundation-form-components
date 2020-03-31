import { DateTime } from 'luxon';
import { ObjectPath } from '../../protocol';

type ForeignFetch = (id: unknown) => object | undefined;

export interface StringFilterCriterion {
	type: 'string';
	path: ObjectPath;
	value: Array<string | null>;
}

export interface NumberFilterCriterion {
	type: 'number';
	path: ObjectPath;
	value: Array<number | null>;
}

export interface BooleanFilterCriterion {
	type: 'boolean';
	path: ObjectPath;
	value: Array<boolean | null>;
}

export interface DateFilterCriterion {
	type: 'date';
	path: ObjectPath;
	value: Array<DateTime | null>;
}

export interface FunctionFilterCriterion {
	type: 'function';
	path: ObjectPath;
	accept: (value: any) => boolean;
}

export interface ForeignKeyStringFilterCriterion {
	type: 'foreign:string';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	foreignPath: ObjectPath;
	value: Array<string | null>;
}

export interface ForeignKeyNumberFilterCriterion {
	type: 'foreign:number';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	foreignPath: ObjectPath;
	value: Array<number | null>;
}

export interface ForeignKeyBooleanFilterCriterion {
	type: 'foreign:boolean';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	foreignPath: ObjectPath;
	value: Array<boolean | null>;
}

export interface ForeignKeyDateFilterCriterion {
	type: 'foreign:date';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	foreignPath: ObjectPath;
	value: Array<DateTime | null>;
}

export interface ForeignKeyFunctionFilterCriterion {
	type: 'foreign:function';
	path: ObjectPath;
	foreignFetch: ForeignFetch;
	foreignPath: ObjectPath;
	accept: (value: any) => boolean;
}

export interface OrFilterCriterion {
	type: 'or';
	criterions: ReadonlyArray<EntityFilterCriterion>;
}

export interface AndFilterCriterion {
	type: 'and';
	criterions: ReadonlyArray<EntityFilterCriterion>;
}

export type EntityFilterCriterion = StringFilterCriterion | NumberFilterCriterion | BooleanFilterCriterion | DateFilterCriterion | FunctionFilterCriterion |
	ForeignKeyStringFilterCriterion | ForeignKeyNumberFilterCriterion | ForeignKeyDateFilterCriterion | ForeignKeyBooleanFilterCriterion | ForeignKeyFunctionFilterCriterion |
	OrFilterCriterion | AndFilterCriterion | null;

export type EntityFilterSimpleCriterion = StringFilterCriterion | NumberFilterCriterion | BooleanFilterCriterion | DateFilterCriterion | FunctionFilterCriterion |
	ForeignKeyStringFilterCriterion | ForeignKeyNumberFilterCriterion | ForeignKeyDateFilterCriterion | ForeignKeyBooleanFilterCriterion | ForeignKeyFunctionFilterCriterion;

export function acceptEntity(entity: object, criterions: ReadonlyArray<EntityFilterCriterion>) {
	return acceptAnd(entity, criterions);
}

export function acceptEntityCriterion(entity: object, criterion: EntityFilterCriterion) {
	if (criterion == null) {
		return true;
	}
	switch (criterion.type) {
		case 'and':
			return acceptAnd(entity, criterion.criterions);
		case 'or':
			return acceptOr(entity, criterion.criterions);
		case 'string': {
			return acceptBasic(criterion.path.get(entity) as string, criterion.value);
		}
		case 'number':
			return acceptBasic(criterion.path.get(entity) as number, criterion.value);
		case 'boolean':
			return acceptBasic(criterion.path.get(entity) as boolean, criterion.value);
		case 'date': {
			const value = criterion.path.get(entity);
			return acceptDate(value != null ? DateTime.fromISO(value as string) : null, criterion.value);
		}
		case 'function':
			return criterion.accept(criterion.path.get(entity));
		case 'foreign:string': {
			const value = criterion.path.get(entity);
			const foreignEntity = criterion.foreignFetch(value);
			const foreignValue = foreignEntity != null ? criterion.foreignPath.get(foreignEntity) : null;
			return acceptBasic(foreignValue as string, criterion.value);
		}
		case 'foreign:number': {
			const value = criterion.path.get(entity);
			const foreignEntity = criterion.foreignFetch(value);
			const foreignValue = foreignEntity != null ? criterion.foreignPath.get(foreignEntity) : null;
			return acceptBasic(foreignValue as number, criterion.value);
		}
		case 'foreign:boolean': {
			const value = criterion.path.get(entity);
			const foreignEntity = criterion.foreignFetch(value);
			const foreignValue = foreignEntity != null ? criterion.foreignPath.get(foreignEntity) : null;
			return acceptBasic(foreignValue as boolean, criterion.value);
		}
		case 'foreign:date': {
			const value = criterion.path.get(entity);
			const foreignEntity = criterion.foreignFetch(value);
			const foreignValue = foreignEntity != null ? criterion.foreignPath.get(foreignEntity) : null;
			return acceptDate(foreignValue != null ? DateTime.fromISO(foreignValue as string) : null, criterion.value);
		}
		case 'foreign:function': {
			const value = criterion.path.get(entity);
			const foreignEntity = criterion.foreignFetch(value);
			const foreignValue = foreignEntity != null ? criterion.foreignPath.get(foreignEntity) : null;
			return criterion.accept(foreignValue);
		}
	}
}

function acceptAnd(entity: object, criterions: ReadonlyArray<EntityFilterCriterion>) {
	for (const c of criterions) {
		if (!acceptEntityCriterion(entity, c)) {
			return false;
		}
	}
	return true;
}

function acceptOr(entity: object, criterions: ReadonlyArray<EntityFilterCriterion>) {
	for (const c of criterions) {
		if (acceptEntityCriterion(entity, c)) {
			return true;
		}
	}
	return false;
}

function acceptBasic<T extends (string | number | boolean)>(value: T | null, filters: ReadonlyArray<T | null>) {
	for (const filter of filters) {
		if (filter == null && value == null) {
			return true;
		} else if (filter != null && value != null && value === filter) {
			return true;
		}
	}
	return false;
}

function acceptDate(value: DateTime | null, filters: ReadonlyArray<DateTime | null>) {
	for (const filter of filters) {
		if (filter == null && value == null) {
			return true;
		} else if (filter != null && value != null &&
			filter.year === value.year &&
			filter.month === value.month &&
			filter.day === value.day) {
			return true;
		}
	}
	return false;
}
