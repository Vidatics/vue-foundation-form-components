<template>
	<div class="column-header">
		<button
			class="clear button grid-x nowrap"
			style="display:flex; width: 100%;"
			:data-toggle="dropdownId"
			@click="openMenu"
		>
			<span class="cell auto text-ellipsis" :title="label">{{label}}</span>
			<span style="width:0.5em">&nbsp;</span>
			<span class="cell shrink">
				<i v-if="filterEnable" class="fas fa-filter"></i>
				<i v-if="sortOrder === 'desc'" class="fas fa-sort-alpha-up-alt"></i>
				<i v-if="sortOrder === 'asc'" class="fas fa-sort-alpha-down"></i>
				&nbsp;
				<i v-if="sort || filter" class="fas fa-caret-down"></i>
			</span>
		</button>
		<div
			ref="dropdown"
			:id="dropdownId"
			class="dropdown-pane sort-filter-dropdown"
			data-dropdown
			data-close-on-click="true"
		>
			<div v-if="sort" class="expanded button-group margin-b-1">
				<button
					type="button"
					class="button expanded"
					:class="{'sort-active-button': sortOrder === 'asc', 'hollow': sortOrder !== 'asc'}"
					@click="toggleSort('asc')"
				>
					<i class="fas fa-sort-alpha-down"></i>
				</button>
				<button
					type="button"
					class="button expanded"
					:class="{'sort-active-button': sortOrder === 'desc', 'hollow': sortOrder !== 'desc'}"
					@click="toggleSort('desc')"
				>
					<i class="fas fa-sort-alpha-up-alt"></i>
				</button>
			</div>
			<hr v-if="sort && filter" />
			<div v-if="filter">
				<input type="text" placeholder="Suchen" v-model.trim="valueQuery" />
				<div class="value-list">
					<label v-for="(option, i) in options" :key="i">
						<input type="checkbox" :checked="isSelected(option)" @click="toggleFilter(option)" />
						{{option.label}}
					</label>
				</div>
				<label>
					<input type="checkbox" v-model="allSelected" />
					Alle
				</label>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import uuid4 from 'uuid/v4';

import $ from 'jquery';
import 'foundation-sites';

import { ObjectPath } from '../protocol';
import { DateTime } from 'luxon';
import {
	StringFilterCriterion,
	NumberFilterCriterion,
	DateFilterCriterion,
	PrimitiveOrderBy,
} from '../utils';

interface Value {
	label: string;
	value: any[];
}

@Component({
	name: 'ColumnHeader',
})
export default class extends Vue {
	@Prop({ required: true }) public label!: string;
	@Prop({ required: true }) public type!: 'string' | 'number' | 'date';
	@Prop({ required: true }) public path!: string;
	@Prop() public formatter?: (value: any) => string;

	@Prop({ required: true }) public items!: ReadonlyArray<object>;

	@Prop({ default: true }) public sort!: boolean;
	@Prop({ default: true }) public filter!: boolean;

	public sortOrder: 'asc' | 'desc' | null = null;
	@Prop() public orderBy?: PrimitiveOrderBy;
	@Prop() public filterCriterion?:
		| StringFilterCriterion
		| NumberFilterCriterion
		| DateFilterCriterion;

	private readonly dropdownId = uuid4();

	private dropdown: FoundationSites.Dropdown | null = null;

	private values: Value[] | null = null;
	private options: Value[] = [];
	private selectedValues = new Set<unknown>();

	private valueQueryString: string = '';

	private get filterEnable() {
		if (this.values == null) {
			return false;
		}
		for (const v of this.values) {
			if (!this.isSelected(v)) {
				return true;
			}
		}
		return false;
	}

	private get valueQuery() {
		return this.valueQueryString;
	}

	private set valueQuery(query: string) {
		this.valueQueryString = query;
		this.updateOptions();
		if (this.options != null) {
			const selected = new Set(this.selectedValues);
			for (const o of this.options) {
				o.value.forEach(selected.add, selected);
			}
			this.createFilterCriterion(selected);
		}
	}

	private get allSelected() {
		if (this.options == null) {
			return false;
		}
		for (const o of this.options) {
			if (!this.isSelected(o)) {
				return false;
			}
		}
		return true;
	}

	private set allSelected(value: boolean) {
		if (this.options == null) {
			return;
		}
		if (value) {
			const selected = new Set(this.selectedValues);
			for (const o of this.options) {
				o.value.forEach(selected.add, selected);
			}
			this.createFilterCriterion(selected);
		} else {
			this.createFilterCriterion(new Set());
		}
	}

	public mounted() {
		this.initMenu();
	}

	public destroyed() {
		if (this.dropdown != null) {
			this.dropdown.destroy();
			this.dropdown = null;
		}
	}

	private openMenu() {
		if (this.dropdown == null) {
			return;
		}
		if (!this.sort && !this.filter) {
			return;
		}
		this.valueQueryString = '';
		this.$nextTick(() => this.updateValues());
	}

	private toggleSort(order: 'asc' | 'desc') {
		if (this.sortOrder == null || this.sortOrder !== order) {
			this.updateOrderBy({
				type: this.type,
				path: ObjectPath.compile(this.path),
				order,
			});
		} else {
			this.updateOrderBy(null);
		}
	}

	private isSelected(value: Value) {
		let anyMatch = false;
		for (const v of value.value) {
			if (!this.selectedValues.has(v)) {
				return false;
			} else {
				anyMatch = true;
			}
		}
		return anyMatch;
	}

	private toggleFilter(value: Value) {
		const selected = new Set(this.selectedValues);
		if (this.isSelected(value)) {
			for (const v of value.value) {
				selected.delete(v);
			}
		} else {
			for (const v of value.value) {
				selected.add(v);
			}
		}
		this.createFilterCriterion(selected);
	}

	private createFilterCriterion(values: Set<unknown>) {
		const acceptedValues = this.getSelectedValues(values);
		if (acceptedValues != null) {
			switch (this.type) {
				case 'string':
					this.updateFilterCriterion({
						type: this.type,
						path: ObjectPath.compile(this.path),
						value: acceptedValues as string[],
					});
					break;
				case 'number':
					this.updateFilterCriterion({
						type: this.type,
						path: ObjectPath.compile(this.path),
						value: acceptedValues as number[],
					});
					break;
				case 'date':
					this.updateFilterCriterion({
						type: this.type,
						path: ObjectPath.compile(this.path),
						value: acceptedValues as DateTime[],
					});
					break;
			}
		} else {
			this.updateFilterCriterion(null);
		}
	}

	private getSelectedValues(selected: Set<unknown>): unknown[] | null {
		if (this.values == null) {
			return null;
		}
		for (const value of this.values) {
			for (const v of value.value) {
				if (!selected.has(v)) {
					return [...selected];
				}
			}
		}
		return null;
	}

	@Emit('update:orderBy')
	// tslint:disable-next-line:no-empty
	private updateOrderBy(value: PrimitiveOrderBy | null) {}

	@Emit('update:filterCriterion')
	private updateFilterCriterion(
		value:
			| StringFilterCriterion
			| NumberFilterCriterion
			| DateFilterCriterion
			| null
		// tslint:disable-next-line:no-empty
	) {}

	@Watch('sort')
	@Watch('filter', { immediate: true })
	private initMenu() {
		if (this.dropdown != null) {
			this.dropdown.destroy();
			this.dropdown = null;
		}
		if (this.$refs.dropdown == null) {
			return;
		}
		if (this.sort || this.filter) {
			this.dropdown = new Foundation.Dropdown(
				$(this.$refs.dropdown as HTMLElement)
			);
		}
	}

	@Watch('items')
	@Watch('path')
	@Watch('type')
	@Watch('formatter')
	private resetValues() {
		this.values = null;
		this.selectedValues = new Set();
	}

	@Watch('orderBy')
	private updateSortOrder() {
		if (this.orderBy != null) {
			this.sortOrder = this.orderBy.order;
		} else {
			this.sortOrder = null;
		}
	}

	@Watch('filterCriterion')
	private updateSelectedValues() {
		if (this.values == null) {
			return;
		}
		if (this.filterCriterion == null) {
			this.selectedValues = new Set();
			for (const v of this.values) {
				v.value.forEach(this.selectedValues.add, this.selectedValues);
			}
		} else {
			this.selectedValues = new Set(
				(this.filterCriterion.value as unknown[]).filter(
					(it: any) => it != null
				)
			);
		}
	}

	private updateValues() {
		if (this.values != null) {
			this.updateOptions();
			return;
		}
		if (this.path == null && this.items == null && this.type == null) {
			this.values = [];
			this.updateOptions();
			return;
		}
		const path = ObjectPath.compile(this.path);
		const uniqueValues = Array.from(
			new Set(this.items.map(it => path.get(it)))
		).map(value => {
			let label = '';
			if (this.formatter != null) {
				label = this.formatter(value);
			} else if (value != null) {
				switch (this.type) {
					case 'string':
						label = value as string;
						break;
					case 'number':
						label = `${value}`;
						break;
					case 'date':
						value = DateTime.fromISO(value as string);
						label = (value as DateTime).toLocaleString(
							DateTime.DATE_SHORT
						);
						break;
				}
			}
			return { label, value: value || null };
		});
		const uniqueLabels = new Map<string, any[]>();
		for (const v of uniqueValues) {
			let list = uniqueLabels.get(v.label);
			if (list == null) {
				uniqueLabels.set(v.label, (list = []));
			}
			list.push(v.value);
		}
		this.values = Array.from(uniqueLabels.entries())
			.map(([label, value]) => ({
				label,
				value,
			}))
			.sort((a, b) => {
				if (a.value.length === 0 && b.value.length === 0) {
					return 0;
				} else if (a.value.length === 0) {
					return 1;
				} else if (b.value.length === 0) {
					return -1;
				}
				return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
			});
		this.updateOptions();
		this.createFilterCriterion(new Set(uniqueValues.map(it => it.value)));
	}

	private updateOptions() {
		if (this.values == null) {
			this.options = [];
		} else if (this.valueQuery.length > 0) {
			const q = this.valueQuery.toLowerCase();
			this.options = this.values.filter(it =>
				it.label.toLowerCase().includes(q)
			);
		} else {
			this.options = this.values;
		}
	}
}
</script>


<style lang="scss" scoped>
@import '../styles/settings';

.column-header {
	display: inline-block;
	
	&>button {
		margin: unset;
		padding: unset;
	}
}

.sort-filter-dropdown {
	width: 250px;
}

.sort-active-button {
	background-color: $button-background-hover;
}

.value-list {
	border: $input-border;
	height: 8em;
	padding: $input-padding;
	overflow-y: scroll;
}
</style>

