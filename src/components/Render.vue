<template>
	<label>
		{{label}}
		<span class="render text-ellipsis" type="text" :title="rendering">{{rendering}}</span>
	</label>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator';

import {
	FormData,
	FORM_DATA,
	ObjectContext,
	OBJECT_CONTEXT,
} from './form.consts';
import { ObjectPath } from '../protocol';

@Component({
	name: 'ofRender',
})
export default class extends Vue {
	@Prop() public label?: string;
	@Prop() public path?: string;
	@Prop({ required: true }) public render?: (value: any) => string;

	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;

	private objectPath: ObjectPath = ObjectPath.compile('.');
	private value: any = null;

	public get rendering() {
		return this.render != null ? this.render(this.value) : '';
	}

	@Watch('objectContext.prefix')
	@Watch('path', { immediate: true })
	public updateObjectPath() {
		if (this.objectContext == null) {
			throw new Error('render component without form');
		}
		if (this.path != null && this.path.length > 0) {
			const prefix = this.objectContext.prefix;
			this.objectPath = ObjectPath.compile(
				prefix.length > 0 ? `${prefix}.${this.path}` : this.path
			);
		} else {
			this.objectPath = ObjectPath.compile('.');
		}
		this.updateValue();
	}

	@Watch('formData.value', { immediate: true })
	public updateValue() {
		if (this.formData == null) {
			throw new Error('render component without form');
		}
		this.value =
			this.formData.value != null
				? this.objectPath.get(this.formData.value)
				: null;
	}
}
</script>

<style lang="scss" scoped>
@import 'styles';

.render {
	@include readonly-input;
}
</style>

