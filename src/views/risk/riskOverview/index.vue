<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <div class="risk-overview-header mb15">
                <el-form inline size="default">
                    <el-form-item>
                        <el-select
                            v-model="domain"
                            :placeholder="$t('message.risk.overview.domainPlaceholder')"
                            :loading="domainLoading"
                            style="width: 200px"
                            @change="handleDomainChange"
                        >
                            <el-option
                                v-for="item in domainOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>

                </el-form>
            </div>
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <RiskChart
                        :text="$t('message.risk.overview.baselineText')"
                        :x-axis="baseline.xAxis"
                        :series="baseline.series"
                        :loading="baseline.loading"
                    />
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <RiskChart
                        :text="$t('message.risk.overview.leakText')"
                        :x-axis="leak.xAxis"
                        :series="leak.series"
                        :loading="leak.loading"
                    />
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { listDomainOptions, scanRiskStats } from '/@/api/grpc/method';
import type { scanRiskStatsReply } from '/@/api/grpc/ada';
import type { OptionType } from '/@/utils/constant';
import RiskChart from './chart.vue';

const { t } = useI18n();

// Domain selection state
const domain = ref('all');
const domainOptions = ref<OptionType[]>([]);
const domainLoading = ref(false);

// Chart data state with loading indicators
const baseline = reactive({
    xAxis: [] as string[],
    series: [] as { name: string; type: string; data: number[] }[],
    loading: false,
});

const leak = reactive({
    xAxis: [] as string[],
    series: [] as { name: string; type: string; data: number[] }[],
    loading: false,
});

/**
 * Transform API response to chart series format
 */
const transformToSeries = (data: scanRiskStatsReply | undefined) => {
    if (!data?.list?.length) {
        return [];
    }

    const riskList = data.list.map((v) => v.riskTotal);
    const normalList = data.list.map((v) => v.normalTotal);

    return [
        { name: t('message.risk.overview.risk'), type: 'bar', data: riskList },
        { name: t('message.risk.overview.normal'), type: 'bar', data: normalList },
    ];
};

/**
 * Extract xAxis labels from API response with i18n translation
 * For baseline: uses message.risk.baseline.{subType}
 * For leak: uses message.risk.ruleConfig.leakDetailValue_{subType}
 */
const extractBaselineXAxis = (data: scanRiskStatsReply | undefined): string[] => {
    return data?.list?.map((v) => t(`message.risk.baseline.${v.subType}`)) ?? [];
};

const extractLeakXAxis = (data: scanRiskStatsReply | undefined): string[] => {
    return data?.list?.map((v) => t(`message.risk.ruleConfig.leakDetailValue_${v.subType}`)) ?? [];
};

/**
 * Fetch baseline statistics
 */
const fetchBaselineStats = async () => {
    baseline.loading = true;
    try {
        const data = await scanRiskStats(domain.value, 'baseline');
        baseline.xAxis = extractBaselineXAxis(data);
        baseline.series = transformToSeries(data);
    } finally {
        baseline.loading = false;
    }
};

/**
 * Fetch leak statistics
 */
const fetchLeakStats = async () => {
    leak.loading = true;
    try {
        const data = await scanRiskStats(domain.value, 'leak');
        leak.xAxis = extractLeakXAxis(data);
        leak.series = transformToSeries(data);
    } finally {
        leak.loading = false;
    }
};

/**
 * Fetch domain options for dropdown
 */
const fetchDomainOptions = async () => {
    domainLoading.value = true;
    try {
        const data = await listDomainOptions();
        domainOptions.value = [
            { value: 'all', label: t('message.risk.overview.allDomain') },
            ...data,
        ];
    } finally {
        domainLoading.value = false;
    }
};

/**
 * Refresh all chart data - fetches baseline and leak stats in parallel
 */
const refresh = async () => {
    await Promise.all([fetchBaselineStats(), fetchLeakStats()]);
};

/**
 * Handle domain selection change
 */
const handleDomainChange = () => {
    refresh();
};

onMounted(async () => {
    // Fetch domain options and chart data in parallel for faster initial load
    await Promise.all([fetchDomainOptions(), refresh()]);
});
</script>

<style scoped>
.risk-overview-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.risk-overview-header :deep(.el-form-item) {
    margin-bottom: 0;
}
</style>
