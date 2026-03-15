<template>
    <el-row class="title">{{ T('sysParams') }}</el-row>
    <el-row style="margin-top: 20px;">
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemCpuTotal') }}</div>
                <div class="metric-value">{{ formatMetricValue(state.info.systemCpuTotal) }}</div>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemMemTotal') }}</div>
                <div class="metric-value">{{ formatMetricValue(state.info.systemMemTotal) }}</div>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemDiskTotal') }}</div>
                <div class="metric-value">{{ formatMetricValue(state.info.systemDiskTotal) }}</div>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemLoadAverage') }}</div>
                <div class="metric-value">{{ formatMetricValue(state.info.systemLoadAverage) }}</div>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemBootTime') }}</div>
                <div class="metric-value">{{ formatDuration(Number(state.info.systemBootTime)) }}</div>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="metric-card">
                <div class="metric-title">{{ T('systemEsHealth') }}</div>
                <div class="metric-value metric-value-health">
                    <el-icon :color="getIconColor(state.info.systemEsHealth)">
                        <component :is="getIcon(state.info.systemEsHealth)" />
                    </el-icon>
                    <span>{{ getHealthLabel(state.info.systemEsHealth) }}</span>
                </div>
            </div>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue';
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
            return CircleCheck;
        case 'yellow':
            return Warning;
        default:
            return CircleClose;
    }
};

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return `0${T('uHour')}`;
    }

    const units = [
        { label: T('uDay'), value: 86400 }, // 1 day = 86400 seconds
        { label: T('uHour'), value: 3600 }  // 1 hour = 3600 seconds
    ];

    let result = '';

    for (const unit of units) {
        const unitValue = Math.floor(seconds / unit.value);
        if (unitValue > 0) {
            result += `${unitValue}${unit.label}`;
            seconds %= unit.value; // Get the remaining seconds
        }
    }

    return result || '0' + T('uHour'); // Return `0 hours` when the input seconds are `0`.
}

const formatMetricValue = (value?: string | number) => {
    if (value === undefined || value === null || value === '') {
        return '--';
    }

    return `${value}`;
};

const getHealthLabel = (health?: string) => {
    switch (health) {
        case 'green':
        case 'yellow':
        case 'red':
            return T(`systemEsHealth_${health}`);
        default:
            return '--';
    }
};

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

.metric-card {
    padding: 8px 0;
}

.metric-title {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 8px;
}

.metric-value {
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
}

.metric-value-health {
    align-items: center;
    display: inline-flex;
    gap: 8px;
}

.el-col {
  text-align: center;
}
.el-icon {
    vertical-align: -0.125em;
}
</style>
