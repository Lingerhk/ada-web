<template>
    <el-checkbox v-if="props.text && props.checkAll" v-model="checkAll" :indeterminate="isIndeterminate"
        @change="handleCheckAllChange" :disabled="props.disabled" style="margin-right: 20px;">
        {{ $t('message.tableCommon.checkAll') }}
    </el-checkbox>
    <el-checkbox-group v-model="model" size="default" @change="handleLevelChange" :disabled="props.disabled">
        <!-- text -->
        <template v-if="props.text">
            <el-checkbox v-for="opt in options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
            </el-checkbox>
        </template>
        <!-- image -->
        <template v-else>
            <el-checkbox-button v-for="opt in options" :key="opt.value" :value="opt.value">
                <LevelImage :level="opt.value" />
            </el-checkbox-button>
        </template>
    </el-checkbox-group>
</template>

<script setup lang="ts">
import { getLevelOptions2 } from "/@/utils/constant";
import LevelImage from "/@/components/level/image.vue";
import { computed, ref } from "vue";

const model = defineModel({ type: Array<String|Number>, default: [] });
const options = getLevelOptions2();
const props = defineProps({
    text: { type: Boolean, default: false },
    checkAll: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const isIndeterminate = computed(() => model.value.length > 0 && model.value.length < options.length);
const checkAll = ref(false);

const handleCheckAllChange = (val: boolean) => {
    checkAll.value = val;
    model.value = val ? options.map(opt => opt.value) : [];
};

const handleLevelChange = (level: Number[]) => {
    checkAll.value = level.length === options.length;
    model.value = level;
};


</script>