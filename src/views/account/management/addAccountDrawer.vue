<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ $t('message.accountPerson.addAccountTitle') }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="$t('message.accountPerson.addAccountStep1')" />
                    <el-step :title="$t('message.accountPerson.addAccountStep2')" />
                    <el-step :title="$t('message.accountPerson.addAccountStep3')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <el-form v-if="state.active === 0" class="drawer-form" label-position="left" label-width="120px"
                    ref="formRef" :rules="rules" :model="state.data">
                    <h3>{{ $t('message.accountPerson.addAccountS1H1') }}</h3>
                    <p style="margin-top: 10px;">{{ $t('message.accountPerson.addAccountS1H2') }}</p>
                    <el-form-item style="margin-top: 10px;" prop="username">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.username') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.username" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item prop="password">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.password') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.password" size="middle" show-password></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item prop="confirmPass">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.confirmPass') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.confirmPass" size="middle" show-password></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item prop="mobile">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.mobile') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.mobile" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item prop="email">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.email') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.email" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.accountPerson.remark') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.remark" size="middle" type="textarea"></el-input>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active === 1" class="drawer-form" label-position="left" label-width="120px">
                    <h3>{{ $t('message.accountPerson.addAccountS2H1') }}</h3>
                    <p style="margin-top: 10px;">{{ $t('message.accountPerson.addAccountS2H2') }}</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.role') }}:</h4>
                        </template>
                        <template #default>
                            <el-select v-model="state.data.role" style="width: 240px">
                                <el-option v-for="item in role" :key="item.value" :value="item.value"
                                    :label="item.label"></el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active >= 2" class="drawer-form" label-position="left" label-width="120px">
                    <h3>{{ $t('message.accountPerson.addAccountS3H1') }}</h3>
                    <p style="margin-top: 10px;">{{ $t('message.accountPerson.addAccountS3H2') }}</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>{{ $t('message.accountPerson.username') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.username }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.accountPerson.role') }}:</h4>
                        </template>
                        <template #default>
                            {{ $t(`message.accountPerson.role_${state.data.role}`) }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.accountPerson.mobile') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.mobile }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.accountPerson.email') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.email }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.accountPerson.remark') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.remark }}
                        </template>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">关闭</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">上一步</el-button>
                <el-button @click="nextStep" type="primary"> {{ state.active < 2 ? "下一步" : "确定" }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { FormInstance, FormRules } from 'element-plus';
import { AddUserReq, UserExistsReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { useI18n } from 'vue-i18n';
import { validateEmail } from '/@/utils/validator';
import { alertApiError, alertResult } from '/@/utils/error';

const { t } = useI18n();

const initData = {
    // step 1
    username: '',
    password: '',
    confirmPass: '',
    mobile: '',
    email: '',
    remark: '',
    // step 2
    role: 'dev',
};

const state = reactive({
    open: false,
    title: '创建子账户',
    data: initData,
    active: 0,
    onClose: () => {},
})

const formRef = ref<FormInstance>();
const rules = reactive<FormRules<typeof initData>>({
    username: [
        { required: true, message: t('message.accountPerson.requireUsername'), trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                api.userExists({ username: value } as UserExistsReq)
                .then(resp => resp.response.result)
                .then(result => {
                    if (result) {
                        callback(new Error(t('message.accountPerson.userExists')));
                    } else {
                        callback();
                    }

                })
                .catch(err => {
                    callback(new Error(t('message.api.alertMessage')));
                    console.error(err)
                });
            },
            trigger: 'blur'
        }
    ],
    password: [{ required: true, message: t('message.accountPerson.requirePassword'), trigger: 'blur' },],
    confirmPass: [
        { required: true, message: t('message.accountPerson.requireConfirmPassword'), trigger: 'blur' },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value !== state.data.password) {
                    callback(new Error(t('message.accountPerson.mismatchPassword')));
                } else {
                    callback();
                }
            },
            trigger: 'blur',
        }
    ],
    mobile: [{ required: true, message: t('message.accountPerson.requireMobile'), trigger: 'blur', }],
    email: [{ required: true, validator: validateEmail, message: t('message.accountPerson.requireEmail'), trigger: 'blur', }],
});

const role = [
    { label: t('message.accountPerson.role_mgr'), value: 'mgr' },
    { label: t('message.accountPerson.role_dev'), value: 'dev' },
    { label: t('message.accountPerson.role_ops'), value: 'ops' },
    { label: t('message.accountPerson.role_sec'), value: 'sec' },
];

const open = (onClose: () => void = () => {}) => {
    state.open = true;
    state.active = 0;
    state.data = { ...initData };
    state.onClose = onClose;
    formRef.value?.clearValidate();
}

const nextStep = async () => {
    if (state.active === 0) {
        const ok = await formRef.value?.validate(valid => valid);
        if (!ok) {
            return;
        }
    }

    state.active++;
    if (state.active == 3) {
        api.addUser({
            username: state.data.username,
            password: state.data.password,
            role: state.data.role,
            mobile: state.data.mobile,
            email: state.data.email,
            remark: '',
            address: '', // 所在地
            realName: '',// 真实姓名
            department: '', // 部门
            post: '', // 岗位
        } as AddUserReq)
        .then(resp => resp.response)
        .then(result => {
            const ok = alertResult(result.result, t('message.accountPerson.addUserSucc'), t('message.accountPerson.addUserFail'));
            if (ok) {
                state.open = false;
                state.onClose();
            }
        })
        .catch(err => alertApiError(err));
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

</style>