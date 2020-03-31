<template>
	<div>
		<span
			v-if="!readonlyShowInput && readonly"
			class="readonly text-ellipsis"
			:type="type"
			:title="formatted"
		>{{formatted}}</span>
		<input
			v-if="readonlyShowInput || !readonly"
			:type="type"
			v-model="model"
			:readonly="readonly"
			:disabled="readonly"
			v-bind="$attrs"
			v-on="$listeners"
		/>
		<slot name="suffix"></slot>
	</div>
</template>

<script lang="ts">
import {
	Component,
	Emit,
	Inject,
	Prop,
	Vue,
	Watch,
} from 'vue-property-decorator';

import {
	FormData,
	FORM_DATA,
	UPDATE_COLLECTOR,
	ObjectContext,
	OBJECT_CONTEXT,
} from './form.consts';
import { UpdateCollector } from '../protocol/UpdateCollector';
import { ObjectPath } from '../protocol/ObjectPath';

@Component({
	name: 'ofInput',
	inheritAttrs: false,
})
export default class extends Vue {
	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;
	@Inject(UPDATE_COLLECTOR) private collector!: UpdateCollector;

	@Prop({ required: true }) private type!: string;
	@Prop({ required: true, type: String }) private path!: string;
	@Prop({ default: false }) private readonlyShowInput!: boolean;
	@Prop() private convertFromInput?: (value: any | null) => any;
	@Prop() private convertToInput?: (value: any | null) => any;
	@Prop() private convertToString?: (value: any | null) => string;
	@Prop({ default: false }) private disabled!: boolean;

	private value: any | null = null;
	private objectPath: ObjectPath | null = null;

	public get readonly() {
		return this.formData == null || this.formData.readonly || this.disabled;
	}

	public get formatted() {
		return this.convertToString != null
			? this.convertToString(this.value)
			: this.value;
	}

	public get model(): any | null {
		return this.value;
	}

	public set model(value: any | null) {
		if (this.collector == null) {
			throw new Error('form input without form');
		}

		const modelValue =
			this.convertFromInput != null
				? this.convertFromInput(value)
				: value;
		if (this.objectPath != null) {
			if (modelValue == null) {
				this.collector.unset(this.objectPath);
				this.setValue(null);
			} else {
				this.collector.set(this.objectPath, modelValue);
				this.setValue(modelValue);
			}
		} else {
			this.setValue(null);
		}
	}

	@Emit('update:value')
	private setValue(value: any | null) {
		if (this.convertToInput != null) {
			this.value = this.convertToInput(value);
		} else {
			this.value = value;
		}
	}

	@Watch('objectContext.prefix')
	@Watch('path', { immediate: true })
	private updateObjectPath() {
		if (this.objectContext == null) {
			throw new Error('form input without form');
		}
		if (this.path != null && this.path.length > 0) {
			const prefix = this.objectContext.prefix;
			this.objectPath = ObjectPath.compile(
				prefix.length > 0 ? `${prefix}.${this.path}` : this.path
			);
		} else {
			this.objectPath = null;
		}
		this.updateValue();
	}

	@Watch('formData.value', { immediate: true })
	private updateValue() {
		if (this.formData == null) {
			throw new Error('form input without form');
		}
		const value =
			this.formData.value != null && this.objectPath != null
				? this.objectPath.get(this.formData.value)
				: null;
		this.setValue(value != null ? value : null);
	}
}
</script>

<style lang="scss" scoped>
@import 'styles';

.readonly {
	@include readonly-input;
}
</style>
