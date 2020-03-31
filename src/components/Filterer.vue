

<script <script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { EntityFilterCriterion, acceptEntity } from '../utils';
import { VNode } from 'vue';

@Component({
	name: 'Filterer',
})
export default class extends Vue {
	@Prop({ required: true }) public items!: ReadonlyArray<object>;
	@Prop({ required: true }) public filter!: ReadonlyArray<
		EntityFilterCriterion
	>;
	@Prop({ default: 'div' }) public element!: string;

	private filteredItems: object[] = [];

	public render(createElement: typeof Vue.prototype.$createElement): VNode {
		return this.$scopedSlots.default != null
			? createElement(this.element, [
					this.$scopedSlots.default({
						items: this.filteredItems,
					}),
			  ])
			: createElement(this.element);
	}

	@Watch('filter')
	@Watch('items', { immediate: true })
	private updateFilter() {
		if (this.items == null || this.items.length === 0) {
			this.filteredItems = [];
			return;
		}
		if (this.filter == null) {
			this.filteredItems = [...this.items];
			return;
		}
		this.filteredItems = this.items.filter(it =>
			acceptEntity(it, this.filter)
		);
	}
}
</script>

