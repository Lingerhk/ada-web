<template>
    <el-drawer :size="1276" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <h3>{{ state.data?.name }}</h3>
        </template>
        <template #default>
            <!-- description -->
            <div style="padding: 20px;">
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.baseline.desc') + ':' }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.desc ?? '')"></div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.baseline.verifyDesc') + ':' }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.verifyDesc ?? '')"></div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.baseline.suggestion') + ':' }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.suggestion ?? '')"></div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.baseline.reference') + ':' }}</el-col>
                    <el-col :span="20">
                        {{ state.data?.reference }}
                    </el-col>
                </el-row>
            </div>
            <!-- entry table -->
            <el-row style="padding: 0 20px;">
                <el-table :data="state.data?.entries.slice(state.pageIdx - 1, state.pageIdx - 1 + state.pageSize) ?? []"
                    :border="true" row-class-name="pointer-cursor">
                    <el-table-column v-for="key in state.keys" :key="key" :prop="`info.${key}`"
                        :label="key"></el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.pageIdx" v-model:page-size="state.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                    :total="state.data?.entries.length ?? 0" @size-change="(val: number) => state.pageSize = val"
                    @current-change="(val: number) => state.pageIdx = val" />
            </el-row>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: right; padding: 20px;">
                <el-button @click="() => state.open = false">{{ $t('message.tableCommon.close')
                    }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GetBaselineReply, ListBaselineReply_Details } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { md2html } from '/@/utils/markdown';

const { t } = useI18n();

const state = reactive({
    open: false,
    title: '',
    id: '',
    data: null as GetBaselineReply | null,
    pageIdx: 1,
    pageSize: 10,
    keys: [] as string[],
});

const refresh = () => {
    api.getBaseline({ iD: state.id })
    .then(resp => resp.response)
    .then((data: GetBaselineReply) => {
        console.log(JSON.stringify(data));
        state.data = data;
        if (state.data.entries.length > 0) {
            state.keys = Object.keys(state.data.entries[0].info);
        } else {
            state.keys = [];
        }
    })
    .catch(err => alertApiError(err));
}

const open = (data: ListBaselineReply_Details) => {
    state.open = true;
    state.id = data.iD;
    refresh();
}

defineExpose({
    open,
});
</script>

<style>
.el-step__icon-inner {
    font-size: 18px !important;
}

.drawer-form {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 40px;
}

.slider-block {
    width: 600px;
    align-items: center;
}

.slider-block .el-slider {
  margin-top: 0;
}

.desc-row {
    margin-bottom: 20px;
}

.desc-label {
    font-size: 16px;
    font-weight: 600;
}

.desc-value {
    font-size: 16px;
}

code {
    color: #739ab3;
    background-color: rgba(27,31,35,.05);
}

</style>