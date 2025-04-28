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
                        <span v-if="state.data.version === state.data.newVersion" style="font-size: 12px; color: #67c23a; margin-left: 8px;">
                            ({{ $t('message.sysConfig.sensorConfig.latestVersion') }})
                        </span>
                        <span v-else style="font-size: 12px; color: #e6a23c; margin-left: 8px;">
                            ({{ $t('message.sysConfig.sensorConfig.canUpgrade') }})
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
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import { ListSensorReply_Details } from '/@/api/grpc/ada';
import { formatApiTime } from '/@/utils/formatTime';

const state = reactive({
    open: false,
    title: '',
    data: null as ListSensorReply_Details | null,
})

const open = (title: string, row: ListSensorReply_Details) => {
    state.open = true;
    state.title = title;
    state.data = row;
    console.log(row);
}

defineExpose({
    open,
})
</script>