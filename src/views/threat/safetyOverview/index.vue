<template>
    <div class="layout-pd">

        <div class="table-filter-row table-filter-row--compact safety-overview-filter">
        <el-form size="default" :inline="true" class="filter-form">
            <el-form-item>
                <el-select v-model="state.req.duration" style="width: 120px">
                    <el-option v-for="opt in dayOptions" :label="opt.label" :key="opt.value"
                        :value="opt.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="state.req.domain" :placeholder="$t('message.tableCommon.allDomain')" style="width: 140px">
                    <el-option v-for="domain in domainOptions" :label="domain.label" :key="domain.value"
                        :value="domain.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        </div>
        <el-row :gutter="10">
            <el-col :span="24" :lg="12">
                <el-card shadow="hover" class="topThreatCard">
                    <el-row>
                        <span class="topThreatTitle">{{ $t('message.threat.safetyOverview.topEvent') }}</span>
                    </el-row>
                    <el-divider></el-divider>
                    <el-row :gutter="10" v-for="(reply, i) in state.eventReply.list" class="topThreatData">
                        <el-col :span="2" class="topThreatDataIndex">{{ i + 1 }}</el-col>
                        <el-col :span="20">{{ reply.name }}</el-col>
                        <el-col :span="2" class="topThreatDataTotal">{{ reply.total }}</el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24" :lg="12">
                <el-card shadow="hover" class="topThreatCard">
                    <el-row>
                        <span class="topThreatTitle">{{ $t('message.threat.safetyOverview.topActivity') }}</span>
                    </el-row>
                    <el-divider></el-divider>
                    <el-row :gutter="10" v-for="(reply, i) in state.activityReply.list" class="topThreatData">
                        <el-col :span="2" class="topThreatDataIndex">{{ i + 1 }}</el-col>
                        <el-col :span="20">{{ reply.name }}</el-col>
                        <el-col :span="2" class="topThreatDataTotal">{{ reply.total }}</el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
            <el-card shadow="hover" style="width: 100%">
                <el-row>
                    <span class="topThreatTitle">{{ $t('message.threat.safetyOverview.trendTitle') }}</span>
                </el-row>
                <el-divider></el-divider>
                <TrendChart :x-axis="state.trendsChart.xAxis" :series="state.trendsChart.series" />
            </el-card>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, defineAsyncComponent, ref, watch } from 'vue';
import { ThreatTopsReply, ThreatTopsReq, ThreatTrendsReply, ThreatTrendsReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { OptionType, getSafetyOverviewDayOptions } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';

const { t } = useI18n();

const TrendChart = defineAsyncComponent(() => import('./chart.vue'));

const domainOptions = ref<OptionType[]>([]);
const dayOptions = getSafetyOverviewDayOptions(t);

const state = reactive({
    req: {
        domain: 'all', // Required: `all` or `domainX`
        type: 'activity', // [(validator.field) = {regex: "activity|event"}]; // Required: `activity` or `event`
        duration: 30, // Required time range in days. Allowed values: 1, 7, or 30. Default: 7.
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
        series: [] as any[],
    }
});

const refresh = (req: ThreatTopsReq): Promise<ThreatTopsReply> => {
    return api.threatTops(req)
        .then(resp => resp.response);
};

const refreshActivity = () => {
    const req: ThreatTopsReq = {
        ...state.req,
        ['type']: 'activity',
    };

    state.activityLoading = true;

    refresh(req)
    .then(data => {
        state.activityReply = data;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.activityLoading = false);
};

const refreshEvent = () => {

    const req: ThreatTopsReq = {
        ...state.req,
        ['type']: 'event',
    };

    state.eventLoading = true;

    refresh(req)
    .then(data => {
        state.eventReply = data;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.eventLoading = false);
};


const refreshTrend = async (level: number) => {
    if (level < 2 || level > 5) {
        return;
    }

    const req: ThreatTrendsReq = {
        domain: state.req.domain,
        level: [level],
        duration: state.req.duration,
    };

    try {
        const data = await api.threatTrends(req).then(resp => resp.response);
        state.trends[`${level}`] = data;
    } catch (err) {
        alertApiError(err);
    }
};

const refreshAllTrend = async () => {
    let xAxis = [];
    state.trendsChart.series = [];
    state.trendsChart.xAxis = [];

    for (let i = 2; i <= 5; i++) {
        await refreshTrend(i);
        
        state.trends[`${i}`].list.forEach(v => {
            if (-1 === xAxis.findIndex(i => i === v.ts)) {
                xAxis = [...xAxis, v.ts];
            }
        });
    }

    state.trendsChart.xAxis = xAxis.sort((a, b) => a < b);
    for (let i = 2; i <= 5; i++) {
        let levelSeries = {
            name: t(`message.tableCommon.level.${i}`),
            type: 'line',
            data: state.trendsChart.xAxis.map(ts => {
                const found = state.trends[`${i}`].list.findIndex(v => ts === v.ts);
                return -1 === found ? 0 : state.trends[`${i}`].list[found].total;
            }),
        };
        state.trendsChart.series = [...state.trendsChart.series, levelSeries];
    }
}

watch(state.req, async () => {
    refreshActivity();
    refreshEvent();
    await refreshAllTrend();
}, { deep: true });

onMounted(async () => {
    refreshActivity();
    refreshEvent();
    await refreshAllTrend();
    listDomainOptions().then(data => domainOptions.value = [{ value: 'all', label: t('message.tableCommon.allDomain')}, ...data]);
});
</script>

<style>
.topThreatCard {
    height: 440px;
}

.topThreatTitle {
    font-size: 18px;
    border-left: 4px solid #006eff;
    padding-left: 10px;
}

.topThreatData {
    margin-top: 15px;
    font-size: 16px;
}

.topThreatDataIndex {
    font-weight: bold;
    text-align: center;
    font-family: 'Lato', sans-serif;
}

.topThreatDataTotal {
    text-align: left;
}

</style>
