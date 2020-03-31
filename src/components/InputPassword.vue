<template>
  <label>
    {{label}}
    <div class="input-group">
      <slot name="prefix"/>
      <of-input
        class="input-group-field"
        type="password"
        :path="path"
        v-bind="$attrs"
        v-on="$listeners"
      />
      <slot name="suffix"/>
    </div>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ofInput from './Input.vue';

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
}
</script>