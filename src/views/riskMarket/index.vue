<template>
	<div class="chart-warp layout-padding-auto layout-padding-view" style="background: none">
		<div class="chart-warp-top">
			<div class="big-data-up mb15">
				<div class="up-left">
					<i class="el-icon-time mr5"></i>
					<el-form :model="state.form" style="width: 200px">
						<el-form-item>
							<el-select v-model="state.form.domain" placeholder="所有域">
								<el-option label="所有域" value="all" />
								<el-option v-for="opt in state.form.domainOptions" :key="opt.value" :value="opt.value"
									:label="opt.label" />
							</el-select>
						</el-form-item>
					</el-form>
				</div>
				<div class="up-right">
				</div>
			</div>
		</div>
		<div class="chart-main">
			<el-row class="flex-item">
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box">
						<el-row>
							<div class="flex-title">
								<span>{{ T('todayAlarmStats') }}</span>
							</div>
							<div class="flex-item"
								style="width: 100%; align-items: center; display: flex; justify-content: center;">
								<div ref="alarmTodayPieRef" style="min-width: 300px; min-height: 300px;"></div>
							</div>
						</el-row>
					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">今日告警事件TOP5</div>
						<div class="no-data-img">
							<el-empty />
						</div>
					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<el-row style="height: 100%;">
						<div class="flex-item-box">
							<div class="flex-title">重大事件（30天内）</div>
							<div class="no-data-img">
								<el-empty />
							</div>
						</div>
					</el-row>
				</el-col>
			</el-row>
			<el-row class="flex-item">
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>告警事件风险趋势</span>
							<el-form :model="state.form" style="width: 150px">
								<el-form-item>
									<el-select v-model="state.form.riskTrendYear" placeholder="全年">
									</el-select>
								</el-form-item>
							</el-form>
						</div>
						<div class="flex-item"
							style="width: 100%; align-items: center; display: flex; justify-content: center;">
							<div ref="alarmRiskTrendLineRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>日志采集统计</span>
							<el-form :model="state.form" style="width: 150px">
								<el-form-item>
									<el-select v-model="state.form.logStatsDuration" placeholder="时间范围">
										<el-option label="1 Hour" :value="1" />
										<el-option label="3 Hours" :value="3" />
										<el-option label="6 Hours" :value="6" />
										<el-option label="12 Hours" :value="12" />
										<el-option label="24 Hours" :value="24" />
									</el-select>
								</el-form-item>
							</el-form>
						</div>
						<div class="flex-item"
							style="width: 100%; align-items: center; display: flex; justify-content: center;">
							<div ref="dashboardLogStatsRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
			</el-row>
			<el-row class="flex-item" style="height: 220px;">
				<el-col :span="8" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">最近一次检测的漏洞事件数量</div>
						<div style="height: 100%;">
							<el-row :gutter="20" style="padding-top: 10px;">
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">高危漏洞数量</el-row>
										<el-row class="bug-value">2</el-row>
									</el-card>
								</el-col>
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">中危漏洞数量</el-row>
										<el-row class="bug-value">2</el-row>
									</el-card>
								</el-col>
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">低危漏洞数量</el-row>
										<el-row class="bug-value">0</el-row>
									</el-card>
								</el-col>
							</el-row>
						</div>
					</div>
				</el-col>
				<el-col :span="8" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>最近一次检测的基线事件数量</span>
						</div>
						<!-- <div style="width: 100%; height: 100%;" ref="baseLinePieRef"></div> -->
						<div style="height: 100%;">
							<el-row :gutter="20" style="padding-top: 10px;">
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">高危基线事件数量</el-row>
										<el-row class="bug-value">2</el-row>
									</el-card>
								</el-col>
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">中危基线事件数量</el-row>
										<el-row class="bug-value">2</el-row>
									</el-card>
								</el-col>
								<el-col :span="8">
									<el-card>
										<el-row class="bug-title">低危基线事件数量</el-row>
										<el-row class="bug-value">0</el-row>
									</el-card>
								</el-col>
							</el-row>
						</div>

					</div>
				</el-col>
				<el-col :span="8" class="flex-item">
					<div style="width: 100%; height: 100%;" class="flex-item-box">
						<div class="flex-title">
							<span>最近一次检测的弱口令事件命中总数</span>
							<span class="flex-title-small">同比上次检测 <span style="color: #006eff;">+0条</span></span>
						</div>
						<el-row style="width: 100%; padding-top: 10px">
							<FilpNumber :value="state.scan.hits"></FilpNumber>
							<span style="margin-left: 10px; font-size: 20px; align-self: flex-end;">条</span>
						</el-row>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts" name="riskMarketIndex">
import { defineAsyncComponent, reactive, onMounted, watch, nextTick, onActivated, ref, markRaw, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { getLevelColor, OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { transRiskMarket as T } from '/@/utils/translator';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import { DashboardStatsReq, DashboardTrendsReq, DashboardLogStatsReq } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { formatDate } from '/@/utils/formatTime';

const { t } = useI18n();

// 引入组件
const RiskMarketHead = defineAsyncComponent(() => import('/@/views/riskMarket/head.vue'));
const FilpNumber = defineAsyncComponent(() => import('/@/components/flipNumber/FlipNumber.vue'))

// 定义变量内容
const storesTagsViewRoutes = useTagsViewRoutes();
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
const state = reactive({
	form: {
		riskTrendYear: '',
		domain: 'all',
		domainOptions: [] as OptionType[],
		logStatsDuration: 1,
	},
	alarm: {
		today: {
			value: '000000',
			speed: 600,
			criticalPie: null
		}
	},
	scan: {
		hits: '000004',
	},
	myCharts: [] as EmptyArrayType,
	global: {
		alarmPie: null,
		baseLinePie: null,
		alarmTrendLine: null,
		dashboardLogStatsLine: null,
		dispose: [null, '', undefined],
	} as any,
	charts: {
		theme: '',
		bgColor: '',
		color: '#303133',
	},
})

let logStatsIntervalId: number | null = null;

const alarmTodayPieRef = ref()
const baseLinePieRef = ref()
const alarmRiskTrendLineRef = ref()
const dashboardLogStatsRef = ref()

// 函数定义
const initECharts = (ec: any, ref: any, option: any) => {
	if (!state.global.dispose.some((b: any) => b === ec)) ec.dispose();
	ec = markRaw(echarts.init(ref.value, state.charts.theme));

	ec.setOption(option);
	state.myCharts.push(ec);
}

const updateAlarmTodayPie = (data: any) => {
	if (!state.global.alarmPie) {
		return;
	}

	const option = {
		series: [
			{
				data: Object.keys(data).map(key => ({
					value: data[key],
					name: t(`message.tableCommon.level.${key}`),
					itemStyle: {
						color: getLevelColor(Number(key)),
					},
					label: {
						alignTo: 'edge',
						formatter: '{b}\n{c}',
						minMargin: 5,
						edgeDistance: 10,
						lineHeight: 15,
					},
				})),
			}
		],
	};

	state.global.alarmPie.setOption(option);
	state.myCharts.push(state.global.alarmPie);
}

const initPie = (ref: any) => {
	if (state.global.alarmPie && !state.global.dispose.some((b: any) => b === state.global.alarmPie)) state.global.alarmPie.dispose();
	state.global.alarmPie = markRaw(echarts.init(ref.value, state.charts.theme));

	const option = {
		tooltip: {
			trigger: 'item'
		},
		legend: {
			bottom: '0%',
			left: 'center'
		},
		series: [
			{
				name: T('todayAlarmStats'),
				type: 'pie',
				radius: ['40%', '70%'],
				data: [],			// 优化拉出效果，只在上半部分工作
				avoidLabelOverlap: false,
			}
		],
	};

	state.global.alarmPie.setOption(option);
	state.myCharts.push(state.global.alarmPie);
}

const initBaseLinePie = (high: number, medium: number, low: number) => {
	if (!state.global.dispose.some((b: any) => b === state.global.baseLinePie)) state.global.baseLinePie.dispose();
	state.global.baseLinePie = markRaw(echarts.init(baseLinePieRef.value, state.charts.theme));

	const total = 30;
	const radius = ['40%', '50%'];
	const xOffset = ['-66%', '0%', '66%'];
	const option = {
		title: [
			{
				text: `${high}`,
				left: '16%',
				top: '32%',
				textAlign: 'center'
			},
			{
				text: `${medium}`,
				left: '48.8%',
				top: '32%',
				textAlign: 'center'
			},
			{
				text: `${low}`,
				left: '82%',
				top: '32%',
				textAlign: 'center'
			}
		],
		series: [
			{
				name: '高危基线事件数量',
				type: 'pie',
				radius, // 设置饼图的半径大小
				left: xOffset[0],
				top: '-20%',
				data: [
					{ value: high, name: '直达1' },
					{ value: total - high, name: '邮件营销1' },
					// ... 其他数据项
				],

				label: {
					show: false,
					position: 'center'
				},
				labelLine: {
					show: false
				},
			},
			{
				name: '中危基线事件数量',
				type: 'pie',
				radius,
				left: xOffset[1],
				top: '-20%',
				data: [
					{ value: medium, name: '直达2' },
					{ value: total - medium, name: '邮件营销2' },
					// ... 其他数据项
				],
				label: {
					show: false,
					position: 'center'
				},
				labelLine: {
					show: false
				},
				// ... 其他配置项
			},
			{
				name: '低危基线事件数量',
				type: 'pie',
				radius,
				left: xOffset[2],
				top: '-20%',
				data: [
					{ value: low, name: '直达3' },
					{ value: total - low, name: '邮件营销3' },
					// ... 其他数据项
				],
				label: {
					show: false,
					position: 'center'
				},
				labelLine: {
					show: false
				},
				// ... 其他配置项
			}
		],
		graphic: [ // 自定义图形元素组
			{
				type: 'text',
				left: '7%',
				top: '80%',
				style: {
					text: '高危基线事件数量',
					textAlign: 'center',
					fill: '#333', // 文字颜色
					fontSize: 14
				}
			},
			{
				type: 'text',
				top: '80%',
				left: '40%',
				style: {
					text: '中危基线事件数量',
					textAlign: 'center',
					fill: '#333', // 文字颜色
					fontSize: 14
				}
			},
			{
				type: 'text',
				top: '80%',
				left: '74%',
				style: {
					text: '低危基线事件数量',
					textAlign: 'center',
					fill: '#333', // 文字颜色
					fontSize: 14
				}
			}
		],
	};

	state.global.baseLinePie.setOption(option);
	state.myCharts.push(state.global.baseLinePie);
}

const updateAlarmRiskTrendLine = (xData: any[], yData: any[]) => {
	if (!state.global.alarmRiskTrendLine) {
		return;
	}

	const option = {
		xAxis: { data: xData, },
		series: [{ data: yData, }],
	};

	state.global.alarmRiskTrendLine.setOption(option);
};

const initAlarmRiskTrendLine = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.alarmRiskTrendLine)) state.global.alarmRiskTrendLine.dispose();
	state.global.alarmRiskTrendLine = markRaw(echarts.init(alarmRiskTrendLineRef.value, state.charts.theme));

	const option = {
		// 设置标题
		title: {
			// text: '2024年每月数据'
		},
		// 设置提示框组件
		tooltip: {
			trigger: 'axis'
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			// data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12']
			data: [],
		},
		// 设置纵坐标
		yAxis: {
			type: 'value'
		},
		// 设置系列列表
		series: [{
			// name: '数据',
			type: 'line',
			data: [],
			// data: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			// 设置区域填充样式
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ // 从上到下的渐变色
						offset: 0,
						color: 'rgba(58,77,233,0.8)' // 折线图顶端颜色
					}, {
						offset: 1,
						color: 'rgba(58,77,233,0)' // 折线图底端颜色
					}])
				}
			}
		}]
	};

	// initECharts(state.global.alarmRiskTrendLine, alarmRiskTrendLineRef, option);
	state.global.alarmRiskTrendLine.setOption(option);
	state.myCharts.push(state.global.alarmRiskTrendLine);
};

const initDashboardLogStatsLine = () => {
	if (state.global.dashboardLogStatsLine && !state.global.dispose.some((b: any) => b === state.global.dashboardLogStatsLine)) {
		state.global.dashboardLogStatsLine.dispose();
	}
	state.global.dashboardLogStatsLine = markRaw(echarts.init(dashboardLogStatsRef.value, state.charts.theme));

	const option = {
		tooltip: {
			trigger: 'axis',
			formatter: function (params: any[]) {
				let tooltipContent = '';
				if (params && params.length > 0) {
					// Format timestamp from the first series item's axis value
					const timestamp = params[0].axisValue;
					const formattedTime = formatDate(new Date(timestamp * 1000), 'HH:MM:SS');
					tooltipContent += `${formattedTime}<br/>`;

					// Add each series data
					params.forEach(item => {
						tooltipContent += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
					});
				}
				return tooltipContent;
			}
		},
		legend: {
			data: ['Winlog Count', 'Pktlog Count'],
			bottom: '0%',
			left: 'center'
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [],
			axisLabel: {
				formatter: function (value: number) {
					// Format timestamp to HH:mm
					return formatDate(new Date(value * 1000), 'HH:MM');
				}
			}
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				name: 'Winlog Count',
				type: 'line',
				data: [],
				smooth: true,
				showSymbol: false,
				areaStyle: {}
			},
			{
				name: 'Pktlog Count',
				type: 'line',
				data: [],
				smooth: true,
				showSymbol: false,
				areaStyle: {}
			}
		]
	};

	state.global.dashboardLogStatsLine.setOption(option);
	state.myCharts.push(state.global.dashboardLogStatsLine);
};

const updateDashboardLogStatsLine = (data: any[]) => {
	if (!state.global.dashboardLogStatsLine) {
		return;
	}

	const xData = data.map(item => item.ts);
	const winlogData = data.map(item => item.winlogCounts);
	const pktlogData = data.map(item => item.pktlogCounts);

	const option = {
		xAxis: {
			data: xData
		},
		series: [
			{
				name: 'Winlog Count',
				data: winlogData
			},
			{
				name: 'Pktlog Count',
				data: pktlogData
			}
		]
	};

	state.global.dashboardLogStatsLine.setOption(option);
};

const fetchDashboardLogStats = () => {
	const req: DashboardLogStatsReq = {
		domain: state.form.domain,
		duration: state.form.logStatsDuration,
	};
	api.dashboardLogStats(req)
		.then(resp => resp.response)
		.then(data => {
			if (data && data.list) {
				updateDashboardLogStatsLine(data.list);
			} else {
				updateDashboardLogStatsLine([]); // Clear chart if no data
			}
		})
		.catch(err => {
			alertApiError(err);
			updateDashboardLogStatsLine([]); // Clear chart on error
		});
};

// Fetch Log Stats periodically
const startLogStatsInterval = () => {
	if (logStatsIntervalId) {
		clearInterval(logStatsIntervalId);
	}
	fetchDashboardLogStats(); // Fetch immediately first
	logStatsIntervalId = window.setInterval(fetchDashboardLogStats, 5000); // Refresh every 5 seconds
};

const stopLogStatsInterval = () => {
	if (logStatsIntervalId) {
		clearInterval(logStatsIntervalId);
		logStatsIntervalId = null;
	}
};

// 批量设置 echarts resize
const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			state.myCharts[i].resize();
		}
	});
};

// 批量设置 echarts resize
const initEchartsResize = () => {
	window.addEventListener('resize', initEchartsResizeFun);
};

// 页面加载时
onMounted(() => {
	initPie(alarmTodayPieRef);
	// initBaseLinePie(5, 10, 15);
	initAlarmRiskTrendLine();
	initDashboardLogStatsLine();
	initEchartsResize();

	listDomainOptions().then(options => state.form.domainOptions = options);

	api.dashboardStats({ domain: state.form.domain } as DashboardStatsReq)
		.then(resp => resp.response)
		.then(data => {
			updateAlarmTodayPie({ 2: 10, 3: 9, 4: 33, 5: 9, });
		})
		.catch(err => alertApiError(err))
		.finally(() => updateAlarmTodayPie({ 2: 10, 3: 9, 4: 33, 5: 9, }));

	api.dashboardTrends({} as DashboardTrendsReq)
		.then(resp => resp.response)
		.then(data => {
			updateAlarmRiskTrendLine(['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'],
				[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		})
		.catch(err => alertApiError(err))
		.finally(() => {
			updateAlarmRiskTrendLine(['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'],
				[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		});

	startLogStatsInterval();
});

// 由于页面缓存原因，keep-alive
onActivated(() => {
	initEchartsResizeFun();
	startLogStatsInterval(); // Restart interval on activation
});

// 监听 pinia 中的 tagsview 开启全屏变化，重新 resize 图表，防止不出现/大小不变等
watch(
	() => isTagsViewCurrenFull.value,
	() => {
		initEchartsResizeFun();
	}
);

// Watch for domain changes
watch(
	() => state.form.domain,
	() => {
		// Re-fetch all domain-dependent data
		// TODO: Add calls for other charts/data that depend on domain
		fetchDashboardLogStats();
	}
);

// Watch for duration changes
watch(
	() => state.form.logStatsDuration,
	() => {
		fetchDashboardLogStats(); // Re-fetch only log stats data
	}
);

// Clear interval on unmount
onUnmounted(() => {
	stopLogStatsInterval();
});
</script>

<style scoped lang="scss">
@import '../chart/chart.scss';

.bug-title {
	font-size: 16px;
	color: #c88686;
}

.bug-value {
	font-size: 32px;
	margin-top: 10px;
}

.no-data-img {
	display: flex;
	justify-content: center;
	/* 水平居中 */
	align-items: center;
	/* 垂直居中 */
	height: 100%;
	/* 容器高度 */
}

.chart-main {
	height: 100%;
	padding-left: 15px;
}

.flex-item {
	padding: 0 15px 15px 0;
}

.flex-item-box {
	width: 100%;
	height: 100%;
	background: var(--el-color-white);
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 4px;
	transition: all ease 0.3s;
	display: flex;
	flex-direction: column;
	padding: 10px;

	&:hover {
		box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
		transition: all ease 0.3s;
	}

	.flex-title {
		margin-bottom: 15px;
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 20px;

		.flex-title-small {
			font-size: 16px;
		}
	}
}

.big-data-up {
	height: 55px;
	width: 100%;
	display: flex;
	align-items: center;
	padding: 0 15px;
	color: var(--el-color-primary);
	overflow: hidden;
	position: relative;

	.up-left {
		position: absolute;
		font-size: 16px;
	}

	.up-right {
		position: absolute;
		right: 30px;
	}

	.up-center {
		width: 100%;
		display: flex;
		justify-content: center;
		font-size: 18px;
		letter-spacing: 5px;
		background-image: -webkit-linear-gradient(left,
				var(--el-color-primary),
				var(--el-color-primary-light-3) 25%,
				var(--el-color-primary) 50%,
				var(--el-color-primary-light-3) 75%,
				var(--el-color-primary));
		-webkit-text-fill-color: transparent;
		-webkit-background-clip: text;
		background-clip: text;
		background-size: 200% 100%;
		-webkit-animation: masked-animation-data-v-b02d8052 4s linear infinite;
		animation: masked-animation-data-v-b02d8052 4s linear infinite;
		-webkit-box-reflect: below -2px -webkit-gradient(linear, left top, left bottom, from(transparent), to(hsla(0, 0%, 100%, 0.1)));
		position: relative;

		@keyframes masked-animation {
			0% {
				background-position: 0 0;
			}

			100% {
				background-position: -100% 0;
			}
		}

		position: relative;

		&::after {
			content: '';
			width: 250px;
			position: absolute;
			bottom: -15px;
			left: 50%;
			transform: translateX(-50%);
			border: 1px transparent solid;
			border-image: linear-gradient(to right, var(--el-color-primary-light-9), var(--el-color-primary)) 1 10;
		}

		span {
			cursor: pointer;
		}
	}
}
</style>
