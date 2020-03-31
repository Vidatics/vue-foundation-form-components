import Vue from 'vue';
import { Updates } from '../protocol';
import { Observable } from 'rxjs';

export const FORM_DATA = Symbol('form-data');
export const UPDATE_COLLECTOR = Symbol('update-collector');
export const OBJECT_CONTEXT = Symbol('object-context');

export interface FormDataHandler {
	beforeCreateUpdates(): void;
}

export interface FormData {
	clear: Observable<true>;
	value: any;
	readonly: boolean;

	register(handler: FormDataHandler): () => void;
}

export interface ObjectContext {
	prefix: string;
}

export interface ObjectForm extends Vue {

	getValue<T>(): T;

	validate(): boolean;
	createUpdates(): Updates;
	clearUpdates(): void;
}
