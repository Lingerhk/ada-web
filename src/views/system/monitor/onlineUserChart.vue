<template>
    <el-form label-width="auto" :inline="true">
        <div class="form-items">
            <el-form-item>
                <template #label>用户在线数</template>
                <el-select size="default" v-model="state.form.userSelected" placeholder="Select" style="width: 120px">
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

const state = reactive({
    form: {
        userSelected: 'all',
        rangeSelected: 'rt',
    }
});

const userOptions = [
    { label: '全部', value: 'all' },
];

const timeRangeOptions = [
    { label: '实时', value: 'rt' },
    { label: '1小时', value: '1h' },
    { label: '24小时', value: '24h' },
    { label: '7天', value: '7d' },
    { label: '30天', value: '30d' },
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
        // title: {
        // text: 'Online user count'
        // },
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
            data: ['在线人数'],
            bottom: '0%',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            name: '人数', // Add the unit here
            nameLocation: 'end',    // Render the unit label at the top of the axis
            nameTextStyle: {
                fontSize: 12,
                padding: [0, 0, 20, -20]  // Adjust text padding for better positioning
            }
            // axisLabel: {
            // formatter: '{value} °C' // Add the unit '°C' here, or change it as needed
            // }
        },
        series: [
            {
                name: '在线人数',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: data
            }
        ],
        grid: {
            left: '4%',   // Reduce left padding
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

const enableHistoryChart = () => {
    disposeChart();
    initChart();

}

watch(
    () => state.form,
    () => {
        console.log(state.form, "changed");
        if (state.form.rangeSelected === 'rt') {
            enableRtChart();
        } else {
            enableHistoryChart();
        }
    },
    {
        deep: true
    })

onMounted(() => {
    initChart();
    enableRtChart();
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