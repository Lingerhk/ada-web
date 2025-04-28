<template>
    <el-form ref="formRef" :model="model" label-width="150px" label-position="left" :rules="rules">
        <!-- interval -->
        <el-form-item prop="alert_interval">
            <template #label>
                <span class="form-item-label">{{ T('alertInterval') }}</span>
            </template>
            <template #default>
                <span>{{ T('alertIntervalHint') }}</span><el-input-number v-model="model.alert_interval" :width="100"
                    size="default" :disabled="props.ro" :min="0" />
            </template>
        </el-form-item>
        <!-- server ip -->
        <el-form-item prop="endpoint" :status-icon="false">
            <template #label>
                <span class="form-item-label">{{ T('endpoint') }}</span>
            </template>
            <template #default>
                <el-space size="small">
                    <el-input v-model="model.endpoint" style="width: 400px;" size="default" :disabled="props.ro"
                        :clearable="false">
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
import { EditorData, parseWebhookType } from '../constant';
import { FormRules } from 'element-plus';
import { transOutgoing as T } from '/@/utils/translator';
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

const initEp = () => {
    model.value.endpoint = props.endpoint ?? '';
};

watch(() => model.value.endpoint, (v) => {
    const type = parseWebhookType(v);
    model.value.application_type = type;
});

watchEffect(initEp);
watch(() => props.endpoint, initEp);

const emits = defineEmits(['test']);

interface RuleForm {
    alert_interval: string,
    endpoint: string,
}

const formRef = ref();

const rules = reactive<FormRules<RuleForm>>({
    alert_interval: [
        { required: true, message: T('requireAlertInterval'), trigger: ['blur', 'change'] },
    ],
    endpoint: [
        { required: true, validator: validateURL, message: T('requireEndpoint'), trigger: 'change' },
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
