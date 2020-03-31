import { Observable, BehaviorSubject } from 'rxjs';

import { ObjectPath } from './ObjectPath';

type BaseType = string | number | boolean | null;

interface ObjectType { [key: string]: BaseType | BaseType[] | ObjectType | ObjectType[]; }

type ValueType = BaseType | BaseType[] | ObjectType | ObjectType[];

export interface Set {
	[path: string]: ValueType;
}

export interface Unset {
	[path: string]: '';
}

export interface Updates {
	$set?: Set[];
	$unset?: Unset[];
}

export function applyUpdates(obj: object, updates: Updates) {
	for (const set of updates.$set || []) {
		for (const path of Object.keys(set)) {
			ObjectPath.compile(path).set(obj, set[path]);
		}
	}
	for (const unset of updates.$unset || []) {
		for (const path of Object.keys(unset)) {
			ObjectPath.compile(path).unset(obj);
		}
	}
}

export function mergeUpdates(a: Updates, b: Updates) {
	const result: Updates = {};
	if (a.$set != null || b.$set != null) {
		result.$set = [...(a.$set || []), ...(b.$set || [])];
	}
	if (a.$unset != null || b.$unset != null) {
		result.$unset = [...(a.$unset || []), ...(b.$unset || [])];
	}
	return result;
}

export function isEmptyUpdates(updates: Updates) {
	return updates.$set == null && updates.$unset == null;
}

export class UpdateCollector {

	private readonly modifiedSubject = new BehaviorSubject<boolean>(false);
	private sets: Array<{ path: ObjectPath, value: ValueType }> = [];
	private unsets: ObjectPath[] = [];

	public get modified(): Observable<boolean> {
		return this.modifiedSubject;
	}

	public clear() {
		this.sets = [];
		this.unsets = [];
		this.updateModified();
	}

	public set(path: ObjectPath, value: ValueType) {
		this.removeSubpaths(path);
		this.sets.push({ path, value });
		this.updateModified();
	}

	public unset(path: ObjectPath) {
		this.removeSubpaths(path);
		this.unsets.push(path);
		this.updateModified();
	}

	public merge(updates: Updates) {
		if (updates.$set != null) {
			for (const set of updates.$set) {
				for (const path of Object.keys(set)) {
					this.set(
						ObjectPath.compile(path),
						set[path]
					);
				}
			}
		}
		if (updates.$unset != null) {
			for (const unset of updates.$unset) {
				for (const path of Object.keys(unset)) {
					this.unset(ObjectPath.compile(path));
				}
			}
		}
	}

	public createUpdates(): Updates {
		const result: Updates = {};
		if (this.sets.length > 0) {
			result.$set = [];
			for (const s of this.sets) {
				const set: Set = {};
				set[s.path.toString()] = s.value;
				result.$set.push(set);
			}
		}
		if (this.unsets.length > 0) {
			result.$unset = [];
			for (const u of this.unsets) {
				const unset: Unset = {};
				unset[u.toString()] = '';
				result.$unset.push(unset);
			}
		}
		return result;
	}

	private removeSubpaths(path: ObjectPath) {
		this.sets = this.sets.filter(it => !it.path.isChildOfOrSame(path));
		this.unsets = this.unsets.filter(it => !it.isChildOfOrSame(path));
	}

	private updateModified() {
		const modified = this.sets.length > 0 || this.unsets.length > 0;
		this.modifiedSubject.next(modified);
	}

}

