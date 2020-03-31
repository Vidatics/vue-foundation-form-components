<template>
  <label>
    {{label}}
    <div class="input-group">
      <slot name="prefix" />
      <of-input
        class="input-group-field"
        type="date"
        :path="path"
        :convertFromInput="convertToDate"
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

import { DateTime } from 'luxon';

import ofInput from './Input.vue';

@Component({
	name: 'ofNumberDate',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop()
	private label?: string;

	@Prop({ required: true })
	private path!: string;

	private convertToDate(value: string | null): string | null {
		if (value == null) {
			return null;
		}
		const date = DateTime.fromISO(value);
		return date.isValid ? date.toISODate() : null;
	}

	private formatValue(value: string) {
		if (value == null) {
			return '';
		}
		const date = DateTime.fromISO(value);
		return date.toLocaleString(DateTime.DATE_SHORT);
	}
}
</script>