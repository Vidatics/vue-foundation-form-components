<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { EntityOrderBy, compareEntities } from '../utils';
import { VNode } from 'vue';

@Component({
	name: 'Sorter',
})
export default class extends Vue {
	@Prop({ required: true }) public items!: ReadonlyArray<object>;
	@Prop({ required: true }) public orderBy!: ReadonlyArray<EntityOrderBy>;
	@Prop({ default: 'div' }) public element!: string;

	private sortedItems: object[] = [];

	public render(createElement: typeof Vue.prototype.$createElement): VNode {
		return this.$scopedSlots.default != null
			? createElement(this.element, [
					this.$scopedSlots.default({
						items: this.sortedItems,
					}),
			  ])
			: createElement(this.element);
	}

	@Watch('orderBy')
	@Watch('items', { immediate: true })
	private updateSort() {
		if (this.items == null || this.items.length === 0) {
			this.sortedItems = [];
			return;
		}
		if (this.orderBy == null || this.orderBy.length === 0) {
			this.sortedItems = [...this.items];
			return;
		}
		this.sortedItems = [...this.items];
		this.sortedItems.sort((a, b) => compareEntities(a, b, this.orderBy));
	}
}
</script>

