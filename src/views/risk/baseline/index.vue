<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true" class="filter-form">
                    <el-form-item>
                        <el-button size="default" type="primary" @click="handleAdd">{{ $t('message.risk.startScan')
                            }}</el-button>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.domain')">
                        <MultiSelector v-model:selected="state.req.domain" :options="state.domains" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.baseline.subType')">
                        <MultiSelector v-model:selected="state.req.subType" :options="SubTypeOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.levelName')">
                        <LeveLCheckbox v-model="state.req.level" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.baseline.result')">
                        <MultiSelector v-model:selected="state.req.result" :options="ResultOpitions" />
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content:right; align-items: flex-start; padding-top: 5px;">
                    <el-input v-model="state.req.search" size="default" :placeholder="$t('message.risk.searchInput')"
                        style="width: 290px;" :suffix-icon="Search" clearable></el-input>
                    <ExportButton type="baseline" />
                </el-space>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.data" v-loading="state.loading" :border="true" row-class-name="pointer-cursor"
                    style="width: 100%">
                    <el-table-column type="index" width="70" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="name" :label="$t('message.risk.baseline.name')" show-overflow-tooltip
                        min-width="300" />
                    <el-table-column prop="domain" :label="$t('message.tableCommon.domain')" />
                    <el-table-column prop="subType" :label="$t('message.risk.baseline.subType')">
                        <template #default="scope">{{
                            $t(`message.risk.baseline.${scope.row.subType}`) }}</template>
                    </el-table-column>
                    <el-table-column :label="$t('message.risk.baseline.level')" width="100">
                        <template #default="scope">{{
                            $t(`message.tableCommon.level.${scope.row.level}`) }}</template>
                    </el-table-column>
                    <el-table-column prop="entries" :label="$t('message.risk.baseline.entries')" width="100" />
                    <el-table-column prop="result" :label="$t('message.risk.baseline.result')">
                        <template #default="scope"><span
                                :class="scope.row.result === 0 ? 'success-color' : 'failed-color'">{{
                                $t(`message.risk.baseline.result_${scope.row.result}`) }}</span></template>
                    </el-table-column>
                    <el-table-column :label="$t('message.risk.updateTm')">
                        <template #default="scope">{{ formatApiTime(scope.row.updateTm) }}</template>
                    </el-table-column>
                    <el-table-column :label="$t('message.tableCommon.operation')">
                        <template #default="scope">
                            <el-button size="large" text type="primary" @click="handleDetail(scope.row)">{{
                                $t('message.tableCommon.detailShort') }}</el-button>
                            <el-button size="large" text type="primary" @click="handleScan(scope.row)">{{
                                $t('message.tableCommon.scanNow') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper" :total="state.total"
                    @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
            <DetailDrawer ref="detailDrawerRef" />
            <AddDrawer ref="AddDrawerRef" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch, defineAsyncComponent, ref } from 'vue';
import { ListBaselineReply, ListBaselineReply_Details, ListBaselineReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { Search } from '@element-plus/icons-vue';
import { formatApiTime } from '/@/utils/formatTime';
import { getResultOptions, getSubTypeOptions } from './constant';
import { useI18n } from 'vue-i18n';
import { listDomainOptions, recheckTask } from '/@/api/grpc/method';
import { ElMessageBox } from 'element-plus';
import ExportButton from '/@/views/system/export/exportButton.vue';
import LeveLCheckbox from '/@/components/level/checkbox.vue';

const { t } = useI18n();

const detailDrawerRef = ref();
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const AddDrawerRef = ref();
const AddDrawer = defineAsyncComponent(() => import('./addDrawer.vue'));
const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));

const SubTypeOptions = getSubTypeOptions(t);
const ResultOpitions = getResultOptions();

const handleAdd = () => {
    AddDrawerRef.value.open()
};

const handleScan = (data: ListBaselineReply_Details) => {
    ElMessageBox.confirm(
        t('message.risk.baseline.recheckTask'),
        t('message.dialog.prompt')
    )
    .then(() => {
        recheckTask(data.iD, 'baseline', t);
    })
    .catch(err => {});
};

const handleDetail = (data: ListBaselineReply_Details) => {
    detailDrawerRef.value.open(data);
};

const state = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        domain: [] as string[],
        subType: [] as string[],
        level: [] as number[],
        result: [] as number[],
        search: '',
        orderUpdateTm: -1,
    } as ListBaselineReq,
    data: [] as ListBaselineReply_Details[],
    loading: false,
    exhausted: false,
    total: 0,
    domains: [] as { label: string, value: string }[],
});

const refresh = () => {
    console.log("listBaseline", JSON.stringify(state.req));
    state.loading = true;

    api.listBaseline(state.req)
    .then(resp => resp.response)
    .then((data: ListBaselineReply) => {
        console.log(data);
        state.exhausted = data.exhausted;
        state.data = data.list;
        state.total = data.page?.total ?? 0;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(() => state.req, () => {
    refresh();
}, { deep: true });

onMounted(async () => {
    refresh();
    state.domains = await listDomainOptions();
});
</script>