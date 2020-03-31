<template>
	<label>
		{{label}}
		<div class="input-group">
			<slot name="prefix" />
			<span type="url" class="readonly" v-if="formData.readonly">
				<a v-for="(url, i) in value" :key="i" :href="url">
					<i class="fas fa-external-link-alt"></i>
					{{url}}
				</a>
			</span>
			<textarea
				v-if="!readonly"
				class="input-group-field"
				v-model="model"
				:readonly="readonly"
				:disabled="readonly"
				v-bind="$attrs"
				v-on="$listeners"
			></textarea>
			<slot name="suffix" />
		</div>
	</label>
</template>

<script lang="ts">
import {
	Component,
	Inject,
	Prop,
	Emit,
	Vue,
	Watch,
} from 'vue-property-decorator';

import {
	FormData,
	FORM_DATA,
	UPDATE_COLLECTOR,
	ObjectContext,
	OBJECT_CONTEXT,
} from './form.consts';
import { UpdateCollector, ObjectPath } from '../protocol';

@Component({
	name: 'ofUrls',
	inheritAttrs: false,
})
export default class extends Vue {
	@Prop() public label?: string;

	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(UPDATE_COLLECTOR) private collector!: UpdateCollector;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;
	@Prop({ required: true, type: String }) private path!: string;

	private value: string[] = [];
	private objectPath: ObjectPath | null = null;

	public get model() {
		return this.value.join('\n');
	}

	public set model(value: string | null) {
		if (this.collector == null) {
			throw new Error('form input without form');
		}
		if (this.objectPath != null) {
			const urls = this.parseUrls(value != null ? value : '');
			if (urls.length === 0) {
				this.collector.unset(this.objectPath);
				this.setValue([]);
			} else {
				this.collector.set(this.objectPath, this.normalize(urls));
				this.setValue(urls);
			}
		} else {
			this.setValue([]);
		}
	}

	public get readonly() {
		return this.formData == null || this.formData.readonly;
	}

	private parseUrls(value: string) {
		return value.split('\n');
	}

	private normalize(urls: string[]) {
		return urls.map(it => it.trim()).filter(it => it.length > 0);
	}

	@Emit('update:value')
	private setValue(value: string[]) {
		this.value = value;
	}

	@Watch('objectContext.prefix')
	@Watch('path', { immediate: true })
	private updateObjectPath() {
		if (this.objectContext == null) {
			throw new Error('form input without form');
		}
		if (this.path != null && this.path.length > 0) {
			const prefix = this.objectContext.prefix;
			this.objectPath = ObjectPath.compile(
				prefix.length > 0 ? `${prefix}.${this.path}` : this.path
			);
		} else {
			this.objectPath = null;
		}
		this.updateValue();
	}

	@Watch('formData.value', { immediate: true })
	private updateValue() {
		if (this.formData == null) {
			throw new Error('form input without form');
		} else {
			const value =
				this.formData.value != null && this.objectPath != null
					? this.objectPath.get<string[]>(this.formData.value)
					: [];
			let urls: string[] = [];
			if (typeof value === 'string') {
				urls = this.parseUrls(value);
			} else if (Array.isArray(value)) {
				urls = value;
			}
			this.setValue(urls);
		}
	}
}
</script>

<style lang="scss" scoped>
.readonly {
	border: none;
	box-shadow: none;
	background-color: transparent;
}
</style>
