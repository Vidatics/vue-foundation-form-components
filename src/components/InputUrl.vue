<template>
	<label>
		{{label}}
		<div class="input-group">
			<slot name="prefix" />
			<span type="url" class="readonly" v-if="formData.readonly">				
				<a :href="value"><i class="fas fa-external-link-alt"></i>{{value}}</a>
			</span>
			<of-input
				v-if="!formData.readonly"
				class="input-group-field"
				type="url"
				:path="path"
				v-bind="$attrs"
				v-on="$listeners"
				@update:value="value = $event"
			/>
			<slot name="suffix" />
		</div>
	</label>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { FormData, FORM_DATA } from './form.consts';

import ofInput from './Input.vue';

@Component({
	name: 'ofUrl',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Inject(FORM_DATA) private formData!: FormData;
	@Prop()
	private label?: string;

	@Prop({ required: true })
	private path!: string;

	private get readony() {
		return this.formData != null && this.formData.readonly;
	}

	private value: string = '';
}
</script>

<style lang="scss" scoped>
@import 'styles';

.readonly {
	@include readonly-input;
}
</style>