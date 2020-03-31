import Vue from 'vue';
import VueRx from 'vue-rx';

Vue.use(VueRx);


import ConfirmDialog from './ConfirmDialog.vue';
import ColumnHeader from './ColumnHeader.vue';
import Filterer from './Filterer.vue';
import InputCheckbox from './InputCheckbox.vue';
import InputDate from './InputDate.vue';
import InputNumber from './InputNumber.vue';
import InputMinMax from './InputMinMax.vue';
import InputPassword from './InputPassword.vue';
import InputSelect from './InputSelect.vue';
import InputForeignKey from './InputForeignKey.vue';
import InputTypeahead from './InputTypeahead.vue';
import InputText from './InputText.vue';
import InputTextarea from './InputTextarea.vue';
import InputTime from './InputTime.vue';
import InputUrl from './InputUrl.vue';
import InputUrls from './InputUrls.vue';
import ObjectForm from './Form.vue';
import Part from './Part.vue';
import Pagination from './Pagination.vue';
import Pager from './Pager.vue';
import Sorter from './Sorter.vue';
import Render from './Render.vue';
import Text from './Text.vue';
import YesNo from './YesNo.vue';

export { ObjectForm } from './form.consts';

Vue.component('ofConfirmDialog', ConfirmDialog);
Vue.component('ofCheckbox', InputCheckbox);
Vue.component('ofColumnHeader', ColumnHeader);
Vue.component('ofForm', ObjectForm);
Vue.component('ofInputCheckbox', InputCheckbox);
Vue.component('ofInputDate', InputDate);
Vue.component('ofInputNumber', InputNumber);
Vue.component('ofInputMinmax', InputMinMax);
Vue.component('ofInputPassword', InputPassword);
Vue.component('ofInputSelect', InputSelect);
Vue.component('ofInputForeignKey', InputForeignKey);
Vue.component('ofInputText', InputText);
Vue.component('ofInputTextarea', InputTextarea);
Vue.component('ofInputTime', InputTime);
Vue.component('ofInputTypeahead', InputTypeahead);
Vue.component('ofInputUrl', InputUrl);
Vue.component('ofInputUrls', InputUrls);
Vue.component('ofPart', Part);
Vue.component('ofPagination', Pagination);
Vue.component('ofRender', Render);
Vue.component('ofText', Text);

Vue.component('filterer', Filterer);
Vue.component('pager', Pager);
Vue.component('sorter', Sorter);
Vue.component('yesNo', YesNo);
