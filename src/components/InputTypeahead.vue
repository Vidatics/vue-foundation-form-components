<template>
	<label>
		{{label}}
		<span
			v-if="readonly"
			class="readonly text-ellipsis"
			type="text"
			:title="value != null ? value : ''"
		>{{value != null ? value : ''}}</span>
		<span v-if="!readonly" class="input-container">
			<input ref="input" type="text" />
		</span>
	</label>
</template>

<script lang="ts">
import {
	Component,
	Emit,
	Inject,
	Prop,
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
import { UpdateCollector } from '../protocol/UpdateCollector';
import { ObjectPath } from '../protocol/ObjectPath';

import $ from 'jquery';
import 'typeahead';

@Component({
	name: 'ofTypeahead',
	inheritAttrs: false,
})
export default class extends Vue {
	@Inject(FORM_DATA) private formData!: FormData;
	@Inject(OBJECT_CONTEXT) private objectContext!: ObjectContext;
	@Inject(UPDATE_COLLECTOR) private collector!: UpdateCollector;

	@Prop()
	private label?: string;
	@Prop({ required: true, type: String })
	private path!: string;
	@Prop()
	private suggestions?: (query: string) => Promise<string[]>;

	@Prop()
	private allLabel?: string;
	@Prop({ default: false }) private disabled!: boolean;

	private typeahead?: JQuery<HTMLElement>;

	private value: string | null = null;

	private objectPath: ObjectPath | null = null;

	public get readonly() {
		return this.formData == null || this.formData.readonly || this.disabled;
	}

	public mounted() {
		this.initTypeahead();
	}

	public destroyed() {
		this.typeahead!.typeahead('destroy');
	}

	private setModel(value: any | null) {
		if (this.collector == null) {
			throw new Error('form input without form');
		}
		const modelValue = value;
		if (this.objectPath != null) {
			if (modelValue == null) {
				this.collector.unset(this.objectPath);
				this.setValue(null);
			} else {
				this.collector.set(this.objectPath, modelValue);
				this.setValue(modelValue);
			}
		} else {
			this.setValue(null);
		}
	}

	private setTypeaheadValue() {
		if (this.typeahead == null) {
			return;
		}
		this.typeahead.typeahead('val', this.value != null ? this.value : '');
	}

	@Emit('update:value')
	private setValue(value: string | null) {
		this.value = value;
		this.setTypeaheadValue();
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
		}
		const value =
			this.formData.value != null && this.objectPath != null
				? this.objectPath.get<string>(this.formData.value)
				: null;
		this.setValue(value != null ? value : null);
	}

	@Watch('formData.readonly')
	private initTypeahead() {
		if (this.readonly) {
			if (this.typeahead) {
				this.typeahead.typeahead('destroy');
			}
			this.typeahead = undefined;
		} else {
			this.$nextTick(() => {
				if (this.typeahead) {
					this.typeahead.typeahead('destroy');
				}
				this.typeahead = $(
					this.$refs.input as HTMLInputElement
				).typeahead(
					{
						minLength: 0,
						classNames: {
							menu: 'is-dropdown-submenu',
							dataset: 'vertical menu',
							cursor: 'is-active',
						},
					},
					{
						async: true,
						source: (query, _, resolveAsync) => {
							if (resolveAsync == null) {
								return;
							}
							if (query.length === 0) {
								resolveAsync([]);
								return;
							}
							this.$nextTick(() => {
								if (this.suggestions != null) {
									this.suggestions(query).then(result => {
										resolveAsync(result);
									});
								} else {
									resolveAsync([]);
								}
							});
						},
						templates: {
							suggestion: value => `<li><a>${value}</a></li>`,
							header: value =>
								`<li style="padding-left:0.3em"><b>Vorschläge</b></li>`,
						},
						limit: 2,
					}
				);
				this.typeahead.bind('typeahead:change', event => {
					const value = (event.target as HTMLInputElement).value;
					this.setModel(value);
				});
				this.setTypeaheadValue();
			});
		}
	}
}
</script>

<style lang="scss" scoped>
@import 'styles';

.input-container {
	display: block;
	width: 100%;
}

.readonly {
	@include readonly-input;
}
</style>

<style lang="scss">
.input-container {
	.twitter-typeahead {
		width: 100%;
	}
}
</style>



