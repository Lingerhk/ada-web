<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding: 20px;">
                <el-form class="drawer-form" label-position="left" label-width="120px" ref="ruleFormRef"
                    :model="state.form" :disabled="true">
                    <el-form-item style="margin-top: 10px;" prop="name" :label="T('name')">
                        <el-input v-model="state.form.name" :placeholder="T('namePlaceholder')" />
                    </el-form-item>
                    <el-form-item prop="domain" :label="T('domain')">
                        <el-select v-model="state.form.domain" :placeholder="T('domainPlaceholder')"
                            style="width: 100%;">
                        </el-select>
                    </el-form-item>
                    <!-- 阻断用户 -->
                    <el-form-item prop="userBlock" :label="T('userBlock')">
                        <el-switch v-model="state.form.userBlock" />
                    </el-form-item>
                    <!-- 阻断用户列表 -->
                    <template v-if="state.form.userBlock">
                        <el-form-item v-for="(_, idx) in state.form.userList" :key="idx"
                            :rules="[{ required: true, message: T('addBlockUserPlaceholder') }]">
                            <el-space>
                                <el-autocomplete v-model="state.form.userList[idx]" style="width: 300px;"
                                    :placeholder="T('addBlockUserPlaceholder')"></el-autocomplete>
                            </el-space>
                        </el-form-item>
                    </template>
                    <!-- 阻断IP -->
                    <el-form-item prop="ipBlock" :label="T('ipBlock')">
                        <el-switch v-model="state.form.ipBlock" />
                    </el-form-item>
                    <!-- 阻断IP列表 -->
                    <template v-if="state.form.ipBlock">
                        <el-form-item v-for="(_, idx) in state.form.ipList" :key="idx"
                            :rules="[{ required: true, validator: validateIp, message: T('addBlockIpPlaceholder') }]">
                            <el-space>
                                <el-input v-model="state.form.ipList[idx]" style="width: 300px;"
                                    :placeholder="T('addBlockIpPlaceholder')"></el-input>
                            </el-space>
                        </el-form-item>
                    </template>
                    <el-form-item prop="remark" :label="T('remark')">
                        <el-input v-model="state.form.remark" type="textarea" :rows="3" />
                    </el-form-item>
                    <el-form-item :label="T('updateTm')">{{ formatApiTime(state.form.updateTm) }}</el-form-item>
                    <el-form-item :label="T('origin')">{{ T(`origin_${state.form.origin}`)}}</el-form-item>
                </el-form>
                <el-row style="font-size: 14px; font-weight: bold; margin-top: 10px;">{{ T('result') }}</el-row>
                <el-table :data="state.showResults" style="margin-top: 10px">
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="info.dc_hostname" :label="T('dcHost')"></el-table-column>
                    <el-table-column prop="info.msg" :label="T('resultInfo')"></el-table-column>
                    <el-table-column prop="info.time" :label="T('resultTime')"></el-table-column>
                </el-table>
                <el-row style="margin-top: 10px" justify="space-between">
                    <div>
                    </div>
                    <el-pagination v-model:current-page="state.pageIdx" v-model:page-size="state.pageSize"
                        :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper"
                        :total="state.form.results.length ?? 0" @size-change="(s) => state.pageSize = s"
                        @current-change="(idx) => state.pageIdx = idx" />
                </el-row>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <div></div>
                <el-button @click="handleClose" type="primary">{{ $t('message.tableCommon.complete') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ListThreatBlockReply_Details, ListThreatBlockReply_Results } from '/@/api/grpc/ada';
import { FormInstance, FormRules } from 'element-plus';
import { transThreatBlock as T } from '/@/utils/translator';
import { validateIp } from '/@/utils/validator';
import { formatApiTime } from '/@/utils/formatTime';

const { t } = useI18n();

const ruleFormRef = ref<FormInstance>();

const state = reactive({
    open: false,
    title: '',
    form: {} as ListThreatBlockReply_Details,
    onClose: () => { },

    showResults: [] as ListThreatBlockReply_Results[],
    pageIdx: 1,
    pageSize: 10,
});

const open = (data: ListThreatBlockReply_Details, onClose: () => void) => {
    ruleFormRef.value?.clearValidate();

    state.open = true;

    state.title = T('detailTitle');
    state.form = data;
    state.onClose = onClose;
    state.showResults = data.results.slice(0, state.pageSize);
}

const handleClose = () => {
    state.open = false;
    state.onClose();
};

watch(() => [state.pageIdx, state.pageSize], () => {
    state.showResults = state.form.results.slice((state.pageIdx - 1) * state.pageSize, state.pageIdx * state.pageSize);
});

defineExpose({
    open,
});
</script>

<style>
</style>

