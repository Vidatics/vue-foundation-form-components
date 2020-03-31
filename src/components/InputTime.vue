<template>
	<label>
		{{label}}
		<div class="input-group">
			<slot name="prefix" />
			<of-input
				class="input-group-field"
				type="time"
				:path="path"
				:convertFromInput="convertToTime"
				:convertToInput="convertToInput"
				:convertToString="formatValue"
				v-bind="$attrs"
				v-on="$listeners"
			/>
			<slot name="suffix" />
		</div>
	</label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ofInput from './Input.vue';
import { DateTime } from 'luxon';

@Component({
	name: 'ofTime',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop()
	private label?: string;

	@Prop({ required: true })
	private path!: string;

	private convertToTime(value: string | null): string | null {
		if (value == null) {
			return null;
		}
		let date = DateTime.fromFormat(value, 'HH:mm:ss');
		if (!date.isValid) {
			date = DateTime.fromFormat(value, 'HH:mm');
		}
		return date.isValid ? date.toISOTime() : null;
	}

	private convertToInput(value: string | null): string | null {
		if (value == null) {
			return null;
		}
		const date = DateTime.fromISO(value);
		return date.isValid ? date.toFormat('HH:mm:ss') : null;
	}

	private formatValue(value: string) {
		if (value == null) {
			return '';
		}
		const date = DateTime.fromISO(value);
		return date.toLocaleString(DateTime.TIME_SIMPLE);
	}
}
</script>