<template>
    <el-form label-width="auto" :inline="true">
        <div class="form-items">
            <el-form-item>
                <template #label>{{ transMonitor('memUsage') }}</template>
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
import { GetSystemStatsReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { transMonitor } from '/@/utils/translator';
import { formatApiTime } from '/@/utils/formatTime';

const state = reactive({
    form: {
        rangeSelected: '2h',
    }
});

const timeRangeOptions = [
    { label: transMonitor('hour', [2]), value: '2h' },
    { label: transMonitor('hour', [24]), value: '24h' },
];

const chartContainer = ref(null);
let myChart = null;
let data = [];
let intervalId = null;

const updateRtData = () => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const value = (Math.random() * 10 + 5).toFixed(2) - 0;

    data.push([time, value]);
    // data = data.slice(-20);
    if (data.length > 1200) {
        data.shift();
    }

    myChart.setOption({
        xAxis: {
            data: data.map(item => item[0])
        },
        series: [{
            data: data
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
                    result += item.marker
                            + " "
                            + item.seriesName
                            + ": "
                            + (item.value).toFixed(2)
                            + "%<br>";
                });

                return result;
            },
        },
        legend: {
            data: [transMonitor('mem')],
            bottom: '0%',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                formatter: (value: string) => {
                    return value.split(' ')[1];
                },
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '25%'],
            // name: '%', // Add the unit here
            nameLocation: 'end',    // Render the unit label at the top of the axis
            nameTextStyle: {
                fontSize: 12,
                padding: [0, 0, 20, -20]  // Adjust text padding for better positioning
            },
            // axisLabel: {
            // formatter: '{value} °C' // Add the unit '°C' here, or change it as needed
            // }
            axisLabel: {
                formatter: (value) => {
                    return (value).toFixed(2) + ' %';
                },
            }
        },
        series: [
            {
                name: transMonitor('mem'),
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: [],
            }
        ],
        grid: {
            left: '8%',   // Reduce left padding
            right: '4%',  // Reduce right padding
            // top: '10%',   // Adjust as needed
            // bottom: '10%' // Adjust as needed
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

const fetch = () => {

    const req: GetSystemStatsReq = {
        type: 'mem',
        scope: state.form.rangeSelected,
    };

    console.log("getSystemStats", req);

    api.getSystemStats(req)
    .then(resp => resp.response)
    .then(arr => {
        console.log(arr);
        data = [];
        arr.stats.sort().forEach(d => data.push([formatApiTime(Number(d.timestamp) * 1000), Number(d.value)]));

        myChart.setOption({
            xAxis: {
                data: data.map(item => item[0])
            },
            series: [{
                data: data.map(item => item[1])
            }]
        });
    })
    .catch(err => alertApiError(err));
};
const enableHistoryChart = () => {
    disposeChart();
    initChart();
    fetch();
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
    // enableRtChart();
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

