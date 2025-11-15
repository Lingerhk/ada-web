<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ T('viewAccountTitle') }}</h3>
        </template>
        <template #default>
            <el-descriptions :column="1" border>
                <el-descriptions-item :label="T('username')">
                    {{ state.data.username }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('role')">
                    {{ T('role_' + state.data.role) }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('mobile')">
                    {{ state.data.mobile || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('email')">
                    {{ state.data.email || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('department')">
                    {{ state.data.department || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('remark')">
                    {{ state.data.remark || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('mfa')">
                    <el-tag :type="state.data.hasMfa ? 'success' : 'info'" size="small">
                        {{ T('mfa_' + (state.data.hasMfa ? 'enable' : 'disable')) }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="T('passwordStrength')">
                    <el-tag :type="getPasswordStrengthType(state.data.passStrength)" size="small">
                        {{ T('passwordStrength_' + state.data.passStrength) }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="T('createTm')">
                    {{ formatApiTime(state.data.createTm) }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('pwdUpdateTm')">
                    {{ formatApiTime(state.data.pwdUpdateTm) }}
                </el-descriptions-item>
                <el-descriptions-item :label="T('updateTm')">
                    {{ formatApiTime(state.data.updateTm) }}
                </el-descriptions-item>
            </el-descriptions>
        </template>
        <template #footer>
            <div style="padding: 20px;">
                <el-button @click="state.open = false">{{ T('close') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ListUserReply_Details } from '/@/api/grpc/ada';
import { transAccount as T } from '/@/utils/translator';
import { formatApiTime } from '/@/utils/formatTime';

const state = reactive({
    open: false,
    data: {} as ListUserReply_Details,
});

const getPasswordStrengthType = (strength: string) => {
    const typeMap = {
        'high': 'success',
        'middle': 'warning',
        'low': 'danger',
    };
    return typeMap[strength] || 'info';
};

const open = (row: ListUserReply_Details) => {
    state.open = true;
    state.data = row;
};

defineExpose({
    open,
});
</script>

<style scoped>
:deep(.el-descriptions__label) {
    width: 150px;
    font-weight: 500;
}
</style>
