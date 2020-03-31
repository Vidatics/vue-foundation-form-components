<template>
  <div ref="dialog"
    class="small reveal"
    data-reveal
    data-close-on-click="false"
    data-close-on-esc="false"
	>
    <h4>{{config.title}}</h4>
	<slot></slot>
    <form ref="form" data-abide>
      <label v-if="config.withMessage" class="margin-b-1">
        {{config.messageLabel}}
        <textarea
          v-model.trim="message"
          @keyup.ctrl.enter="performCommit"
        ></textarea>
      </label>
    </form>
    <div class="grid-x">
      <div class="cell auto"></div>
      <div class="cell shrink">
        <button type="button" class="button primary" @click="performConfirm">{{ config.okLabel || 'Ok'}}</button>
        &nbsp;
        <button type="button" class="button warning" @click="performDiscard">{{ config.abortLabel || 'Abbrechen' }}</button>
      </div>
      <div class="cell auto"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import $ from 'jquery';
import 'foundation-sites';

export interface ConfirmDialogConfig {
	title: string;
	withMessage: boolean;
	messageLabel?: string;
	okLabel?: string;
	abortLabel?: string;
}

@Component({
	name: 'ConfirmDialog',
})
export default class extends Vue {
	@Prop({required: true}) public open!: boolean;
	@Prop({required: true}) public config!: ConfirmDialogConfig;

	public message: string = '';

	public get title() {
		return this.config != null ? this.config.title : '';
	}

	public get withMessage() {
		return this.config != null && this.config.withMessage === true;
	}

	private modal: FoundationSites.Reveal | null = null;
	private form: FoundationSites.Abide | null = null;

	public destroyed() {
		if (this.modal != null) {
			this.modal.destroy();
			this.modal = null;
		}
		if (this.form != null) {
			this.form.destroy();
			this.form = null;
		}
	}

	@Watch('open')
	private openDialog() {
		if (this.open && this.config != null) {
			if (this.modal != null) {
				this.modal.destroy();
				this.modal = null;
			}
			this.modal = new Foundation.Reveal($(this.$refs.dialog as HTMLElement));
			if (this.form != null) {
				this.form.destroy();
				this.form = null;
			}
			this.form = new Foundation.Abide($(this.$refs.form as HTMLElement));
			this.form.resetForm();
			this.modal.open();
		} else {
			if (this.modal != null) {
				this.modal.close();
				this.modal.destroy();
				this.modal = null;
			}
		}
	}

	private performDiscard() {
		if (this.modal != null) {
			this.modal.close();
		}
		this.discard();
	}

	private performConfirm() {
		if (this.form != null) {
			if (!this.form.validateForm()) {
				return;
			}
		}
		if (this.modal != null) {
			this.modal.close();
		}
		this.confirm(this.message);
		this.message = '';
	}

	@Emit('discard')
	// tslint:disable-next-line:no-empty
	private discard() {}

	@Emit('confirm')
	// tslint:disable-next-line:no-empty
	private confirm(message: string) {}
}
</script>
