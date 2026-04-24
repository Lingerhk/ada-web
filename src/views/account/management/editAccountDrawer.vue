<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ T('editAccountTitle') }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="T('editAccountStep1')" />
                    <el-step :title="T('editAccountStep2')" />
                    <el-step :title="T('editAccountStep3')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <el-form v-if="state.active === 0" class="drawer-form" label-position="left" label-width="120px">
                    <h3>{{ T('editAccountS1H1') }}</h3>
                    <p style="margin-top: 10px;">{{ T('editAccountS1H2') }}</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>{{ T('username') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.username" size="default" disabled></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('mobile') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.mobile" size="default"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('email') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.email" size="default"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('department') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.department" size="default"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('remark') }}:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.remark" size="default" type="textarea"></el-input>
                        </template>
                    </el-form-item>
                    <el-divider />
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('resetPass') }}:</h4>
                        </template>
                        <template #default>
                            <el-button type="warning" @click="handleResetPassword">{{ T('resetPass') }}</el-button>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active === 1" class="drawer-form" label-position="left" label-width="120px">
                    <h3>{{ T('editAccountS2H1') }}</h3>
                    <p style="margin-top: 10px;">{{ T('editAccountS2H2') }}</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>{{ T('userRole') }}:</h4>
                        </template>
                        <template #default>
                            <el-select v-model="state.data.role" style="width: 240px">
                                <el-option v-for="item in role" :key="item.value" :value="item.value" :label="T('role_' + item.value)"></el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active >= 2" class="drawer-form" label-position="left" label-width="120px">
                    <h3>{{ T('editAccountS3H1') }}</h3>
                    <p style="margin-top: 10px;">{{ T('editAccountS3H2') }}</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>{{ T('username') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.username }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('userRole') }}:</h4>
                        </template>
                        <template #default>
                            {{ T('role_' + state.data.role) }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('mobile') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.mobile }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('email') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.email }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('department') }}:</h4>
                        </template>
                        <template #default>
                            {{ state.data.department }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ T('remark') }}:</h4>
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
                <el-button v-if="state.active === 0" @click="state.open = false">{{ T('close') }}</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">{{ T('prevStep') }}</el-button>
                <el-button @click="nextStep" type="primary">{{ state.active < 2 ? T('nextStep') : T('confirm') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import { ListUserReply_Details, UpdateUserReq, ResetPasswordReq } from '/@/api/grpc/ada';
import { transAccount as T } from '/@/utils/translator';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { generateSecret } from '/@/utils/security';
import useClipboard from 'vue-clipboard3';

const { toClipboard } = useClipboard();

const initData = {
    // step 1
    username: '',
    mobile: '',
    email: '',
    remark: '',
    department: '',
    // step 2
    role: '',
};

const role = [
    { value: 'mgr' },
    { value: 'dev' },
    { value: 'ops' },
    { value: 'sec' },
];

const state = reactive({
    open: false,
    data: initData,
    active: 0,
    onClose: () => {},
})

const open = (row: ListUserReply_Details, onClose?: () => void) => {
    state.open = true;
    state.active = 0;
    state.onClose = onClose || (() => {});
    state.data = {
        // step 1
        username: row.username,
        mobile: row.mobile,
        email: row.email,
        remark: row.remark,
        department: row.department,
        // step 2
        role: row.role,
    };
}

const handleResetPassword = async () => {
    ElMessageBox.confirm(T('resetPasswordText'), T('warning'), {
        confirmButtonText: T('confirm'),
        cancelButtonText: T('cancel'),
        type: 'warning',
    }).then(async () => {
        const newPassword = generateSecret();
        const username = state.data.username;

        const req: ResetPasswordReq = {
            username,
            newPassword,
        };

        const ok = await api.resetPassword(req)
            .then(resp => resp.response)
            .then(data => {
                return alertResult(data.result, T('resetPasswordSucc'), T('resetPasswordFail'));
            })
            .catch(err => {
                alertApiError(err);
                return false;
            });

        if (!ok) {
            return;
        }

        ElMessageBox.alert(T('resetPasswordAlert', [newPassword]), T('resetPasswordPrompt'), {
            dangerouslyUseHTMLString: true,
            confirmButtonText: T('copyPassword'),
            center: true,
            beforeClose: async (action, instance, done) => {
                if (action === 'confirm') {
                    const copyOk = await toClipboard(newPassword).then(() => true).catch(() => false);
                    ElMessage({
                        message: copyOk ? T('copySucc', [username, newPassword]) : T('copyFail'),
                        type: copyOk ? 'success' : 'warning',
                    });
                }
                done();
            },
        }).catch(() => {});
    }).catch(() => {});
};

const nextStep = () => {
    state.active++;
    if (state.active == 3) {
        // Call update user API
        const req: UpdateUserReq = {
            username: state.data.username,
            mobile: state.data.mobile,
            email: state.data.email,
            remark: state.data.remark,
            department: state.data.department,
            role: state.data.role,
        };

        api.updateUser(req)
            .then(resp => resp.response)
            .then(data => {
                const ok = alertResult(data.result, T('saveSucc'), T('saveFail'));
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
