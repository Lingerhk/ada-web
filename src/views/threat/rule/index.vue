<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <el-form :inline="true">
                    <el-form-item :label="T('level')">
                        <LevelCheckbox v-model="state.req.level" />
                    </el-form-item>
                    <el-form-item :label="T('enable')">
                        <multiSelector :options="enableOptions" v-model:selected="state.req.enable" />
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table ref="tableRef" class="none-border-table" :data="state.aggRules" :border="false"
                    row-class-name="rule-row" style="width: 100%" :show-header="false" row-key="type"
                    @row-click="(row: any, column: any, event: Event) => handleExpand(row)">
                    <el-table-column :width="50">
                        <template #default="props">
                            <el-button size="default" text type="primary"
                                :icon="isExpanded(props.row) ? Minus : Plus"></el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" :min-width="300">
                        <template #default="props">
                            <span style="font-size: 18px; font-weight: bold;">{{ props.row.type }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="enableCount" :min-width="300">
                        <template #default="props">
                            <el-row>{{ T('enableCount') }}</el-row>
                            <el-row>{{ props.row.enableCount }}</el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="disableCount" :min-width="300">
                        <template #default="props">
                            <el-row>{{ T('disableCount') }}</el-row>
                            <el-row>{{ props.row.disableCount }}</el-row>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand" class-name="col-expand" width="1">
                        <template #default="props">
                            <el-row style="padding: 20px">
                                <el-table class="with-border-table" :data="props.row.rules" :border="true">
                                    <el-table-column :label="T('name')" prop="name" :min-width="400"></el-table-column>
                                    <el-table-column :label="T('level')" prop="level" :min-width="100">
                                        <teamplate #default>
                                            <level-image :level="props.row.level" />
                                        </teamplate>
                                    </el-table-column>"
                                    <el-table-column :label="T('enable')" prop="enable" :min-width="100">
                                        <template #default="prop">
                                            <el-switch v-model="prop.row.enable"
                                                :before-change="() => beforeEnable(prop.row)"></el-switch>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="T('autoBlock')" prop="autoBlock" :min-width="100">
                                        <template #default="prop">
                                            <el-switch v-model="prop.row.autoBlock"
                                                :before-change="() => beforeAutoBlock(prop.row)"></el-switch>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="T('updateTm')" prop="updateTm" :min-width="200"
                                        :formatter="(row: any, column: any, cellValue: any, index: number) => formatApiTime(cellValue)"></el-table-column>
                                </el-table>
                            </el-row>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ActionThreatRuleReq, ListThreatRuleReply_Details, ListThreatRuleReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { Plus, Minus } from '@element-plus/icons-vue'
import { transThreatRule as T, transLevel } from '/@/utils/translator';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import LevelImage from '/@/components/level/image.vue';
import LevelCheckbox from '/@/components/level/checkbox.vue';
import multiSelector from '/@/components/form/multiSelector.vue';
import { getThreatRuleEnableOptions } from '/@/utils/constant';

interface AggregatedRule {
    type: string;
    enableCount: number;
    disableCount: number;
    rules: ListThreatRuleReply_Details[];
}

const state = reactive({
    req: {
        level: [],
        enable: [],
    } as ListThreatRuleReq,
    aggRules: [] as AggregatedRule[],
    loading: false,
    expandedKeys: [] as string[],
});

const tableRef = ref();
const { t } = useI18n();
const enableOptions = getThreatRuleEnableOptions();

const isExpanded = (data: any) => {
    return state.expandedKeys.includes(data.type);
};

const handleExpand = (data: any) => {
    state.expandedKeys = isExpanded(data) ? state.expandedKeys.filter(key => key !== data.type) : [...state.expandedKeys, data.type];
    tableRef.value.toggleRowExpansion(data);
};

const changeRule = async (iD: string, type: string, enable: boolean): Promise<boolean> => {

    const req: ActionThreatRuleReq = {
        iD,
        type,
        switch: enable,
    };

    return api.actionThreatRule(req)
    .then(resp => resp.response)
    .then(data => {
        const ok = alertResult(data.result, T('enableSucc'), T('enableFail'));
        return ok;
    })
    .catch(err => {
        alertApiError(err);
        return false;
    });
};

const confirmChangeRule = async (data: ListThreatRuleReply_Details, type: string, enable: boolean): Promise<boolean> => {

	return ElMessageBox.confirm(T('actionRuleTitle', [T(`${type}_${enable}`)]), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
	})
	.then(() => {
        return changeRule(data.iD, type, enable);
    })
	.catch(() => false);
};

const beforeAutoBlock = async (data: ListThreatRuleReply_Details): Promise<boolean> => {
    return confirmChangeRule(data, "auto_block", !data.autoBlock).finally(() => refresh());
};

const beforeEnable = async (data: ListThreatRuleReply_Details): Promise<boolean> => {
    return confirmChangeRule(data, "is_enable", !data.enable).finally(() => refresh());
};

const aggregateRules = (rules: ListThreatRuleReply_Details[]): AggregatedRule[] => {

    const res = rules.reduce((acc, rule) => {
        if (!acc.has(rule.type)) {
            acc.set(rule.type, {
                type: rule.type,
                enableCount: 0,
                disableCount: 0,
                rules: [],
            });
        }

        if (rule.enable) {
            acc.get(rule.type)!.enableCount++;
        } else {
            acc.get(rule.type)!.disableCount++;
        }

        acc.get(rule.type)!.rules.push(rule);

        return acc;
    }, new Map<string, AggregatedRule>());

    return Array.from(res.values());
};

const refresh = () => {
    state.loading = true;
    api.listThreatRule(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.aggRules = aggregateRules(data.list);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

onMounted(() => {
    refresh();
});

watch(() => state.req, () => {
    console.log(state.req);
    refresh();
}, { deep: true });

</script>

<style>
.table-row {
    cursor: pointer;
}

.none-border-table {
    --el-table-border-color: none !important;
    
    .el-table__body {
        -webkit-border-vertical-spacing: 13px;
    }
}

.with-border-table {
    --el-table-border-color: #ebeef5 !important;

    .el-table__body {
        -webkit-border-vertical-spacing: 0px;
    }
}

.rule-row {
    background-color: #f5f7fa !important;
    height: 64px;
}

.col-expand {
    overflow: hidden;
}

</style>