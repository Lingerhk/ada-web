<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="$t('message.threat.sensitive.addEntryStep1')" />
                    <el-step :title="$t('message.threat.sensitive.addEntryStep2')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <el-form class="drawer-form" label-position="left" label-width="120px" ref="ruleFormRef" :rules="rules"
                    :model="state.data">
                    <h3>{{ $t('message.threat.sensitive.addEntryDesc1') }}</h3>
                    <p style="margin-top: 10px;">{{ $t('message.threat.sensitive.addEntryDesc2') }}</p>
                    <el-form-item style="margin-top: 10px;" prop="type">
                        <template #label>
                            <h4>* {{ $t(`message.threat.sensitive.type`) }}:</h4>
                        </template>
                        <template #default>
                            <el-select v-if="state.active === 0" size="default" v-model="state.data.type">
                                <el-option v-for="o in typeOptions" :key="o.value" :value="o.value"
                                    :label="$t(o.label)"></el-option>
                            </el-select>
                            <span v-if="state.active !== 0">{{ $t(`message.threat.sensitive.${state.data.type}`)
                                }}</span>
                        </template>
                    </el-form-item>
                    <el-form-item style="margin-top: 10px;" prop="name">
                        <template #label>
                            <h4>{{ $t(`message.threat.sensitive.name`) }}:</h4>
                        </template>
                        <template #default>
                            <!-- <el-input v-if="state.active === 0" v-model="state.data.name" size="default"></el-input> -->
                            <el-autocomplete v-if="state.active === 0" v-model="state.data.name" size="default"
                                :fetch-suggestions="querySearch" style="width: 100%;"></el-autocomplete>
                            <span v-else>{{ state.data.name }}</span>
                        </template>
                    </el-form-item>
                    <el-form-item style="margin-top: 10px;" prop="domain">
                        <template #label>
                            <h4>{{ $t(`message.advancedSearch.domain`) }}:</h4>
                        </template>
                        <template #default>
                            <el-select v-if="state.active === 0" v-model="state.data.domain" size="default">
                                <el-option v-for="o in state.domainOptions" :key="o.value" :value="o.value"
                                    :label="$t(o.label)"></el-option>
                            </el-select>
                            <span v-if="state.active !== 0">{{ state.data.domain }}</span>
                        </template>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">{{ $t('message.tableCommon.close')
                    }}</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">{{
                    $t('message.tableCommon.prevStep') }}</el-button>
                <el-button @click="nextStep(ruleFormRef)" type="primary"> {{ state.active < 1 ?
                        $t('message.tableCommon.nextStep') : $t('message.tableCommon.complete') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AddSensitiveEntryReply, AddSensitiveEntryReq, ListDomainEntryReq } from '/@/api/grpc/ada';
import { typeOptions } from './constant';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';

const { t } = useI18n();

const ruleFormRef = ref<FormInstance>();

const rules = reactive<FormRules<AddSensitiveEntryReq>>({
    domain: [{ required: true, message: t('message.threat.sensitive.addRuleDomainRequired'), trigger: 'blur' }],
    name: [{ required: true, message: t('message.threat.sensitive.addRuleNameRequired'), trigger: 'change', }],
});

const state = reactive({
    open: false,
    title: t('message.threat.sensitive.addEntry'),
    data: {
        type: '',
        domain: '',
        name: '',
    } as AddSensitiveEntryReq,
    active: 0,
    domainOptions: [] as OptionType[],
    onClose: () => {},
});

const open = (type: string, onClose: () => void) => {
    state.open = true;
    state.active = 0;
    state.data.type = type;
    state.data.domain = '';
    state.data.name = '';
    state.onClose = onClose;

    listDomainOptions().then(o => {
        state.domainOptions = o;
        if (o.length > 0) {
            state.data.domain = o[0].value;
        }
    });
}

const doAddSensitiveEntry = () => {

    console.log('addSensitiveEntry', state.data);

    api.addSensitiveEntry(state.data)
    .then(resp => resp.response)
    .then((data: AddSensitiveEntryReply) => {
        if (data.result === 'success') {
            ElMessage.success(t('message.threat.sensitive.addSucc'));
            state.open = false;
            state.onClose();
        } else {
            ElMessage.warning(t('message.threat.sensitive.addFail'))
        }
    })
    .catch(err => alertApiError(err));
};

const querySearch = (queryString: string, cb: any) => {
    // fetch names from server
    const req: ListDomainEntryReq = {
        type: state.data.type,
        domain: state.data.domain,
        search: queryString,
    };

    console.log('listDomainEntry request', req);
    api.listDomainEntry(req)
    .then(resp => resp.response)
    .then(data => {
        const suggestions = data.entries.map(value => ({ value }));
        cb(suggestions);
    })
    .catch(err => {
        // alertApiError(err);
        cb([]);
    });
}

const nextStep = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    if (state.active === 0) {
        await formEl.validate((valid, fields) => {
            if (valid) {
                state.active++;
            } else {
                console.log('error submit!', fields);
            }
        });
    } else {
        state.active++;
    }

    if (state.active == 2) {
        doAddSensitiveEntry();
    }
};

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
}

watch(() => state.data.domain, () => {
    state.data.name = '';
});

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

</style>
