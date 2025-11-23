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
        <el-form-item prop="server">
            <template #label>
                <span class="form-item-label">{{ T('emailServer') }}</span>
            </template>
            <template #default>
                <el-input v-model="model.server" style="width: 400px;" size="default" :disabled="props.ro" />
            </template>
        </el-form-item>
        <!-- server port -->
        <el-form-item prop="port">
            <template #label>
                <span class="form-item-label">{{ T('emailPort') }}</span>
            </template>
            <template #default>
                <el-input v-model="model.port" style="width: 400px;" size="default" :disabled="props.ro" />
            </template>
        </el-form-item>
        <!-- username -->
        <el-form-item prop="username">
            <template #label>
                <span class="form-item-label">{{ T('emailUsername') }}</span>
            </template>
            <template #default>
                <el-input v-model="model.username" style="width: 400px;" size="default" :disabled="props.ro" />
            </template>
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password">
            <template #label>
                <span class="form-item-label">{{ T('emailPassword') }}</span>
            </template>
            <template #default>
                <el-input v-model="model.password" style="width: 400px;" size="default" :disabled="props.ro"
                    show-password />
            </template>
        </el-form-item>
        <!-- receiver -->
        <el-form-item prop="receiver">
            <template #label>
                <span class="form-item-label">{{ T('emailReceiver') }}</span>
            </template>
            <template #default>
                <el-space size="small">
                    <el-input v-model="model.receiver" style="width: 400px;" size="default" :disabled="props.ro" />
                    <el-button v-if="!props.ro" type="primary" @click="handleTest" :loading="props.testLoading">{{
                        T('test') }}</el-button>
                </el-space>
            </template>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">

import '../style.scss';

import { reactive, ref } from 'vue';
import { EditorData } from '../constant';
import { FormRules } from 'element-plus';
import { transNotify as T } from '/@/utils/translator';
import { validateEmail, validateNumeric, validateURL } from '/@/utils/validator';

const model = defineModel({
    required: true,
    type: Object as () => EditorData,
    default: {},
});

const props = defineProps({
    ro: Boolean,
    testLoading: Boolean,
});

const emits = defineEmits(['test']);

interface RuleForm {
    alert_interval: string,
    server: string,
    port: string,
    username: string,
    password: string,
    receiver: string,
}

const formRef = ref();

const rules = reactive<FormRules<RuleForm>>({
    alert_interval: [
        { required: true, message: T('requireAlertInterval'), trigger: ['blur', 'change'] },
    ],
    server: [
        { required: true, message: T('requireEmailServer'), trigger: ['blur', 'change'] },
        { validator: validateURL, message: T('requireEmailServer'), trigger: 'blur' },
    ],
    port: [
        { required: true, message: T('requireEmailPort'), trigger: ['blur', 'change'] },
        { validator: validateNumeric, message: T('requireEmailPort'), trigger: 'blur' }
    ],
    username: [
        { required: true, message: T('requireEmailUsername'), trigger: ['blur', 'change'] }
    ],
    password: [
        { required: true, message: T('requireEmailPassword'), trigger: ['blur', 'change'] }
    ],
    receiver: [
        { required: true, message: T('requireEmailReceiver'), trigger: ['blur', 'change'] },
        { validator: validateEmail, message: T('requireEmailReceiver'), trigger: ['blur', 'change'] }
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