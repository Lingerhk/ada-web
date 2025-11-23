<template>
    <el-form ref="formRef" :model="model" label-width="150px" label-position="left" :rules="rules">
        <!-- interval -->
        <el-form-item prop="alert_interval">
            <template #label>
                <span class="form-item-label">{{ T('alertInterval') }}</span>
            </template>
            <template #default>
                <div class="alert-interval-container">
                    <div class="alert-interval-hint">
                        <el-tag type="danger" size="small">{{ T('alertIntervalCritical') }}</el-tag>
                        <el-tag type="warning" size="small">{{ T('alertIntervalHigh') }}</el-tag>
                        <span class="hint-text">{{ T('alertIntervalRealtime') }}</span>
                    </div>
                    <div class="alert-interval-input">
                        <el-tag type="info" size="small">{{ T('alertIntervalMedium') }}</el-tag>
                        <el-tag size="small">{{ T('alertIntervalLow') }}</el-tag>
                        <el-input-number v-model="model.alert_interval" :width="100"
                            size="default" :disabled="props.ro" :min="1" />
                        <span class="hint-text">{{ T('alertIntervalUnit') }}</span>
                    </div>
                </div>
            </template>
        </el-form-item>
        <!-- server ip -->
        <el-form-item prop="endpoint" :status-icon="false">
            <template #label>
                <span class="form-item-label">{{ T('endpoint') }}</span>
            </template>
            <template #default>
                <el-space size="small">
                    <el-input v-model="epData.data2" style="width: 400px;" size="default" :disabled="props.ro"
                        :clearable="false">
                        <template #prepend>
                            <el-select class="prepend-select" v-model="epData.data1" style="width: 115px" :disabled="props.ro"
                                :clearable="false">
                                <el-option label="udp://" value="udp://" />
                                <el-option label="tcp://" value="tcp://" />
                            </el-select>
                        </template>
                    </el-input>
                    <el-button v-if="!props.ro" type="primary" @click="handleTest" :loading="props.testLoading">{{
    T('test') }}</el-button>
                </el-space>
            </template>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">

import '../style.scss';

import { reactive, ref, watch, watchEffect } from 'vue';
import { EditorData } from '../constant';
import { FormRules } from 'element-plus';
import { transNotify as T } from '/@/utils/translator';
import { validateURL } from '/@/utils/validator';

const model = defineModel({
    required: true,
    type: Object as () => EditorData,
    default: {},
});

const props = defineProps({
    ro: Boolean,
    testLoading: Boolean,
    endpoint: String,
});

const epData = reactive({
    data1: '',
    data2: '',
});

const initProto = () => {
    const endpoint = props.endpoint ?? '';
    epData.data1 = !endpoint ? 'udp://' : endpoint.startsWith('tcp://') ? 'tcp://' : 'udp://';
    epData.data2 = !endpoint ? '' : endpoint.split('://')[1];
};

watchEffect(initProto);
watch(() => props.endpoint, initProto);
watch(() => epData, (val) => {
    model.value.endpoint = epData.data1 + epData.data2;
}, { deep: true });

const emits = defineEmits(['test']);

interface RuleForm {
    alert_interval: string,
    endpoint: string,
}

const formRef = ref();

const validateEndpoint = (rule, value, callback) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    if (value === '' || urlPattern.test(epData.data2)) {
        callback();
    } else {
        callback(new Error('Please enter a valid URL'));
    }
};

const rules = reactive<FormRules<RuleForm>>({
    alert_interval: [
        { required: true, message: T('requireAlertInterval'), trigger: ['blur', 'change'] },
    ],
    endpoint: [
        { required: true, validator: validateEndpoint, message: T('requireEndpoint'), trigger: 'change' },
    ],
});

const validate = async () => {
    if (!formRef.value) {
        return false;
    }

    const valid = await formRef.value.validate(v => v);
    return valid;
};

const handleTest = async () => {
    const valid = await validate();
    if (!valid) {
        return;
    }

    emits('test');
};

defineExpose({
    validate,
});

</script>

<style>
.el-step__icon-inner {
    font-size: 18px !important;
}
</style>

<style lang="scss" >
.prepend-select {
    .el-input__validateIcon {
        display: none !important;
    }
}
</style>