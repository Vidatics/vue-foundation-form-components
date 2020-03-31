<template>
	<label>
		{{label}}
		<span class="text text-ellipsis" type="text">
			<slot></slot>
		</span>
	</label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
	name: 'ofText',
})
export default class extends Vue {
	@Prop() public label?: string;
}
</script>

<style lang="scss" scoped>
@import 'styles';

.text {
	@include readonly-input;
}
</style>

