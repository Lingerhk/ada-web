<template>
    <el-row class="title">{{ T('sysParams') }}</el-row>
    <el-row style="margin-top: 20px;">
        <el-col :span="4">
            <el-statistic :title="T('systemCpuTotal')" :value="state.info.systemCpuTotal" />
        </el-col>
        <el-col :span="4">
            <el-statistic :title="T('systemMemTotal')" :value="state.info.systemMemTotal" />
        </el-col>
        <el-col :span="4">
            <el-statistic :title="T('systemDiskTotal')" :value="state.info.systemDiskTotal" />
        </el-col>
        <el-col :span="4">
            <el-statistic :title="T('systemLoadAverage')" :value="state.info.systemLoadAverage" />
        </el-col>
        <el-col :span="4">
            <el-statistic :title="T('systemBootTime')" :value="formatDuration(Number(state.info.systemBootTime))" />
        </el-col>
        <el-col :span="4">
            <el-statistic :title="T('systemEsHealth')" :value="T(`systemEsHealth_${state.info.systemEsHealth}`)">
                <template #prefix>
                    <el-icon :color="getIconColor(state.info.systemEsHealth)">
                        <component :is="getIcon(state.info.systemEsHealth)" />
                    </el-icon>
                </template>
            </el-statistic>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, reactive } from 'vue';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { GetSystemInfoReply } from '/@/api/grpc/ada';
import { transMonitor as T } from '/@/utils/translator';
import { CircleCheck, CircleClose, Warning } from '@element-plus/icons-vue';

const state = reactive({
    info: {} as GetSystemInfoReply,
});

const getIconColor = (health: string) => {
    switch (health) {
        case 'yellow':
            return '#e8b949';
        default:
            return health;
    }
};

const getIcon = (health: string) => {
    switch (health) {
        case 'green':
            return h(CircleCheck);
        case 'yellow':
            return h(Warning);
        default:
            return h(CircleClose);
    }
};

function formatDuration(seconds: number): string {
    const units = [
        { label: T('uDay'), value: 86400 }, // 1 天 = 86400 秒
        { label: T('uHour'), value: 3600 }, // 1 小时 = 3600 秒
        { label: T('uMinute'), value: 60 },   // 1 分钟 = 60 秒
        { label: T('uSecond'), value: 1 }        // 1 秒 = 1 秒
    ];

    let result = '';

    for (const unit of units) {
        const unitValue = Math.floor(seconds / unit.value);
        if (unitValue > 0) {
            result += `${unitValue}${unit.label}`;
            seconds %= unit.value; // 获取剩余的秒数
        }
    }

    return result || '0' + T('uSecond'); // 如果输入的秒数为 0，则返回 '0秒'
}

const refresh = () => {
    api.getSystemInfo({})
    .then(resp => resp.response)
    .then(info => {
        state.info = info;
    })
    .catch(err => alertApiError(err));
};

let timerId: NodeJS.Timer | null = null;

onMounted(() => {
    refresh();

    if (!timerId) {
        timerId = setInterval(() => {
            refresh();
        }, 5000);
    }
});

onUnmounted(() => {
    if (timerId) {
        clearInterval(timerId);
    }
});

</script>

<style lang="scss" scoped>
.title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
}

.el-col {
  text-align: center;
}
.el-icon {
    vertical-align: -0.125em;
}
</style>
