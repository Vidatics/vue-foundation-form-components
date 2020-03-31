<template>
  <nav>
    <ul v-if="pages > 0" class="pagination text-center">
      <li v-if="currentPage === 0" class="pagination-previous disabled">zurück</li>
      <li v-if="currentPage > 0" class="pagination-previous">
        <a href="#" @click="previous">zurück</a>
      </li>
      <li v-if="currentPage > 2">
        <a href="#" @click="updateCurrentPage(0)">1</a>
      </li>
      <li v-if="currentPage > 3" class="ellipsis" aria-hidden="true"></li>
      <li v-for="i in Math.min(currentPage, 2)" :key="`p${i}`">
        <a
          href="#"
          @click="updateCurrentPage(currentPage - Math.min(currentPage, 2) + i - 1)"
        >{{currentPage - Math.min(currentPage, 2) + i}}</a>
      </li>
      <li class="current">{{currentPage + 1}}</li>
      <li v-for="i in Math.min(pages - currentPage - 1, 2)" :key="`n${i}`">
        <a href="#" @click="updateCurrentPage(currentPage + i)">{{currentPage + 1 + i}}</a>
      </li>
      <li v-if="pages - currentPage - 1 > 3" class="ellipsis" aria-hidden="true"></li>
      <li v-if="pages - currentPage - 1 > 2">
        <a href="#" @click="updateCurrentPage(pages - 1)">{{pages}}</a>
      </li>
      <li v-if="currentPage < pages - 1" class="pagination-next">
        <a href="#" @click="next">weiter</a>
      </li>
      <li v-if="currentPage >= pages - 1" class="pagination-next disabled">weiter</li>
    </ul>
  </nav>
</template>


<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component({
	name: 'ofPagination',
})
export default class extends Vue {
	@Prop({ required: true }) public pages!: number;
	@Prop({ required: true }) public currentPage!: number;

	private previous() {
		if (this.currentPage > 0) {
			this.updateCurrentPage(this.currentPage - 1);
		}
	}

	private next() {
		if (this.currentPage < this.pages - 1) {
			this.updateCurrentPage(this.currentPage + 1);
		}
	}

	@Emit('update:currentPage')
	// tslint:disable-next-line:no-empty
	private updateCurrentPage(value: number) {}
}
</script>
