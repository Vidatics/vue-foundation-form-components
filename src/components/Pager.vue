<template>
  <div>
    <slot :page="page"></slot>
    <of-pagination v-if="pages > 1" :pages="pages" :currentPage.sync="currentPage" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
	name: 'Pager',
})
export default class extends Vue {
	@Prop({ required: true }) public items?: any[];
	@Prop({ default: 15 }) public itemsPerPage!: number;

	private currentPage = 0;

	get pages() {
		return this.items != null
			? Math.ceil(this.items.length / this.itemsPerPage)
			: 0;
	}

	get page() {
		if (this.items == null) {
			return [];
		}
		const first = this.currentPage * this.itemsPerPage;
		const last = first + this.itemsPerPage;
		return this.items.slice(first, last);
	}

	@Watch('items', { immediate: true })
	private resetPage() {
		this.currentPage = 0;
	}
}
</script>
