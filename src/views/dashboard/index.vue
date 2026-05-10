<template>
	<div class="chart-warp dashboard-shell layout-pd" style="background: none">
		<div class="chart-warp-top dashboard-filter-bar">
			<div class="big-data-up mb15">
				<div class="up-left">
					<el-form :model="state.form" class="dashboard-filter-form" inline>
						<el-form-item>
							<el-select v-model="state.form.domain" class="dashboard-filter-select" :placeholder="T('allDomains')">
								<el-option :label="T('allDomains')" value="all" />
								<el-option v-for="opt in state.form.domainOptions" :key="opt.value" :value="opt.value"
									:label="opt.label" />
							</el-select>
						</el-form-item>
						<el-form-item>
							<el-select v-model="state.form.trendDurationDays" class="dashboard-filter-select" :placeholder="T('trendRange')">
								<el-option
									v-for="days in state.form.trendDurationOptions"
									:key="days"
									:label="trendDurationLabel(days)"
									:value="days"
								/>
							</el-select>
						</el-form-item>
					</el-form>
				</div>
				<div class="up-right">
				</div>
			</div>
		</div>
		<div class="chart-main">
			<el-row class="flex-item summary-row">
				<el-col :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">{{ T('summary') }}</div>
						<div style="height: 100%;">
							<el-row :gutter="20" style="padding-top: 10px;">
								<el-col :xs="24" :sm="12" :lg="6">
									<el-card class="metric-card">
										<el-icon class="summary-icon summary-icon--assets"><UserFilled /></el-icon>
										<el-row class="summary-title">{{ T('assets') }}</el-row>
										<el-row class="summary-detail">
											{{ T('users') }}: {{ state.asset.distribution.users }} |
											{{ T('computers') }}: {{ state.asset.distribution.computers }} |
											{{ T('groups') }}: {{ state.asset.distribution.groups }}
										</el-row>
										<el-row class="summary-value">{{ state.asset.total }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="12" :lg="6">
									<el-card class="metric-card">
										<el-icon class="summary-icon summary-icon--rules"><Tickets /></el-icon>
										<el-row class="summary-title">{{ T('rules') }}</el-row>
										<el-row class="summary-detail">
											{{ T('alertRules') }}: {{ state.rules.distribution.alert }} |
											{{ T('activityRules') }}: {{ state.rules.distribution.activity }}
										</el-row>
										<el-row class="summary-value">{{ state.rules.total }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="12" :lg="6">
									<el-card class="metric-card">
										<el-icon class="summary-icon summary-icon--agents"><Monitor /></el-icon>
										<el-row class="summary-title">{{ T('agents') }}</el-row>
										<el-row class="summary-detail">
											{{ T('domains') }}: {{ state.agent.distribution.domains }} |
											{{ T('sensors') }}: {{ state.agent.distribution.sensors }} |
											{{ T('dcs') }}: {{ state.agent.distribution.dcs }}
										</el-row>
										<el-row class="summary-value">{{ state.agent.total }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="12" :lg="6">
									<el-card class="metric-card">
										<el-icon class="summary-icon summary-icon--events"><Bell /></el-icon>
										<el-row class="summary-title">{{ T('events') }}</el-row>
										<el-row class="summary-detail">
											{{ T('alertEvents') }}: {{ state.event.distribution.events }} |
											{{ T('activities') }}: {{ state.event.distribution.activities }}
										</el-row>
										<el-row class="summary-value">{{ state.event.total }}</el-row>
									</el-card>
								</el-col>
							</el-row>
						</div>
					</div>
				</el-col>
			</el-row>
			<el-row class="flex-item">
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box">
						<el-row>
							<div class="flex-title">
								<span>{{ T('todayAlarmStats') }}</span>
							</div>
							<div class="flex-item dashboard-chart">
								<div ref="alarmTodayPieRef" style="min-width: 300px; min-height: 300px;"></div>
							</div>
						</el-row>
					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box" v-loading="state.topEventsToday.loading">
						<div class="flex-title">{{ T('topAlarmEventsToday') }}</div>
						<div v-if="state.topEventsToday.list.length" class="top-event-list">
							<div v-for="(item, index) in state.topEventsToday.list" :key="`${item.name}-${index}`" class="top-event-row">
								<span class="top-event-index">{{ index + 1 }}</span>
								<span class="top-event-name" :title="item.name">{{ item.name }}</span>
								<span class="top-event-total">{{ item.total }}{{ T('countUnit') }}</span>
							</div>
						</div>
						<div v-else class="no-data-img">
							<el-empty :description="T('noData')" />
						</div>
					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<el-row style="height: 100%;">
						<div class="flex-item-box" v-loading="state.majorEvents.loading">
							<div class="flex-title">{{ T('majorEventsLast30Days') }}</div>
							<div v-if="state.majorEvents.list.length" class="top-event-list">
								<div v-for="(item, index) in state.majorEvents.list" :key="`${item.name}-${index}`" class="top-event-row">
									<span class="top-event-index">{{ index + 1 }}</span>
									<span class="top-event-name" :title="item.name">{{ item.name }}</span>
									<span class="top-event-total">{{ item.total }}{{ T('countUnit') }}</span>
								</div>
							</div>
							<div v-else class="no-data-img">
								<el-empty :description="T('noData')" />
							</div>
						</div>
					</el-row>
				</el-col>
			</el-row>
			<el-row class="flex-item">
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>{{ T('alarmEventRiskTrend') }}</span>
						</div>
						<div class="flex-item dashboard-chart">
							<div ref="alarmRiskTrendLineRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>{{ T('logCollectionStats') }}</span>
							<el-form :model="state.form" style="width: 150px">
								<el-form-item>
									<el-select v-model="state.form.logStatsDuration" :placeholder="T('timeRange')">
										<el-option label="1 Hour" :value="1" />
										<el-option label="3 Hours" :value="3" />
										<el-option label="6 Hours" :value="6" />
										<el-option label="12 Hours" :value="12" />
										<el-option label="24 Hours" :value="24" />
									</el-select>
								</el-form-item>
							</el-form>
						</div>
						<div class="flex-item dashboard-chart">
							<div ref="dashboardLogStatsRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
			</el-row>
			<el-row class="flex-item">
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">{{ T('alertDispositionTrend') }}</div>
						<div class="flex-item dashboard-chart">
							<div ref="alertDispositionTrendBarRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
				<el-col :lg="12" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">{{ T('domainRiskRanking') }}</div>
						<div class="flex-item dashboard-chart">
							<div ref="domainRiskRankBarRef" style="width: 100%; min-height: 300px;"></div>
						</div>
					</div>
				</el-col>
			</el-row>
			<el-row class="flex-item">
				<el-col :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">{{ T('scanTaskTrend') }}</div>
						<div class="flex-item dashboard-chart">
							<div ref="scanTaskTrendBarRef" style="width: 100%; min-height: 320px;"></div>
						</div>
					</div>
				</el-col>
			</el-row>
			<el-row class="flex-item scan-row">
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">{{ T('latestVulnerabilityCount') }}</div>
						<div style="height: 100%;">
							<el-row :gutter="20" style="padding-top: 10px;">
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--high">
										<el-row class="bug-title">{{ T('highRiskVulnerabilities') }}</el-row>
										<el-row class="bug-value">{{ state.scan.leak.high }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--medium">
										<el-row class="bug-title">{{ T('mediumRiskVulnerabilities') }}</el-row>
										<el-row class="bug-value">{{ state.scan.leak.medium }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--low">
										<el-row class="bug-title">{{ T('lowRiskVulnerabilities') }}</el-row>
										<el-row class="bug-value">{{ state.scan.leak.low }}</el-row>
									</el-card>
								</el-col>
							</el-row>
						</div>
					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<div class="flex-item-box">
						<div class="flex-title">
							<span>{{ T('latestBaselineCount') }}</span>
						</div>
						<!-- <div style="width: 100%; height: 100%;" ref="baseLinePieRef"></div> -->
						<div style="height: 100%;">
							<el-row :gutter="20" style="padding-top: 10px;">
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--high">
										<el-row class="bug-title">{{ T('highRiskBaseline') }}</el-row>
										<el-row class="bug-value">{{ state.scan.baseline.high }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--medium">
										<el-row class="bug-title">{{ T('mediumRiskBaseline') }}</el-row>
										<el-row class="bug-value">{{ state.scan.baseline.medium }}</el-row>
									</el-card>
								</el-col>
								<el-col :xs="24" :sm="8">
									<el-card class="risk-card risk-card--low">
										<el-row class="bug-title">{{ T('lowRiskBaseline') }}</el-row>
										<el-row class="bug-value">{{ state.scan.baseline.low }}</el-row>
									</el-card>
								</el-col>
							</el-row>
						</div>

					</div>
				</el-col>
				<el-col :lg="8" :span="24" class="flex-item">
					<div style="width: 100%; height: 100%;" class="flex-item-box">
						<div class="flex-title">
							<span>{{ T('latestWeakPasswordHits') }}</span>
						</div>
						<el-row :gutter="20" style="padding-top: 10px;">
							<el-col :xs="24" :sm="12">
								<el-card class="risk-card risk-card--high">
									<el-row class="bug-title">{{ T('weakPasswordCount') }}</el-row>
									<el-row class="bug-value">{{ state.scan.weakpwd.total }}</el-row>
								</el-card>
							</el-col>
							<el-col :xs="24" :sm="12">
								<el-card class="risk-card risk-card--medium">
									<el-row class="bug-title">{{ T('comparedToPrevious') }}</el-row>
									<el-row class="bug-value" :class="state.scan.weakpwd.diff < 0 ? 'trend-down' : 'trend-up'">
										{{ state.scan.weakpwd.diff > 0 ? '+' : '' }}{{ state.scan.weakpwd.diff }}
									</el-row>
								</el-card>
							</el-col>
						</el-row>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts" name="dashboard">
import { reactive, onMounted, watch, nextTick, onActivated, ref, markRaw, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { Bell, Monitor, Tickets, UserFilled } from '@element-plus/icons-vue';
import { getLevelColor, OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { transDashboard as T } from '/@/utils/translator';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import { DashboardStatsReq, DashboardTrendsReq, DashboardLogStatsReq, ThreatTopsReq, ThreatTopsReply_Details } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { formatDate } from '/@/utils/formatTime';

const { t } = useI18n();

// Define reactive state and refs
const storesTagsViewRoutes = useTagsViewRoutes();
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
const trendDurationOptions = [30, 60, 90, 120];
const state = reactive({
	form: {
		domain: 'all',
		domainOptions: [] as OptionType[],
		trendDurationDays: trendDurationOptions[0],
		trendDurationOptions,
		logStatsDuration: 1,
	},
	alarm: {
		today: {
			value: '000000',
			speed: 600,
			criticalPie: null,
			hasData: false,
		}
	},
	scan: {
		leak: {
			high: 0,
			medium: 0,
			low: 0,
		},
		baseline: {
			high: 0,
			medium: 0,
			low: 0,
		},
		weakpwd: {
			total: 0,
			previous: 0,
			diff: 0,
		},
	},
	asset: {
		total: 0,
		distribution: {
			users: 0,
			computers: 0,
			groups: 0,
		},
	},
	rules: {
		total: 0,
		distribution: {
			alert: 0,
			activity: 0,
		},
	},
	agent: {
		total: 0,
		distribution: {
			domains: 0,
			sensors: 0,
			dcs: 0,
		},
	},
	event: {
		total: 0,
		distribution: {
			events: 0,
			activities: 0,
		},
	},
	topEventsToday: {
		list: [] as ThreatTopsReply_Details[],
		loading: false,
	},
	majorEvents: {
		list: [] as ThreatTopsReply_Details[],
		loading: false,
	},
	myCharts: [] as EmptyArrayType,
	global: {
		alarmPie: null,
		baseLinePie: null,
		alarmTrendLine: null,
		dashboardLogStatsLine: null,
		alertDispositionTrendBar: null,
		domainRiskRankBar: null,
		scanTaskTrendBar: null,
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
const alertDispositionTrendBarRef = ref()
const domainRiskRankBarRef = ref()
const scanTaskTrendBarRef = ref()

// Function definitions
const initECharts = (ec: any, ref: any, option: any) => {
	if (!state.global.dispose.some((b: any) => b === ec)) ec.dispose();
	ec = markRaw(echarts.init(ref.value, state.charts.theme));

	ec.setOption(option);
	state.myCharts.push(ec);
}

const getAlarmLevelMeta = (key: string) => {
	const normalizedKey = String(key).toLowerCase();
	const map: Record<string, { label: string; color: string }> = {
		high: { label: T('highRiskAlerts'), color: getLevelColor(5) },
		medium: { label: T('mediumRiskAlerts'), color: getLevelColor(3) },
		low: { label: T('lowRiskAlerts'), color: getLevelColor(2) },
	};
	if (map[normalizedKey]) return map[normalizedKey];

	const level = Number(key);
	return {
		label: Number.isFinite(level) ? t(`message.tableCommon.level.${level}`) : key,
		color: getLevelColor(level),
	};
};

const updateAlarmTodayPie = (data: any) => {
	if (!state.global.alarmPie) {
		return;
	}

	const pieData = Object.entries(data || {})
		.map(([key, value]) => {
			const total = Number(value || 0);
			const meta = getAlarmLevelMeta(key);
			return {
				value: total,
				name: meta.label,
				itemStyle: {
					color: meta.color,
				},
				label: {
					alignTo: 'edge',
					formatter: '{b}\n{c}',
					minMargin: 5,
					edgeDistance: 10,
					lineHeight: 15,
				},
			};
		})
		.filter(item => item.value > 0);

	state.alarm.today.hasData = pieData.length > 0;

	const option = {
		legend: {
			show: state.alarm.today.hasData,
			bottom: '0%',
			left: 'center',
		},
		graphic: state.alarm.today.hasData ? [] : [
			{
				type: 'text',
				left: 'center',
				top: 'middle',
				style: {
					text: T('noData'),
					fill: '#8a96a3',
					fontSize: 14,
					fontWeight: 700,
				},
			},
		],
		series: state.alarm.today.hasData ? [
			{
				name: T('todayAlarmStats'),
				type: 'pie',
				radius: ['40%', '70%'],
				data: pieData,
				avoidLabelOverlap: false,
				stillShowZeroSum: false,
				label: {
					show: state.alarm.today.hasData,
				},
			}
		] : [],
	};

	state.global.alarmPie.setOption(option, { replaceMerge: ['series', 'graphic'] });
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
			show: false,
			bottom: '0%',
			left: 'center'
		},
		graphic: [
			{
				type: 'text',
				left: 'center',
				top: 'middle',
				style: {
					text: T('noData'),
					fill: '#8a96a3',
					fontSize: 14,
					fontWeight: 700,
				},
			},
		],
		series: [],
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
				name: T('highRiskBaseline'),
				type: 'pie',
				radius, // Set the pie-chart radius
				left: xOffset[0],
				top: '-20%',
				data: [
					{ value: high, name: T('filledPortion') },
					{ value: total - high, name: T('remainingPortion') },
					// ... additional data fields
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
				name: T('mediumRiskBaseline'),
				type: 'pie',
				radius,
				left: xOffset[1],
				top: '-20%',
				data: [
					{ value: medium, name: T('filledPortion') },
					{ value: total - medium, name: T('remainingPortion') },
					// ... additional data fields
				],
				label: {
					show: false,
					position: 'center'
				},
				labelLine: {
					show: false
				},
				// ... other options
			},
			{
				name: T('lowRiskBaseline'),
				type: 'pie',
				radius,
				left: xOffset[2],
				top: '-20%',
				data: [
					{ value: low, name: T('filledPortion') },
					{ value: total - low, name: T('remainingPortion') },
					// ... additional data fields
				],
				label: {
					show: false,
					position: 'center'
				},
				labelLine: {
					show: false
				},
				// ... other options
			}
		],
		graphic: [ // Custom graphic element group
			{
				type: 'text',
				left: '7%',
				top: '80%',
				style: {
					text: T('highRiskBaseline'),
					textAlign: 'center',
					fill: '#333', // Text color
					fontSize: 14
				}
			},
			{
				type: 'text',
				top: '80%',
				left: '40%',
				style: {
					text: T('mediumRiskBaseline'),
					textAlign: 'center',
					fill: '#333', // Text color
					fontSize: 14
				}
			},
			{
				type: 'text',
				top: '80%',
				left: '74%',
				style: {
					text: T('lowRiskBaseline'),
					textAlign: 'center',
					fill: '#333', // Text color
					fontSize: 14
				}
			}
		],
	};

	state.global.baseLinePie.setOption(option);
	state.myCharts.push(state.global.baseLinePie);
}

const trendDurationLabel = (days: number) => T('latestDays', [days]);

const normalizeTrendDurationDays = (durationDays: number) => {
	return trendDurationOptions.includes(durationDays) ? durationDays : trendDurationOptions[0];
};

const buildDurationLabels = (durationDays: number) => {
	const normalizedDays = normalizeTrendDurationDays(durationDays);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = new Date(today);
	start.setDate(start.getDate() - normalizedDays + 1);
	return Array.from({ length: normalizedDays }, (_, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return formatDate(date, 'YYYY-mm-dd');
	});
};

const fitTrendData = (values: number[] | undefined, length: number) => Array.from({ length }, (_, index) => Number(values?.[index] || 0));

const updateAlarmRiskTrendLine = (xData: string[], trendData: { total?: number[]; high?: number[]; medium?: number[]; low?: number[] }) => {
	if (!state.global.alarmRiskTrendLine) {
		return;
	}

	const labels = xData.length ? xData : buildDurationLabels(Number(state.form.trendDurationDays));
	const seriesNames = {
		total: T('totalAlerts'),
		high: T('highRiskAlerts'),
		medium: T('mediumRiskAlerts'),
		low: T('lowRiskAlerts'),
	};
	const option = {
		legend: {
			top: 0,
			right: 0,
			data: Object.values(seriesNames),
		},
		grid: {
			top: 48,
			left: 42,
			right: 24,
			bottom: 32,
		},
		xAxis: { data: labels, axisLabel: { hideOverlap: true } },
		series: [
			{
				name: seriesNames.total,
				type: 'line',
				smooth: true,
				symbolSize: 6,
				data: fitTrendData(trendData.total, labels.length),
			},
			{
				name: seriesNames.high,
				type: 'line',
				smooth: true,
				symbolSize: 6,
				data: fitTrendData(trendData.high, labels.length),
			},
			{
				name: seriesNames.medium,
				type: 'line',
				smooth: true,
				symbolSize: 6,
				data: fitTrendData(trendData.medium, labels.length),
			},
			{
				name: seriesNames.low,
				type: 'line',
				smooth: true,
				symbolSize: 6,
				data: fitTrendData(trendData.low, labels.length),
			},
		],
	};

	state.global.alarmRiskTrendLine.setOption(option);
};

const initAlarmRiskTrendLine = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.alarmRiskTrendLine)) state.global.alarmRiskTrendLine.dispose();
	state.global.alarmRiskTrendLine = markRaw(echarts.init(alarmRiskTrendLineRef.value, state.charts.theme));

	const option = {
		// Configure the title
		title: {
			// text: 'Monthly data for 2024'
		},
		// Configure the tooltip
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			top: 0,
			right: 0,
			data: [T('totalAlerts'), T('highRiskAlerts'), T('mediumRiskAlerts'), T('lowRiskAlerts')],
		},
		grid: {
			top: 48,
			left: 42,
			right: 24,
			bottom: 32,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			axisLabel: { hideOverlap: true },
			// data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12']
			data: [],
		},
		// Configure the y-axis
		yAxis: {
			type: 'value'
		},
		// Configure the series list
		series: []
	};

	// initECharts(state.global.alarmRiskTrendLine, alarmRiskTrendLineRef, option);
	state.global.alarmRiskTrendLine.setOption(option);
	state.myCharts.push(state.global.alarmRiskTrendLine);
};

const updateAlertDispositionTrendBar = (labels: string[], data: { pending?: number[]; handled?: number[]; whitelisted?: number[]; blocked?: number[] }) => {
	if (!state.global.alertDispositionTrendBar) return;
	state.global.alertDispositionTrendBar.setOption({
		legend: { top: 0, right: 0 },
		grid: { top: 48, left: 42, right: 24, bottom: 32 },
		xAxis: { type: 'category', data: labels, axisLabel: { hideOverlap: true } },
		yAxis: { type: 'value' },
		series: [
			{ name: T('pendingAlerts'), type: 'bar', stack: 'status', data: fitTrendData(data.pending, labels.length) },
			{ name: T('handledAlerts'), type: 'bar', stack: 'status', data: fitTrendData(data.handled, labels.length) },
			{ name: T('whitelistedAlerts'), type: 'bar', stack: 'status', data: fitTrendData(data.whitelisted, labels.length) },
			{ name: T('blockedAlerts'), type: 'bar', stack: 'status', data: fitTrendData(data.blocked, labels.length) },
		],
	});
};

const initAlertDispositionTrendBar = () => {
	if (state.global.alertDispositionTrendBar && !state.global.dispose.some((b: any) => b === state.global.alertDispositionTrendBar)) {
		state.global.alertDispositionTrendBar.dispose();
	}
	state.global.alertDispositionTrendBar = markRaw(echarts.init(alertDispositionTrendBarRef.value, state.charts.theme));
	state.global.alertDispositionTrendBar.setOption({
		tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
		legend: { top: 0, right: 0 },
		grid: { top: 48, left: 42, right: 24, bottom: 32 },
		xAxis: { type: 'category', data: [], axisLabel: { hideOverlap: true } },
		yAxis: { type: 'value' },
		series: [],
	});
	state.myCharts.push(state.global.alertDispositionTrendBar);
};

const updateDomainRiskRankBar = (domains: string[], data: { alerts?: number[]; leaks?: number[]; baselines?: number[] }) => {
	if (!state.global.domainRiskRankBar) return;
	const labels = domains.length ? domains : [T('noData')];
	state.global.domainRiskRankBar.setOption({
		legend: { top: 0, right: 0 },
		grid: { top: 48, left: 110, right: 24, bottom: 32 },
		xAxis: { type: 'value' },
		yAxis: { type: 'category', data: labels },
		series: [
			{ name: T('highRiskAlerts'), type: 'bar', stack: 'risk', data: fitTrendData(data.alerts, labels.length) },
			{ name: T('highRiskVulnerabilitiesShort'), type: 'bar', stack: 'risk', data: fitTrendData(data.leaks, labels.length) },
			{ name: T('highRiskBaselinesShort'), type: 'bar', stack: 'risk', data: fitTrendData(data.baselines, labels.length) },
		],
	});
};

const initDomainRiskRankBar = () => {
	if (state.global.domainRiskRankBar && !state.global.dispose.some((b: any) => b === state.global.domainRiskRankBar)) {
		state.global.domainRiskRankBar.dispose();
	}
	state.global.domainRiskRankBar = markRaw(echarts.init(domainRiskRankBarRef.value, state.charts.theme));
	state.global.domainRiskRankBar.setOption({
		tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
		legend: { top: 0, right: 0 },
		grid: { top: 48, left: 110, right: 24, bottom: 32 },
		xAxis: { type: 'value' },
		yAxis: { type: 'category', data: [] },
		series: [],
	});
	state.myCharts.push(state.global.domainRiskRankBar);
};

const updateScanTaskTrendBar = (labels: string[], data: any) => {
	if (!state.global.scanTaskTrendBar) return;
	const series = [
		{ name: T('vulnerabilityFinished'), data: fitTrendData(data.leakFinished, labels.length) },
		{ name: T('vulnerabilityFailed'), data: fitTrendData(data.leakFailed, labels.length) },
		{ name: T('vulnerabilityHits'), data: fitTrendData(data.leakHits, labels.length) },
		{ name: T('baselineFinished'), data: fitTrendData(data.baselineFinished, labels.length) },
		{ name: T('baselineFailed'), data: fitTrendData(data.baselineFailed, labels.length) },
		{ name: T('baselineHits'), data: fitTrendData(data.baselineHits, labels.length) },
		{ name: T('weakpwdFinished'), data: fitTrendData(data.weakpwdFinished, labels.length) },
		{ name: T('weakpwdFailed'), data: fitTrendData(data.weakpwdFailed, labels.length) },
		{ name: T('weakpwdHits'), data: fitTrendData(data.weakpwdHits, labels.length) },
	].map(item => ({ name: item.name, type: 'bar', barMaxWidth: 14, data: item.data }));
	state.global.scanTaskTrendBar.setOption({
		legend: { type: 'scroll', top: 0, right: 0 },
		grid: { top: 72, left: 42, right: 24, bottom: 32 },
		xAxis: { type: 'category', data: labels, axisLabel: { hideOverlap: true } },
		yAxis: { type: 'value' },
		series,
	});
};

const initScanTaskTrendBar = () => {
	if (state.global.scanTaskTrendBar && !state.global.dispose.some((b: any) => b === state.global.scanTaskTrendBar)) {
		state.global.scanTaskTrendBar.dispose();
	}
	state.global.scanTaskTrendBar = markRaw(echarts.init(scanTaskTrendBarRef.value, state.charts.theme));
	state.global.scanTaskTrendBar.setOption({
		tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
		legend: { type: 'scroll', top: 0, right: 0 },
		grid: { top: 72, left: 42, right: 24, bottom: 32 },
		xAxis: { type: 'category', data: [], axisLabel: { hideOverlap: true } },
		yAxis: { type: 'value' },
		series: [],
	});
	state.myCharts.push(state.global.scanTaskTrendBar);
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

const fetchDashboardStats = () => {
	api.dashboardStats({ domain: state.form.domain } as DashboardStatsReq)
		.then(resp => resp.response)
		.then(data => {
			// Update alarm today pie chart with actual data
			if (data.alert) {
				updateAlarmTodayPie(data.alert);
			}

			// Update vulnerability counts
			if (data.leak) {
				state.scan.leak = {
					high: data.leak['high'] || 0,
					medium: data.leak['medium'] || 0,
					low: data.leak['low'] || 0,
				};
			}

			// Update baseline counts
			if (data.baseline) {
				state.scan.baseline = {
					high: data.baseline['high'] || 0,
					medium: data.baseline['medium'] || 0,
					low: data.baseline['low'] || 0,
				};
			}

			// Update weak password hits
			if (data.weakpwd) {
				const total = data.weakpwd.latest ?? data.weakpwd.total ?? 0;
				const previous = data.weakpwd.previous ?? 0;
				state.scan.weakpwd = {
					total,
					previous,
					diff: data.weakpwd.diff ?? total - previous,
				};
			}

			// Update asset distribution
			if (data.asset) {
				state.asset.distribution = {
					users: data.asset['users'] || 0,
					computers: data.asset['computers'] || 0,
					groups: data.asset['groups'] || 0,
				};
				state.asset.total = (data.asset['users'] || 0) +
				                     (data.asset['computers'] || 0) +
				                     (data.asset['groups'] || 0);
			}

			// Update rule distribution
			if (data.rule) {
				state.rules.distribution = {
					alert: data.rule['alert'] || 0,
					activity: data.rule['activity'] || 0,
				};
				state.rules.total = (data.rule['alert'] || 0) +
				                    (data.rule['activity'] || 0);
			}

			// Update agent distribution
			if (data.agent) {
				state.agent.distribution = {
					domains: data.agent['domains'] || 0,
					sensors: data.agent['sensors'] || 0,
					dcs: data.agent['dcs'] || 0,
				};
				state.agent.total = (data.agent['domains'] || 0) +
				                    (data.agent['sensors'] || 0) +
				                    (data.agent['dcs'] || 0);
			}

			// Update event distribution
			if (data.event) {
				state.event.distribution = {
					events: data.event['events'] || 0,
					activities: data.event['activities'] || 0,
				};
				state.event.total = (data.event['events'] || 0) +
				                    (data.event['activities'] || 0);
			}
		})
		.catch(err => alertApiError(err));
};

const fetchTopEventList = (duration: number, limit = 5) => {
	const req: ThreatTopsReq = {
		domain: state.form.domain,
		type: 'event',
		duration,
	};
	return api.threatTops(req)
		.then(resp => resp.response.list.slice(0, limit));
};

const fetchDashboardTopEvents = () => {
	state.topEventsToday.loading = true;
	fetchTopEventList(1)
		.then(list => state.topEventsToday.list = list)
		.catch(err => {
			state.topEventsToday.list = [];
			alertApiError(err);
		})
		.finally(() => state.topEventsToday.loading = false);

	state.majorEvents.loading = true;
	fetchTopEventList(30)
		.then(list => state.majorEvents.list = list)
		.catch(err => {
			state.majorEvents.list = [];
			alertApiError(err);
		})
		.finally(() => state.majorEvents.loading = false);
};

const fetchDashboardTrends = () => {
	const durationDays = normalizeTrendDurationDays(Number(state.form.trendDurationDays));
	const req: DashboardTrendsReq = {
		domain: state.form.domain,
		year: 0,
		durationDays,
	};

	api.dashboardTrends(req)
		.then(resp => resp.response)
		.then(data => {
			const labels = data.labels?.length ? data.labels : buildDurationLabels(durationDays);
			updateAlarmRiskTrendLine(labels, {
				total: data.total,
				high: data.high,
				medium: data.medium,
				low: data.low,
			});
			updateAlertDispositionTrendBar(labels, {
				pending: data.alertPending,
				handled: data.alertHandled,
				whitelisted: data.alertWhitelisted,
				blocked: data.alertBlocked,
			});
			updateDomainRiskRankBar(data.domainRiskDomains || [], {
				alerts: data.domainRiskHighAlerts,
				leaks: data.domainRiskHighLeaks,
				baselines: data.domainRiskHighBaselines,
			});
			updateScanTaskTrendBar(labels, {
				leakFinished: data.scanLeakFinished,
				leakFailed: data.scanLeakFailed,
				leakHits: data.scanLeakHits,
				baselineFinished: data.scanBaselineFinished,
				baselineFailed: data.scanBaselineFailed,
				baselineHits: data.scanBaselineHits,
				weakpwdFinished: data.scanWeakpwdFinished,
				weakpwdFailed: data.scanWeakpwdFailed,
				weakpwdHits: data.scanWeakpwdHits,
			});
		})
		.catch(err => {
			const labels = buildDurationLabels(durationDays);
			alertApiError(err);
			updateAlarmRiskTrendLine(labels, {});
			updateAlertDispositionTrendBar(labels, {});
			updateDomainRiskRankBar([], {});
			updateScanTaskTrendBar(labels, {});
		});
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

// Resize all ECharts instances
const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			state.myCharts[i].resize();
		}
	});
};

// Resize all ECharts instances
const initEchartsResize = () => {
	window.addEventListener('resize', initEchartsResizeFun);
};

// On mount
onMounted(() => {
	initPie(alarmTodayPieRef);
	// initBaseLinePie(5, 10, 15);
	initAlarmRiskTrendLine();
	initDashboardLogStatsLine();
	initAlertDispositionTrendBar();
	initDomainRiskRankBar();
	initScanTaskTrendBar();
	initEchartsResize();

	listDomainOptions().then(options => state.form.domainOptions = options);

	fetchDashboardStats();
	fetchDashboardTopEvents();
	fetchDashboardTrends();

	startLogStatsInterval();
});

// Because the page is cached via keep-alive
onActivated(() => {
	initEchartsResizeFun();
	startLogStatsInterval(); // Restart interval on activation
});

// Watch full-screen changes from Pinia and resize the charts so they render correctly
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
		fetchDashboardStats();
		fetchDashboardTopEvents();
		fetchDashboardTrends();
		fetchDashboardLogStats();
	}
);

// Watch for trend duration changes
watch(
	() => state.form.trendDurationDays,
	() => {
		fetchDashboardTrends();
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

.dashboard-shell {
	padding-top: 0 !important;
}

.dashboard-filter-bar {
	margin-bottom: 2px;
}

.dashboard-filter-form {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin: 0;
}

.dashboard-filter-form :deep(.el-form-item) {
	margin: 0;
}

.dashboard-filter-select {
	width: 200px;
}

.bug-title {
	font-size: 16px;
	color: var(--ada-muted);
	font-weight: 800;
}

.bug-value {
	font-size: 30px;
	margin-top: 10px;
	color: var(--ada-ink);
	font-weight: 800;
}

.asset-title {
	font-size: 16px;
	color: #67c23a;
}

.asset-value {
	font-size: 32px;
	margin-top: 10px;
}

.summary-title {
	font-size: 16px;
	color: var(--ada-primary);
	font-weight: 800;
}

.summary-detail {
	font-size: 12px;
	color: var(--ada-muted);
	margin-top: 8px;
	line-height: 1.5;
}

.summary-value {
	font-size: 30px;
	margin-top: 10px;
	color: var(--ada-ink);
	font-weight: 800;
}

.summary-row,
.scan-row {
	min-height: 220px;
}

.metric-card,
.risk-card {
	height: 100%;
	min-height: 118px;
}

.metric-card {
	position: relative;
	overflow: hidden;
	padding-right: 64px;
}

.summary-icon {
	position: absolute;
	right: 16px;
	bottom: 16px;
	width: 46px;
	height: 46px;
	border-radius: 50%;
	font-size: 22px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.summary-icon--assets {
	color: var(--ada-primary);
	background: rgba(22, 143, 122, 0.12);
}

.summary-icon--rules {
	color: #4f6eea;
	background: rgba(79, 110, 234, 0.12);
}

.summary-icon--agents {
	color: var(--ada-warning);
	background: rgba(245, 184, 75, 0.14);
}

.summary-icon--events {
	color: var(--ada-danger);
	background: rgba(212, 87, 69, 0.12);
}

.risk-card {
	border-left: 3px solid var(--ada-primary) !important;
}

.risk-card--high {
	border-left-color: var(--ada-danger) !important;
}

.risk-card--medium {
	border-left-color: var(--ada-warning) !important;
}

.risk-card--low {
	border-left-color: var(--ada-success) !important;
}

.no-data-img {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	min-height: 260px;
}

.top-event-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding-top: 2px;
	min-height: 260px;
}

.top-event-row {
	display: grid;
	grid-template-columns: 28px minmax(0, 1fr) auto;
	align-items: center;
	column-gap: 10px;
	min-height: 36px;
	padding: 8px 10px;
	border: 1px solid rgba(220, 232, 229, 0.82);
	border-radius: 6px;
	background: rgba(248, 251, 250, 0.88);
}

.top-event-index {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: rgba(22, 143, 122, 0.12);
	color: var(--ada-primary);
	font-weight: 800;
}

.top-event-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ada-ink);
	font-weight: 700;
}

.top-event-total {
	color: var(--ada-muted);
	font-weight: 800;
	font-variant-numeric: tabular-nums;
}

.chart-main {
	height: 100%;
	padding-left: 0;
}

.chart-main > .el-row.flex-item {
	padding-right: 0;
}

.flex-item {
	padding: 0 12px 12px 0;
}

.chart-main > .el-row > .flex-item:last-child {
	padding-right: 0;
}

.flex-item-box {
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.96);
	border: 1px solid rgba(220, 232, 229, 0.88);
	border-radius: 8px;
	transition:
		transform 0.18s ease,
		box-shadow 0.18s ease,
		border-color 0.18s ease;
	display: flex;
	flex-direction: column;
	padding: 16px;

	&:hover {
		border-color: rgba(22, 143, 122, 0.28);
		box-shadow: 0 10px 24px rgba(31, 54, 61, 0.08);
	}

	.flex-title {
		margin-bottom: 15px;
		display: flex;
		justify-content: space-between;
		width: 100%;
		color: var(--ada-ink);
		font-size: 18px;
		font-weight: 800;

		.flex-title-small {
			font-size: 16px;
			color: var(--ada-muted);
			font-weight: 700;
		}
	}
}

.dashboard-chart {
	width: 100%;
	align-items: center;
	display: flex;
	justify-content: center;
}

.trend-up {
	color: var(--ada-primary);
	font-weight: 800;
}

.trend-down {
	color: var(--ada-danger);
	font-weight: 800;
}

.big-data-up {
	height: 64px;
	width: 100%;
	display: flex;
	align-items: center;
	padding: 0 18px;
	border: 1px solid rgba(220, 232, 229, 0.86);
	border-radius: 8px;
	color: var(--ada-primary);
	background:
		linear-gradient(135deg, rgba(22, 143, 122, 0.1), rgba(245, 184, 75, 0.08)),
		#ffffff;
	overflow: hidden;
	position: relative;

	.up-left {
		position: static;
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
		color: var(--ada-ink);
		font-size: 18px;
		font-weight: 800;
		letter-spacing: 0;
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
			border-image: linear-gradient(to right, rgba(22, 143, 122, 0.12), rgba(245, 184, 75, 0.42)) 1 10;
		}

		span {
			cursor: pointer;
		}
	}
}

@media (max-width: 768px) {
	.flex-item {
		padding-right: 0;
	}

	.big-data-up {
		height: auto;
		padding: 14px;
	}

	.dashboard-filter-select {
		width: 100%;
	}

	.dashboard-filter-form,
	.dashboard-filter-form :deep(.el-form-item) {
		width: 100%;
	}

	.big-data-up .up-left {
		width: 100%;

		.el-form {
			width: 100% !important;
		}
	}
}
</style>
