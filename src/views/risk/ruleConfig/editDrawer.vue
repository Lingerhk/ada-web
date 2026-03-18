<template>
    <el-drawer size="1200" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="$t('message.risk.ruleConfig.step1')" />
                    <el-step :title="$t('message.risk.ruleConfig.step2')" />
                    <el-step :title="$t('message.risk.ruleConfig.step3')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <h3>{{ $t(`message.risk.ruleConfig.addRuleDesc${state.active * 2 + 1}`) }}</h3>
                <p style="margin-top: 10px;">{{ $t(`message.risk.ruleConfig.addRuleDesc${state.active * 2 + 2}`) }}</p>
                <el-form class="drawer-form" label-position="left" label-width="120px" ref="addRuleFormRef"
                    :model="state.addReq" :rules="addRules">
                    <!-- type, step1/3 -->
                    <el-row class="mb20" v-if="state.active === 0 || state.active === 2">
                        <el-form-item prop="name" :label="$t('message.risk.ruleConfig.templateName')">
                            <el-input v-model="state.addReq.name" :clearable="true" size="default"
                                :disabled="state.active === 2" style="width: 300px" />
                        </el-form-item>
                    </el-row>
                    <el-row class="mb20" v-if="state.active === 0 || state.active === 2">
                        <el-form-item prop="type" :label="$t('message.risk.ruleConfig.templateType')">
                            <el-select size="default" v-model="state.addReq.type" collapse-tags
                                popper-class="custom-header" :max-collapse-tags="1" style="width: 300px"
                                :disabled="state.active === 2 || !state.isAdd">
                                <el-option v-for="option in RiskTypeOptions" :key="option.value" :label="option.label"
                                    :value="option.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-row>
                    <!-- metaData, step2/3 -->
                    <template v-if="(state.active === 1 || state.active === 2)">
                        <template v-if="state.addReq.type !== 'weakpwd'">
                            <!-- plugin table -->
                            <el-row>
                                <el-table ref="tableRef"
                                    :data="state.plugins.slice(state.pageIdx - 1, state.pageIdx - 1 + state.pageSize) ?? []"
                                    :border="true" row-class-name="pointer-cursor" :expand-row-keys="state.expandKeys"
                                    row-key="iD">
                                    <el-table-column type="index" width="70" :label="$t('message.tableCommon.index')" />
                                    <el-table-column :label="$t(`message.risk.${state.addReq.type}.name`)"
                                        prop="name" />
                                    <el-table-column
                                        :label="$t(`message.risk.ruleConfig.${state.addReq.type}DetailTitle_type`)"
                                        prop="type">
                                        <template #default="prop">
                                            {{
                                            $t(`message.risk.ruleConfig.${state.addReq.type}DetailValue_${prop.row.type}`)
                                            }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t(`message.risk.ruleConfig.pluginLevel`)" prop="level">
                                        <template #default="prop">
                                            {{ $t(`message.tableCommon.level.${prop.row.level}`) }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="metaData" label="">
                                        <template #default="props">
                                            <el-button size="default" @click="handleExpand(props.row)" text
                                                type="primary" :icon="Edit"
                                                :disabled="Object.keys(props.row.metaData).length === 0"></el-button>
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="expand" class-name="col-expand" width="1">
                                        <template #default="props">
                                            <el-table size="default" :data="metaDataToList(props.row.metaData)"
                                                :border="true">
                                                <el-table-column label="name" prop="key"></el-table-column>
                                                <el-table-column label="value" prop="value">
                                                    <template #default="meta">
                                                        <el-input size="default" :disabled="state.active === 2"
                                                            v-model="props.row.metaData[meta.row.key]"></el-input>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t(`message.risk.ruleConfig.pluginEnable`)" prop="enable">
                                        <template #default="prop">
                                            <el-switch v-model="prop.row.enable" size="default" :active-value="1"
                                                :disabled="state.active === 2" :inactive-value="0"></el-switch>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-row>
                            <!-- pagination -->
                            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                                <div></div>
                                <el-pagination v-model:current-page="state.pageIdx" v-model:page-size="state.pageSize"
                                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                                    :total="state.plugins.length" @size-change="(val: number) => state.pageSize = val"
                                    @current-change="(val: number) => state.pageIdx = val" />
                            </el-row>
                        </template>
                        <template v-else>
                            <el-row justify="space-between" style="width: 100%;">
                                <div style="display: flex; align-items: center;">
                                    <span>{{ $t('message.risk.ruleConfig.detailWeakpwd') }}: </span>
                                    <el-tooltip class="box-item" effect="dark"
                                        :content="$t('message.risk.ruleConfig.detailWeakpwdTooltip')"
                                        placement="right-start">
                                        <el-icon style="margin-left: 5px;">
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </div>
                                <div></div>
                            </el-row>
                            <Codemirror v-for="plugin in state.plugins" v-model:value="plugin.metaData.password"
                                :options="state.cmOptions && {readOnly: state.active === 2}" border placeholder=""
                                :height="500" style="margin-top: 20px;" />
                        </template>
                    </template>
                </el-form>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">{{ $t('message.drawer.close')
                    }}</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">{{ $t('message.drawer.prev')
                    }}</el-button>
                <el-button @click="nextStep(addRuleFormRef)" type="primary"> {{ state.active < 2 ?
                        $t('message.drawer.next') : $t('message.drawer.confirm') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AddScanTmplReq, GetScanTmplReq, ListScanPluginReply, ListScanPluginReq, ListScanTmplReply_Details, UpdateScanTmplReq, pluginInfo } from '/@/api/grpc/ada';
import { FormInstance, FormRules } from 'element-plus';
import { Edit } from '@element-plus/icons-vue'
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { getRiskTypeOptions2 } from '../constant';
import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/lint.css";

const { t } = useI18n();

const RiskTypeOptions = getRiskTypeOptions2(t);

const addRuleFormRef = ref<FormInstance>();

const addRules = reactive<FormRules<AddScanTmplReq>>({
    name: [{ required: true, message: t('message.risk.ruleConfig.templateNameRequired'), trigger: 'blur', }],
    type: [{ required: true, message: t('message.risk.ruleConfig.templateTypeRequired'), trigger: 'blur', }],
});

const state = reactive({
    open: false,
    title: t('message.risk.ruleConfig.addRule'),
    active: 0,
    isAdd: true,
    addReq: {
        name: '',
        type: '',
        plugins: [],
    } as AddScanTmplReq,
    pluginReq: {
        type: '',
    } as ListScanPluginReq,
    expandKeys: [] as string[],

    plugins: [] as pluginInfo[],
    pageIdx: 1,
    pageSize: 10,
    cmOptions: {
        lineNumbers: true,
        mode: "htmlmixed", // Language mode
    },
    updateId: '',
    onClose: () => {},
});

const tableRef = ref();

const metaDataToList = (data: any) => {
    const l = Object.keys(data).map(key => ({
        key,
        value: data[key]
    }));
    return l
};

const handleExpand = (data: any) => {
    const found = state.expandKeys.findIndex(id => id === data.iD);
    if (-1 === found) {
        state.expandKeys = [...state.expandKeys, data.iD];
    } else {
        state.expandKeys = state.expandKeys.filter(id => id !== data.iD);
    }
    console.log(state.expandKeys);

    tableRef.value.toggleRowExpansion(data);
};

const listScanPlugin = (type: string): Promise<ListScanPluginReply> => {
    return api.listScanPlugin({ type })
    .then(resp => resp.response);
};

const open = (title: string, row: ListScanTmplReply_Details | null, onClose: () => void | null) => {
    state.open = true;
    state.title = title;
    state.active = 0;
    state.isAdd = (row === null ? true : false);
    state.updateId = '';
    state.addReq = {
        name: '',
        type: '',
        plugins: [],
    };
    state.onClose = onClose;

    if (!state.isAdd) {
        const req = {
            iD: row?.iD
        } as GetScanTmplReq;

        api.getScanTmpl(req)
        .then(resp => resp.response)
        .then(data => {
            state.plugins = data.plugins;
        })
        .catch(err => alertApiError(err));

        state.addReq.type = row?.type ?? '';
        state.addReq.name = row?.name ?? '';
        state.updateId = row?.iD ?? '';
    }
}

const nextStep = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    if (state.active === 2) {
        let ok = false;
        try {
            if (state.isAdd) {
                state.addReq.plugins = state.plugins;
                const resp = await api.addScanTmpl(state.addReq).then(resp => resp.response);
                ok = alertResult(resp.result, t('message.risk.ruleConfig.addSucc'), t('message.risk.ruleConfig.addFail'));
            } else {
                const req: UpdateScanTmplReq = {
                    iD: state.updateId,
                    name: state.addReq.name,
                    plugins: state.plugins
                };
                const resp = await api.updateScanTmpl(req).then(resp => resp.response);
                ok = alertResult(resp.result, t('message.risk.ruleConfig.updateSucc'), t('message.risk.ruleConfig.updateFail'));
            }
        } catch (err) {
            alertApiError(err);
        } finally {
            if (ok) {
                state.open = false;
                if (state.onClose) {
                    state.onClose();
                }
            }
        }
        return;
    }

    // input template name & type
    if (state.active === 0) {
        await formEl.validate((valid, fields) => {
            if (valid) {
                state.active++;

                // get plugin
                if (state.isAdd) {
                    listScanPlugin(state.addReq.type)
                    .then(data => {
                        state.plugins = data.plugins;
                    })
                    .catch(err => alertApiError(err));
                }
            } else {
                return;
            }
        });
    } else if (state.active < 3) {
        state.active++;
    }

};

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
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

.col-expand {
    overflow: hidden;
}

</style>
