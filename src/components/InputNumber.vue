<template>
	<label>
		{{label}}
		<div class="input-group">
			<slot name="prefix"></slot>
			<of-input
				class="input-group-field"
				type="number"
				:path="path"
				:convertFromInput="toNumber"
				v-bind="$attrs"
				v-on="$listeners"
				v-on:keydown="checkValue"
				ref="input"
			/>
			<slot name="suffix"></slot>
		</div>
	</label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ofInput from './Input.vue';
import InputVue from './Input.vue';

@Component({
	name: 'ofNumberField',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop()
	private label?: string;

	@Prop({ required: true })
	private path!: string;

	private numberRegex = new RegExp('[-0-9.,]').compile();

	private cancelEvent(event: Event) {
		event.preventDefault();
		return false;
	}

	private checkValue(event: KeyboardEvent) {
		// TODO if the cursor is moved entering a minus will fail. This should be enough for now and we might come back later

		const input: any = this.$refs.input as any;
		const field = event.key || event.char;
		let value: string = input.model === null ? '' : input.model;
		if (
			event.getModifierState('Control') ||
			event.getModifierState('Shift') ||
			event.getModifierState('Alt') ||
			field.length > 1
		) {
			return;
		}

		if (this.numberRegex.test(field)) {
			// add another digit so we can test - and , and .
			value = value + field + '1';

			if (Number.isNaN(Number(value))) {
				return this.cancelEvent(event);
			}
		} else {
			return this.cancelEvent(event);
		}
	}
	private toNumber(value: string | null): number | null {
		if (value == null) {
			return null;
		}
		const result = Number.parseFloat(value);
		return Number.isFinite(result) ? result : null;
	}

	private formatValue(value: string) {
		if (value == null) {
			return '';
		}
	}
}
</script>