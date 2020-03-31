<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
	Component,
	Inject,
	Provide,
	Prop,
	Vue,
	Watch,
} from 'vue-property-decorator';

import { ObjectContext, OBJECT_CONTEXT } from './form.consts';

@Component({
	name: 'ObjectPart',
})
export default class extends Vue {
	@Inject(OBJECT_CONTEXT) private parentContext?: ObjectContext;
	@Provide(OBJECT_CONTEXT) private readonly objectContext: ObjectContext = {
		prefix: '',
	};

	@Prop({ required: true }) private path!: string;

	@Watch('path', { immediate: true })
	private updateContext() {
		if (this.parentContext == null) {
			throw Error('object part without form');
		}
		const prefix = this.parentContext.prefix;
		this.objectContext.prefix =
			prefix.length > 0 ? `${prefix}.${this.path}` : this.path;
	}
}
</script>
