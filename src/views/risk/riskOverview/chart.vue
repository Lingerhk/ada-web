<template>
    <div class="chart-wrapper">
        <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="8" animated />
        </div>
        <div v-else-if="isEmpty" class="chart-empty">
            <el-empty />
        </div>
        <div v-else ref="chartContainer" class="chart-container"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption, ECharts } from 'echarts';

interface SeriesItem {
    name: string;
    type: string;
    data: number[];
}

const props = withDefaults(defineProps<{
    text?: string;
    xAxis?: string[];
    series?: SeriesItem[];
    loading?: boolean;
}>(), {
    text: '',
    xAxis: () => [],
    series: () => [],
    loading: false,
});

const chartContainer = ref<HTMLElement | null>(null);
// Use shallowRef for ECharts instance to avoid deep reactivity overhead
const myChart = shallowRef<ECharts | null>(null);

const isEmpty = computed(() => {
    return !props.loading && (!props.series?.length || !props.xAxis?.length);
});

const getChartOptions = (): EChartsOption => ({
    title: {
        text: props.text,
        left: '50%',
        textAlign: 'center',
        textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
        },
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
        },
    },
    legend: {
        data: props.series?.map((item) => item.name) || [],
        bottom: 0,
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true,
    },
    xAxis: {
        type: 'category',
        data: props.xAxis || [],
        axisLabel: {
            interval: 0,
            rotate: props.xAxis.length > 5 ? 25 : 0,
            fontSize: 11,
        },
    },
    yAxis: {
        type: 'value',
        minInterval: 1,
    },
    series: props.series?.map((item) => ({
        ...item,
        barMaxWidth: 35,
        itemStyle: {
            borderRadius: [4, 4, 0, 0],
        },
    })) || [],
});

const initChart = async () => {
    // Wait for next tick to ensure DOM is rendered
    await nextTick();

    if (!chartContainer.value) return;

    // Check if container has dimensions
    if (chartContainer.value.clientWidth === 0 || chartContainer.value.clientHeight === 0) {
        // Retry after a short delay
        setTimeout(initChart, 100);
        return;
    }

    if (!myChart.value) {
        myChart.value = echarts.init(chartContainer.value);
    }

    if (myChart.value && props.series?.length && props.xAxis?.length) {
        myChart.value.setOption(getChartOptions(), true);
    }
};

const handleResize = () => {
    myChart.value?.resize();
};

// Debounced resize handler for better performance
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 100);
};

// Watch for data changes
watch(
    () => [props.xAxis, props.series, props.loading],
    () => {
        if (!props.loading && props.series?.length && props.xAxis?.length) {
            initChart();
        }
    },
    { deep: true }
);

onMounted(() => {
    if (!props.loading && props.series?.length && props.xAxis?.length) {
        initChart();
    }
    window.addEventListener('resize', debouncedResize);
});

onBeforeUnmount(() => {
    // Clean up resize listener
    window.removeEventListener('resize', debouncedResize);
    if (resizeTimer) clearTimeout(resizeTimer);

    // Dispose ECharts instance to prevent memory leak
    if (myChart.value) {
        myChart.value.dispose();
        myChart.value = null;
    }
});
</script>

<style scoped>
.chart-wrapper {
    width: 100%;
    min-height: 400px;
    position: relative;
}

.chart-container {
    width: 100%;
    height: 400px;
}

.chart-loading,
.chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 20px;
}

.chart-loading {
    flex-direction: column;
}
</style>
