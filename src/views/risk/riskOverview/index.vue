<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <div class="big-data-up mb15">
                <div class="up-left">
                    <el-form style="width: 200px" size="default">
                        <el-form-item>
                            <el-select v-model="domain" :placeholder="$t('message.risk.overview.domainPlaceholder')">
                                <el-option v-for="domain in domainOptions" :label="domain.label" :key="domain.value" :value="domain.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <el-row :gutter="5">
                <el-col :span="24" :lg="12">
                    <baselineChart :text="$t('message.risk.overview.baselineText')" :x-axis="baseline.xAxis"
                        :series="baseline.series" />
                </el-col>
                <el-col :span="24" :lg="12">
                    <baselineChart :text="$t('message.risk.overview.leakText')" :x-axis="leak.xAxis"
                        :series="leak.series" />
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue';
import { listDomainOptions, scanRiskStats } from '/@/api/grpc/method';
import { useI18n } from 'vue-i18n';
import { scanRiskStatsReply } from '/@/api/grpc/ada';
import { OptionType } from '/@/utils/constant';
import { watch } from 'vue';

const { t } = useI18n();

const baselineChart = defineAsyncComponent(() => import('./chart.vue'));

const domain = ref('all');
const domainOptions = ref<OptionType[]>([]);

const baseline = reactive({
    xAxis: [] as string[],
    series: [] as any[],
});

const leak = reactive({
    xAxis: [] as string[],
    series: [] as any[],
});

const getSeries = (data: scanRiskStatsReply) => {
    if (!data?.list) {
        return [];
    }

    const normalList = data?.list.map(v => v.normalTotal) ?? [];
    const riskList = data?.list.map(v => v.riskTotal) ?? [];
    return [
        { name: t('message.risk.overview.risk'), type: 'bar', data: riskList },
        { name: t('message.risk.overview.normal'), type: 'bar', data: normalList },
    ];
}

const refresh = () => {
    scanRiskStats(domain.value, 'baseline').then(data => {
        if (!data?.list) {
            return;
        }

        baseline.xAxis = data?.list.map(v => v.subTypeDesc) ?? [];
        baseline.series = getSeries(data);
    });

    scanRiskStats(domain.value, 'leak').then(data => {
        if (!data?.list) {
            return;
        }

        leak.xAxis = data?.list.map(v => v.subTypeDesc) ?? [];
        leak.series = getSeries(data);
    });
};

watch(domain, () => {
    refresh();
});

onMounted(() => {
    refresh();
    listDomainOptions().then(data => domainOptions.value = [{ value: 'all', label: t('message.risk.overview.allDomain')}, ...data]);
});
</script>