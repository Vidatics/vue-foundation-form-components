<template>
	<div>
		<of-input-select
			:label="label"
			:path="path"
			v-bind="$attrs"
			:options="foreignKeys"
			@update:value="setValue"
		/>
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

import { ObjectPath } from '../protocol/ObjectPath';
import ofSelect from './InputSelect.vue';

export interface Option {
	label: string;
	value: any;
}

@Component({
	name: 'ofForeignKey',
	components: { ofSelect },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() private label?: string;
	@Prop({ required: true }) private path!: string;
	@Prop({ required: true }) private items!: any[];
	@Prop({ required: true }) private foreignKey!: string;
	@Prop({ required: true }) private foreignLabel!: string;

	private foreignKeys: Option[] = [];

	private foreignKeyPath: ObjectPath = ObjectPath.compile('value');
	private foreignLabelPath: ObjectPath = ObjectPath.compile('label');

	@Emit('update:value')
	private setValue(value: any | null) {
		return value;
	}

	@Watch('items', { immediate: true })
	private calcualateKeys() {
		if (!this.foreignKeyPath || !this.foreignLabelPath || !this.items) {
			this.foreignKeys = [];
		}

		this.foreignKeys = this.items.map(item => {
			const label = this.foreignLabelPath.get(item) as string;
			const value = this.foreignKeyPath.get(item) as string;
			return {
				value,
				label,
			};
		});
		this.foreignKeys.splice(0, 0, {value: null, label: '' });
	}

	@Watch('foreignKey', { immediate: true })
	private buildForeignKeyPath(path: string) {
		if (!path) {
			return;
		}
		this.foreignKeyPath = ObjectPath.compile(path);
		this.calcualateKeys();
	}

	@Watch('foreignLabel', { immediate: true })
	private buildForeignLabelPath(path: string) {
		if (!path) {
			return;
		}
		this.foreignLabelPath = ObjectPath.compile(path);
		this.calcualateKeys();
	}
}
</script>

<style lang="scss" scoped>
@import 'styles';

.readonly {
	@include readonly-input;
}
</style>
