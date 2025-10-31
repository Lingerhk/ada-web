<template>
    <el-dialog v-model="visible" @close="close" style="width:700px;" :close-on-click-modal="false"
        :close-on-press-escape="false" destroy-on-close>
        <template #header>
            <span style="color:burlywood; font-weight: bold; font-size: 18px; padding: 0px 20px;">{{
                $t('message.accountPerson.changePasswordTitle') }}</span>
            <span style="font-size: 14px;">{{ $t('message.accountPerson.changePasswordSubTitle') }}</span>
        </template>
        <template #default>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="150px" label-position="left" size="default"
                style="width: 100%;" status-icon>
                <el-form-item :label="$t('message.accountPerson.changePasswordOldPlaceholder')" prop="oldPassword">
                    <el-input v-model="form.oldPassword" show-password />
                </el-form-item>
                <el-form-item :label="$t('message.accountPerson.changePasswordNewPlaceholder')" prop="newPassword">
                    <el-input v-model="form.newPassword" show-password />
                </el-form-item>
                <el-form-item :label="$t('message.accountPerson.changePasswordNew2Placeholder')" prop="checkNewPassword">
                    <el-input v-model="form.checkNewPassword" show-password />
                </el-form-item>
            </el-form>
        </template>
        <template #footer>
            <el-button @click="cancel">{{ $t('message.accountPerson.cancel') }}</el-button>
            <el-button type="primary" @click="confirm(formRef)">{{ $t('message.accountPerson.confirm') }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { Local } from '/@/utils/storage';
import { UpdateUserPasswordReq } from '/@/api/grpc/ada';
import { useI18n } from 'vue-i18n';
import { FormInstance, FormRules } from 'element-plus';
import { alertApiError, alertResult } from '/@/utils/error';
import api from '/@/api/grpc';

const { t } = useI18n();

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    modelValue: Boolean,
});

const visible = ref(props.modelValue);

watchEffect(() => {
    visible.value = props.modelValue;
});

const form = reactive({
    oldPassword: '',
    newPassword: '',
    checkNewPassword: '',
});

const formRef = ref<FormInstance>();

const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value !== form.newPassword) {
        callback(new Error(t('message.accountPerson.mismatchNewPassword')));
    } else {
        callback();
    }
};

const rules = reactive<FormRules<typeof form>>({
    oldPassword: [{required: true, message: t('message.accountPerson.requirePassowrd'), trigger: 'blur'}],
    newPassword: [{required: true, message: t('message.accountPerson.requirePassowrd'), trigger: 'blur'}],
    checkNewPassword: [
        { required: true, message: t('message.accountPerson.requirePassowrd'), trigger: 'blur' },
        { validator: validatePass2, trigger: 'blur' },
    ],
});

const close = () => {
    Local.remove('needChangePassword');

    emit('update:modelValue', false)
};

const cancel = () => {
    visible.value = false;
};

const confirm = async (formEl: FormInstance) => {
    const valid = await formEl.validate(v => v);
    if (!valid) {
        return;
    }

    const req: UpdateUserPasswordReq = {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        username: Local.get('userName'),
    };

    try {
        const data = await api.updateUserPassword(req).then(resp => resp.response);
        const ok = alertResult(data.result, t('message.accountPerson.changePasswordSucc'), t('message.accountPerson.changePasswordFail'));
        if (ok) {
            cancel();
        }
    } catch (err) {
        alertApiError(err);
    }
};

</script>

<style>
</style>
