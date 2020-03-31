<template>
	<label>
		{{label}}
		<div class="input-group">
			<slot name="prefix" />
			<of-input
				class="input-group-field"
				type="number"
				:placeholder="minPlaceholder"
				:path="minPath"
				:convertFromInput="toNumber"
				:max="maxValue"
				v-bind="$attrs"
				@update:value="setMinValue"
			/>
			<of-input
				class="input-group-field"
				type="number"
				:placeholder="maxPlaceholder"
				:path="maxPath"				
				:convertFromInput="toNumber"
				:min="minValue"
				v-bind="$attrs"
				@update:value="setMaxValue"
			/>
			<slot name="suffix" />
		</div>
	</label>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

import ofInput from './Input.vue';

@Component({
	name: 'ofMinMaxField',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() private label?: string;
	@Prop({ default: 'Min', type: String }) private minPlaceholder!: string;
	@Prop({ default: 'Max', type: String }) private maxPlaceholder!: string;
	@Prop({ required: true }) private minPath!: string;
	@Prop({ required: true }) private maxPath!: string;

	private minValue: number | null = null;
	private maxValue: number | null = null;

	private toNumber(value: string | null): number | null {
		if (value == null) {
			return null;
		}
		const result = Number.parseFloat(value);
		return Number.isFinite(result) ? result : null;
	}

	private setMinValue(minValue: number | null) {
		this.minValue = minValue;
		this.setValue();
	}

	private setMaxValue(maxValue: number | null) {
		this.maxValue = maxValue;
		this.setValue();
	}

	@Emit('update:value')
	private setValue() {
		const result: { min?: number; max?: number } = {};
		if (this.minValue != null) {
			result.min = this.minValue;
		}
		if (this.maxValue != null) {
			result.max = this.maxValue;
		}
		return result;
	}
}
</script>
