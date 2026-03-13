<template>
    <el-dialog v-model="model" :title="T('newTitle')" width="800px" @close="handleClose">
        <el-steps :active="state.step" align-center style="margin-bottom: 20px">
            <el-step :title="T('step1')" />
            <el-step :title="T('step2')" />
        </el-steps>

        <!-- Step 1: Basic Info Selection -->
        <div v-if="state.step === 0">
            <el-form ref="basicFormRef" :model="form" label-width="150px" label-position="left" :rules="basicRules">
                <el-form-item prop="moduleName">
                    <template #label>
                        <span class="form-item-label">{{ T('moduleName') }}</span>
                    </template>
                    <el-select v-model="form.moduleName" style="width: 100%" :placeholder="T('selectModuleName')">
                        <el-option v-for="option in ModuleOptions" :key="option.value" :label="option.label" :value="option.value" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="notifyType">
                    <template #label>
                        <span class="form-item-label">{{ T('notifyType') }}</span>
                    </template>
                    <el-select v-model="form.notifyType" style="width: 100%" :placeholder="T('selectNotifyType')">
                        <el-option v-for="option in NotifyOptions" :key="option.value" :label="option.label" :value="option.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <span class="form-item-label">{{ T('enable') }}</span>
                    </template>
                    <el-switch v-model="form.enable" active-value="enable" inactive-value="disable" />
                </el-form-item>
                <el-form-item prop="remark">
                    <template #label>
                        <span class="form-item-label">{{ T('remark') }}</span>
                    </template>
                    <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="T('remarkPlaceholder')" />
                </el-form-item>
                <el-form-item v-if="form.moduleName !== 'system'">
                    <template #label>
                        <span class="form-item-label">{{ T('rule') }}</span>
                    </template>
                    <LevelCheckbox v-model="form.level" text check-all />
                </el-form-item>
            </el-form>
            <el-alert v-if="form.notifyType" type="info" :title="T(`desc_${form.notifyType}`)" show-icon :closable="false" style="margin-top: 10px" />
        </div>

        <!-- Step 2: Configuration Details -->
        <div v-if="state.step === 1">
            <el-alert type="warning" :title="T(`templateAlert_${form.notifyType}`)" show-icon :closable="false" style="margin-bottom: 20px" />
            <EmailEditor v-if="form.notifyType === 'email'" v-model="form.metadata" :ro="false"
                :test-loading="testLoading" @test="testNotifyConf" ref="editorRef" />
            <SyslogEditor v-if="form.notifyType === 'syslog'" v-model="form.metadata" :ro="false"
                :test-loading="testLoading" :endpoint="form.endpoint" @test="testNotifyConf"
                ref="editorRef" />
            <Webhook v-if="form.notifyType === 'webhook'" v-model="form.metadata" :ro="false"
                :test-loading="testLoading" @test="testNotifyConf" ref="editorRef"
                :endpoint="form.endpoint" />
        </div>

        <template #footer>
            <div style="display: flex; justify-content: space-between;">
                <el-button v-if="state.step === 0" @click="model = false">{{ $t('message.drawer.close') }}</el-button>
                <el-button v-if="state.step !== 0" @click="prevStep">{{ $t('message.drawer.prev') }}</el-button>
                <el-button type="primary" @click="nextStep" :loading="state.loading">
                    {{ state.step < 1 ? $t('message.drawer.next') : $t('message.drawer.confirm') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import './style.scss';

import { reactive, ref, watch } from 'vue';
import { transNotify as T } from '/@/utils/translator';
import { AddNotifyConfReq, TestNotifyConfReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import LevelCheckbox from '/@/components/level/checkbox.vue';
import EmailEditor from './editor/emailEditor.vue';
import SyslogEditor from './editor/syslogEditor.vue';
import Webhook from './editor/webhook.vue';
import { alertApiError, alertResult } from '/@/utils/error';
import { getNotifyModuleOptions, getNotifyNotifyOptions } from '/@/utils/constant';
import { useI18n } from 'vue-i18n';
import { FormRules } from 'element-plus';

const { t } = useI18n();
const ModuleOptions = getNotifyModuleOptions(t);
const NotifyOptions = getNotifyNotifyOptions(t);

const model = defineModel({
    required: true,
    type: Boolean,
    default: false
});

const emit = defineEmits(['success']);

const state = reactive({
    step: 0,
    loading: false,
});

const form = ref<AddNotifyConfReq>({
    moduleName: '',
    notifyType: '',
    endpoint: '',
    enable: 'enable',
    level: [],
    metadata: {
        alert_interval: '20',
    },
    remark: '',
});

const basicFormRef = ref();
const editorRef = ref();
const testLoading = ref(false);

const basicRules = reactive<FormRules>({
    moduleName: [
        { required: true, message: T('selectModuleName'), trigger: 'change' },
    ],
    notifyType: [
        { required: true, message: T('selectNotifyType'), trigger: 'change' },
    ],
});

const handleClose = () => {
    state.step = 0;
    form.value = {
        moduleName: '',
        notifyType: '',
        endpoint: '',
        enable: 'enable',
        level: [],
        metadata: {
            alert_interval: '20',
        },
        remark: '',
    };
};

watch(() => model.value, (val) => {
    if (val) {
        handleClose();
    }
});

const testNotifyConf = () => {
    testLoading.value = true;

    const { endpoint, ...rest } = form.value.metadata;

    const req: TestNotifyConfReq = {
        moduleName: form.value.moduleName,
        notifyType: form.value.notifyType,
        endpoint,
        metadata: rest,
    };

    api.testNotifyConf(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, data.msg, data.msg);
    })
    .catch(err => alertApiError(err))
    .finally(() => testLoading.value = false);
};

const prevStep = () => {
    if (state.step > 0) {
        state.step--;
    }
};

const nextStep = async () => {
    if (state.step === 0) {
        // Validate basic form
        const valid = await basicFormRef.value.validate((v: boolean) => v);
        if (!valid) {
            return;
        }
        state.step++;
    } else if (state.step === 1) {
        // Validate editor form and submit
        const valid = await editorRef.value.validate();
        if (!valid) {
            return;
        }

        state.loading = true;
        const { endpoint, ...metadata } = form.value.metadata;
        const req: AddNotifyConfReq = {
            moduleName: form.value.moduleName,
            notifyType: form.value.notifyType,
            endpoint,
            enable: form.value.enable,
            level: form.value.level,
            metadata,
            remark: form.value.remark,
        };

        api.addNotifyConf(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, T('addNotifyConfSucc'), T('addNotifyConfFail'));
            if (data.result === 'success') {
                model.value = false;
                emit('success');
            }
        })
        .catch(err => alertApiError(err))
        .finally(() => state.loading = false);
    }
};
</script>
