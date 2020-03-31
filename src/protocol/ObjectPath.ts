
interface PropertySegment {
	type: 'property';
	key: string;
}

interface ArraySegment {
	type: 'array';
	key: number;
}

interface IdentitySegment {
	type: 'identity';
}

type Segment = PropertySegment | ArraySegment | IdentitySegment;

export class ObjectPath {



	public static compile(path: string) {
		if (path === '.') {
			return new ObjectPath([], { type: 'identity' });
		}
		const segments: Segment[] = [];
		for (const segment of path.split('.')) {
			if (ObjectPath.ARRAY_PATTERN.test(segment)) {
				segments.push({ type: 'array', key: Number.parseInt(segment, 10) });
			} else if (ObjectPath.PROPERTY_PATTERN.test(segment)) {
				segments.push({ type: 'property', key: segment });
			} else {
				throw new Error(`Invalid object path: '${path}'`);
			}
		}
		return new ObjectPath(
			segments.slice(0, segments.length - 1),
			segments[segments.length - 1]);
	}

	private static readonly PROPERTY_PATTERN = /^.+$/;
	private static readonly ARRAY_PATTERN = /^\d+$/;

	private static segmentToString(segment: Segment): string {
		switch (segment.type) {
			case 'property':
				return segment.key;
			case 'array':
				return `${segment.key}`;
			case 'identity':
				return '.';
		}
	}

	private static isSameSegment(a: Segment, b: Segment): boolean {
		if (a.type === 'identity' || b.type === 'identity') {
			return true;
		}
		switch (a.type) {
			case 'property':
				return b.type === 'property' && a.key === b.key;
			case 'array':
				return b.type === 'array' && a.key === b.key;
		}
	}

	private static getSegment(object: any, segment: Segment): any {
		switch (segment.type) {
			case 'property':
				if (typeof object === 'object') {
					return object[segment.key];
				}
				break;
			case 'array':
				if (Array.isArray(object) && segment.key >= 0 && segment.key < object.length) {
					return object[segment.key];
				}
				break;
			case 'identity':
				return object;
		}
		return undefined;
	}

	private static createEmptySegment(segment: Segment): any {
		switch (segment.type) {
			case 'property':
				return {};
			case 'array':
				return [];
		}
		return undefined;
	}

	private static setSegment(object: any, segment: Segment, value: any) {
		switch (segment.type) {
			case 'property':
				if (typeof object === 'object') {
					object[segment.key] = value;
				}
				break;
			case 'array':
				if (Array.isArray(object)) {
					if (segment.key >= 0 && segment.key < object.length) {
						object[segment.key] = value;
					} else {
						while (segment.key > object.length) {
							object.push(undefined);
						}
						object.push(value);
					}
				}
				break;
			case 'identity':
				throw new Error('Cannot set identity path');
		}
	}

	private static unsetSegment(object: any, segment: Segment) {
		switch (segment.type) {
			case 'property':
				if (typeof object === 'object') {
					delete object[segment.key];
					return;
				}
				break;
			case 'array':
				if (Array.isArray(object) && segment.key >= 0 && segment.key < object.length) {
					object.splice(segment.key, 1);
					return;
				}
				break;
			case 'identity':
				throw new Error('Cannot unset identity path');
		}
	}

	private constructor(private readonly prefix: Segment[], private readonly segment: Segment) {
	}

	public get identity() {
		return this.prefix.length === 0 && this.segment.type === 'identity';
	}

	public toString(): string {
		return [...this.prefix.map(it => ObjectPath.segmentToString(it)),
		ObjectPath.segmentToString(this.segment)].join('.');
	}

	public isSame(other: ObjectPath): boolean {
		if (other.prefix.length !== this.prefix.length) {
			return false;
		}
		for (let i = 0; i < this.prefix.length; ++i) {
			if (!ObjectPath.isSameSegment(other.prefix[i], this.prefix[i])) {
				return false;
			}
		}
		return ObjectPath.isSameSegment(other.segment, this.segment);
	}

	public isChildOf(parent: ObjectPath): boolean {
		if (this.identity && parent.identity) {
			return false;
		}
		if (parent.identity) {
			return true;
		}
		if (parent.prefix.length >= this.prefix.length) {
			return false;
		}
		for (let i = 0; i < parent.prefix.length; ++i) {
			if (!ObjectPath.isSameSegment(parent.prefix[i], this.prefix[i])) {
				return false;
			}
		}
		return ObjectPath.isSameSegment(parent.segment, this.prefix[parent.prefix.length]);
	}

	public isChildOfOrSame(other: ObjectPath): boolean {
		if (other.identity) {
			return true;
		}
		if (other.prefix.length > this.prefix.length) {
			return false;
		}
		return this.isSame(other) || this.isChildOf(other);
	}

	public append(subpath: ObjectPath): ObjectPath {
		return new ObjectPath([...this.prefix, this.segment, ...subpath.prefix], subpath.segment);
	}

	public get<T>(object: object | any[]): T | undefined {
		let partial: any = object;
		for (const segment of this.prefix) {
			partial = ObjectPath.getSegment(partial, segment);
		}
		return ObjectPath.getSegment(partial, this.segment);
	}

	public set(object: object | any[], value: any) {
		let partial: any = object;
		for (let i = 0; i < this.prefix.length; ++i) {
			const segment = this.prefix[i];
			let next = ObjectPath.getSegment(partial, segment);
			if (next == null) {
				next = ObjectPath.createEmptySegment(i < this.prefix.length - 1
					? this.prefix[i + 1]
					: this.segment);
				ObjectPath.setSegment(partial, segment, next);
			}
			partial = next;
		}
		ObjectPath.setSegment(partial, this.segment, value);
	}

	public unset(object: object | any[]) {
		let partial: any = object;
		for (const segment of this.prefix) {
			partial = ObjectPath.getSegment(partial, segment);
		}
		if (partial != null) {
			ObjectPath.unsetSegment(partial, this.segment);
		}
	}

}

