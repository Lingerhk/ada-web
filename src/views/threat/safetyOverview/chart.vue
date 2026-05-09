<template>
	<div class="trend-chart">
		<div v-if="loading" class="trend-chart-state">
			<el-skeleton :rows="7" animated />
		</div>
		<div v-else-if="isEmpty" class="trend-chart-state">
			<el-empty />
		</div>
		<div v-else ref="chartContainer" class="trend-chart-container"></div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { formatApiTime } from '/@/utils/formatTime';

type AxisValue = number | bigint | string;
type SeriesItem = {
	name: string;
	type: string;
	data: number[];
	smooth?: boolean;
	symbolSize?: number;
	lineStyle?: Record<string, unknown>;
	areaStyle?: Record<string, unknown>;
};

const props = withDefaults(defineProps<{
	xAxis?: AxisValue[];
	series?: SeriesItem[];
	loading?: boolean;
}>(), {
	xAxis: () => [],
	series: () => [],
	loading: false,
});

const chartContainer = ref<HTMLElement | null>(null);
const myChart = shallowRef<ECharts | null>(null);

const isEmpty = computed(() => !props.loading && (!props.xAxis?.length || !props.series?.length));

const normalizeTs = (value: AxisValue): number => {
	if (typeof value === 'bigint') return Number(value);
	return Number(value);
};

const toChartTime = (value: AxisValue): number => {
	const timestamp = normalizeTs(value);
	return timestamp > 0 && timestamp < 10000000000 ? timestamp * 1000 : timestamp;
};

const getChartOptions = (): EChartsOption => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'line',
		},
	},
	legend: {
		top: 0,
		right: 0,
		data: props.series?.map(item => item.name) || [],
	},
	grid: {
		top: 48,
		left: 44,
		right: 24,
		bottom: 36,
		containLabel: true,
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: props.xAxis?.map(ts => formatApiTime(toChartTime(ts))) || [],
		axisLabel: {
			color: '#6b7788',
			hideOverlap: true,
		},
	},
	yAxis: {
		type: 'value',
		minInterval: 1,
		axisLabel: {
			color: '#6b7788',
		},
		splitLine: {
			lineStyle: {
				color: '#edf3f1',
			},
		},
	},
	series: props.series || [],
});

const initChart = async () => {
	await nextTick();
	if (!chartContainer.value || isEmpty.value || props.loading) return;

	if (chartContainer.value.clientWidth === 0 || chartContainer.value.clientHeight === 0) {
		window.setTimeout(initChart, 100);
		return;
	}

	if (!myChart.value) {
		myChart.value = echarts.init(chartContainer.value);
	}
	myChart.value.setOption(getChartOptions(), true);
};

const handleResize = () => {
	myChart.value?.resize();
};

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedResize = () => {
	if (resizeTimer) clearTimeout(resizeTimer);
	resizeTimer = setTimeout(handleResize, 100);
};

watch(
	() => [props.xAxis, props.series, props.loading],
	() => {
		if (!props.loading) initChart();
	},
	{ deep: true }
);

onMounted(() => {
	initChart();
	window.addEventListener('resize', debouncedResize);
});

onBeforeUnmount(() => {
	window.removeEventListener('resize', debouncedResize);
	if (resizeTimer) clearTimeout(resizeTimer);
	if (myChart.value) {
		myChart.value.dispose();
		myChart.value = null;
	}
});
</script>

<style scoped>
.trend-chart {
	width: 100%;
	min-height: 380px;
}

.trend-chart-container {
	width: 100%;
	height: 380px;
}

.trend-chart-state {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 380px;
	padding: 20px;
}
</style>
