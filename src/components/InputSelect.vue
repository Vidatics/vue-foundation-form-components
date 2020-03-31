<template>
	<label>
		{{label}}
		<span
			v-if="readonly"
			class="readonly text-ellipsis"
			type="text"
			:title="modelText"
		>{{modelText}}</span>
		<select
			v-if="!readonly"
			:multiple="multiple"
			v-model="model"
			v-on="$listeners"
			:disabled="readonly"
		>
			<option v-for="(option, i) in options" :key="i" :value="option.value">{{option.label}}</option>
		</select>
	</label>
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

import { ObjectPath } from '../protocol/ObjectPath';
import { UpdateCollector } from '../protocol/UpdateCollector';

import {
	FormData,
	UPDATE_COLLECTOR,
	FORM_DATA,
	ObjectContext,
	OBJECT_CONTEXT,
} from './form.consts';

export interface Option {
	label: string;
	value: any;
}

@Component({
	name: 'ofSelect',
})
export default class extends Vue {
	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(UPDATE_COLLECTOR) private collector!: UpdateCollector;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;

	@Prop() private label?: string;
	@Prop() private multiple?: boolean;
	@Prop({ required: true }) private path!: string;
	@Prop({ required: true }) private options!: Option[];
	@Prop({ default: false }) private disabled!: boolean;

	private value: any | null = null;
	private objectPath: ObjectPath | null = null;

	public get readonly() {
		return this.formData == null || this.formData.readonly || this.disabled;
	}

	public get modelText() {
		if (this.model == null) {
			return '';
		}
		const option = this.options.find(it => it.value === this.model);
		return option != null ? option.label : '';
	}

	public get model(): any | null {
		return this.value;
	}

	public set model(value: any | null) {
		if (this.collector == null) {
			throw new Error('form input without form');
		}
		const modelValue = value;
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
		this.value = value;
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
