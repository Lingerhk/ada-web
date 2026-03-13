<template>
    <div ref="chartContainer" style="width: 100%; min-width: 1000px; height: 400px;"></div>
</template>

<script setup lang="ts">

import { onMounted, reactive, ref, watchEffect } from 'vue';
import * as echarts from 'echarts';
import { formatApiTime } from '/@/utils/formatTime';

const chartContainer = ref(null);

let myChart = null;

const props = defineProps({
    xAxis: Array,
    series: Array
});

const initChart = () => {
    if (chartContainer.value && !myChart) {
        myChart = echarts.init(chartContainer.value);
    }
    if (myChart) {
        const options = {
            title: {
                text: '',
            },
            tooltip: {
                trigger: 'axis',  // Configure the tooltip to track the axis
                axisPointer: {
                    type: 'shadow'  // Use a shadow pointer
                }
            },
            legend: {
                data: props.series?.map(item => item.name) || [],
            },
            xAxis: {
                data: props.xAxis?.map(ts => formatApiTime(Number(ts))) || []
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