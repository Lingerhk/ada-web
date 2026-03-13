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
    { label: T('ul'), value: 'net_rx' },
    { label: T('dl'), value: 'net_tx' },
];

const timeRangeOptions = [
    { label: T('hour', [2]), value: '2h' },
    { label: T('hour', [24]), value: '24h' },
];

const chartContainer = ref(null);
let myChart = null;
let intervalId = null;
let ulData = [];
let dlData = [];

const updateRtData = () => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const ulValue = (Math.random() * 10 + 5).toFixed(2) - 0;
    const dlValue = (Math.random() * 10 + 5).toFixed(2) - 0;

    ulData.push([time, ulValue]);
    dlData.push([time, dlValue]);

    if (ulData.length > 1200) {
        ulData.shift();
    }

    if (dlData.length > 1200) {
        dlData.shift();
    }

    myChart.setOption({
        xAxis: {
            data: dlData.map(item => item[0])
        },
        series: [{
            data: ulData
        }, {
            data: dlData
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
            }
        },
        legend: {
            data: [T('ul'), T('dl')],
            bottom: '0%',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '25%'],
            name: 'Mbps', // Add the unit here
            nameLocation: 'end',    // Render the unit label at the top of the axis
            nameTextStyle: {
                fontSize: 12,
                padding: [0, 0, 20, -20]  // Adjust text padding for better positioning
            }
        },
        series: [
            {
                name: T('ul'),
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: ulData
            },
            {
                name: T('dl'),
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: dlData
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

    console.log("getSystemStats", req);

    return api.getSystemStats(req)
    .then(resp => resp.response)
    .then(arr => {
        console.log(arr);
        return arr.stats
    })
    .catch(err => {
        alertApiError(err);
        return [];
    });
};

const convert = (arr: StatsInfo[]): any[] => {
    return arr.sort().map(d => [formatApiTime(Number(d.timestamp) * 1000), Number(d.value)]);
};

const enableHistoryChart = async () => {
    disposeChart();
    initChart();

    dlData = convert(state.form.typeSelected === 'all' || state.form.typeSelected === 'net_tx' ? await fetch('net_tx') : []);
    ulData = convert(state.form.typeSelected === 'all' || state.form.typeSelected === 'net_rx' ? await fetch('net_rx') : []);

    myChart.setOption({
        xAxis: {
            data: state.form.typeSelected === 'all' || state.form.typeSelected === 'net_tx' ? dlData.map(item => item[0]) : ulData.map(item => item[0]),
        },
        series: [{
            data: ulData
        }, {
            data: dlData
        }]
    });
}

watch(
    () => state.form,
    () => {
        // console.log(state.form, "changed");
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
    justify-content: space-between;
}
</style>
