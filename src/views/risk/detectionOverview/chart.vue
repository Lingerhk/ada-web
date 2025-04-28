<template>
    <div ref="chartContainer" style="width: 100%; min-width: 1000px; height: 400px;"></div>
</template>

<script setup lang='ts'>

import { onMounted, reactive, ref, watchEffect } from 'vue';
import * as echarts from 'echarts';

const chartContainer = ref(null);

let myChart = null;

const props = defineProps({
    text: String,
    xAxis: Array,
    series: Array
});

// const initChart = () => {
//     if (chartContainer.value && !myChart) {
//         myChart = echarts.init(chartContainer.value);
//     }

//     if (myChart) {
//         const options = {
//             title: {
//                 text: props.text || '默认标题'
//             },
//             tooltip: {},
//             legend: {
//                 data: props.series.map(item => item.name)
//             },
//             xAxis: {
//                 data: props.xAxis || []
//             },
//             yAxis: {},
//             series: props.series || []
//         };
//         myChart.setOption(options, true);
//     }
// };
const initChart = () => {
    if (chartContainer.value && !myChart) {
        myChart = echarts.init(chartContainer.value);
    }
    if (myChart) {
        const options = {
            title: {
                text: props.text || '默认标题'
            },
            tooltip: {
                trigger: 'axis',  // 设置 tooltip 按照坐标轴显示
                axisPointer: {
                    type: 'shadow'  // 使用阴影指示器
                }
            },
            legend: {
                data: props.series.map(item => item.name)
            },
            xAxis: {
                data: props.xAxis || []
            },
            yAxis: {},
            series: props.series || []
        };
        myChart.setOption(options, true);
    }
};

watchEffect(initChart);

onMounted(() => {
    initChart();
});

</script>