<template>
    <div class="layout-pd">
        <el-card class="account-workbench" shadow="hover">
            <div class="table-toolbar">
                <div class="table-toolbar__actions">
                    <el-button type="primary" size="default" @click="onAddAccount">
                        <el-icon><Plus /></el-icon>
                        {{ T('new') }}
                    </el-button>
                </div>
                <el-form class="table-toolbar__filters account-filter-form" :inline="true">
                    <el-form-item :label="T('role')">
                        <el-select v-model="state.filter.role" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" :placeholder="T('selectRole')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="roleCheckAll" :indeterminate="roleIndeterminate" @change="handleRoleCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in option.role" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="T('mfa_short')">
                        <el-select v-model="state.filter.mfa" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" :placeholder="T('selectMfa')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="mfaCheckAll" :indeterminate="mfaIndeterminate" @change="handleMfaCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="opt in option.mfa" :key="opt.value" :label="opt.label" :value="opt.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="T('passwordStrength')">
                        <el-select v-model="state.filter.passwordStrength" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" :placeholder="T('selectPasswordStrength')" popper-class="custom-header">
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
            </div>
            <el-table class="workbench-table" :data="state.table.data" v-loading="state.table.loading" stripe style="width: 100%">
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
                        <el-button size="small" plain @click="onViewAccount(scope.row)">{{ T('view') }}</el-button>
                        <el-button size="small" plain :disabled="priv > scope.row.priv" @click="onEditAccount(scope.row)">{{ T('edit') }}</el-button>
                        <el-button size="small" type="danger" :disabled="priv > scope.row.priv || currentUser === scope.row.username" @click="onDelete(scope.row)">{{ T('delete') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-row class="workbench-pagination" justify="end">
                <el-pagination v-model:current-page="state.filter.pageIdx" v-model:page-size="state.filter.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                    :total="state.total" @size-change="(val: number) => state.filter.pageSize = val"
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
        filterMfaStatus: state.filter.mfa, // MFA status: enable|disable|stop
        filterPassStrength: state.filter.passwordStrength, // Password strength: high/middle/low
        filterStartCreateTm: state.filter.createTm.length === 2 ? state.filter.createTm[0] : '', // Creation start time
        filterEndCreateTm: state.filter.createTm.length === 2 ? state.filter.createTm[1] : '', // Creation end time
        filterStartPassTm: state.filter.passTm.length === 2 ? state.filter.passTm[0] : '', // Password update start time
        filterEndPassTm: state.filter.passTm.length === 2 ? state.filter.passTm[1] : '', // Password update end time
        sort: -1, // Sort by creation time (`1` asc, `-1` desc) or password update time (`2` asc, `-2` desc)
    };

    state.table.loading = true;
    api.listUser(req)
    .then(response => response.response)
    .then(data => {
        state.table.data = data.list;
        state.total = data.page?.total ?? 0;
    })
    .catch(err => {
        alertApiError(err);
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
});

</script>

<style>
@import '../style.css';

.account-workbench {
    min-height: 520px;
}

.account-workbench .table-toolbar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 0 0 14px;
    border-bottom: 1px solid #edf3f1;
    margin-bottom: 14px;
}

.account-workbench .table-toolbar__actions {
    flex: none;
}

.account-workbench .table-toolbar__filters {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: flex-start;
    padding-bottom: 0 !important;
    border-bottom: 0 !important;
    margin-bottom: 0 !important;
}

.account-workbench .table-toolbar__filters .el-form-item,
.account-workbench .table-toolbar__filters .el-form-item:last-of-type {
    margin: 0 !important;
}

.account-workbench .account-filter-form .el-form-item__label {
    height: var(--el-component-size);
    line-height: var(--el-component-size);
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    white-space: nowrap;
    background: #f0f6f4 !important;
    border: 1px solid #dbe8e5 !important;
    border-right: 0 !important;
    border-radius: 6px 0 0 6px;
    color: var(--ada-text);
    font-weight: 700;
}

.account-workbench .account-filter-form .el-form-item__content {
    min-height: var(--el-component-size);
    align-items: flex-start;
}

.account-workbench .account-filter-form .el-input,
.account-workbench .account-filter-form .el-select,
.account-workbench .account-filter-form .el-date-editor {
    vertical-align: top;
}

.account-workbench .account-filter-form .el-input__wrapper,
.account-workbench .account-filter-form .el-select__wrapper,
.account-workbench .account-filter-form .el-date-editor {
    min-height: var(--el-component-size);
    border-radius: 6px;
}

.account-workbench .account-filter-form .el-form-item__label + .el-form-item__content .el-input__wrapper,
.account-workbench .account-filter-form .el-form-item__label + .el-form-item__content .el-select__wrapper,
.account-workbench .account-filter-form .el-form-item__label + .el-form-item__content .el-date-editor {
    border-radius: 0 6px 6px 0;
}

.account-workbench .table-toolbar__filters .el-select {
    width: 184px;
}

.account-workbench .table-toolbar__filters .el-date-editor {
    width: 300px;
}

.account-workbench .workbench-table {
    border: 1px solid #edf3f1;
    border-radius: 8px;
}

.account-workbench .workbench-pagination {
    padding: 16px 2px 0;
}

@media (max-width: 960px) {
    .account-workbench .table-toolbar {
        flex-direction: column;
    }

    .account-workbench .table-toolbar__filters .el-select,
    .account-workbench .table-toolbar__filters .el-date-editor {
        width: 100%;
    }

    .account-workbench .table-toolbar__filters .el-form-item {
        width: 100%;
    }
}
</style>
