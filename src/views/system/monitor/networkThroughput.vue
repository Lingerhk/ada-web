<template>
    <el-form label-width="auto" :inline="true">
        <div class="form-items">
            <el-form-item>
                <template #label>{{ T('netUsage') }}</template>
                <el-select size="default" v-model="state.form.typeSelected" placeholder="Select" style="width: 120px">
                    <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-radio-group v-model="state.form.rangeSelected" size="default">
                    <el-radio-button v-for="item in timeRangeOptions" :label="item.label" :value="item.value" />
                </el-radio-group>
            </el-form-item>
        </div>
    </el-form>
    <div ref="chartContainer" style="height: 400px;"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, watch } from 'vue';
import * as echarts from 'echarts';
import { transMonitor as T } from '/@/utils/translator';
import { GetSystemStatsReq, StatsInfo } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';

const state = reactive({
    form: {
        typeSelected: 'all',
        rangeSelected: '2h',
    }
});

const userOptions = [
    { label: T('all'), value: 'all' },
    { label: T('dl'), value: 'net_rx' },
    { label: T('ul'), value: 'net_tx' },
];

const timeRangeOptions = [
    { label: T('hour', [2]), value: '2h' },
    { label: T('hour', [24]), value: '24h' },
];

const chartContainer = ref(null);
let myChart = null;
let intervalId = null;
let downloadData = [];
let uploadData = [];

const formatThroughput = (value: number) => {
    const kbps = Number(value);
    if (!Number.isFinite(kbps)) return '0 Kbps';
    if (Math.abs(kbps) >= 1024) return `${(kbps / 1024).toFixed(2)} Mbps`;
    if (Math.abs(kbps) >= 10) return `${kbps.toFixed(0)} Kbps`;
    return `${kbps.toFixed(2)} Kbps`;
};

const updateRtData = () => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const downloadValue = (Math.random() * 10 + 5).toFixed(2) - 0;
    const uploadValue = (Math.random() * 10 + 5).toFixed(2) - 0;

    downloadData.push([time, downloadValue]);
    uploadData.push([time, uploadValue]);

    if (downloadData.length > 1200) {
        downloadData.shift();
    }

    if (uploadData.length > 1200) {
        uploadData.shift();
    }

    myChart.setOption({
        xAxis: {
            data: downloadData.map(item => item[0])
        },
        series: [{
            data: downloadData.map(item => item[1])
        }, {
            data: uploadData.map(item => item[1])
        }]
    });
};

const initChart = () => {
    myChart = echarts.init(chartContainer.value);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            formatter: (params) => {
                let result = params[0].axisValueLabel + '<br>';
                params.forEach(item => {
                    result += `${item.marker} ${item.seriesName}: ${formatThroughput(item.value)}<br>`;
                });

                return result;
            },
        },
        legend: {
            data: [T('dl'), T('ul')],
            bottom: '0%',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '25%'],
            name: 'Kbps / Mbps',
            nameLocation: 'end',    // Render the unit label at the top of the axis
            nameTextStyle: {
                fontSize: 12,
                padding: [0, 0, 20, -20]  // Adjust text padding for better positioning
            },
            axisLabel: {
                formatter: (value) => formatThroughput(value),
            }
        },
        series: [
            {
                name: T('dl'),
                type: 'line',
                showSymbol: false,
                emphasis: {
                    scale: false,
                },
                data: downloadData.map(item => item[1])
            },
            {
                name: T('ul'),
                type: 'line',
                showSymbol: false,
                emphasis: {
                    scale: false,
                },
                data: uploadData.map(item => item[1])
            }
        ],
        grid: {
            left: '8%',   // Reduce left padding
            right: '4%',  // Reduce right padding
        },
    };

    myChart.setOption(option);
};

const disposeChart = () => {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    if (myChart !== null) {
        myChart.dispose();
    }
}

const enableRtChart = () => {
    disposeChart();
    initChart();

    intervalId = setInterval(updateRtData, 1000);
}

const fetch = async (t: string) => {
    const req: GetSystemStatsReq = {
        type: t,
        scope: state.form.rangeSelected,
    };

    return api.getSystemStats(req)
    .then(resp => resp.response)
    .then(arr => {
        return arr.stats
    })
    .catch(err => {
        alertApiError(err);
        return [];
    });
};

const convert = (arr: StatsInfo[]): any[] => {
    return arr
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
        .map(d => [formatApiTime(Number(d.timestamp) * 1000), Number(d.value)]);
};

const enableHistoryChart = async () => {
    disposeChart();
    initChart();

    const showDownload = state.form.typeSelected === 'all' || state.form.typeSelected === 'net_rx';
    const showUpload = state.form.typeSelected === 'all' || state.form.typeSelected === 'net_tx';
    downloadData = convert(showDownload ? await fetch('net_rx') : []);
    uploadData = convert(showUpload ? await fetch('net_tx') : []);

    myChart.setOption({
        xAxis: {
            data: showDownload ? downloadData.map(item => item[0]) : uploadData.map(item => item[0]),
        },
        series: [{
            data: downloadData.map(item => item[1])
        }, {
            data: uploadData.map(item => item[1])
        }]
    });
}

watch(
    () => state.form,
    () => {
        enableHistoryChart();
        // if (state.form.rangeSelected === 'rt') {
        //     enableRtChart();
        // } else {
        //     enableHistoryChart();
        // }
    },
    {
        deep: true
    })

onMounted(() => {
    initChart();
    enableHistoryChart();
    window.addEventListener('resize', myChart.resize);
});

onUnmounted(() => {
    window.removeEventListener('resize', myChart.resize);
    disposeChart();
});

</script>

<style>
.form-items {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 12px;
}

.form-items .el-form-item,
.form-items .el-form-item:last-of-type {
    margin: 0 !important;
}
</style>
