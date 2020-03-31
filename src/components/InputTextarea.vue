<template>
  <label>
    {{label}}
      <span v-show="readonly" class="readonly" type="text">{{model}}</span>
      <textarea
        v-show="!readonly"
        v-model="model"
        :readonly="readonly"
        :disabled="readonly"
        v-bind="$attrs"
        v-on="$listeners"
      ></textarea>
  </label>
</template>

<script lang="ts">
import {
	Component,
	Inject,
	Prop,
	Emit,
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
import { UpdateCollector, ObjectPath } from '../protocol';

@Component({
	name: 'ofTextarea',
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() public label?: string;

	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(UPDATE_COLLECTOR) private collector!: UpdateCollector;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;
	@Prop({ required: true, type: String }) private path!: string;

	private value: string | null = null;
	private objectPath: ObjectPath | null = null;

	public get model() {
		return this.value;
	}

	public set model(value: string | null) {
		if (this.collector == null) {
			throw new Error('form input without form');
		}
		if (this.objectPath != null) {
			if (value == null) {
				this.collector.unset(this.objectPath);
				this.setValue(null);
			} else {
				this.collector.set(this.objectPath, value);
				this.setValue(value);
			}
		} else {
			this.setValue(null);
		}
	}

	public get readonly() {
		return this.formData == null || this.formData.readonly;
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
		} else {
			const value =
				this.formData.value != null && this.objectPath != null
					? this.objectPath.get(this.formData.value)
					: null;
			this.setValue(value != null ? value : null);
		}
	}
}
</script>

<style lang="scss" scoped>
.readonly {
	border: none;
	box-shadow: none;
	background-color: transparent;
}
</style>
