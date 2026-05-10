<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab">
                <!-- Rule Template Tab -->
                <el-tab-pane :label="$t('message.risk.ruleConfig.ruleTemplateTab')" name="ruleTemplate">
                    <el-row class="table-filter-row table-filter-row--compact" style="margin-top: 10px;">
                        <!-- Search controls -->
                        <el-form :inline="true">
                            <el-form-item>
                                <el-button size="default" type="primary" @click="handleAdd">
                                    <el-icon><Plus /></el-icon>
                                    {{ $t('message.tableCommon.new') }}
                                </el-button>
                            </el-form-item>
                            <el-form-item :label="$t('message.risk.ruleConfig.templateType')">
                                <el-select size="default" v-model="templateState.req.type" clearable filterable
                                    :filter-method="filterRiskTypeOptions"
                                    @visible-change="handleRiskTypeVisibleChange"
                                    style="width: 240px" :placeholder="$t('message.risk.ruleConfig.selectType')">
                                    <el-option v-for="option in filteredRiskTypeOptions" :key="option.value" :label="option.label"
                                        :value="option.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <!-- Result list below -->
                    <el-row style="margin-top: 10px">
                        <el-table :data="templateState.data" v-loading="templateState.loading" :border="true" row-class-name="pointer-cursor"
                            class="scan-template-table" style="width: 100%">
                            <el-table-column type="index" width="80" :label="$t('message.tableCommon.index')" />
                            <el-table-column prop="name" :label="$t('message.risk.ruleConfig.templateName')" />
                            <el-table-column prop="type" :label="$t('message.risk.ruleConfig.templateType')" width="150" class-name="nowrap-column" header-class-name="nowrap-column">
                                <template #default="scope">
                                    {{ getRiskTypeText(scope.row.type) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('message.risk.ruleConfig.enabledPlugins')" width="150" align="center" class-name="nowrap-column" header-class-name="nowrap-column">
                                <template #default="scope">
                                    <div class="plugin-count-cell">
                                        <span class="plugin-count-cell__total">{{ getPluginCountStats(scope.row.iD).total }}</span>
                                        <span class="plugin-count-cell__divider">/</span>
                                        <span class="plugin-count-cell__enabled">{{ getPluginCountStats(scope.row.iD).enabled }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="updateTm" :label="$t('message.risk.ruleConfig.updateTm')">
                                <template #default="scope">{{ formatApiTime(scope.row.updateTm) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('message.tableCommon.operation')" width="124" fixed="right" align="center">
                                <template #default="scope">
                                    <div class="operation-icon-group">
                                        <el-tooltip :content="$t('message.tableCommon.edit')" placement="top">
                                            <span class="operation-icon-trigger">
                                                <el-button class="operation-icon-button" size="small" :icon="Edit" :aria-label="$t('message.tableCommon.edit')" @click="handleEdit(scope.row)" :disabled="scope.row.tmplType !== 2" />
                                            </span>
                                        </el-tooltip>
                                        <el-tooltip :content="$t('message.tableCommon.detail')" placement="top">
                                            <el-button class="operation-icon-button" size="small" type="primary" :icon="View" :aria-label="$t('message.tableCommon.detail')" @click="handleDetail(scope.row)" />
                                        </el-tooltip>
                                        <el-tooltip :content="$t('message.tableCommon.delete')" placement="top">
                                            <span class="operation-icon-trigger">
                                                <el-button class="operation-icon-button" size="small" type="danger" :icon="Delete" :aria-label="$t('message.tableCommon.delete')" @click="handleDelete(scope.row)" :disabled="scope.row.tmplType !== 2" />
                                            </span>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </el-tab-pane>

                <!-- Rule Configuration Tab -->
                <el-tab-pane :label="$t('message.risk.ruleConfig.ruleConfigTab')" name="ruleConfig">
                    <el-row style="margin-top: 10px">
                        <el-table :data="configState.data" v-loading="configState.loading" :border="true"
                            class="rule-config-table" style="width: 100%">
                            <el-table-column type="index" width="80" :label="$t('message.risk.ruleConfig.confId')" />
                            <el-table-column prop="name" :label="$t('message.risk.ruleConfig.confName')">
                                <template #default="scope">
                                    {{ getScanConfigName(scope.row) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="type" :label="$t('message.risk.ruleConfig.confType')" width="130" class-name="nowrap-column" header-class-name="nowrap-column">
                                <template #default="scope">
                                    {{ getRiskTypeText(scope.row.type) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="isEnable" :label="$t('message.risk.ruleConfig.confEnabled')" width="100" class-name="nowrap-column" header-class-name="nowrap-column">
                                <template #default="scope">
                                    <el-switch
                                        :model-value="scope.row.isEnable"
                                        size="default"
                                        :loading="configState.switchLoading[scope.row.iD]"
                                        @change="(val: boolean) => handleEnableChange(scope.row, val)"
                                    />
                                </template>
                            </el-table-column>
                            <el-table-column prop="cycleType" width="150" class-name="nowrap-column" header-class-name="nowrap-column">
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
                            <el-table-column :label="$t('message.tableCommon.operation')" width="96" fixed="right" align="center" class-name="nowrap-column" header-class-name="nowrap-column">
                                <template #default="scope">
                                    <div class="operation-icon-group">
                                        <el-tooltip :content="$t('message.tableCommon.edit')" placement="top">
                                            <el-button class="operation-icon-button" size="small" :icon="Edit" :aria-label="$t('message.tableCommon.edit')" @click="handleConfigEdit(scope.row)" />
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
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
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import {
    ListScanTmplReply,
    ListScanTmplReply_Details,
    ListScanTmplReq,
    ListScanConfReq,
    ListScanConfReply,
    scanConfDetail,
    SetScanConfReq,
} from '/@/api/grpc/ada';
import { getScanTmpl, listScanTmpl } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessageBox } from 'element-plus';
import { Delete, Edit, Plus, QuestionFilled, View } from '@element-plus/icons-vue';
import api from '/@/api/grpc';

const DetailDrawerRef = ref();
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const EditDrawerRef = ref();
const EditDrawer = defineAsyncComponent(() => import('./editDrawer.vue'));
const ScanConfigEditDrawerRef = ref();
const ScanConfigEditDrawer = defineAsyncComponent(() => import('./scanConfigEditDrawer.vue'));
const { t, te, locale } = useI18n();

const riskTypeValues = ['all', 'baseline', 'leak', 'weakpwd'] as const;
const riskTypeKeyword = ref('');
const riskTypeAliases: Record<string, string[]> = {
    all: ['all', '全部', '所有', '所有检测'],
    baseline: ['baseline', '基线', '基线检测'],
    leak: ['vulnerability', 'leak', '漏洞', '漏洞检测'],
    weakpwd: ['weak password', 'weakpwd', 'weak password detection', '弱口令', '弱口令检测'],
};

const translateOrFallback = (key: string, fallback: string) => te(key) ? t(key) : fallback;

const getRiskTypeText = (type: string) => translateOrFallback(`message.risk.ruleConfig.${type}`, type);

const getScanConfigName = (row: scanConfDetail) => {
    return translateOrFallback(`message.risk.ruleConfig.confName_${row.type}`, row.name);
};

const riskTypeOptions = computed(() => {
    locale.value;
    return riskTypeValues.map(value => ({
        value,
        label: getRiskTypeText(value),
        keywords: [getRiskTypeText(value), ...(riskTypeAliases[value] ?? [])].map(v => v.toLowerCase()),
    }));
});

const filteredRiskTypeOptions = computed(() => {
    const keyword = riskTypeKeyword.value.trim().toLowerCase();
    if (!keyword) {
        return riskTypeOptions.value;
    }
    return riskTypeOptions.value.filter(option => option.keywords.some(item => item.includes(keyword)));
});

const filterRiskTypeOptions = (value: string) => {
    riskTypeKeyword.value = value;
};

const handleRiskTypeVisibleChange = (visible: boolean) => {
    if (!visible) {
        riskTypeKeyword.value = '';
    }
};

const activeTab = ref('ruleTemplate');

type PluginCountStats = {
    total: number;
    enabled: number;
};

// =============== Rule Template State ===============
const templateState = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        type: 'all',
    } as ListScanTmplReq,
    data: [] as ListScanTmplReply_Details[],
    pluginCountStats: {} as Record<string, PluginCountStats>,
    exhausted: false,
    loading: false,
});

// =============== Rule Configuration State ===============
const configState = reactive({
    req: {
        pageIdx: 1,
        pageSize: 1000,
    } as ListScanConfReq,
    data: [] as scanConfDetail[],
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

const getPluginCountStats = (id: string) => {
    const stats = templateState.pluginCountStats[id];
    if (!stats || stats.total < 0 || stats.enabled < 0) {
        return {
            total: '-',
            enabled: '-',
        };
    }

    return {
        total: String(stats.total),
        enabled: String(stats.enabled),
    };
};

let templateRefreshSeq = 0;

const refreshPluginCountStats = async (rows: ListScanTmplReply_Details[], seq: number) => {
    const counts: Record<string, PluginCountStats> = {};
    await Promise.all(rows.map(async row => {
        try {
            const data = await getScanTmpl(row.iD);
            counts[row.iD] = {
                total: data.plugins.length,
                enabled: data.plugins.filter(plugin => plugin.enable === 1).length,
            };
        } catch (err) {
            counts[row.iD] = {
                total: -1,
                enabled: -1,
            };
        }
    }));

    if (seq === templateRefreshSeq) {
        templateState.pluginCountStats = counts;
    }
};

const refreshTemplates = async () => {
    const seq = ++templateRefreshSeq;
    templateState.loading = true;
    try {
        const data: ListScanTmplReply = await listScanTmpl(templateState.req);
        if (seq !== templateRefreshSeq) {
            return;
        }
        templateState.exhausted = data.exhausted;
        templateState.data = data.list;
        templateState.pluginCountStats = {};
        await refreshPluginCountStats(data.list, seq);
    } catch (err) {
        alertApiError(err);
    } finally {
        if (seq === templateRefreshSeq) {
            templateState.loading = false;
        }
    }
};

// =============== Rule Configuration Methods ===============
const refreshConfigs = () => {
    configState.loading = true;
    api.listScanConf(configState.req)
        .then(resp => resp.response)
        .then((data: ListScanConfReply) => {
            configState.exhausted = data.exhausted;
            configState.data = data.list;
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

<style scoped>
:deep(.nowrap-column .cell) {
    white-space: nowrap;
}

.plugin-count-cell {
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
    font-variant-numeric: tabular-nums;
}

.plugin-count-cell__total {
    color: #17233c;
    font-weight: 700;
}

.plugin-count-cell__divider {
    color: #94a3b8;
    font-size: 12px;
}

.plugin-count-cell__enabled {
    color: var(--el-color-success);
    font-weight: 700;
}
</style>
