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
                        <el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.leak.selectDomain')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in state.domainOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.leak.subType')">
                        <el-select v-model="state.req.subType" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.leak.selectSubType')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="subTypeCheckAll" :indeterminate="subTypeIndeterminate" @change="handleSubTypeCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in SubTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.level.name')">
                        <el-select v-model="state.req.level" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.leak.selectLevel')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="levelCheckAll" :indeterminate="levelIndeterminate" @change="handleLevelCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in LevelOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.updateTm')">
                        <el-date-picker size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.result')">
                        <el-select v-model="state.req.result" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.leak.selectResult')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="resultCheckAll" :indeterminate="resultIndeterminate" @change="handleResultCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in ResultOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
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
                    <el-table-column type="index" width="80" :label="$t('message.tableCommon.index')" />
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
                    <el-table-column :label="$t('message.tableCommon.operation')" width="160" fixed="right" align="center">
                        <template #default="scope">
                            <el-button size="small" @click="handleDetail(scope.row)">{{
                                $t('message.tableCommon.detail') }}</el-button>
                            <el-button size="small" @click="handleScan(scope.row)">{{
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

const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const DetailDrawerRef = ref();

const AddDrawer = defineAsyncComponent(() => import('./addDrawer.vue'));
const AddDrawerRef = ref();

const { t } = useI18n();

const SubTypeOptions = getLeakTypeOptions(t);
const LevelOptions = getLevelOptions(t);
const ResultOptions = getRiskResultOptions(t);

const timeRange = ref([] as string[]);

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const subTypeCheckAll = ref(false);
const subTypeIndeterminate = ref(false);
const levelCheckAll = ref(false);
const levelIndeterminate = ref(false);
const resultCheckAll = ref(false);
const resultIndeterminate = ref(false);

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

// Handle domain Select All
const handleDomainCheckAll = (val: boolean) => {
    domainIndeterminate.value = false;
    if (val) {
        state.req.domain = state.domainOptions.map(opt => opt.value);
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
        state.req.result = ResultOptions.map(opt => opt.value);
    } else {
        state.req.result = [];
    }
};

// Watch individual filter properties
watch(() => state.req.domain, (val) => {
    domainIndeterminate.value = false;
    if (val.length === 0) {
        domainCheckAll.value = false;
    } else if (val.length === state.domainOptions.length) {
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
    } else if (val.length === ResultOptions.length) {
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

watch(timeRange, (val) => {
    if (val && val.length === 2) {
        state.req.startTm = formatApiTime(val[0]);
        state.req.endTm = formatApiTime(val[1]);
    }
    state.req.pageIdx = 1;
    refresh();
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