<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item :label="$t('message.system.outgoing.notifyType')">
                        <MultiSelector v-model:selected="state.req.moduleName" :options="ModuleOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.system.outgoing.moduleName')">
                        <MultiSelector v-model:selected="state.req.notifyType" :options="NotifyOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.system.outgoing.enable')">
                        <MultiSelector v-model:selected="state.req.enable" :options="EnableOptions" />
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    row-class-name="pointer-cursor" style="width: 100%">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="moduleName" :label="$t('message.system.outgoing.moduleName')">
                        <template #default="prop">
                            {{ $t(`message.system.outgoing.module_${prop.row.moduleName}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="notifyType" :label="$t('message.system.outgoing.notifyType')" :formatter="formatNotifyType"/>
                    <el-table-column prop="endpoint" :label="$t('message.system.outgoing.endpoint')" />
                    <el-table-column prop="remark" :label="$t('message.system.outgoing.remark')"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="enable" :label="$t('message.system.outgoing.enable')" :width="90">
                        <template #default="prop">
                            <el-switch v-model="prop.row.enable" active-value="enable" inactive-value="disable" @change="(v) => switchNotification(prop.row, v)"
                                size="default" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.system.outgoing.updateTm')">
                        <template #default="prop">
                            {{ formatApiTime(prop.row.updateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #default="prop">
                            <el-space spacer="|" size="small">
                                <el-button type="text" @click="handleDetail(prop.row)">{{ T('detail') }}</el-button>
                                <el-button type="text" @click="handleEdit(prop.row)">{{ T('edit') }}</el-button>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" :layout='"sizes, prev, pager, next, jumper"'
                    :total="state.reply.page?.total ?? 0" @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
        </el-card>
        <Drawer v-model="dstate.open" :data="dstate.data" :ro="dstate.ro"/>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, watch } from 'vue';
import { EnableNotifyConfReq, ListNotifyConfReply, ListNotifyConfReply_Details, ListNotifyConfReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { getOutgoingEnableOptions, getOutgoingNotifyOptions, getOutgoingModuleOptions } from '/@/utils/constant';
import { useI18n } from 'vue-i18n';
import { formatApiTime } from '/@/utils/formatTime';
import { transOutgoing as T } from '/@/utils/translator';
import Drawer from './drawer.vue';
import { formatNotifyType } from './constant';

const { t } = useI18n();

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));

const ModuleOptions = getOutgoingModuleOptions(t);
const NotifyOptions = getOutgoingNotifyOptions(t);
const EnableOptions = getOutgoingEnableOptions(t);

const state = reactive({
    req: {
        pageIdx: 1, // start index with 1
        pageSize: 20, // if pageSize is -1, we will return all nodes
        moduleName: [], // [(validator.field) = {regex: "all|alert|baseline|leak|system"}]; // 模块类型 alert,baseline,leak,system
        notifyType: [], // [(validator.field) = {regex: "all|syslog|webhook|email"}]; // 通知类型 syslog,webhook,email
        endpoint: '', // 通知目标
        enable: [], // [(validator.field) = {regex: "all|enable|disable"}]; // 启用状态， 开启enable 关闭disable
        sortTime: 0, // 根据时间排序，1升序，-1降序,0为默认顺序
    } as ListNotifyConfReq,
    reply: {} as ListNotifyConfReply,
    loading: false,
});

const dstate = reactive({
    open: false,
    ro: false,
    data: {} as ListNotifyConfReply_Details,
});

const switchNotification = (data: ListNotifyConfReply_Details, v: string) => {
    const req: EnableNotifyConfReq = {
        id: data.id,
        enable: v,
    };
    console.log("enableNotifyConf", req);

    api.enableNotifyConf(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.outgoing.enableSucc'), t('message.system.outgoing.enableFail'));
    })
    .catch(err => alertApiError(err))
    .finally(() => refresh());
};

const handleDetail = (data: ListNotifyConfReply_Details) => {
    dstate.open = true;
    dstate.ro = true;
    dstate.data = data;
};

const handleEdit = (data: ListNotifyConfReply_Details) => {
    dstate.open = true;
    dstate.ro = false;
    dstate.data = data;
};

const refresh = () => {
    console.log("listNotifyConf", state.req);

    api.listNotifyConf(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(state.req, () => refresh(), { deep: true });
watch(() => dstate.open, (val) => {
    if (!val) {
        refresh();
    }
});

onMounted(() => {
    refresh();
});
</script>