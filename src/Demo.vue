<template>
	<div id="demo" class="grid-container">
		<filterer element="table" :items="items" :filter="itemFilters" v-slot="filter">
			<thead>
				<tr>
					<th>
						<of-column-header
							label="Id"
							type="string"
							path="id"
							:items="items"
							:orderBy="itemOrderColumn === 'id' ? itemOrder : null"
							@update:orderBy="itemOrder = $event; itemOrderColumn = 'id'"
							:filterCriterion.sync="itemFilters[0]"
						></of-column-header>
					</th>
					<th>
						<of-column-header
							label="Typeahead"
							type="string"
							path="data.typeahead"
							:items="items"
							:orderBy="itemOrderColumn === 'typeahead' ? itemOrder : null"
							@update:orderBy="itemOrder = $event; itemOrderColumn = 'typeahead'"
							:filterCriterion.sync="itemFilters[1]"
						></of-column-header>
					</th>
					<th>
						<of-column-header
							label="Select"
							type="string"
							path="data.select"
							:formatter="selectFormatter"
							:items="items"
							:orderBy="itemOrderColumn === 'select' ? itemOrder : null"
							@update:orderBy="itemOrder = $event; itemOrderColumn = 'select'"
							:filterCriterion.sync="itemFilters[2]"
						></of-column-header>
					</th>
					<th>
						<of-column-header
							label="Number"
							type="number"
							path="data.number"
							:items="items"
							:orderBy="itemOrderColumn === 'number' ? itemOrder : null"
							@update:orderBy="itemOrder = $event; itemOrderColumn = 'number'"
							:filterCriterion.sync="itemFilters[3]"
						></of-column-header>
					</th>
				</tr>
			</thead>
			<sorter
				element="tbody"
				:items="filter.items"
				:orderBy="itemOrder && [itemOrder] || null"
				v-slot="sort"
			>
				<tr
					v-for="(item, idx) in sort.items"
					:key="idx"
					@click="selectedItem = item"
					:class="{'active': selectedItem === item}"
				>
					<td>{{item.id}}</td>
					<td>{{item.data.typeahead}}</td>
					<td>{{item.data.select}}</td>
					<td>{{item.data.number}}</td>
				</tr>
			</sorter>
		</filterer>
		<div class="grid-x grid-margin-x">
			<div class="cell auto callout secondary">
				<h5>Selected Item</h5>
				<pre><tt><small>{{selectedItem}}</small></tt></pre>
			</div>
			<div class="cell auto">
				<of-form ref="form" :value="selectedItem" :readonly="selectedItem == null">
					<of-input-typeahead
						label="Typeahead Input"
						path="data.typeahead"
						:options="typeaheadOptions"
						:suggestions="typeahead"
					></of-input-typeahead>

					<of-input-select label="Select Input" path="data.select" :options="selectOptions"></of-input-select>

					<of-input-number label="Number Input" path="data.number"></of-input-number>

					<of-part path="data">
						<of-input-checkbox label="Checkbox Input" path="checkbox"></of-input-checkbox>

						<of-input-password label="Password Input" path="password" />

						<of-input-text label="Text Input" path="text" />

						<of-input-time label="Time Input" path="time" />

						<of-input-url label="Url Input" path="url" />

						<of-input-textarea label="Textarea Input" path="textarea" />
					</of-part>
				</of-form>
				<div class="button-group">
					<button class="button secondary" @click="validate">Validate</button>
					<button class="button primary" @click="apply">Apply</button>
					<button class="button warning" @click="reset">Reset</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import './lib';
import { ObjectForm } from './components';
import { ObjectPath } from './protocol/ObjectPath';
import { EntityFilterCriterion, EntityOrderBy } from './utils';
import { applyUpdates } from './protocol';

@Component({})
export default class App extends Vue {
	public items = [
		{ id: 'Obj.0', data: {} },
		{ id: 'Obj.1', data: {} },
		{ id: 'Obj.2', data: {} },
	];
	public selectedItem: { readonly id: string; data: object } | null = null;

	public itemFilters: EntityFilterCriterion[] = [];
	public itemOrderColumn: string | null = null;
	public itemOrder: EntityOrderBy | null = null;

	public readonly typeaheadOptions = [
		'Typeahead A',
		'Typeahead B',
		'Typeahead C',
	];
	public readonly selectOptions = [
		{
			label: 'Option A',
			value: 'a',
		},
		{
			label: 'Option B',
			value: 'b',
		},
		{
			label: 'Option C',
			value: 'c',
		},
	];

	@Ref('form')
	public form?: ObjectForm;

	public selectFormatter(value: string) {
		const option = this.selectOptions.find(it => it.value === value);
		return (option && option.label) || '';
	}

	public typeahead(query: string): Promise<string[]> {
		const q = query.toLowerCase();
		return Promise.resolve(
			this.typeaheadOptions.filter(it => it.toLowerCase().includes(q))
		);
	}

	public validate() {
		if (this.form == null) {
			return;
		}
		this.form.validate();
	}

	public apply() {
		if (this.form == null) {
			return;
		}
		if (this.selectedItem != null) {
			const update = this.form.createUpdates();
			const item = Object.assign({}, this.selectedItem);
			applyUpdates(item, update);
			const idx = this.items.findIndex(it => it.id === item.id);
			this.items[idx] = item;
			this.items = [...this.items];
			this.selectedItem = null;
		}
		this.form.clearUpdates();
	}

	public reset() {
		if (this.form == null) {
			return;
		}
		this.form.clearUpdates();
	}
}
</script>


<style lang="scss" >
@import './styles/settings';

html,
body {
	height: 100%;
}

#demo {
	height: 100%;
}

.active {
	background-color: $primary-color !important;
}
</style>
