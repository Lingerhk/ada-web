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
                    :data="state.dataMore?.plugins.slice(state.pageIdx - 1, state.pageIdx - 1 + state.pageSize) ?? []"
                    :border="true" row-class-name="pointer-cursor" row-key="ID" :expand-row-keys="state.expandedKeys">
                    <el-table-column v-for="key in state.keys" :prop="key"
                        :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_${key}`)" :key="key"
                        :align="key === 'level' ? 'center' : 'left'">
                        <template #default="props">
                            <el-button v-if="key === 'metaData'" size="default" @click="handleExpand(props.row)" text
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
                        <div></div>
                    </el-row>
                    <Codemirror v-for="plugin in state.dataMore?.plugins" v-model:value="plugin.metaData.password"
                        :options="state.cmOptions" border placeholder="" :height="500" style="margin-top: 20px;"
                        v-bind:key="plugin.iD" />
                </template>
            </el-row>
            <!-- 分页 -->
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
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GetScanTmplReply, ListScanTmplReply_Details } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { getScanTmpl } from '/@/api/grpc/method';
import { Edit } from '@element-plus/icons-vue'
import { QuestionFilled } from '@element-plus/icons-vue'
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
    expandedKeys: [],
    cmOptions: {
        lineNumbers: true,
        mode: "htmlmixed", // Language mode
    },
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

const handleExpand = (data: GetScanTmplReply) => {
    tableRef.value.toggleRowExpansion(data);
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
