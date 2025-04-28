<template>
	<el-select size="default" v-model="selected" multiple clearable collapse-tags popper-class="custom-header"
		:max-collapse-tags="1" :style="{ 'width': `${props.width}` }">
		<template #header>
			<el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
				{{ $t('message.tableCommon.checkAll') }}
			</el-checkbox>
		</template>
		<el-option v-for="option in props.options" :key="option.value" :label="option.label"
			:value="option.value"></el-option>
	</el-select>
</template>
  
<script setup lang="ts" name="multiSelector">

import { ref, watch } from 'vue';
const props = defineProps({
	options: {
		type: Array<{label: String, value: String | Number | boolean}>,
		default: () => [],
	},
	selected: {
		type: Array<any>,
		default: () => [],
	},
	width: {
		type: String,
		default: '200px',
	},
});

const checkAll = ref(props.selected.length !== 0 && props.selected.length === props.options.length);
const indeterminate = ref(false);
const selected = ref([...props.selected]);

watch(
	() => props.selected,
	(newValue) => {
		selected.value = newValue;
	},
	{ deep: true }
);

watch(
	() => selected.value,
	(val) => {
		indeterminate.value = false;
		if (val.length === 0) {
			checkAll.value = false;
		} else if (val.length === props.options.length) {
			checkAll.value = true;
		} else {
			indeterminate.value = true;
		}
	},
);

const handleCheckAll = (val: boolean) => {
	indeterminate.value = false;
	if (val) {
		selected.value = props.options.map((_) => _.value);
	} else {
		selected.value = [];
	}
}

</script>
  
<style scoped>

</style>