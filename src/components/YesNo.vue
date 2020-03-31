<template>
  <div class="switch">
    <input
      class="switch-input"
      :id="id"
      type="checkbox"
      v-model="checked"
      v-bind="$attrs"
    />
    <label class="switch-paddle" :for="id">
      <slot>
        <span class="yes switch-active" aria-hidden="true">Ja</span>
        <span class="no switch-inactive" aria-hidden="true">Nein</span>
      </slot>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

import uuid from 'uuid/v4';

@Component({
	name: 'YesNo',
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() public value?: boolean;

	private readonly id = uuid();

	private get checked() {
		return !!this.value;
	}

	private set checked(value: boolean) {
		this.input(value);
	}

	@Emit('input')
	// tslint:disable-next-line:no-empty
	private input(value: boolean) {}
}
</script>

<style lang="scss" scoped>
.switch {
	display: inline-block;
	vertical-align: middle;

	.switch-paddle {
		.yes {
			left: 15%;
		}
		.no {
			right: 5%;
		}
	}
}
</style>

