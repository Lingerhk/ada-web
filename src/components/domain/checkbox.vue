<template>
    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
        {{ $t('message.tableCommon.checkAll') }}
    </el-checkbox>
    <el-checkbox-group v-model="model" size="default" @change="handleLevelChange" style="margin-left: 20px;">
        <el-checkbox v-for="opt in props.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
        </el-checkbox>
    </el-checkbox-group>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { OptionType } from "/@/utils/constant";
import { computed, ref } from "vue";

const model = defineModel({ type: Array<String | Number>, default: [] });
const props = defineProps({
    options: {
        type: Array<OptionType>,
        default: () => [],
    },
});

const isIndeterminate = computed(() => model.value.length > 0 && model.value.length < props.options.length);
const checkAll = ref(true);

watch(() => props.options, (val) => {
    model.value = val.map(o => o.value);
    checkAll.value = true;
});

const handleCheckAllChange = (val: boolean) => {
    checkAll.value = val;
    model.value = val ? props.options.map(opt => opt.value) : [];
};

const handleLevelChange = (level: Number[]) => {
    checkAll.value = level.length === props.options.length;
    model.value = level;
};


</script>
