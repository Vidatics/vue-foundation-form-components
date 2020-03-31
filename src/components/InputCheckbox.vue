<template>
	<div>
		<ofInput type="checkbox" :path="path" :readonlyShowInput="true" v-bind="$attrs" v-on="$listeners">
			<template v-slot:suffix>
				<label class="text-ellipsis" :title="label">{{label}}</label>
			</template>
		</ofInput>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ofInput from './Input.vue';

@Component({
	name: 'ofCheckbox',
	components: { ofInput },
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() public label?: string;

	@Prop({ required: true }) public path!: string;
}
</script>

