<template>
	<div class="chart-wrapper" :style="chartStyle">
		<div v-if="loading" class="chart-state" :style="chartStyle">
			<el-skeleton :rows="7" animated />
		</div>
		<div v-else-if="isEmpty" class="chart-state" :style="chartStyle">
			<el-empty />
		</div>
		<div v-else ref="chartContainer" class="chart-container" :style="chartStyle"></div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';

type ChartMode = 'bar' | 'stackedBar' | 'line' | 'horizontalBar';
type SeriesItem = {
	name: string;
	type?: string;
	data: number[];
	stack?: string;
	smooth?: boolean;
	showSymbol?: boolean;
	areaStyle?: Record<string, unknown>;
	lineStyle?: Record<string, unknown>;
};

const props = withDefaults(defineProps<{
	title?: string;
	xAxis?: string[];
	series?: SeriesItem[];
	loading?: boolean;
	mode?: ChartMode;
	height?: number;
	colors?: string[];
}>(), {
	title: '',
	xAxis: () => [],
	series: () => [],
	loading: false,
	mode: 'bar',
	height: 300,
	colors: () => ['#d95656', '#168f7a', '#d49a2a', '#3b82c4', '#7c6fd6'],
});

const chartContainer = ref<HTMLElement | null>(null);
const myChart = shallowRef<ECharts | null>(null);

const isHorizontal = computed(() => props.mode === 'horizontalBar');
const isStacked = computed(() => props.mode === 'stackedBar' || props.mode === 'horizontalBar');
const isLine = computed(() => props.mode === 'line');
const isEmpty = computed(() => !props.loading && (!props.series?.length || !props.xAxis?.length));
const chartStyle = computed(() => ({
	height: `${props.height}px`,
	minHeight: `${props.height}px`,
}));

const getSeries = () => (props.series || []).map((item, index) => ({
	...item,
	type: item.type || (isLine.value ? 'line' : 'bar'),
	stack: isStacked.value ? (item.stack || 'total') : item.stack,
	smooth: isLine.value ? (item.smooth ?? true) : item.smooth,
	showSymbol: isLine.value ? (item.showSymbol ?? false) : item.showSymbol,
	barMaxWidth: isHorizontal.value ? 18 : 34,
	lineStyle: isLine.value ? { width: 2, ...(item.lineStyle || {}) } : item.lineStyle,
	areaStyle: isLine.value ? (item.areaStyle || { opacity: 0.08 }) : item.areaStyle,
	itemStyle: {
		color: props.colors[index % props.colors.length],
		borderRadius: isHorizontal.value ? [0, 4, 4, 0] : [4, 4, 0, 0],
	},
}));

const getChartOptions = (): EChartsOption => ({
	color: props.colors,
	title: props.title ? {
		text: props.title,
		left: 0,
		top: 0,
		textStyle: {
			color: '#202a36',
			fontSize: 13,
			fontWeight: 800,
		},
	} : undefined,
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: isLine.value ? 'line' : 'shadow',
		},
	},
	legend: {
		bottom: 0,
		left: 0,
		itemWidth: 10,
		itemHeight: 10,
		textStyle: {
			color: '#66758a',
			fontSize: 12,
		},
		data: props.series?.map(item => item.name) || [],
	},
	grid: {
		top: props.title ? 36 : 12,
		left: isHorizontal.value ? 110 : 12,
		right: 18,
		bottom: 42,
		containLabel: true,
	},
	xAxis: isHorizontal.value ? {
		type: 'value',
		minInterval: 1,
		axisLabel: {
			color: '#66758a',
		},
		splitLine: {
			lineStyle: {
				color: '#edf3f1',
			},
		},
	} : {
		type: 'category',
		data: props.xAxis || [],
		axisLabel: {
			color: '#66758a',
			interval: 0,
			rotate: (props.xAxis?.length || 0) > 4 ? 24 : 0,
			hideOverlap: true,
		},
		axisTick: {
			alignWithLabel: true,
		},
	},
	yAxis: isHorizontal.value ? {
		type: 'category',
		data: props.xAxis || [],
		axisLabel: {
			color: '#66758a',
			width: 96,
			overflow: 'truncate',
		},
	} : {
		type: 'value',
		minInterval: 1,
		axisLabel: {
			color: '#66758a',
		},
		splitLine: {
			lineStyle: {
				color: '#edf3f1',
			},
		},
	},
	series: getSeries(),
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
	() => [props.xAxis, props.series, props.loading, props.mode, props.height],
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
.chart-wrapper,
.chart-container {
	width: 100%;
}

.chart-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 18px;
}
</style>
