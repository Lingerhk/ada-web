<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-form :inline="true">
                <el-form-item>
                    <el-button type="primary" size="default" @click="onAddAccount">
                        <el-icon><Plus /></el-icon>
                        {{ T('new') }}
                    </el-button>
                </el-form-item>
                <el-form-item :label="T('role')">
                    <el-select v-model="state.filter.role" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="T('selectRole')" popper-class="custom-header">
                        <template #header>
                            <el-checkbox v-model="roleCheckAll" :indeterminate="roleIndeterminate" @change="handleRoleCheckAll">
                                {{ $t('message.tableCommon.checkAll') }}
                            </el-checkbox>
                        </template>
                        <el-option v-for="option in option.role" :key="option.value" :label="option.label" :value="option.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="T('mfa_short')">
                    <el-select v-model="state.filter.mfa" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="T('selectMfa')" popper-class="custom-header">
                        <template #header>
                            <el-checkbox v-model="mfaCheckAll" :indeterminate="mfaIndeterminate" @change="handleMfaCheckAll">
                                {{ $t('message.tableCommon.checkAll') }}
                            </el-checkbox>
                        </template>
                        <el-option v-for="opt in option.mfa" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="T('passwordStrength')">
                    <el-select v-model="state.filter.passwordStrength" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="T('selectPasswordStrength')" popper-class="custom-header">
                        <template #header>
                            <el-checkbox v-model="passwordStrengthCheckAll" :indeterminate="passwordStrengthIndeterminate" @change="handlePasswordStrengthCheckAll">
                                {{ $t('message.tableCommon.checkAll') }}
                            </el-checkbox>
                        </template>
                        <el-option v-for="opt in option.passwordStrength" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
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
                <el-table-column type="index" width="80px" :label="$t('message.tableCommon.index')" />
                <el-table-column prop="username" :label="T('username')"></el-table-column>
                <el-table-column prop="role" :label="T('role')" width="110">
                    <template #default="prop">
                        {{ T(`role_${prop.row.role}`) }}
                    </template>
                </el-table-column>
                <el-table-column prop="hasMfa" :label="T('mfa_short')" width="100" align="center">
                    <template #default="prop">
                        <el-tag :type="prop.row.hasMfa ? 'success' : 'info'" size="small">
                            {{ T('mfa_' + (prop.row.hasMfa ? 'enable' : 'disable')) }}
                        </el-tag>
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
                <el-table-column prop="activeTm" :label="T('activeTm')" :width="170">
                    <template #default="prop">
                        {{ prop.row.activeTm ? formatApiTime(prop.row.activeTm) : '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="T('operation')" width="210" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" @click="onViewAccount(scope.row)">{{ T('view') }}</el-button>
                        <el-button size="small" :disabled="priv > scope.row.priv" @click="onEditAccount(scope.row)">{{ T('edit') }}</el-button>
                        <el-button size="small" type="danger" :disabled="priv > scope.row.priv || currentUser === scope.row.username" @click="onDelete(scope.row)">{{ T('delete') }}</el-button>
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
        <ViewAccountDrawer ref="viewAccountDrawerRef" />
        <EditAccountDrawer ref="editAccountDrawerRef" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { ListUserReq, ListUserReply_Details } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { transAccount as T } from '/@/utils/translator';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { alertApiError, alertResult } from '/@/utils/error';
import { Local } from '/@/utils/storage';

const { t } = useI18n();

const AddAccountDrawer = defineAsyncComponent(() => import('./addAccountDrawer.vue'));
const addAccountDrawerRef = ref();
const ViewAccountDrawer = defineAsyncComponent(() => import('./viewAccountDrawer.vue'));
const viewAccountDrawerRef = ref();
const EditAccountDrawer = defineAsyncComponent(() => import('./editAccountDrawer.vue'));
const editAccountDrawerRef = ref();

// Checkbox states for "Check All"
const roleCheckAll = ref(false);
const roleIndeterminate = ref(false);
const mfaCheckAll = ref(false);
const mfaIndeterminate = ref(false);
const passwordStrengthCheckAll = ref(false);
const passwordStrengthIndeterminate = ref(false);

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

const onViewAccount = (row) => {
    viewAccountDrawerRef.value.open(row);
};

const onEditAccount = (row) => {
    editAccountDrawerRef.value.open(row, refreshUser);
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

// Handle role Select All
const handleRoleCheckAll = (val: boolean) => {
    roleIndeterminate.value = false;
    if (val) {
        state.filter.role = option.role.map(opt => opt.value);
    } else {
        state.filter.role = [];
    }
};

// Handle mfa Select All
const handleMfaCheckAll = (val: boolean) => {
    mfaIndeterminate.value = false;
    if (val) {
        state.filter.mfa = option.mfa.map(opt => opt.value);
    } else {
        state.filter.mfa = [];
    }
};

// Handle passwordStrength Select All
const handlePasswordStrengthCheckAll = (val: boolean) => {
    passwordStrengthIndeterminate.value = false;
    if (val) {
        state.filter.passwordStrength = option.passwordStrength.map(opt => opt.value);
    } else {
        state.filter.passwordStrength = [];
    }
};

// Watch individual filter properties
watch(() => state.filter.role, (val) => {
    roleIndeterminate.value = false;
    if (val.length === 0) {
        roleCheckAll.value = false;
    } else if (val.length === option.role.length) {
        roleCheckAll.value = true;
    } else {
        roleIndeterminate.value = true;
    }
    state.filter.pageIdx = 1;
    refreshUser();
});

watch(() => state.filter.mfa, (val) => {
    mfaIndeterminate.value = false;
    if (val.length === 0) {
        mfaCheckAll.value = false;
    } else if (val.length === option.mfa.length) {
        mfaCheckAll.value = true;
    } else {
        mfaIndeterminate.value = true;
    }
    state.filter.pageIdx = 1;
    refreshUser();
});

watch(() => state.filter.passwordStrength, (val) => {
    passwordStrengthIndeterminate.value = false;
    if (val.length === 0) {
        passwordStrengthCheckAll.value = false;
    } else if (val.length === option.passwordStrength.length) {
        passwordStrengthCheckAll.value = true;
    } else {
        passwordStrengthIndeterminate.value = true;
    }
    state.filter.pageIdx = 1;
    refreshUser();
});

watch(() => state.filter.pageIdx, () => {
    refreshUser();
});

watch(() => state.filter.pageSize, () => {
    refreshUser();
});

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
    refreshUser();
});

onMounted(() => {
    refreshUser();

    const user = Local.get('user');
    priv.value = user['priv'] ?? 99;
    currentUser.value = user['username'] ?? '';

    console.log(priv.value, user.priv, user);
});

</script>

<style>
@import '../style.css';
</style>
