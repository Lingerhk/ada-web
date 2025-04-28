<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-form :inline="true">
                <el-form-item>
                    <el-button type="primary" size="default" @click="onAddAccount">新建</el-button>
                </el-form-item>
                <el-form-item :label="T('role')">
                    <MultiSelector v-model:selected="state.filter.role" :options="option.role"></MultiSelector>
                </el-form-item>
                <el-form-item :label="T('mfa')">
                    <MultiSelector v-model:selected="state.filter.mfa" :options="option.mfa"></MultiSelector>
                </el-form-item>
                <el-form-item :label="T('passwordStrength')">
                    <MultiSelector v-model:selected="state.filter.passwordStrength" :options="option.passwordStrength">
                    </MultiSelector>
                </el-form-item>
                <el-form-item :label="T('createTm')">
                    <el-date-picker size="default" v-model="createTimeRange" type="datetimerange"
                        :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                        :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                </el-form-item>
                <el-form-item :label="T('pwdUpdateTm')">
                    <el-date-picker size="default" v-model="passTimeRange" type="datetimerange"
                        :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                        :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                </el-form-item>
            </el-form>
            <el-table :data="state.table.data" v-loading="state.table.loading" style="width: 100%">
                <el-table-column type="index" width="80px" />
                <el-table-column prop="username" :label="T('username')"></el-table-column>
                <el-table-column prop="role" :label="T('role')">
                    <template #default="prop">
                        {{ T(`role_${prop.row.role}`) }}
                    </template>
                </el-table-column>
                <el-table-column prop="hasMfa" :label="T('mfa')">
                    <template #default="prop">
                        {{ T(`mfa_${prop.row.hasMfa}`) }}
                    </template>
                </el-table-column>
                <el-table-column prop="passStrength" :label="T('passwordStrength')">
                    <template #default="prop">
                        <span :class="`password-strength-${prop.row.passStrength}`">{{
                            T(`passwordStrength_${prop.row.passStrength}`) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="email" :label="T('email')"></el-table-column>
                <el-table-column prop="mobile" :label="T('mobile')"></el-table-column>
                <el-table-column prop="createTm" :label="T('createTm')" :width="170">
                    <template #default="prop">
                        {{ formatApiTime(prop.row.createTm) }}
                    </template>
                </el-table-column>
                <el-table-column prop="pwdUpdateTm" :label="T('pwdUpdateTm')" :width="170">
                    <template #default="prop">
                        {{ formatApiTime(prop.row.pwdUpdateTm) }}
                    </template>
                </el-table-column>
                <el-table-column prop="remark" :label="T('remark')"></el-table-column>
                <el-table-column :label="T('operation')">
                    <template #default="scope">
                        <el-button :disabled="priv > scope.row.priv" size="large" text type="primary"
                            @click="onEditAccount(scope.row)">{{ T('modify')
                            }}</el-button>
                        <el-button :disabled="priv > scope.row.priv" size="large" text type="error"
                            @click="onDelete(scope.row)">{{ T('delete') }}</el-button>
                        <el-button :disabled="priv > scope.row.priv" size="large" text type="primary"
                            @click="onResetPass(scope.row)">{{ T('resetPass')
                            }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.filter.pageIdx" v-model:page-size="state.filter.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                    :total="state.data?.entries.length ?? 0" @size-change="(val: number) => state.filter.pageSize = val"
                    @current-change="(val: number) => state.filter.pageIdx = val" />
            </el-row>
        </el-card>
        <AddAccountDrawer ref="addAccountDrawerRef" />
        <EditAccountDrawer ref="editAccountDrawerRef" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { ListUserReq, ListUserReply_Details, ResetPasswordReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { ElMessage, ElMessageBox } from 'element-plus';
import { transAccount as T } from '/@/utils/translator';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { generateSecret } from '/@/utils/security';
import useClipboard from 'vue-clipboard3';
import { alertApiError, alertResult } from '/@/utils/error';
import { Local } from '/@/utils/storage';

const { t } = useI18n();
const { toClipboard } = useClipboard();

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));
const AddAccountDrawer = defineAsyncComponent(() => import('./addAccountDrawer.vue'));
const addAccountDrawerRef = ref();
const EditAccountDrawer = defineAsyncComponent(() => import('./editAccountDrawer.vue'));
const editAccountDrawerRef = ref();

const option = {
    role: ['mgr', 'dev', 'ops', 'sec'].map(r => ({ label: T(`role_${r}`), value: r })),
    mfa: ['enable', 'disable'].map(r => ({ label: T(`mfa_${r}`), value: r})),
    passwordStrength: ['high', 'middle', 'low'].map(r => ({ label: T(`passwordStrength_${r}`), value: r})),
};

const createTimeRange = ref([] as string[]);
const passTimeRange = ref([] as string[]);
const currentUser = ref(null);
const priv = ref(99);

const state = reactive({
    filter: {
        role: [] as string[],
        mfa: [] as string[],
        passwordStrength: [] as string[],
        createTm: [] as string[],
        passTm: [] as string[],
        pageIdx: 1,
        pageSize: 10,
    },
    total: 0,
    table: {
        loading: false,
        data: [] as ListUserReply_Details[],
    },
});

const onAddAccount = () => {
    addAccountDrawerRef.value.open(refreshUser);
};

const onEditAccount = (row) => {
    editAccountDrawerRef.value.open(row);
};

const onDelete = (row) => {
	ElMessageBox.confirm(t('message.accountPerson.deleteAccountPrompt', [row.username]), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
	}).then(() => {
        api.deleteUser({ username: row.username })
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, T('deleteAccountSucc'), T('deleteAccountFail'));
        })
        .catch(err => alertApiError(err))
        .finally(() => refreshUser());
    }).catch(err => {

    });
}

const onResetPass = (row) => {
	ElMessageBox.confirm(T('resetPasswordText'), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
	}).then(async () => {
        const newPassword = generateSecret();
        const username = row.username;

        const req: ResetPasswordReq = {
            username,
            newPassword,
        };

        const ok = api.resetPassword(req)
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
                    const ok = await toClipboard(newPassword).then(() => true).catch(err => {console.log(err); return false});
                    ElMessage({
                        message: ok ? T('copySucc', [username, newPassword]) : T('copyFail'),
                        type: ok ? 'success' : 'warning',
                    });
                }
                done();
            },
        }).catch(err => {

        });
	}).catch(err => {
        console.log(err);
    });
};

const refreshUser = () => {
    const req: ListUserReq = {
        pageIdx: state.filter.pageIdx,
        pageSize: state.filter.pageSize,
        search: '',
        isSelf: false,
        filterRole: state.filter.role,
        filterMfaStatus: state.filter.mfa, // 二次认证状态 开启enable|禁用disable|关闭stop
        filterPassStrength: state.filter.passwordStrength, // 密码强度 high/middle/low
        filterStartCreateTm: state.filter.createTm.length === 2 ? state.filter.createTm[0] : '', // 创建开始时间
        filterEndCreateTm: state.filter.createTm.length === 2 ? state.filter.createTm[1] : '', // 创建结束时间
        filterStartPassTm: state.filter.passTm.length === 2 ? state.filter.passTm[0] : '', // 密码最后修改开始时间
        filterEndPassTm: state.filter.passTm.length === 2 ? state.filter.passTm[1] : '', // 密码最后修改结束时间
        sort: -1, // 创建时间排序，1为升序，-1为降序| 密码修改时间 2为升序，-2为降序
    };

    state.table.loading = true;
    api.listUser(req)
    .then(response => response.response)
    .then(data => {
        state.table.data = data.list;
        state.total = data.page?.total ?? 0;
        console.log(data.list);
    })
    .catch(err => {
        alertApiError(err);
        // const msg = decodeURIComponent(err.message);
        // ElMessage.error(msg);
        // console.log(err.code, msg);
    })
    .finally(() => state.table.loading = false);
};

watch(() => state.filter, () => {
    console.log(state.filter);
    refreshUser();
}, { deep: true });

watch([createTimeRange, passTimeRange], () => {
    if (createTimeRange.value && createTimeRange.value.length === 2) {
        state.filter.createTm = [formatApiTime(createTimeRange.value[0]), formatApiTime(createTimeRange.value[1])];
    } else {
        state.filter.createTm = [];
    }

    if (passTimeRange.value && passTimeRange.value.length === 2) {
        state.filter.passTm = [formatApiTime(passTimeRange.value[0]), formatApiTime(passTimeRange.value[1])];
    } else {
        state.filter.passTm = [];
    }
});

onMounted(() => {
    refreshUser();

    const user = Local.get('user');
    priv.value = user['priv'] ?? 99;

    console.log(priv.value, user.priv, user);
});

</script>

<style>
@import '../style.css';
</style>