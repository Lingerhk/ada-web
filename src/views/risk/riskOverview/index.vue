<template>
	<div class="layout-pd risk-overview-page">
		<div class="risk-toolbar">
			<div class="scope-summary">
				<el-icon><DataAnalysis /></el-icon>
				<span>{{ selectedDomainLabel }} / {{ $t('message.risk.overview.latestScanPosture') }}</span>
			</div>
			<el-form size="default" :inline="true" class="filter-form risk-filter">
				<el-form-item :label="$t('message.risk.overview.domainScope')">
					<el-select
						v-model="state.domain"
						:placeholder="$t('message.risk.overview.domainPlaceholder')"
						:loading="state.domainLoading"
						class="domain-select"
					>
						<el-option v-for="item in domainOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
			</el-form>
		</div>

		<div class="metric-grid" v-loading="state.statsLoading || state.riskStatsLoading">
			<div v-for="card in metricCards" :key="card.key" class="metric-tile" :class="`metric-tile--${card.tone}`">
				<div class="metric-icon">
					<el-icon><component :is="card.icon" /></el-icon>
				</div>
				<div class="metric-content">
					<span class="metric-label">{{ card.label }}</span>
					<strong>{{ card.value }}</strong>
					<span>{{ card.desc }}</span>
				</div>
			</div>
		</div>

		<div class="context-grid">
			<section class="overview-panel risk-mix-panel" v-loading="state.statsLoading || state.riskStatsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.exposureMix') }}</h3>
						<span>{{ $t('message.risk.overview.exposureMixDesc') }}</span>
					</div>
					<el-tag :type="postureTagType" effect="light">{{ postureLabel }}</el-tag>
				</div>
				<div class="exposure-stack" :aria-label="$t('message.risk.overview.exposureMix')">
					<div
						v-for="item in exposureBreakdown"
						:key="item.key"
						class="exposure-segment"
						:style="{ width: `${item.percent}%`, background: item.color }"
					/>
				</div>
				<div class="exposure-list">
					<div v-for="item in exposureBreakdown" :key="item.key" class="exposure-row">
						<span class="exposure-dot" :style="{ background: item.color }"></span>
						<span>{{ item.label }}</span>
						<strong>{{ formatNumber(item.value) }}</strong>
					</div>
				</div>
			</section>

			<section class="overview-panel" v-loading="state.trendLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.scanCoverage') }}</h3>
						<span>{{ $t('message.risk.overview.scanCoverageDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><Finished /></el-icon>
				</div>
				<div class="coverage-grid">
					<div class="coverage-item">
						<span>{{ $t('message.risk.overview.completedScans') }}</span>
						<strong>{{ formatNumber(scanCoverage.finished) }}</strong>
					</div>
					<div class="coverage-item">
						<span>{{ $t('message.risk.overview.failedScans') }}</span>
						<strong>{{ formatNumber(scanCoverage.failed) }}</strong>
					</div>
					<div class="coverage-item">
						<span>{{ $t('message.risk.overview.scanHits') }}</span>
						<strong>{{ formatNumber(scanCoverage.hits) }}</strong>
					</div>
				</div>
				<div class="coverage-line">
					<span>{{ $t('message.risk.overview.detectionCategories') }}</span>
					<strong>{{ detectionCategoryCount }}</strong>
				</div>
				<div class="coverage-line coverage-line--muted">
					<span>{{ $t('message.risk.overview.normalChecksDesc', [formatNumber(normalCheckTotal)]) }}</span>
				</div>
			</section>

			<section class="overview-panel" v-loading="state.riskStatsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.remediationFocus') }}</h3>
						<span>{{ $t('message.risk.overview.remediationFocusDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><Aim /></el-icon>
				</div>
				<div v-if="topRiskCategories.length" class="focus-list">
					<div v-for="item in topRiskCategories" :key="`${item.type}-${item.subType}`" class="focus-row">
						<div>
							<span>{{ item.label }}</span>
							<small>{{ item.sourceLabel }} - {{ $t('message.risk.overview.riskOfTotal', [formatPercent(item.ratio)]) }}</small>
						</div>
						<strong>{{ formatNumber(item.riskTotal) }}</strong>
					</div>
				</div>
				<el-empty v-else :description="$t('message.risk.overview.noRiskCategory')" />
			</section>
		</div>

		<div class="chart-grid">
			<section class="overview-panel" v-loading="state.riskStatsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.vulnerabilityByType') }}</h3>
						<span>{{ $t('message.risk.overview.vulnerabilityByTypeDesc') }}</span>
					</div>
					<el-icon class="panel-icon panel-icon--danger"><WarningFilled /></el-icon>
				</div>
				<RiskChart
					:x-axis="leakChart.xAxis"
					:series="leakChart.series"
					mode="stackedBar"
					:height="300"
					:colors="['#d95656', '#168f7a']"
					:loading="state.riskStatsLoading"
				/>
			</section>

			<section class="overview-panel" v-loading="state.riskStatsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.baselineByType') }}</h3>
						<span>{{ $t('message.risk.overview.baselineByTypeDesc') }}</span>
					</div>
					<el-icon class="panel-icon panel-icon--info"><Lock /></el-icon>
				</div>
				<RiskChart
					:x-axis="baselineChart.xAxis"
					:series="baselineChart.series"
					mode="stackedBar"
					:height="300"
					:colors="['#d95656', '#168f7a']"
					:loading="state.riskStatsLoading"
				/>
			</section>
		</div>

		<div class="chart-grid chart-grid--wide">
			<section class="overview-panel" v-loading="state.trendLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.scanTrend') }}</h3>
						<span>{{ $t('message.risk.overview.scanTrendDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><TrendCharts /></el-icon>
				</div>
				<RiskChart
					:x-axis="scanTrendChart.xAxis"
					:series="scanTrendChart.series"
					mode="line"
					:height="310"
					:colors="['#d95656', '#3b82c4', '#d49a2a']"
					:loading="state.trendLoading"
				/>
			</section>

			<section class="overview-panel" v-loading="state.trendLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.domainRiskRanking') }}</h3>
						<span>{{ $t('message.risk.overview.domainRiskRankingDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><Histogram /></el-icon>
				</div>
				<RiskChart
					:x-axis="domainRiskChart.xAxis"
					:series="domainRiskChart.series"
					mode="horizontalBar"
					:height="310"
					:colors="['#c5261e', '#d95656', '#3b82c4']"
					:loading="state.trendLoading"
				/>
			</section>
		</div>

		<div class="list-grid">
			<section class="overview-panel" v-loading="state.findingsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.latestFindings') }}</h3>
						<span>{{ $t('message.risk.overview.latestFindingsDesc') }}</span>
					</div>
					<el-icon class="panel-icon"><List /></el-icon>
				</div>
				<div v-if="latestFindings.length" class="finding-list">
					<div v-for="item in latestFindings" :key="`${item.source}-${item.id}`" class="finding-row">
						<div class="finding-main">
							<span class="finding-name" :title="item.name">{{ item.name }}</span>
							<small>{{ item.sourceLabel }} / {{ item.domain || '-' }} / {{ formatTime(item.updateTm) }}</small>
						</div>
						<el-tag :type="getLevelTag(item.level)" effect="light">{{ getLevelLabel(item.level) }}</el-tag>
					</div>
				</div>
				<el-empty v-else :description="$t('message.risk.overview.noFindings')" />
			</section>

			<section class="overview-panel" v-loading="state.findingsLoading">
				<div class="panel-header">
					<div>
						<h3>{{ $t('message.risk.overview.weakPasswordAccounts') }}</h3>
						<span>{{ $t('message.risk.overview.weakPasswordAccountsDesc') }}</span>
					</div>
					<el-icon class="panel-icon panel-icon--warning"><Key /></el-icon>
				</div>
				<div v-if="state.recentWeakpwd.length" class="weakpwd-list">
					<div v-for="item in state.recentWeakpwd" :key="item.iD" class="weakpwd-row">
						<div class="finding-main">
							<span class="finding-name" :title="item.username">{{ item.username || item.samName }}</span>
							<small>{{ item.samName || '-' }} / {{ item.domain || '-' }} / {{ formatTime(item.updateTm) }}</small>
						</div>
						<el-tag :type="item.locked ? 'info' : 'danger'" effect="light">
							{{ item.locked ? $t('message.risk.weakpwd.locked_1') : $t('message.risk.weakpwd.locked_0') }}
						</el-tag>
					</div>
				</div>
				<el-empty v-else :description="$t('message.risk.overview.noFindings')" />
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { Aim, DataAnalysis, Finished, Histogram, Key, List, Lock, TrendCharts, WarningFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import {
	DashboardStatsReply,
	DashboardStatsReq,
	DashboardTrendsReply,
	DashboardTrendsReq,
	ListBaselineReply_Details,
	ListBaselineReq,
	ListLeakReply_Details,
	ListLeakReq,
	ListWeakPwdReply_Details,
	ListWeakPwdReq,
	ScanRiskStatsReply,
	ScanRiskStatsReply_Details,
	ScanRiskStatsReq,
} from '/@/api/grpc/ada';
import { listDomainOptions } from '/@/api/grpc/method';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { OptionType, getLevelColor } from '/@/utils/constant';

type RiskSource = 'leak' | 'baseline';
type ChartSeries = {
	name: string;
	type?: string;
	data: number[];
	stack?: string;
	smooth?: boolean;
	showSymbol?: boolean;
	areaStyle?: Record<string, unknown>;
};
type FocusItem = ScanRiskStatsReply_Details & {
	type: RiskSource;
	label: string;
	sourceLabel: string;
	ratio: number;
};
type FindingItem = {
	id: string;
	source: RiskSource;
	sourceLabel: string;
	name: string;
	domain: string;
	level: number;
	updateTm: string;
};

const RiskChart = defineAsyncComponent(() => import('./chart.vue'));

const { t, te, locale } = useI18n();
const currentYear = new Date().getFullYear();

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

const createDashboardTrends = (): DashboardTrendsReply => ({
	labels: [],
	total: [],
	high: [],
	medium: [],
	low: [],
	alertPending: [],
	alertHandled: [],
	alertWhitelisted: [],
	alertBlocked: [],
	domainRiskDomains: [],
	domainRiskHighAlerts: [],
	domainRiskHighLeaks: [],
	domainRiskHighBaselines: [],
	scanLeakFinished: [],
	scanLeakFailed: [],
	scanLeakHits: [],
	scanBaselineFinished: [],
	scanBaselineFailed: [],
	scanBaselineHits: [],
	scanWeakpwdFinished: [],
	scanWeakpwdFailed: [],
	scanWeakpwdHits: [],
});

const rawDomainOptions = ref<OptionType[]>([]);
const state = reactive({
	domain: 'all',
	domainLoading: false,
	statsLoading: false,
	riskStatsLoading: false,
	trendLoading: false,
	findingsLoading: false,
	dashboardStats: createDashboardStats(),
	dashboardTrends: createDashboardTrends(),
	leakStats: { list: [] } as ScanRiskStatsReply,
	baselineStats: { list: [] } as ScanRiskStatsReply,
	recentLeaks: [] as ListLeakReply_Details[],
	recentBaselines: [] as ListBaselineReply_Details[],
	recentWeakpwd: [] as ListWeakPwdReply_Details[],
});

const domainOptions = computed<OptionType[]>(() => [
	{ value: 'all', label: t('message.risk.overview.allDomain') },
	...rawDomainOptions.value,
]);

const selectedDomainLabel = computed(() => {
	const found = domainOptions.value.find(item => item.value === state.domain);
	return found?.label || t('message.risk.overview.allDomain');
});

const listDomainFilter = computed(() => state.domain === 'all' ? [] : [state.domain]);

const formatNumber = (value: number): string => new Intl.NumberFormat().format(Number(value || 0));
const formatPercent = (value: number): string => `${Math.round(Number(value || 0) * 100)}%`;
const sum = (values: number[]): number => values.reduce((total, value) => total + Number(value || 0), 0);
const mapValue = (section: keyof DashboardStatsReply, key: string): number => Number((state.dashboardStats[section] as Record<string, number>)?.[key] || 0);
const sectionSeverityTotal = (section: 'leak' | 'baseline'): number => mapValue(section, 'high') + mapValue(section, 'medium') + mapValue(section, 'low');
const statsRiskTotal = (data: ScanRiskStatsReply): number => data.list.reduce((total, item) => total + Number(item.riskTotal || 0), 0);
const statsNormalTotal = (data: ScanRiskStatsReply): number => data.list.reduce((total, item) => total + Number(item.normalTotal || 0), 0);

const translateOrRaw = (key: string, fallback: string) => te(key) ? t(key) : fallback;
const getBaselineLabel = (subType: string) => translateOrRaw(`message.risk.baseline.${subType}`, subType);
const getLeakLabel = (subType: string) => translateOrRaw(`message.risk.ruleConfig.leakDetailValue_${subType}`, subType);
const getLevelLabel = (level: number) => translateOrRaw(`message.tableCommon.level.${level}`, `${level}`);
const isEnglishLocale = computed(() => `${locale.value}`.toLowerCase().startsWith('en'));
const hasChineseText = (value: string) => /[\u4e00-\u9fff]/.test(value);
const humanizeKey = (value: string) => value
	.replace(/[_-]+/g, ' ')
	.replace(/\s+/g, ' ')
	.trim()
	.replace(/\b\w/g, char => char.toUpperCase());
const getFindingName = (name: string, subType: string, source: RiskSource) => {
	if (!isEnglishLocale.value || !hasChineseText(name)) return name || humanizeKey(subType);
	const translatedType = source === 'leak' ? getLeakLabel(subType) : getBaselineLabel(subType);
	return translatedType && !hasChineseText(translatedType) ? translatedType : humanizeKey(subType);
};
const getLevelTag = (level: number) => {
	if (level >= 5) return 'danger';
	if (level >= 4) return 'warning';
	if (level >= 3) return 'warning';
	return 'info';
};
const formatTime = (value: string) => value ? formatApiTime(value) : '-';

const leakRiskTotal = computed(() => statsRiskTotal(state.leakStats) || sectionSeverityTotal('leak'));
const baselineRiskTotal = computed(() => statsRiskTotal(state.baselineStats) || sectionSeverityTotal('baseline'));
const normalCheckTotal = computed(() => statsNormalTotal(state.leakStats) + statsNormalTotal(state.baselineStats));
const weakpwdLatest = computed(() => mapValue('weakpwd', 'latest') || mapValue('weakpwd', 'total'));
const weakpwdPrevious = computed(() => mapValue('weakpwd', 'previous'));
const weakpwdDiff = computed(() => mapValue('weakpwd', 'diff') || (weakpwdLatest.value - weakpwdPrevious.value));
const highRiskExposure = computed(() => mapValue('leak', 'high') + mapValue('baseline', 'high'));
const totalExposure = computed(() => leakRiskTotal.value + baselineRiskTotal.value + weakpwdLatest.value);
const assessedTotal = computed(() => leakRiskTotal.value + baselineRiskTotal.value + normalCheckTotal.value);
const riskRate = computed(() => assessedTotal.value ? (leakRiskTotal.value + baselineRiskTotal.value) / assessedTotal.value : 0);
const detectionCategoryCount = computed(() => state.leakStats.list.length + state.baselineStats.list.length);

const postureLabel = computed(() => {
	if (highRiskExposure.value > 0) return t('message.risk.overview.postureCritical');
	if (totalExposure.value > 0) return t('message.risk.overview.postureElevated');
	return t('message.risk.overview.postureStable');
});
const postureTagType = computed(() => {
	if (highRiskExposure.value > 0) return 'danger';
	if (totalExposure.value > 0) return 'warning';
	return 'success';
});

const weakpwdDiffText = computed(() => {
	const diff = weakpwdDiff.value;
	const sign = diff > 0 ? '+' : '';
	return t('message.risk.overview.weakPasswordHitsDesc', [`${sign}${formatNumber(diff)}`]);
});

const metricCards = computed(() => [
	{
		key: 'exposure',
		tone: 'primary',
		icon: WarningFilled,
		label: t('message.risk.overview.exposureFindings'),
		value: formatNumber(totalExposure.value),
		desc: t('message.risk.overview.exposureFindingsDesc', [formatNumber(leakRiskTotal.value), formatNumber(baselineRiskTotal.value)]),
	},
	{
		key: 'high',
		tone: 'danger',
		icon: Aim,
		label: t('message.risk.overview.highRiskExposure'),
		value: formatNumber(highRiskExposure.value),
		desc: t('message.risk.overview.highRiskExposureDesc', [formatNumber(mapValue('leak', 'high')), formatNumber(mapValue('baseline', 'high'))]),
	},
	{
		key: 'weakpwd',
		tone: 'warning',
		icon: Key,
		label: t('message.risk.overview.weakPasswordHits'),
		value: formatNumber(weakpwdLatest.value),
		desc: weakpwdDiffText.value,
	},
	{
		key: 'assessed',
		tone: 'info',
		icon: Lock,
		label: t('message.risk.overview.assessedObjects'),
		value: formatPercent(riskRate.value),
		desc: t('message.risk.overview.assessedObjectsDesc', [formatNumber(assessedTotal.value)]),
	},
]);

const exposureBreakdown = computed(() => {
	const items = [
		{ key: 'high', label: t('message.risk.overview.highExposure'), value: highRiskExposure.value, color: getLevelColor(5) },
		{ key: 'medium', label: t('message.risk.overview.mediumExposure'), value: mapValue('leak', 'medium') + mapValue('baseline', 'medium'), color: getLevelColor(3) },
		{ key: 'low', label: t('message.risk.overview.lowExposure'), value: mapValue('leak', 'low') + mapValue('baseline', 'low'), color: getLevelColor(2) },
		{ key: 'weakpwd', label: t('message.risk.overview.weakPasswordExposure'), value: weakpwdLatest.value, color: '#d49a2a' },
	];
	const total = items.reduce((ret, item) => ret + item.value, 0);
	return items.map(item => ({
		...item,
		percent: total ? Math.max(4, Math.round((item.value / total) * 100)) : 25,
	}));
});

const scanCoverage = computed(() => {
	const finished = sum(state.dashboardTrends.scanLeakFinished) + sum(state.dashboardTrends.scanBaselineFinished) + sum(state.dashboardTrends.scanWeakpwdFinished);
	const failed = sum(state.dashboardTrends.scanLeakFailed) + sum(state.dashboardTrends.scanBaselineFailed) + sum(state.dashboardTrends.scanWeakpwdFailed);
	const hits = sum(state.dashboardTrends.scanLeakHits) + sum(state.dashboardTrends.scanBaselineHits) + sum(state.dashboardTrends.scanWeakpwdHits);
	return { finished, failed, hits };
});

const topRiskCategories = computed<FocusItem[]>(() => {
	const leakItems = state.leakStats.list.map(item => ({
		...item,
		type: 'leak' as RiskSource,
		label: getLeakLabel(item.subType),
		sourceLabel: t('message.risk.overview.sourceVulnerability'),
		ratio: item.riskTotal + item.normalTotal ? item.riskTotal / (item.riskTotal + item.normalTotal) : 0,
	}));
	const baselineItems = state.baselineStats.list.map(item => ({
		...item,
		type: 'baseline' as RiskSource,
		label: getBaselineLabel(item.subType),
		sourceLabel: t('message.risk.overview.sourceBaseline'),
		ratio: item.riskTotal + item.normalTotal ? item.riskTotal / (item.riskTotal + item.normalTotal) : 0,
	}));
	return [...leakItems, ...baselineItems]
		.filter(item => Number(item.riskTotal || 0) > 0)
		.sort((a, b) => Number(b.riskTotal || 0) - Number(a.riskTotal || 0))
		.slice(0, 5);
});

const buildStatsChart = (data: ScanRiskStatsReply, labelResolver: (subType: string) => string) => ({
	xAxis: data.list.map(item => labelResolver(item.subType)),
	series: [
		{
			name: t('message.risk.overview.riskItems'),
			data: data.list.map(item => Number(item.riskTotal || 0)),
		},
		{
			name: t('message.risk.overview.normalItems'),
			data: data.list.map(item => Number(item.normalTotal || 0)),
		},
	] as ChartSeries[],
});

const leakChart = computed(() => buildStatsChart(state.leakStats, getLeakLabel));
const baselineChart = computed(() => buildStatsChart(state.baselineStats, getBaselineLabel));

const scanTrendChart = computed(() => ({
	xAxis: state.dashboardTrends.labels,
	series: [
		{ name: t('message.risk.overview.vulnerabilityHits'), data: state.dashboardTrends.scanLeakHits },
		{ name: t('message.risk.overview.baselineHits'), data: state.dashboardTrends.scanBaselineHits },
		{ name: t('message.risk.overview.weakPasswordHits'), data: state.dashboardTrends.scanWeakpwdHits },
	] as ChartSeries[],
}));

const domainRiskChart = computed(() => ({
	xAxis: state.dashboardTrends.domainRiskDomains,
	series: [
		{ name: t('message.risk.overview.alertRisk'), data: state.dashboardTrends.domainRiskHighAlerts },
		{ name: t('message.risk.overview.vulnerabilityRisk'), data: state.dashboardTrends.domainRiskHighLeaks },
		{ name: t('message.risk.overview.baselineRisk'), data: state.dashboardTrends.domainRiskHighBaselines },
	] as ChartSeries[],
}));

const latestFindings = computed<FindingItem[]>(() => {
	const leakItems = state.recentLeaks.map(item => ({
		id: item.iD,
		source: 'leak' as RiskSource,
		sourceLabel: t('message.risk.overview.sourceVulnerability'),
		name: getFindingName(item.name, item.subType, 'leak'),
		domain: item.domain,
		level: item.level,
		updateTm: item.updateTm,
	}));
	const baselineItems = state.recentBaselines.map(item => ({
		id: item.iD,
		source: 'baseline' as RiskSource,
		sourceLabel: t('message.risk.overview.sourceBaseline'),
		name: getFindingName(item.name, item.subType, 'baseline'),
		domain: item.domain,
		level: item.level,
		updateTm: item.updateTm,
	}));
	return [...leakItems, ...baselineItems]
		.sort((a, b) => Date.parse(b.updateTm || '') - Date.parse(a.updateTm || ''))
		.slice(0, 8);
});

const fetchDomainOptions = async () => {
	state.domainLoading = true;
	try {
		rawDomainOptions.value = await listDomainOptions();
	} catch (err) {
		alertApiError(err);
	} finally {
		state.domainLoading = false;
	}
};

const fetchRiskStats = async () => {
	state.riskStatsLoading = true;
	try {
		const [leakResp, baselineResp] = await Promise.all([
			api.scanRiskStats({ domain: state.domain, type: 'leak' } as ScanRiskStatsReq).then(resp => resp.response),
			api.scanRiskStats({ domain: state.domain, type: 'baseline' } as ScanRiskStatsReq).then(resp => resp.response),
		]);
		state.leakStats = leakResp;
		state.baselineStats = baselineResp;
	} catch (err) {
		state.leakStats = { list: [] };
		state.baselineStats = { list: [] };
		alertApiError(err);
	} finally {
		state.riskStatsLoading = false;
	}
};

const fetchDashboardStats = async () => {
	state.statsLoading = true;
	try {
		state.dashboardStats = await api.dashboardStats({ domain: state.domain } as DashboardStatsReq).then(resp => resp.response);
	} catch (err) {
		state.dashboardStats = createDashboardStats();
		alertApiError(err);
	} finally {
		state.statsLoading = false;
	}
};

const fetchDashboardTrends = async () => {
	state.trendLoading = true;
	try {
		state.dashboardTrends = await api.dashboardTrends({
			domain: state.domain,
			year: currentYear,
			durationDays: 0,
		} as DashboardTrendsReq).then(resp => resp.response);
	} catch (err) {
		state.dashboardTrends = createDashboardTrends();
		alertApiError(err);
	} finally {
		state.trendLoading = false;
	}
};

const fetchRecentFindings = async () => {
	state.findingsLoading = true;
	try {
		const [leakResp, baselineResp, weakpwdResp] = await Promise.all([
			api.listLeak({
				pageIdx: 1,
				pageSize: 6,
				domain: listDomainFilter.value,
				subType: [],
				level: [],
				result: [1],
				search: '',
				startTm: '',
				endTm: '',
				orderUpdateTm: -1,
			} as ListLeakReq).then(resp => resp.response),
			api.listBaseline({
				pageIdx: 1,
				pageSize: 6,
				domain: listDomainFilter.value,
				subType: [],
				level: [],
				result: [1],
				search: '',
				orderUpdateTm: -1,
			} as ListBaselineReq).then(resp => resp.response),
			api.listWeakPwd({
				pageIdx: 1,
				pageSize: 6,
				domain: listDomainFilter.value,
				locked: [],
				isPlain: false,
				search: '',
				orderUpdateTm: -1,
			} as ListWeakPwdReq).then(resp => resp.response),
		]);
		state.recentLeaks = leakResp.list;
		state.recentBaselines = baselineResp.list;
		state.recentWeakpwd = weakpwdResp.list;
	} catch (err) {
		state.recentLeaks = [];
		state.recentBaselines = [];
		state.recentWeakpwd = [];
		alertApiError(err);
	} finally {
		state.findingsLoading = false;
	}
};

const refresh = async () => {
	await Promise.all([
		fetchRiskStats(),
		fetchDashboardStats(),
		fetchDashboardTrends(),
		fetchRecentFindings(),
	]);
};

watch(
	() => state.domain,
	() => refresh()
);

onMounted(async () => {
	await Promise.all([fetchDomainOptions(), refresh()]);
});
</script>

<style scoped lang="scss">
.risk-overview-page {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.risk-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 18px;
	border: 1px solid rgba(220, 232, 229, 0.86);
	border-radius: 8px;
	background:
		linear-gradient(135deg, rgba(217, 86, 86, 0.08), rgba(59, 130, 196, 0.08)),
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

.risk-filter {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;

	:deep(.el-form-item) {
		margin: 0;
	}
}

.domain-select {
	width: 200px;
}

.metric-grid,
.context-grid,
.chart-grid,
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

.chart-grid,
.list-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-grid--wide {
	grid-template-columns: 1.25fr 1fr;
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
	min-height: 132px;
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

.metric-tile--danger .metric-icon,
.panel-icon--danger {
	color: var(--ada-danger);
	background: rgba(217, 86, 86, 0.12);
}

.metric-tile--warning .metric-icon,
.panel-icon--warning {
	color: var(--ada-warning);
	background: rgba(212, 154, 42, 0.14);
}

.metric-tile--info .metric-icon,
.panel-icon--info {
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

.exposure-stack {
	display: flex;
	width: 100%;
	height: 12px;
	border-radius: 999px;
	overflow: hidden;
	background: #eef3f2;
}

.exposure-segment {
	min-width: 4%;
}

.exposure-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px 14px;
	margin-top: 18px;
}

.exposure-row {
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

.exposure-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}

.coverage-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10px;
}

.coverage-item {
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
		font-size: 22px;
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

.focus-list,
.finding-list,
.weakpwd-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.focus-row,
.finding-row,
.weakpwd-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	min-height: 52px;
	padding: 10px 12px;
	border: 1px solid rgba(220, 232, 229, 0.78);
	border-radius: 6px;
	background: rgba(248, 251, 250, 0.88);
}

.focus-row {
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

.finding-main {
	min-width: 0;
}

.finding-name {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ada-ink);
	font-size: 13px;
	font-weight: 800;
	line-height: 1.4;
}

.finding-main small {
	display: block;
	margin-top: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ada-muted);
	font-size: 12px;
	line-height: 1.35;
}

@media (max-width: 1280px) {
	.metric-grid,
	.context-grid,
	.chart-grid--wide {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.context-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 900px) {
	.risk-toolbar,
	.risk-filter {
		align-items: stretch;
		flex-direction: column;
	}

	.domain-select {
		width: 100%;
	}

	.metric-grid,
	.chart-grid,
	.chart-grid--wide,
	.list-grid {
		grid-template-columns: 1fr;
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

	.coverage-grid,
	.exposure-list {
		grid-template-columns: 1fr;
	}
}
</style>
