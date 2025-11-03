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
                        <el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.baseline.selectDomain')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in state.domains" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.baseline.subType')">
                        <el-select v-model="state.req.subType" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.baseline.selectSubType')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="subTypeCheckAll" :indeterminate="subTypeIndeterminate" @change="handleSubTypeCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in SubTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.level.name')">
                        <el-select v-model="state.req.level" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.baseline.selectLevel')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="levelCheckAll" :indeterminate="levelIndeterminate" @change="handleLevelCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in LevelOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.baseline.result')">
                        <el-select v-model="state.req.result" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.baseline.selectResult')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="resultCheckAll" :indeterminate="resultIndeterminate" @change="handleResultCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in ResultOpitions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="state.req.search" size="default" :placeholder="$t('message.risk.searchInput')"
                            style="width: 290px;" :suffix-icon="Search" clearable></el-input>
                    </el-form-item>
                    <el-form-item>
                        <ExportButton type="baseline" />
                    </el-form-item>
                </el-form>
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
import { getLevelOptions } from '/@/utils/constant';

const { t } = useI18n();

const detailDrawerRef = ref();
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const AddDrawerRef = ref();
const AddDrawer = defineAsyncComponent(() => import('./addDrawer.vue'));

const SubTypeOptions = getSubTypeOptions(t);
const LevelOptions = getLevelOptions(t);
const ResultOpitions = getResultOptions();

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const subTypeCheckAll = ref(false);
const subTypeIndeterminate = ref(false);
const levelCheckAll = ref(false);
const levelIndeterminate = ref(false);
const resultCheckAll = ref(false);
const resultIndeterminate = ref(false);

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

// Handle domain Select All
const handleDomainCheckAll = (val: boolean) => {
    domainIndeterminate.value = false;
    if (val) {
        state.req.domain = state.domains.map(opt => opt.value);
    } else {
        state.req.domain = [];
    }
};

// Handle subType Select All
const handleSubTypeCheckAll = (val: boolean) => {
    subTypeIndeterminate.value = false;
    if (val) {
        state.req.subType = SubTypeOptions.map(opt => opt.value);
    } else {
        state.req.subType = [];
    }
};

// Handle level Select All
const handleLevelCheckAll = (val: boolean) => {
    levelIndeterminate.value = false;
    if (val) {
        state.req.level = LevelOptions.map(opt => opt.value);
    } else {
        state.req.level = [];
    }
};

// Handle result Select All
const handleResultCheckAll = (val: boolean) => {
    resultIndeterminate.value = false;
    if (val) {
        state.req.result = ResultOpitions.map(opt => opt.value);
    } else {
        state.req.result = [];
    }
};

// Watch individual filter properties
watch(() => state.req.domain, (val) => {
    domainIndeterminate.value = false;
    if (val.length === 0) {
        domainCheckAll.value = false;
    } else if (val.length === state.domains.length) {
        domainCheckAll.value = true;
    } else {
        domainIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.subType, (val) => {
    subTypeIndeterminate.value = false;
    if (val.length === 0) {
        subTypeCheckAll.value = false;
    } else if (val.length === SubTypeOptions.length) {
        subTypeCheckAll.value = true;
    } else {
        subTypeIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.level, (val) => {
    levelIndeterminate.value = false;
    if (val.length === 0) {
        levelCheckAll.value = false;
    } else if (val.length === LevelOptions.length) {
        levelCheckAll.value = true;
    } else {
        levelIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.result, (val) => {
    resultIndeterminate.value = false;
    if (val.length === 0) {
        resultCheckAll.value = false;
    } else if (val.length === ResultOpitions.length) {
        resultCheckAll.value = true;
    } else {
        resultIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.search, () => {
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.pageIdx, () => {
    refresh();
});

watch(() => state.req.pageSize, () => {
    refresh();
});

onMounted(async () => {
    refresh();
    state.domains = await listDomainOptions();
});
</script>