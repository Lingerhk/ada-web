<template>
	<div class="layout-pd safety-overview-page">
		<div class="safety-toolbar">
			<div class="scope-summary">
				<el-icon><DataAnalysis /></el-icon>
				<span>{{ selectedDomainLabel }} / {{ activeDurationLabel }}</span>
			</div>
			<el-form size="default" :inline="true" class="filter-form safety-filter">
				<el-form-item :label="$t('message.threat.safetyOverview.timeRange')">
					<el-radio-group v-model="state.req.duration" class="duration-segments">
						<el-radio-button v-for="opt in dayOptions" :key="opt.value" :label="opt.value">
							{{ opt.label }}
						</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="$t('message.threat.safetyOverview.domainScope')">
					<el-select v-model="state.req.domain" :placeholder="$t('message.tableCommon.allDomain')" class="domain-select">
						<el-option v-for="domain in domainOptions" :label="domain.label" :key="domain.value" :value="domain.value" />
					</el-select>
				</el-form-item>
			</el-form>
		</div>

		<div class="metric-grid" v-loading="state.trendLoading || state.dashboardLoading">
			<div class="metric-tile metric-tile--primary">
				<div class="metric-icon"><el-icon><Bell /></el-icon></div>
				<div class="metric-content">
					<span class="metric-label">{{ $t('message.threat.safetyOverview.rangeAlerts') }}</span>
					<strong>{{ formatNumber(summary.totalAlerts) }}</strong>
					<span>{{ $t('message.threat.safetyOverview.rangeAlertsDesc', [activeDurationLabel]) }}</span>
				</div>
			</div>
			<div class="metric-tile metric-tile--danger">
				<div class="metric-icon"><el-icon><WarningFilled /></el-icon></div>
				<div class="metric-content">
					<span class="metric-label">{{ $t('message.threat.safetyOverview.severeAlerts') }}</span>
					<strong>{{ formatNumber(summary.severeAlerts) }}</strong>
					<span>{{ $t('message.threat.safetyOverview.severeAlertsDesc', [formatPercent(summary.severeRatio)]) }}</span>
				</div>
			</div>
			<div class="metric-tile metric-tile--warning">
				<div class="metric-icon"><el-icon><DataLine /></el-icon></div>
				<div class="metric-content">
					<span class="metric-label">{{ $t('message.threat.safetyOverview.activityHits') }}</span>
					<strong>{{ formatNumber(summary.activityHits) }}</strong>
					<span>{{ $t('message.threat.safetyOverview.topActivityScope') }}</span>
				</div>
			</div>
			<div class="metric-tile metric-tile--info">
				<div class="metric-icon"><el-icon><Monitor /></el-icon></div>
				<div class="metric-content">
					<span class="metric-label">{{ $t('message.threat.safetyOverview.monitoredSurface') }}</span>
					<strong>{{ formatNumber(summary.monitoredSurface) }}</strong>
					<span>{{ $t('message.threat.safetyOverview.monitoredSurfaceDesc', [dashboardValue('agent', 'domains'), dashboardValue('agent', 'dcs')]) }}</span>
				</div>
			</div>
		</div>

		<div class="context-grid">
			<section class="overview-panel severity-panel" v-loading="state.trendLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.threat.safetyOverview.severityMix') }}</h3>
						<span>{{ $t('message.threat.safetyOverview.severityMixDesc') }}</span>
					</div>
					<el-tag :type="summary.severeAlerts > 0 ? 'danger' : 'success'" effect="light">
						{{ summary.peakLevelLabel }}
					</el-tag>
				</div>
				<div class="severity-stack" :aria-label="$t('message.threat.safetyOverview.severityMix')">
					<div
						v-for="item in severityBreakdown"
						:key="item.level"
						class="severity-segment"
						:class="`severity-segment--${item.level}`"
						:style="{ width: `${item.percent}%` }"
					/>
				</div>
				<div class="severity-list">
					<div v-for="item in severityBreakdown" :key="item.level" class="severity-row">
						<span class="severity-dot" :style="{ background: item.color }"></span>
						<span>{{ item.label }}</span>
						<strong>{{ formatNumber(item.total) }}</strong>
					</div>
				</div>
			</section>

			<section class="overview-panel">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.threat.safetyOverview.identityCoverage') }}</h3>
						<span>{{ $t('message.threat.safetyOverview.identityCoverageDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><UserFilled /></el-icon>
				</div>
				<div class="mini-stat-grid">
					<div v-for="item in assetStats" :key="item.key" class="mini-stat">
						<span>{{ item.label }}</span>
						<strong>{{ formatNumber(item.value) }}</strong>
					</div>
				</div>
				<div class="coverage-line">
					<span>{{ $t('message.threat.safetyOverview.detectionRules') }}</span>
					<strong>{{ formatNumber(summary.ruleCoverage) }}</strong>
				</div>
				<div class="coverage-line coverage-line--muted">
					<span>{{ $t('message.threat.safetyOverview.ruleSplit', [dashboardValue('rule', 'alert'), dashboardValue('rule', 'activity')]) }}</span>
				</div>
			</section>

			<section class="overview-panel">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.threat.safetyOverview.riskSignals') }}</h3>
						<span>{{ $t('message.threat.safetyOverview.riskSignalsDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><Tickets /></el-icon>
				</div>
				<div class="risk-signal-list">
					<div v-for="item in riskSignals" :key="item.key" class="risk-signal">
						<div>
							<span>{{ item.label }}</span>
							<small>{{ $t('message.threat.safetyOverview.highRiskCount', [formatNumber(item.high)]) }}</small>
						</div>
						<strong>{{ formatNumber(item.total) }}</strong>
					</div>
				</div>
			</section>
		</div>

		<div class="list-grid">
			<section class="overview-panel" v-loading="state.eventLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.threat.safetyOverview.topEvent') }}</h3>
						<span>{{ dominantEventText }}</span>
					</div>
					<el-icon class="panel-icon"><Histogram /></el-icon>
				</div>
				<div v-if="state.eventReply.list.length" class="top-threat-list">
					<div v-for="(reply, i) in state.eventReply.list" :key="`${reply.name}-${i}`" class="top-threat-row">
						<span class="top-threat-rank" :class="{ 'is-leading': i < 3 }">{{ i + 1 }}</span>
						<div class="top-threat-main">
							<span class="top-threat-name" :title="reply.name">{{ reply.name }}</span>
							<div class="top-threat-bar">
								<i :style="{ width: `${getPercent(reply.total, topEventMax)}%` }"></i>
							</div>
						</div>
						<strong>{{ formatNumber(reply.total) }}</strong>
					</div>
				</div>
				<el-empty v-else :description="$t('message.dashboard.noData')" />
			</section>

			<section class="overview-panel" v-loading="state.activityLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.threat.safetyOverview.topActivity') }}</h3>
						<span>{{ dominantActivityText }}</span>
					</div>
					<el-icon class="panel-icon"><TrendCharts /></el-icon>
				</div>
				<div v-if="state.activityReply.list.length" class="top-threat-list">
					<div v-for="(reply, i) in state.activityReply.list" :key="`${reply.name}-${i}`" class="top-threat-row">
						<span class="top-threat-rank" :class="{ 'is-leading': i < 3 }">{{ i + 1 }}</span>
						<div class="top-threat-main">
							<span class="top-threat-name" :title="reply.name">{{ reply.name }}</span>
							<div class="top-threat-bar top-threat-bar--activity">
								<i :style="{ width: `${getPercent(reply.total, topActivityMax)}%` }"></i>
							</div>
						</div>
						<strong>{{ formatNumber(reply.total) }}</strong>
					</div>
				</div>
				<el-empty v-else :description="$t('message.dashboard.noData')" />
			</section>
		</div>

		<section class="overview-panel trend-panel" v-loading="state.trendLoading">
			<div class="panel-header">
				<div>
					<h3>{{ $t('message.threat.safetyOverview.trendTitle') }}</h3>
					<span>{{ $t('message.threat.safetyOverview.trendDesc', [activeDurationLabel]) }}</span>
				</div>
				<el-tag effect="plain">{{ selectedDomainLabel }}</el-tag>
			</div>
			<TrendChart :x-axis="state.trendsChart.xAxis" :series="state.trendsChart.series" :loading="state.trendLoading" />
		</section>
	</div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { Bell, DataAnalysis, DataLine, Histogram, Monitor, Tickets, TrendCharts, UserFilled, WarningFilled } from '@element-plus/icons-vue';
import { DashboardStatsReply, DashboardStatsReq, ThreatTopsReply, ThreatTopsReq, ThreatTrendsReply, ThreatTrendsReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { OptionType, getLevelColor, getSafetyOverviewDayOptions } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';

type TrendSeries = {
	name: string;
	type: 'line';
	data: number[];
	smooth: boolean;
	symbolSize: number;
	lineStyle: {
		width: number;
	};
	areaStyle?: {
		opacity: number;
	};
};

const { t, locale } = useI18n();

const TrendChart = defineAsyncComponent(() => import('./chart.vue'));

const rawDomainOptions = ref<OptionType[]>([]);
const dayOptions = computed(() => getSafetyOverviewDayOptions(t));
const domainOptions = computed<OptionType[]>(() => [
	{ value: 'all', label: t('message.tableCommon.allDomain') },
	...rawDomainOptions.value,
]);

const createDashboardStats = (): DashboardStatsReply => ({
	agent: {},
	alert: {},
	baseline: {},
	leak: {},
	weakpwd: {},
	asset: {},
	rule: {},
	event: {},
});

const state = reactive({
	req: {
		domain: 'all',
		type: 'activity',
		duration: 30,
	} as ThreatTopsReq,

	activityReply: {
		list: [],
	} as ThreatTopsReply,
	activityLoading: false,

	eventReply: {
		list: [],
	} as ThreatTopsReply,
	eventLoading: false,

	trends: {
		'2': { list: [] } as ThreatTrendsReply,
		'3': { list: [] } as ThreatTrendsReply,
		'4': { list: [] } as ThreatTrendsReply,
		'5': { list: [] } as ThreatTrendsReply,
	},
	trendsChart: {
		xAxis: [] as number[],
		series: [] as TrendSeries[],
	},
	trendLoading: false,

	dashboardStats: createDashboardStats(),
	dashboardLoading: false,
});

const toNumber = (value: number | bigint | undefined | null): number => {
	if (typeof value === 'bigint') return Number(value);
	return Number(value || 0);
};

const dashboardValue = (section: keyof DashboardStatsReply, key: string): number => {
	const data = state.dashboardStats[section] as Record<string, number> | undefined;
	return Number(data?.[key] || 0);
};

const mapTotal = (section: keyof DashboardStatsReply): number => {
	const data = state.dashboardStats[section] as Record<string, number> | undefined;
	return Object.values(data || {}).reduce((total, value) => total + Number(value || 0), 0);
};

const listTotal = (list: { total: number }[]): number => list.reduce((total, item) => total + Number(item.total || 0), 0);

const formatNumber = (value: number): string => new Intl.NumberFormat().format(Number(value || 0));

const formatPercent = (value: number): string => `${Math.round(Number(value || 0) * 100)}%`;

const getPercent = (value: number, max: number): number => {
	if (!max) return 0;
	return Math.max(4, Math.round((Number(value || 0) / max) * 100));
};

const activeDurationLabel = computed(() => dayOptions.value.find(opt => opt.value === state.req.duration)?.label || '');

const selectedDomainLabel = computed(() => {
	const found = domainOptions.value.find(domain => domain.value === state.req.domain);
	return found?.label || t('message.tableCommon.allDomain');
});

const levelTotals = computed(() => {
	return [2, 3, 4, 5].reduce((ret, level) => {
		ret[level] = state.trends[`${level}`].list.reduce((total, item) => total + Number(item.total || 0), 0);
		return ret;
	}, {} as Record<number, number>);
});

const summary = computed(() => {
	const totalAlerts = Object.values(levelTotals.value).reduce((total, value) => total + value, 0);
	const severeAlerts = Number(levelTotals.value[4] || 0) + Number(levelTotals.value[5] || 0);
	const monitoredSurface = dashboardValue('agent', 'sensors') + dashboardValue('agent', 'dcs');
	const ruleCoverage = dashboardValue('rule', 'alert') + dashboardValue('rule', 'activity');
	const peakLevel = [5, 4, 3, 2].find(level => Number(levelTotals.value[level] || 0) > 0);

	return {
		totalAlerts,
		severeAlerts,
		severeRatio: totalAlerts ? severeAlerts / totalAlerts : 0,
		activityHits: listTotal(state.activityReply.list),
		monitoredSurface,
		ruleCoverage,
		peakLevelLabel: peakLevel ? t(`message.tableCommon.level.${peakLevel}`) : t('message.threat.safetyOverview.noRiskSignal'),
	};
});

const severityBreakdown = computed(() => {
	const total = summary.value.totalAlerts;
	return [5, 4, 3, 2].map(level => {
		const levelTotal = Number(levelTotals.value[level] || 0);
		return {
			level,
			label: t(`message.tableCommon.level.${level}`),
			total: levelTotal,
			percent: total ? Math.max(4, Math.round((levelTotal / total) * 100)) : 25,
			color: getLevelColor(level),
		};
	});
});

const assetStats = computed(() => [
	{ key: 'users', label: t('message.dashboard.users'), value: dashboardValue('asset', 'users') },
	{ key: 'computers', label: t('message.dashboard.computers'), value: dashboardValue('asset', 'computers') },
	{ key: 'groups', label: t('message.dashboard.groups'), value: dashboardValue('asset', 'groups') },
]);

const riskSignals = computed(() => [
	{
		key: 'leak',
		label: t('message.threat.safetyOverview.vulnerabilityFindings'),
		total: mapTotal('leak'),
		high: dashboardValue('leak', 'high'),
	},
	{
		key: 'baseline',
		label: t('message.threat.safetyOverview.baselineFindings'),
		total: mapTotal('baseline'),
		high: dashboardValue('baseline', 'high'),
	},
	{
		key: 'weakpwd',
		label: t('message.threat.safetyOverview.weakPasswordFindings'),
		total: dashboardValue('weakpwd', 'latest') || dashboardValue('weakpwd', 'total') || mapTotal('weakpwd'),
		high: dashboardValue('weakpwd', 'high') || dashboardValue('weakpwd', 'total') || dashboardValue('weakpwd', 'latest'),
	},
]);

const topEventMax = computed(() => Math.max(...state.eventReply.list.map(item => Number(item.total || 0)), 0));
const topActivityMax = computed(() => Math.max(...state.activityReply.list.map(item => Number(item.total || 0)), 0));

const dominantEventText = computed(() => {
	const item = state.eventReply.list[0];
	if (!item) return t('message.threat.safetyOverview.noDominantEvent');
	return t('message.threat.safetyOverview.dominantEvent', [item.name, formatNumber(item.total)]);
});

const dominantActivityText = computed(() => {
	const item = state.activityReply.list[0];
	if (!item) return t('message.threat.safetyOverview.noDominantActivity');
	return t('message.threat.safetyOverview.dominantActivity', [item.name, formatNumber(item.total)]);
});

const refresh = (req: ThreatTopsReq): Promise<ThreatTopsReply> => {
	return api.threatTops(req).then(resp => resp.response);
};

const refreshActivity = async () => {
	const req: ThreatTopsReq = {
		...state.req,
		type: 'activity',
	};

	state.activityLoading = true;
	try {
		state.activityReply = await refresh(req);
	} catch (err) {
		alertApiError(err);
	} finally {
		state.activityLoading = false;
	}
};

const refreshEvent = async () => {
	const req: ThreatTopsReq = {
		...state.req,
		type: 'event',
	};

	state.eventLoading = true;
	try {
		state.eventReply = await refresh(req);
	} catch (err) {
		alertApiError(err);
	} finally {
		state.eventLoading = false;
	}
};

const refreshTrend = async (level: number) => {
	const req: ThreatTrendsReq = {
		domain: state.req.domain,
		level: [level],
		duration: state.req.duration,
	};

	const data = await api.threatTrends(req).then(resp => resp.response);
	state.trends[`${level}`] = data;
	return data;
};

const rebuildTrendChart = () => {
	const xAxis = Array.from(new Set(
		[2, 3, 4, 5].flatMap(level => state.trends[`${level}`].list.map(item => toNumber(item.ts)))
	)).sort((a, b) => a - b);

	state.trendsChart.xAxis = xAxis;
	state.trendsChart.series = [2, 3, 4, 5].map(level => ({
		name: t(`message.tableCommon.level.${level}`),
		type: 'line',
		smooth: true,
		symbolSize: 6,
		lineStyle: {
			width: level >= 4 ? 3 : 2,
		},
		areaStyle: level >= 4 ? { opacity: 0.08 } : undefined,
		data: xAxis.map(ts => {
			const found = state.trends[`${level}`].list.find(item => toNumber(item.ts) === ts);
			return found ? Number(found.total || 0) : 0;
		}),
	}));
};

const refreshAllTrend = async () => {
	state.trendLoading = true;
	state.trendsChart.series = [];
	state.trendsChart.xAxis = [];

	try {
		await Promise.all([2, 3, 4, 5].map(level => refreshTrend(level)));
		rebuildTrendChart();
	} catch (err) {
		alertApiError(err);
	} finally {
		state.trendLoading = false;
	}
};

const refreshDashboardStats = async () => {
	state.dashboardLoading = true;
	const req: DashboardStatsReq = {
		domain: state.req.domain,
	};

	try {
		state.dashboardStats = await api.dashboardStats(req).then(resp => resp.response);
	} catch (err) {
		state.dashboardStats = createDashboardStats();
		alertApiError(err);
	} finally {
		state.dashboardLoading = false;
	}
};

const refreshAll = async () => {
	await Promise.all([
		refreshActivity(),
		refreshEvent(),
		refreshAllTrend(),
		refreshDashboardStats(),
	]);
};

watch(
	() => [state.req.domain, state.req.duration],
	() => {
		refreshAll();
	}
);

watch(
	() => locale.value,
	() => {
		rebuildTrendChart();
	}
);

onMounted(async () => {
	const data = await listDomainOptions();
	rawDomainOptions.value = data;
	await refreshAll();
});
</script>

<style scoped lang="scss">
.safety-overview-page {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.safety-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 18px;
	border: 1px solid rgba(220, 232, 229, 0.86);
	border-radius: 8px;
	background:
		linear-gradient(135deg, rgba(22, 143, 122, 0.1), rgba(245, 184, 75, 0.08)),
		#ffffff;
}

.scope-summary {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-width: 190px;
	color: var(--ada-primary);
	font-size: 14px;
	font-weight: 800;
}

.safety-filter {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 10px 0;

	:deep(.el-form-item) {
		margin: 0 0 0 10px;
	}
}

.domain-select {
	width: 180px;
}

.metric-grid,
.context-grid,
.list-grid {
	display: grid;
	gap: 14px;
}

.metric-grid {
	grid-template-columns: repeat(4, minmax(0, 1fr));
}

.context-grid {
	grid-template-columns: 1.1fr 1fr 1fr;
}

.list-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-tile,
.overview-panel {
	border: 1px solid rgba(220, 232, 229, 0.88);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 6px 18px rgba(31, 54, 61, 0.04);
}

.metric-tile {
	position: relative;
	display: grid;
	grid-template-columns: 48px minmax(0, 1fr);
	gap: 14px;
	min-height: 136px;
	padding: 18px;
	overflow: hidden;
}

.metric-tile::after {
	content: '';
	position: absolute;
	inset: auto 0 0 0;
	height: 3px;
	background: var(--ada-primary);
}

.metric-tile--danger::after {
	background: var(--ada-danger);
}

.metric-tile--warning::after {
	background: var(--ada-warning);
}

.metric-tile--info::after {
	background: var(--ada-info);
}

.metric-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	border-radius: 8px;
	color: var(--ada-primary);
	background: rgba(22, 143, 122, 0.12);
	font-size: 22px;
}

.metric-tile--danger .metric-icon {
	color: var(--ada-danger);
	background: rgba(217, 86, 86, 0.12);
}

.metric-tile--warning .metric-icon {
	color: var(--ada-warning);
	background: rgba(212, 154, 42, 0.14);
}

.metric-tile--info .metric-icon {
	color: var(--ada-info);
	background: rgba(59, 130, 196, 0.12);
}

.metric-content {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;

	.metric-label,
	span:last-child {
		color: var(--ada-muted);
		font-size: 13px;
		font-weight: 700;
		line-height: 1.35;
	}

	strong {
		color: var(--ada-ink);
		font-size: 32px;
		font-weight: 800;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}
}

.overview-panel {
	min-width: 0;
	padding: 16px;
}

.panel-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 14px;

	h3 {
		margin: 0;
		color: var(--ada-ink);
		font-size: 17px;
		font-weight: 800;
		line-height: 1.35;
	}

	span {
		display: block;
		margin-top: 4px;
		color: var(--ada-muted);
		font-size: 12px;
		line-height: 1.4;
	}
}

.panel-icon {
	flex: 0 0 auto;
	width: 34px;
	height: 34px;
	border-radius: 8px;
	color: var(--ada-primary);
	background: rgba(22, 143, 122, 0.1);
	font-size: 18px;
}

.severity-stack {
	display: flex;
	width: 100%;
	height: 12px;
	border-radius: 999px;
	overflow: hidden;
	background: #eef3f2;
}

.severity-segment {
	min-width: 4%;
}

.severity-segment--5 {
	background: #c5261e;
}

.severity-segment--4 {
	background: #ff8626;
}

.severity-segment--3 {
	background: #f7c131;
}

.severity-segment--2 {
	background: #1956af;
}

.severity-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px 14px;
	margin-top: 18px;
}

.severity-row {
	display: grid;
	grid-template-columns: 10px minmax(0, 1fr) auto;
	align-items: center;
	gap: 8px;
	min-width: 0;
	color: var(--ada-muted);
	font-size: 13px;
	font-weight: 700;

	span:nth-child(2) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	strong {
		color: var(--ada-ink);
		font-variant-numeric: tabular-nums;
	}
}

.severity-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}

.mini-stat-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10px;
}

.mini-stat {
	min-height: 76px;
	padding: 12px;
	border: 1px solid rgba(220, 232, 229, 0.78);
	border-radius: 6px;
	background: rgba(248, 251, 250, 0.88);

	span {
		color: var(--ada-muted);
		font-size: 12px;
		font-weight: 700;
	}

	strong {
		display: block;
		margin-top: 8px;
		color: var(--ada-ink);
		font-size: 24px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}
}

.coverage-line {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	margin-top: 12px;
	color: var(--ada-muted);
	font-size: 13px;
	font-weight: 700;

	strong {
		color: var(--ada-primary);
		font-size: 20px;
		font-weight: 800;
	}
}

.coverage-line--muted {
	justify-content: flex-start;
	margin-top: 6px;
	font-size: 12px;
	line-height: 1.4;
}

.risk-signal-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.risk-signal {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	min-height: 52px;
	padding: 10px 12px;
	border: 1px solid rgba(220, 232, 229, 0.78);
	border-radius: 6px;
	background: rgba(248, 251, 250, 0.88);

	span,
	small {
		display: block;
	}

	span {
		color: var(--ada-ink);
		font-size: 13px;
		font-weight: 800;
	}

	small {
		margin-top: 4px;
		color: var(--ada-muted);
		font-size: 12px;
	}

	strong {
		color: var(--ada-danger);
		font-size: 22px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}
}

.top-threat-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	min-height: 354px;
}

.top-threat-row {
	display: grid;
	grid-template-columns: 30px minmax(0, 1fr) auto;
	align-items: center;
	gap: 10px;
	min-height: 46px;
	padding: 8px 10px;
	border: 1px solid rgba(220, 232, 229, 0.8);
	border-radius: 6px;
	background: rgba(248, 251, 250, 0.88);

	strong {
		color: var(--ada-ink);
		font-size: 14px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}
}

.top-threat-rank {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	border-radius: 50%;
	color: var(--ada-primary);
	background: rgba(22, 143, 122, 0.12);
	font-size: 13px;
	font-weight: 800;
}

.top-threat-rank.is-leading {
	color: #ffffff;
	background: var(--ada-primary);
}

.top-threat-main {
	min-width: 0;
}

.top-threat-name {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ada-ink);
	font-size: 13px;
	font-weight: 800;
	line-height: 1.4;
}

.top-threat-bar {
	height: 5px;
	margin-top: 6px;
	border-radius: 999px;
	background: rgba(217, 86, 86, 0.1);
	overflow: hidden;

	i {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--ada-danger), var(--ada-warning));
	}
}

.top-threat-bar--activity {
	background: rgba(22, 143, 122, 0.1);

	i {
		background: linear-gradient(90deg, var(--ada-primary), var(--ada-info));
	}
}

.trend-panel {
	padding-bottom: 8px;
}

@media (max-width: 1280px) {
	.metric-grid,
	.context-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 900px) {
	.safety-toolbar,
	.safety-filter {
		align-items: stretch;
		flex-direction: column;
	}

	.scope-summary {
		min-width: 0;
	}

	.safety-filter {
		justify-content: flex-start;

		:deep(.el-form-item) {
			margin-left: 0;
			margin-right: 0;
		}
	}

	.domain-select {
		width: 100%;
	}

	.metric-grid,
	.context-grid,
	.list-grid {
		grid-template-columns: 1fr;
	}

	.duration-segments {
		width: 100%;
	}

	.duration-segments :deep(.el-radio-button) {
		flex: 1;
	}

	.duration-segments :deep(.el-radio-button__inner) {
		width: 100%;
	}
}

@media (max-width: 640px) {
	.metric-tile {
		grid-template-columns: 40px minmax(0, 1fr);
		min-height: 118px;
		padding: 14px;
	}

	.metric-icon {
		width: 40px;
		height: 40px;
	}

	.metric-content strong {
		font-size: 26px;
	}

	.mini-stat-grid,
	.severity-list {
		grid-template-columns: 1fr;
	}
}
</style>
