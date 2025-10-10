<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item>
                        <el-button size="default" type="primary" @click="handleAdd">{{ $t('message.risk.startScan')
                            }}</el-button>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.domain')">
                        <MultiSelector v-model:selected="state.req.domain" :options="state.domainOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.leak.subType')">
                        <MultiSelector v-model:selected="state.req.subType" :options="SubTypeOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.level.name')">
                        <MultiSelector v-model:selected="state.req.level" :options="LevelOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.updateTm')">
                        <el-date-picker size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.result')">
                        <MultiSelector v-model:selected="state.req.result" :options="ResultOptions" />
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content:right; align-items: flex-start; padding-top: 5px;">
                    <el-input size="default" v-model="state.req.search"
                        :placeholder="$t('message.risk.leak.searchPlaceholder')" style="width: 290px;"
                        :suffix-icon="Search" clearable></el-input>
                    <ExportButton type="leak" />
                </el-space>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.data" v-loading="state.loading" :border="true" row-class-name="pointer-cursor"
                    style="width: 100%">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="name" :label="$t('message.risk.leak.name')" />
                    <el-table-column prop="domain" :label="$t('message.tableCommon.domain')" />
                    <el-table-column prop="dcHostname" :label="$t('message.tableCommon.dcHostname')" />
                    <el-table-column prop="subType" :label="$t('message.risk.leak.subType')">
                        <template #default="props">
                            {{ $t(`message.risk.ruleConfig.leakDetailValue_${props.row.subType}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="level" :label="$t('message.tableCommon.level.name')">
                        <template #default="props">
                            {{ $t(`message.tableCommon.level.${props.row.level}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.risk.updateTm')">
                        <template #default="props">
                            {{ formatApiTime(props.row.updateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="result" :label="$t('message.risk.result')">
                        <template #default="props"><span
                                :class="props.row.result === 0 ? 'success-color' : 'failed-color'">{{
                                    $t(`message.risk.baseline.result_${props.row.result}`) }}</span></template>
                    </el-table-column>
                    <el-table-column :label="$t('message.tableCommon.operation')">
                        <template #default="scope">
                            <el-button size="large" text type="primary" @click="handleDetail(scope.row)">{{
                                $t('message.tableCommon.detail') }}</el-button>
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
                    :page-sizes="[10, 20, 30, 40, 50]"
                    :layout='state.exhausted ? "sizes, prev, jumper" : "sizes, prev, next, jumper"' :total="400"
                    @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
            <DetailDrawer ref="DetailDrawerRef" />
            <AddDrawer ref="AddDrawerRef" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { ListLeakReply, ListLeakReply_Details, ListLeakReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { listDomainOptions, recheckTask } from '/@/api/grpc/method';
import { getLevelOptions, getRiskResultOptions } from '/@/utils/constant';
import { useI18n } from 'vue-i18n';
import { shortcuts } from '/@/utils/formatTime';
import { Search } from '@element-plus/icons-vue';
import { getLeakTypeOptions } from '../constant';
import { ElMessageBox } from 'element-plus';
import ExportButton from '/@/views/system/export/exportButton.vue';

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const DetailDrawerRef = ref();

const AddDrawer = defineAsyncComponent(() => import('./addDrawer.vue'));
const AddDrawerRef = ref();

const { t } = useI18n();

const SubTypeOptions = getLeakTypeOptions(t);
const LevelOptions = getLevelOptions(t);
const ResultOptions = getRiskResultOptions(t);

const timeRange = ref([] as string[]);

const state = reactive({
    loading: false,
    req: {
        pageIdx: 1,
        pageSize: 10,
        domain: [] as string[],
        subType: [] as string[],
        level: [] as number[],
        result: [1] as number[],
        search: '',
        startTm: '',
        endTm: '',
        orderUpdateTm: -1,
    } as ListLeakReq,
    data: [] as ListLeakReply_Details[],
    exhausted: false,
    domainOptions: [] as any[],
});

const handleAdd = () => {
    AddDrawerRef.value.open();
};

const handleDetail = (data: ListLeakReply_Details) => {
    DetailDrawerRef.value.open(data);
};

const handleScan = (data: ListLeakReply_Details) => {
    ElMessageBox.confirm(
        t('message.risk.leak.recheckTask'),
        t('message.dialog.prompt')
    )
    .then(() => {
        recheckTask(data.iD, 'leak', t);
    })
    .catch(err => {});
};

const refresh = () => {
    console.log('listLeak', state.req);

    state.loading = true;

    api.listLeak(state.req)
    .then(resp => resp.response)
    .then((data: ListLeakReply) => {
        state.data = data.list;
        state.exhausted = data.exhausted;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(() => state.req, () => {
    refresh();
}, { deep: true });

watch(timeRange, (val) => {
    if (val && val.length === 2) {
        state.req.startTm = formatApiTime(val[0]);
        state.req.endTm = formatApiTime(val[1]);
    }
});

onMounted(() => {
    refresh();
    listDomainOptions().then(v => state.domainOptions = v);
});
</script>

<style>
.el-form--inline .el-form-item {
    margin-right: 10px;
}
</style>