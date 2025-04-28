<template>
    <el-button type="primary" :icon="Download" @click="() => state.open = !state.open">{{ T('text') }}</el-button>
    <Dialog v-model="state.open" :type="props.type" />
</template>

<script setup lang="ts">
import { transExport as T } from '/@/utils/translator';
import Dialog from './exportDialog.vue';
import { reactive } from 'vue';
import { Download } from '@element-plus/icons-vue';

const props = defineProps({
    type: String,
});

const state = reactive({
    open: false,
});

</script>

<style lang="scss">
</style>
