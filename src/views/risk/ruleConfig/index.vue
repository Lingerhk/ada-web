<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab">
                <!-- Rule Template Tab -->
                <el-tab-pane :label="$t('message.risk.ruleConfig.ruleTemplateTab')" name="ruleTemplate">
                    <el-row justify="space-between" style="margin-top: 10px;">
                        <!-- 搜索 -->
                        <el-form :inline="true">
                            <el-form-item>
                                <el-button size="default" type="primary" @click="handleAdd">
                                    <el-icon><Plus /></el-icon>
                                    {{ $t('message.tableCommon.new') }}
                                </el-button>
                            </el-form-item>
                            <el-form-item :label="$t('message.risk.ruleConfig.templateType')">
                                <el-select size="default" v-model="templateState.req.type" clearable
                                    style="width: 240px" :placeholder="$t('message.risk.ruleConfig.selectType')">
                                    <el-option v-for="option in RiskTypeOptions" :key="option.value" :label="option.label"
                                        :value="option.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <!-- 下方显示列表 -->
                    <el-row style="margin-top: 10px">
                        <el-table :data="templateState.data" v-loading="templateState.loading" :border="true" row-class-name="pointer-cursor"
                            style="width: 100%">
                            <el-table-column type="index" width="80" :label="$t('message.tableCommon.index')" />
                            <el-table-column prop="name" :label="$t('message.risk.ruleConfig.templateName')" />
                            <el-table-column prop="type" :label="$t('message.risk.ruleConfig.templateType')">
                                <template #default="scope">
                                    {{ $t(`message.risk.ruleConfig.${scope.row.type}`) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="updateTm" :label="$t('message.risk.ruleConfig.updateTm')">
                                <template #default="scope">{{ formatApiTime(scope.row.updateTm) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('message.tableCommon.operation')" width="210" fixed="right" align="center">
                                <template #default="scope">
                                    <el-button size="small" @click="handleEdit(scope.row)"
                                        :disabled="scope.row.tmplType !== 2">{{
                                            $t('message.tableCommon.edit') }}</el-button>
                                    <el-button size="small" @click="handleDetail(scope.row)">{{
                                        $t('message.tableCommon.detail') }}</el-button>
                                    <el-button size="small" type="danger" @click="handleDelete(scope.row)"
                                        :disabled="scope.row.tmplType !== 2">{{
                                            $t('message.tableCommon.delete') }}</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </el-tab-pane>

                <!-- Rule Configuration Tab -->
                <el-tab-pane :label="$t('message.risk.ruleConfig.ruleConfigTab')" name="ruleConfig">
                    <el-row style="margin-top: 10px">
                        <el-table :data="configState.data" v-loading="configState.loading" :border="true"
                            style="width: 100%">
                            <el-table-column type="index" width="80" :label="$t('message.risk.ruleConfig.confId')" />
                            <el-table-column prop="name" :label="$t('message.risk.ruleConfig.confName')" />
                            <el-table-column prop="type" :label="$t('message.risk.ruleConfig.confType')">
                                <template #default="scope">
                                    {{ $t(`message.risk.ruleConfig.${scope.row.type}`) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="isEnable" :label="$t('message.risk.ruleConfig.confEnabled')" width="100">
                                <template #default="scope">
                                    <el-switch
                                        :model-value="scope.row.isEnable"
                                        size="default"
                                        :loading="configState.switchLoading[scope.row.iD]"
                                        @change="(val: boolean) => handleEnableChange(scope.row, val)"
                                    />
                                </template>
                            </el-table-column>
                            <el-table-column prop="cycleType" width="150">
                                <template #header>
                                    <span>{{ $t('message.risk.ruleConfig.confCycleType') }}</span>
                                    <el-tooltip
                                        :content="$t('message.risk.ruleConfig.cycleTypeTooltip')"
                                        placement="top"
                                        :show-after="200"
                                    >
                                        <el-icon style="margin-left: 4px; cursor: help; vertical-align: middle;">
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </template>
                                <template #default="scope">
                                    {{ getCycleTypeLabel(scope.row.cycleType) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="updateTm" :label="$t('message.risk.ruleConfig.confUpdateTm')">
                                <template #default="scope">{{ formatApiTime(scope.row.updateTm) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('message.tableCommon.operation')" width="100" fixed="right" align="center">
                                <template #default="scope">
                                    <el-button size="small" @click="handleConfigEdit(scope.row)">{{
                                        $t('message.tableCommon.edit') }}</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                    <el-row style="margin-top: 10px" justify="end">
                        <el-pagination
                            v-model:current-page="configState.req.pageIdx"
                            v-model:page-size="configState.req.pageSize"
                            :page-sizes="[10, 30, 60, 100]"
                            layout="sizes, prev, pager, next, jumper"
                            :total="configState.page?.total ?? 0"
                            @size-change="handleConfigPageSizeChange"
                            @current-change="handleConfigPageChange"
                        />
                    </el-row>
                </el-tab-pane>
            </el-tabs>
            <DetailDrawer ref="DetailDrawerRef" />
            <EditDrawer ref="EditDrawerRef" />
            <ScanConfigEditDrawer ref="ScanConfigEditDrawerRef" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import {
    DeleteScanTmplReq,
    ListScanTmplReply,
    ListScanTmplReply_Details,
    ListScanTmplReq,
    ListScanConfReq,
    ListScanConfReply,
    scanConfDetail,
    SetScanConfReq,
    ModelPage
} from '/@/api/grpc/ada';
import { listScanTmpl } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { getRiskTypeOptions } from '../constant';
import { useI18n } from 'vue-i18n';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessageBox } from 'element-plus';
import { Plus, QuestionFilled } from '@element-plus/icons-vue';
import api from '/@/api/grpc';

const DetailDrawerRef = ref();
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const EditDrawerRef = ref();
const EditDrawer = defineAsyncComponent(() => import('./editDrawer.vue'));
const ScanConfigEditDrawerRef = ref();
const ScanConfigEditDrawer = defineAsyncComponent(() => import('./scanConfigEditDrawer.vue'));
const { t } = useI18n();

const RiskTypeOptions = getRiskTypeOptions(t);

const activeTab = ref('ruleTemplate');

// =============== Rule Template State ===============
const templateState = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        type: 'all',
    } as ListScanTmplReq,
    data: [] as ListScanTmplReply_Details[],
    exhausted: false,
    loading: false,
});

// =============== Rule Configuration State ===============
const configState = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
    } as ListScanConfReq,
    data: [] as scanConfDetail[],
    page: null as ModelPage | null,
    exhausted: false,
    loading: false,
    switchLoading: {} as Record<string, boolean>,
});

// =============== Cycle Type Options ===============
const getCycleTypeLabel = (cycleType: number): string => {
    switch (cycleType) {
        case 1:
            return t('message.risk.ruleConfig.cycleTypeDay');
        case 2:
            return t('message.risk.ruleConfig.cycleTypeWeek');
        case 3:
            return t('message.risk.ruleConfig.cycleTypeMonth');
        default:
            return '-';
    }
};

// =============== Rule Template Methods ===============
const handleAdd = () => {
    EditDrawerRef.value.open(t('message.risk.ruleConfig.addRule'), null, refreshTemplates);
};

const handleEdit = (data: ListScanTmplReply_Details) => {
    if (data.tmplType !== 2) {
        return;
    }

    EditDrawerRef.value.open(t('message.risk.ruleConfig.addRule'), data, refreshTemplates);
};

const handleDetail = (data: ListScanTmplReply_Details) => {
    DetailDrawerRef.value.open(data);
};

const handleDelete = (data: ListScanTmplReply_Details) => {
    if (data.tmplType !== 2) {
        return;
    }

    ElMessageBox.confirm(
        t('message.risk.ruleConfig.deleteOne'),
        t('message.dialog.prompt')
    )
    .then(() => {
        api.deleteScanTmpl({iD: data.iD})
        .then(resp => resp.response)
        .then(data => alertResult(data.result, t('message.risk.ruleConfig.delSucc'), t('message.risk.ruleConfig.delFail')))
        .catch(err => alertApiError(err))
        .finally(() => refreshTemplates());
    })
    .catch(err => {});
};

const refreshTemplates = () => {
    templateState.loading = true;
    listScanTmpl(templateState.req)
        .then((data: ListScanTmplReply) => {
            templateState.exhausted = data.exhausted;
            templateState.data = data.list;
        })
        .catch(err => alertApiError(err))
        .finally(() => templateState.loading = false);
};

// =============== Rule Configuration Methods ===============
const refreshConfigs = () => {
    configState.loading = true;
    api.listScanConf(configState.req)
        .then(resp => resp.response)
        .then((data: ListScanConfReply) => {
            configState.exhausted = data.exhausted;
            configState.data = data.list;
            configState.page = data.page ?? null;
        })
        .catch(err => alertApiError(err))
        .finally(() => configState.loading = false);
};

const handleEnableChange = (row: scanConfDetail, newVal: boolean) => {
    const req: SetScanConfReq = {
        iD: row.iD,
        isEnable: newVal,
        cycleType: row.cycleType,
    };

    // Set loading state for this specific switch
    configState.switchLoading[row.iD] = true;

    api.setScanConf(req)
        .then(resp => resp.response)
        .then(data => {
            if (data.result === 'SUCCESS') {
                alertResult(data.result, t('message.risk.ruleConfig.confUpdateSucc'), '');
                // Refresh the list to get updated data from server
                refreshConfigs();
            } else {
                alertResult(data.result, '', t('message.risk.ruleConfig.confUpdateFail'));
                // Refresh to revert the switch state
                refreshConfigs();
            }
        })
        .catch(err => {
            alertApiError(err);
            // Refresh to revert the switch state
            refreshConfigs();
        })
        .finally(() => {
            configState.switchLoading[row.iD] = false;
        });
};

const handleConfigEdit = (row: scanConfDetail) => {
    ScanConfigEditDrawerRef.value.open(row, refreshConfigs);
};

const handleConfigPageSizeChange = (newPageSize: number) => {
    configState.req.pageSize = newPageSize;
    refreshConfigs();
};

const handleConfigPageChange = (newPage: number) => {
    configState.req.pageIdx = newPage;
    refreshConfigs();
};

// Watch template type filter
watch(() => templateState.req.type, () => {
    templateState.req.pageIdx = 1;
    refreshTemplates();
});

watch(() => templateState.req.pageIdx, () => {
    refreshTemplates();
});

watch(() => templateState.req.pageSize, () => {
    refreshTemplates();
});

// Watch tab changes to load data
watch(activeTab, (newTab) => {
    if (newTab === 'ruleConfig') {
        refreshConfigs();
    }
});

onMounted(() => {
    refreshTemplates();
});

</script>
