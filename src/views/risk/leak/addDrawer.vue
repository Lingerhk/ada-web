<template>
    <el-drawer :size="1276" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <h3>{{ $t('message.risk.leak.addTitle') }}</h3>
        </template>
        <template #default>
            <!-- description -->
            <div style="padding: 20px;">
                <el-row class="desc-value">{{ $t('message.risk.leak.addDesc') }}</el-row>
                <el-form style="margin-top: 20px;">
                    <el-row :gutter="2">
                        <el-col :span="12" class="form-title">*{{ $t('message.tableCommon.domain') }}:</el-col>
                        <el-col :span="12" class="form-title">*{{ $t('message.risk.ruleConfig.templateName')
                            }}:</el-col>
                    </el-row>
                    <el-row v-for="(plan, index) in state.plans" :gutter="8">
                        <el-col :span="12" class="form-select">
                            <el-select size="default" v-model="state.plans[index][0]" style="width: 512px;">
                                <el-option v-for="opt in filterDomainOption(state.plans[index][0])" :label="opt.label" :value="opt.value" :key="opt.value" />
                            </el-select>
                        </el-col>
                        <el-col :span="12" class="form-select">
                            <el-select size="default" v-model="state.plans[index][1]" style="width: 512px;">
                                <el-option v-for="opt in state.tmplOptions" :label="opt.label" :value="opt.value" :key="opt.value" />
                            </el-select>
                        </el-col>
                    </el-row>
                </el-form>
                <el-row><el-button type="primary" size="default" @click="addDomain" :disabled="state.plans.length === state.domainOptions.length">{{ $t('message.risk.leak.addDomain') }}</el-button></el-row>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: right; padding: 20px;">
                <el-button @click="() => state.open = false">{{ $t('message.drawer.close')
                    }}</el-button>
                <el-button @click="submit" type="primary">{{ $t('message.drawer.confirm')
                    }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AddScanTaskReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { listDomainOptions, listLeakTmpl } from '/@/api/grpc/method';
import { OptionType } from '/@/utils/constant';

const { t } = useI18n();

const state = reactive({
    open: false,
    title: '',
    plans: [] as any[],
    domainOptions: [] as OptionType[],
    tmplOptions: [] as OptionType[],
});

const filterDomainOption = (model: string): OptionType[] => {

    return state.domainOptions.filter(opt => {
        if (opt.value === model) {
            return true;
        }

        return state.plans.findIndex(p => p[0] === opt.value) === -1
    });
}

const addDomain = () => {
    const filtered = state.domainOptions.filter(v => state.plans.findIndex(p => p[0] === v.value) === -1);
    if (filtered.length === 0) {
        return;
    }

    state.plans = [...state.plans, [filtered[0].value, state.tmplOptions[0].value]];
}

const submit = () => {
    // if (Object.keys(state.req.plans).length === 0) {
    if (state.plans.length === 0) {
        console.log("empty request");
        return;
    }

    let plans = {};
    state.plans.forEach(p => {
        plans[p[0]] = p[1];
    });

    const req: AddScanTaskReq = {
        type: 'leak',
        plans,
    };

    api.addScanTask(req)
    .then(resp => resp.response)
    .then(data => {
        const ok = alertResult(data.result, t('message.risk.leak.addSucc'), t('message.risk.leak.addFail'));
        if (ok) {
            state.open = false;
        }
    })
    .catch(err => alertApiError(err));
}

const open = async () => {
    state.open = true;
    state.domainOptions = await listDomainOptions();
    state.tmplOptions = (await listLeakTmpl()).map(t => ({
        value: t.iD,
        label: t.name,
    } as OptionType));

    state.plans = [[state.domainOptions[0].value, state.tmplOptions[0].value]];
    console.log(state.plans);
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

.form-title {
    font-size: 16px;
    font-weight: bold;
}

.form-select {
    padding-top: 10px;
    padding-bottom: 10px;
}

code {
    color: #739ab3;
    background-color: rgba(27,31,35,.05);
}

</style>
