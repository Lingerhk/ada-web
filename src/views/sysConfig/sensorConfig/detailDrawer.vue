<template>
    <el-drawer v-model="state.open">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <el-descriptions size="default" style="padding: 20px;" column="1" border>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.iD') + ':'">{{ state.data?.iD }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.advancedSearch.domain') + ':'">{{ state.data?.domain
                    }}</el-descriptions-item>
                <el-descriptions-item label="FQDN:">{{ `${state.data?.hostname}.${state.data?.domain}`
                    }}</el-descriptions-item>
                <el-descriptions-item label="IP:">{{ state.data?.iP }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.advancedSearch.status') + ':'">
                    <span :class="state.data?.status === 'Running' ? 'success-color' : 'failed-color'">{{
                        $t(`message.sysConfig.sensorConfig.status_${state.data?.status}`)}}</span></el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.pktSwitch') + ':'">{{
                    $t(`message.sysConfig.sensorConfig.switch_${state.data?.pktPluginSwitch}`) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.pktStatus') + ':'">
                    <span :class="state.data?.logStatus === 'Running' ? 'success-color' : 'failed-color'">{{
                        $t(`message.sysConfig.sensorConfig.status_${state.data?.logStatus}`)
                        }}</span></el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.logSwitch') + ':'">{{
                    $t(`message.sysConfig.sensorConfig.switch_${state.data?.logPluginSwitch}`) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.logStatus') + ':'">
                    <span :class="state.data?.logPluginStatus === 'Running' ? 'success-color' : 'failed-color'">{{
                        $t(`message.sysConfig.sensorConfig.status_${state.data?.logPluginStatus}`)
                        }}</span></el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.SensorResource') + ':'">
                    CPU: {{ state.data?.sensorCpuUsed }}, Memory: {{ state.data?.sensorMemUsed }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.bindNetIface') + ':'">
                    <el-space>
                        <el-tag v-for="idx in state.data?.bindNetIface" type="primary" :key="idx">{{
                            state.data?.netIface[idx]}}</el-tag>
                    </el-space>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.netIface') + ':'">
                    <el-space>
                        <el-tag v-for="iface in state.data?.netIface" type="primary" :key="iface">{{ iface }}</el-tag>
                    </el-space>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.perfLimit') + ':'">
                    {{ $t('message.sysConfig.sensorConfig.perfLimitInfo', [
                        `${(parseFloat(state.data?.perfLimit['limit_cpu_max'] || '0') * 100).toFixed(0)}%`,
                        `${(parseFloat(state.data?.perfLimit['limit_mem_max'] || '0') * 100).toFixed(0)}%`
                    ]) }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.curVersion') + ':'">
                    {{ state.data?.version }}
                    <span v-if="state.data?.version && state.data?.newVersion">
                        <span v-if="compareVersions(state.data.version, state.data.newVersion) >= 0" style="font-size: 12px; color: #67c23a; margin-left: 8px;">
                            ({{ $t('message.sysConfig.sensorConfig.latestVersion') }})
                        </span>
                        <span v-else style="font-size: 12px; color: #e6a23c; margin-left: 8px;">
                            ({{ $t('message.sysConfig.sensorConfig.canUpgrade') }})
                            <el-button 
                                type="primary" 
                                size="small" 
                                link 
                                style="margin-left: 5px;" 
                                @click="updateVersion"
                                :disabled="!canUpdate">
                                {{ $t('message.tableCommon.updateVersion') }}
                            </el-button>
                        </span>
                    </span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.osInformation') + ':'">
                    <el-tooltip :content="state.data?.kernelVer || ''" placement="top">
                        {{ state.data?.platform }}
                    </el-tooltip>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.osResource') + ':'">
                    CPU: {{ state.data?.cpuTotal }}, Memory: {{ state.data?.memTotal }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.sensorTime') + ':'">{{
                    formatApiTime(state.data?.sensorTime) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.createTm') + ':'">{{
                    formatApiTime(state.data?.createTm) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('message.sysConfig.sensorConfig.remark') + ':'">{{ state.data?.remark
                    }}</el-descriptions-item>
            </el-descriptions>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: flex-end; margin-right: 20px;">
                <el-button @click="state.open = false">{{ $t('message.tableCommon.close') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ListSensorReply_Details, UpdateSensorVersionReply } from '/@/api/grpc/ada';
import { formatApiTime } from '/@/utils/formatTime';
import api from '/@/api/grpc';
import { ElMessage, ElMessageBox } from 'element-plus';
import { alertApiError } from '/@/utils/error';

const { t } = useI18n();

type OnUpdateFunc = () => void;

const state = reactive({
    open: false,
    title: '',
    data: null as ListSensorReply_Details | null,
    onUpdate: null as OnUpdateFunc | null,
});

const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 < p2) return -1; // v1 < v2
        if (p1 > p2) return 1;  // v1 > v2
    }
    return 0; // v1 === v2
};

const canUpdate = computed(() => {
    if (!state.data || !state.data.version || !state.data.newVersion) return false;
    // Can update if newVersion is greater than current version
    return compareVersions(state.data.version, state.data.newVersion) < 0;
});

const updateVersion = () => {
    if (!state.data) return;
    
    ElMessageBox.confirm(
        t('message.sysConfig.sensorConfig.confirmUpdateVersion', [state.data.version, state.data.newVersion]),
        t('message.dialog.prompt'),
        {
            confirmButtonText: t('message.dialog.confirm'),
            cancelButtonText: t('message.dialog.cancel'),
            type: 'warning',
        }
    ).then(() => {
        api.updateSensorVersion({
            sensorId: state.data!.iD,
            version: state.data!.newVersion
        })
        .then(resp => resp.response)
        .then((data: UpdateSensorVersionReply) => {
            if (data.result === 'success') {
                ElMessage.success(t('message.sysConfig.sensorConfig.updateVersionSucc'));
                if (state.onUpdate) {
                    state.onUpdate();
                }
                state.open = false;
            } else {
                ElMessage.warning(t('message.sysConfig.sensorConfig.updateVersionFail'));
            }
        })
        .catch(err => alertApiError(err));
    }).catch(() => {
        // User cancelled
        console.log('Version update cancelled');
    });
};

const open = (title: string, row: ListSensorReply_Details, onUpdate?: OnUpdateFunc) => {
    state.open = true;
    state.title = title;
    state.data = row;
    state.onUpdate = onUpdate || null;
}

defineExpose({
    open,
});
</script>

<style scoped>
.success-color {
    color: #67c23a;
}
.failed-color {
    color: #f56c6c;
}
</style>