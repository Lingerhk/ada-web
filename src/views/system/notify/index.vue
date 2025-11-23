<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item>
                        <el-button type="primary" @click="handleNew">{{ T('new') }}</el-button>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.notify.moduleName')">
                        <el-select v-model="state.req.moduleName" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.system.notify.selectModule')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="moduleCheckAll" :indeterminate="moduleIndeterminate" @change="handleModuleCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in ModuleOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.notify.notifyType')">
                        <el-select v-model="state.req.notifyType" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.system.notify.selectNotify')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="notifyCheckAll" :indeterminate="notifyIndeterminate" @change="handleNotifyCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in NotifyOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.notify.enable')">
                        <el-select v-model="state.req.enable" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 150px" :placeholder="$t('message.system.notify.selectEnable')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="enableCheckAll" :indeterminate="enableIndeterminate" @change="handleEnableCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in EnableOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    row-class-name="pointer-cursor" style="width: 100%">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="moduleName" :label="$t('message.system.notify.moduleName')">
                        <template #default="prop">
                            {{ $t(`message.system.notify.module_${prop.row.moduleName}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="notifyType" :label="$t('message.system.notify.notifyType')" :formatter="formatNotifyType"/>
                    <el-table-column prop="endpoint" :label="$t('message.system.notify.endpoint')" />
                    <el-table-column prop="remark" :label="$t('message.system.notify.remark')"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="enable" :label="$t('message.system.notify.enable')" :width="90">
                        <template #default="prop">
                            <el-switch v-model="prop.row.enable" active-value="enable" inactive-value="disable" @change="(v: string) => switchNotification(prop.row, v)"
                                size="default" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.system.notify.updateTm')">
                        <template #default="prop">
                            {{ formatApiTime(prop.row.updateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #default="prop">
                            <el-space spacer="|" size="small">
                                <el-button type="text" @click="handleDetail(prop.row)">{{ T('detail') }}</el-button>
                                <el-button type="text" @click="handleEdit(prop.row)">{{ T('edit') }}</el-button>
    <el-button type="text" style="color: #f56c6c" @click="confirmDelete(prop.row)">{{ T('delete') }}</el-button>
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
        <Drawer :model-value="dstate.open" @update:model-value="(val: boolean) => dstate.open = val" :data="dstate.data" :ro="dstate.ro"/>
        <NewDialog v-model="newDialogVisible" @success="refresh"/>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { DeleteNotifyConfReq, EnableNotifyConfReq, ListNotifyConfReply, ListNotifyConfReply_Details, ListNotifyConfReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { getNotifyEnableOptions, getNotifyNotifyOptions, getNotifyModuleOptions } from '/@/utils/constant';
import { useI18n } from 'vue-i18n';
import { formatApiTime } from '/@/utils/formatTime';
import { transNotify as T } from '/@/utils/translator';
import Drawer from './drawer.vue';
import NewDialog from './newDialog.vue';
import { formatNotifyType } from './constant';

const { t } = useI18n();

const ModuleOptions = getNotifyModuleOptions(t);
const NotifyOptions = getNotifyNotifyOptions(t);
const EnableOptions = getNotifyEnableOptions(t);

// Checkbox states for "Check All"
const moduleCheckAll = ref(false);
const moduleIndeterminate = ref(false);
const notifyCheckAll = ref(false);
const notifyIndeterminate = ref(false);
const enableCheckAll = ref(false);
const enableIndeterminate = ref(false);

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

const newDialogVisible = ref(false);

const handleNew = () => {
    newDialogVisible.value = true;
};

const confirmDelete = (data: ListNotifyConfReply_Details) => {
    ElMessageBox.confirm(T('deleteConfirm'), T('deleteTitle'), {
        confirmButtonText: t('message.dialog.confirm'),
        cancelButtonText: t('message.dialog.cancel'),
        type: 'warning',
    }).then(() => {
        handleDelete(data);
    }).catch(() => {
        // User cancelled
    });
};

const handleDelete = (data: ListNotifyConfReply_Details) => {
    const req: DeleteNotifyConfReq = {
        id: data.id,
    };
    console.log("deleteNotifyConf", req);

    api.deleteNotifyConf(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.notify.deleteNotifyConfSucc'), t('message.system.notify.deleteNotifyConfFail'));
    })
    .catch(err => alertApiError(err))
    .finally(() => refresh());
};

const switchNotification = (data: ListNotifyConfReply_Details, v: string) => {
    const req: EnableNotifyConfReq = {
        id: data.id,
        enable: v,
    };
    console.log("enableNotifyConf", req);

    api.enableNotifyConf(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.notify.enableSucc'), t('message.system.notify.enableFail'));
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

// Handle module Select All
const handleModuleCheckAll = (val: boolean) => {
    moduleIndeterminate.value = false;
    if (val) {
        state.req.moduleName = ModuleOptions.map(opt => opt.value);
    } else {
        state.req.moduleName = [];
    }
};

// Handle notify Select All
const handleNotifyCheckAll = (val: boolean) => {
    notifyIndeterminate.value = false;
    if (val) {
        state.req.notifyType = NotifyOptions.map(opt => opt.value);
    } else {
        state.req.notifyType = [];
    }
};

// Handle enable Select All
const handleEnableCheckAll = (val: boolean) => {
    enableIndeterminate.value = false;
    if (val) {
        state.req.enable = EnableOptions.map(opt => opt.value);
    } else {
        state.req.enable = [];
    }
};

// Watch individual filter properties
watch(() => state.req.moduleName, (val) => {
    moduleIndeterminate.value = false;
    if (val.length === 0) {
        moduleCheckAll.value = false;
    } else if (val.length === ModuleOptions.length) {
        moduleCheckAll.value = true;
    } else {
        moduleIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.notifyType, (val) => {
    notifyIndeterminate.value = false;
    if (val.length === 0) {
        notifyCheckAll.value = false;
    } else if (val.length === NotifyOptions.length) {
        notifyCheckAll.value = true;
    } else {
        notifyIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.enable, (val) => {
    enableIndeterminate.value = false;
    if (val.length === 0) {
        enableCheckAll.value = false;
    } else if (val.length === EnableOptions.length) {
        enableCheckAll.value = true;
    } else {
        enableIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.pageIdx, () => {
    refresh();
});

watch(() => state.req.pageSize, () => {
    refresh();
});

watch(() => dstate.open, (val) => {
    if (!val) {
        refresh();
    }
});

onMounted(() => {
    refresh();
});
</script>