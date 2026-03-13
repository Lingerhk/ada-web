<template>
    <el-drawer :size="1276" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <h3>{{ $t('message.risk.ruleConfig.detailDrawerTitle') }}</h3>
        </template>
        <template #default>
            <!-- description -->
            <div style="padding: 20px;">
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="2" class="desc-label">{{ '*' + $t('message.risk.ruleConfig.templateName') + ':'
                        }}</el-col>
                    <el-col :span="20" class="desc-value">
                        {{ state.dataMore?.name }}
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="2" class="desc-label">{{ '*' + $t('message.risk.ruleConfig.templateType') + ':'
                        }}</el-col>
                    <el-col :span="20" class="desc-value">
                        {{ $t(`message.risk.ruleConfig.${state.dataMore?.type}`) }}
                    </el-col>
                </el-row>
            </div>
            <!-- entry table -->
            <el-row style="padding: 0 20px;">
                <el-table v-if="state.data?.type !== 'weakpwd'" ref="tableRef"
                    :data="state.dataMore?.plugins.slice((state.pageIdx - 1) * state.pageSize, state.pageIdx * state.pageSize) ?? []"
                    :border="true" row-class-name="pointer-cursor" row-key="iD" :expand-row-keys="state.expandedKeys">
                    <el-table-column v-for="key in state.keys" :prop="key"
                        :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_${key}`)" :key="key"
                        :align="key === 'level' ? 'center' : 'left'">
                        <template #default="props">
                            <el-button v-if="key === 'metaData'" size="default" @click="handleEditMetaData(props.row)" text
                                type="primary" :icon="Edit"
                                :disabled="Object.keys(props.row.metaData).length === 0"></el-button>
                            <el-tag v-else-if="key === 'level'" :type="getLevelType(props.row[key])" effect="dark">
                                {{ $t(`message.tableCommon.level.${props.row[key]}`) }}
                            </el-tag>
                            <span v-else>
                                {{ ['iD', 'name'].findIndex(v => v === key) === - 1 ?
                                    $t(`message.risk.ruleConfig.${state.data?.type}DetailValue_${props.row[key]}`) :
                                    props.row[key] }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand" class-name="col-expand" width="1">
                        <template #default="props">
                            <JsonViewer :value="props.row.metaData" copyable sort></JsonViewer>
                        </template>
                    </el-table-column>
                </el-table>
                <template v-else-if="state.data?.type === 'weakpwd'">
                    <el-row justify="space-between" style="width: 100%;">
                        <div style="display: flex; align-items: center;">
                            <span>{{ $t('message.risk.ruleConfig.detailWeakpwd') }}: </span>
                            <el-tooltip class="box-item" effect="dark"
                                :content="$t('message.risk.ruleConfig.detailWeakpwdTooltip')" placement="right-start">
                                <el-icon style="margin-left: 5px;">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                        <el-button v-if="state.data?.tmplType === 2" size="default" type="primary" @click="handleSaveWeakpwd">
                            {{ $t('message.tableCommon.save') }}
                        </el-button>
                    </el-row>
                    <Codemirror v-for="(plugin, index) in state.dataMore?.plugins"
                        :value="getPasswordString(plugin.metaData.password)"
                        @update:value="(val: string) => updatePassword(index, val)"
                        :options="{ ...state.cmOptions, readOnly: state.data?.tmplType !== 2 }" border placeholder="" :height="500" style="margin-top: 20px;"
                        :key="plugin.iD" />
                </template>
            </el-row>
            <!-- Pagination -->
            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                <div></div>
                <el-pagination v-if="state.data?.type !== 'weakpwd'" v-model:current-page="state.pageIdx"
                    v-model:page-size="state.pageSize" :page-sizes="[10, 20, 30, 40, 50]"
                    layout='sizes, prev, pager, next, jumper' :total="state.dataMore?.plugins.length ?? 0"
                    @size-change="(val: number) => state.pageSize = val"
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

    <!-- MetaData Edit Dialog -->
    <el-dialog v-model="editDialog.open" :title="$t('message.risk.ruleConfig.editMetaDataTitle')" width="600px">
        <el-form label-position="left" label-width="180px">
            <el-form-item v-for="(value, key) in editDialog.metaData" :key="key" :label="String(key)">
                <el-input v-model="editDialog.metaData[key]" :disabled="state.data?.tmplType !== 2" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="editDialog.open = false">{{ $t('message.tableCommon.cancel') }}</el-button>
            <el-button type="primary" @click="handleSaveMetaData" :disabled="state.data?.tmplType !== 2">
                {{ $t('message.tableCommon.save') }}
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GetScanTmplReply, ListScanTmplReply_Details, UpdateScanTmplReq, pluginInfo, pluginInfoV2 } from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';
import { getScanTmpl } from '/@/api/grpc/method';
import api from '/@/api/grpc';
import { Edit } from '@element-plus/icons-vue'
import { QuestionFilled } from '@element-plus/icons-vue'

// Convert pluginInfo to pluginInfoV2 for API request
// Arrays are joined with newlines (backend expects this format for password fields)
const convertToPluginInfoV2 = (plugins: pluginInfo[]): pluginInfoV2[] => {
    return plugins.map(p => ({
        iD: p.iD,
        enable: p.enable,
        metaData: Object.fromEntries(
            Object.entries(p.metaData).map(([k, v]) => {
                if (typeof v === 'string') {
                    return [k, v];
                } else if (Array.isArray(v)) {
                    // Join arrays with newlines (backend splits them back)
                    return [k, v.join('\n')];
                } else {
                    return [k, String(v)];
                }
            })
        ),
    }));
};
import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/lint.css";

const { t } = useI18n();

const tableRef = ref();

const state = reactive({
    open: false,
    data: null as ListScanTmplReply_Details | null,
    dataMore: null as GetScanTmplReply | null,
    pageIdx: 1,
    pageSize: 10,
    keys: [] as string[],
    expandedKeys: [] as string[],
    cmOptions: {
        lineNumbers: true,
        mode: "htmlmixed", // Language mode
    },
});

const editDialog = reactive({
    open: false,
    pluginId: '' as string,
    metaData: {} as Record<string, any>,
});

const getLevelType = (level: number): string => {
    const typeMap: Record<number, string> = {
        1: 'info',
        2: 'success',
        3: 'warning',
        4: 'danger',
        5: 'danger',
    };
    return typeMap[level] || 'info';
};

// Convert password to string for Codemirror display
// Handles both array format (from DB) and string format (from API)
const getPasswordString = (password: any): string => {
    if (Array.isArray(password)) {
        return password.join('\n');
    }
    return password ?? '';
};

// Update password in plugin metaData
const updatePassword = (index: number, value: string) => {
    if (state.dataMore && state.dataMore.plugins[index]) {
        state.dataMore.plugins[index].metaData.password = value;
    }
};

const handleEditMetaData = (row: pluginInfo) => {
    editDialog.pluginId = row.iD;
    // Deep copy metaData to avoid direct mutation
    editDialog.metaData = JSON.parse(JSON.stringify(row.metaData));
    editDialog.open = true;
};

const handleSaveMetaData = async () => {
    if (!state.dataMore || !state.data) return;

    // Update the plugin's metaData in the local state
    const pluginIndex = state.dataMore.plugins.findIndex(p => p.iD === editDialog.pluginId);
    if (pluginIndex === -1) return;

    state.dataMore.plugins[pluginIndex].metaData = editDialog.metaData;

    // Call API to save
    try {
        const req: UpdateScanTmplReq = {
            iD: state.data.iD,
            name: state.dataMore.name,
            plugins: convertToPluginInfoV2(state.dataMore.plugins),
        };
        const resp = await api.updateScanTmpl(req).then(resp => resp.response);
        const ok = alertResult(resp.result, t('message.risk.ruleConfig.updateSucc'), t('message.risk.ruleConfig.updateFail'));
        if (ok) {
            editDialog.open = false;
            refresh();
        }
    } catch (err) {
        alertApiError(err);
    }
};

const handleSaveWeakpwd = async () => {
    if (!state.dataMore || !state.data) return;

    try {
        const req: UpdateScanTmplReq = {
            iD: state.data.iD,
            name: state.dataMore.name,
            plugins: convertToPluginInfoV2(state.dataMore.plugins),
        };
        const resp = await api.updateScanTmpl(req).then(resp => resp.response);
        alertResult(resp.result, t('message.risk.ruleConfig.updateSucc'), t('message.risk.ruleConfig.updateFail'));
    } catch (err) {
        alertApiError(err);
    }
};

const refresh = () => {
    if (!state.data?.iD) {
        return;
    }

    getScanTmpl(state.data.iD)
        .then(data => {
            state.dataMore = data;
            console.log(data);
            if (state.dataMore.plugins.length > 0) {
                state.keys = Object.keys(state.dataMore.plugins[0]);
            } else {
                state.keys = [];
            }
        })
        .catch(err => alertApiError(err));
}

const open = (data: ListScanTmplReply_Details) => {
    state.open = true;
    state.data = data;
    state.pageIdx = 1;
    state.expandedKeys = [];

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
    font-size: 14px;
    font-weight: 600;
}

.desc-value {
    font-size: 14px;
}

.col-expand {
    overflow: hidden;
}

code {
    color: #739ab3;
    background-color: rgba(27, 31, 35, .05);
}
</style>
