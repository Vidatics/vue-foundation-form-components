<template>
	<form ref="form" data-abide>
		<slot></slot>
	</form>
</template>

<script lang="ts">
import {
	Component,
	Emit,
	Prop,
	Provide,
	Vue,
	Watch,
} from 'vue-property-decorator';
import { UpdateCollector, Updates } from '../protocol/UpdateCollector';
import { Observable, Subject } from 'rxjs';

import $ from 'jquery';
import 'foundation-sites';
import { ObjectPath } from '../protocol/ObjectPath';

import {
	FormData,
	FORM_DATA,
	UPDATE_COLLECTOR,
	ObjectContext,
	OBJECT_CONTEXT,
	ObjectForm,
	FormDataHandler,
} from './form.consts';

@Component({
	name: 'ObjectForm',
})
export default class extends Vue implements ObjectForm {
	private clearSubject = new Subject<true>();
	@Provide(FORM_DATA)
	private formData: FormData = {
		value: undefined,
		readonly: false,
		clear: this.clearSubject,
		register: this.registerHandler,
	};
	@Provide(UPDATE_COLLECTOR)
	private collector = new UpdateCollector();
	@Provide(OBJECT_CONTEXT)
	private objectContex: ObjectContext = {
		prefix: '',
	};

	@Prop() private value!: any;
	@Prop({ default: false }) private readonly!: boolean;

	private formHandlers: FormDataHandler[] = [];

	private form: FoundationSites.Abide | null = null;

	public mounted() {
		this.$subscribeTo(this.collector.modified, value =>
			this.modified(value)
		);
		this.form = new Foundation.Abide($(this.$refs.form as HTMLElement));
	}

	public destroyed() {
		if (this.form != null) {
			this.form.destroy();
			this.form = null;
		}
	}

	public getValue(): any {
		return this.value;
	}

	public validate() {
		const valid = this.form != null ? this.form.validateForm() : false;
		if (!valid) {
			const invalid = $(this.$el)
				.find('.is-invalid-input')
				.first();
			if (invalid.length > 0) {
				invalid[0].scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}
		return valid;
	}

	public createUpdates() {
		for (const h of this.formHandlers) {
			h.beforeCreateUpdates();
		}
		return this.collector.createUpdates();
	}

	public clearUpdates() {
		this.clearSubject.next(true);
		this.collector.clear();
		if (this.form != null) {
			this.form.resetForm();
		}
		this.updateValue();
	}

	private registerHandler(handler: FormDataHandler): () => void {
		this.formHandlers = [...this.formHandlers, handler];
		let deleted = false;
		return () => {
			if (!deleted) {
				deleted = true;
				const index = this.formHandlers.indexOf(handler);
				if (index >= 0) {
					this.formHandlers = [...this.formHandlers];
					this.formHandlers.splice(index, 1);
				}
			}
		};
	}

	@Emit()
	// tslint:disable-next-line:no-empty
	private modified(value: boolean) {}

	@Watch('value', { immediate: true })
	private updateValue() {
		this.formData.value = this.value;
		this.collector.clear();
	}

	@Watch('readonly', { immediate: true })
	private updateReadonly() {
		this.formData.readonly = this.readonly;
	}
}
</script>



