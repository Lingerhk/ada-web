<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between" style="flex-wrap: nowrap;">
                <!-- Search controls -->
                <el-form :inline="true" class="filter-form" style="flex: 1;">
                    <el-form-item :label="$t('message.threat.levelName')">
                        <el-select v-model="threatLevel" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 130px" :placeholder="$t('message.threat.alarmList.selectLevel')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="levelCheckAll" :indeterminate="levelIndeterminate" @change="handleLevelCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in levelOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.dcHostname')">
                        <el-select v-model="dchostSelected" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.threat.activityList.selectDcHostname')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="dchostCheckAll" :indeterminate="dchostIndeterminate" @change="handleDchostCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in dchostOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.activityTitle')">
                        <el-select v-model="titleSelected" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.threat.activityList.selectTitle')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="titleCheckAll" :indeterminate="titleIndeterminate" @change="handleTitleCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in titleOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker size="default" v-model="lastOccurenceTime" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
                <!-- Actions on the right -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content: flex-end; align-items: flex-start; padding-top: 5px; flex-shrink: 0;">
                    <el-input v-model="idInput" size="default" :placeholder="$t('message.threat.idInput')"
                        style="width: 290px;" :suffix-icon="Search" clearable></el-input>
                    <el-button type="primary" size="default" @click="resetReqParams">{{
                        $t('message.threat.reset') }}</el-button>
                    <el-button type="primary" size="default" @click="refreshActivity">{{
                        $t('message.threat.refreshManually') }}</el-button>
                    <!-- <el-button type="primary" size="default">{{ $t('message.threat.print') }}</el-button> -->
                </el-space>
            </el-row>
            <!-- Result list below -->
            <el-row style="margin-top: 10px">
                <div style="width: 100%; overflow-x: auto;">
                    <el-table :data="data" v-loading="loading" :border="true" row-class-name="pointer-cursor"
                        style="width: 100%;" @row-click="handleRowClick" ref="activityTable">
                        <el-table-column type="expand" width="50">
                            <template #default="props">
                                <div class="json-viewer-wrapper">
                                    <JsonViewer :value="JSON.parse(props.row.rawLog)" copyable boxed sort></JsonViewer>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="title" :label="$t('message.threat.tableTitle.title')" :width="250" show-overflow-tooltip />
                    <el-table-column :label="$t('message.threat.tableTitle.createTm')" :width="160">
                        <template #default="scope">{{ formatApiTime(scope.row.createTm) }}</template>
                    </el-table-column>
                        <el-table-column prop="dcHostname" :label="$t('message.threat.tableTitle.dcHostname')" :width="200" />
                    <el-table-column :label="$t('message.threat.tableTitle.level')" :width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="getLevelType(scope.row.level)" effect="dark">
                                {{ $t(`message.threat.level.${scope.row.level}`) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="desc" :label="$t('message.threat.tableTitle.desc')" :width="300"
                        show-overflow-tooltip />
                    <el-table-column prop="fieldData" :label="$t('message.threat.tableTitle.fieldData')" :width="160">
                        <template #default="scope">
                            <el-space wrap size="small">
                                <el-tooltip v-for="key in filterFieldDataKey(scope.row.fieldData)" :key="key"
                                    class="box-item" effect="dark" :content="scope.row.fieldData[key]" placement="top">
                                    <el-tag size="small">{{ key }}</el-tag>
                                </el-tooltip>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.tags')" :width="120">
                        <template #default="scope">
                            <el-space wrap size="small">
                                <el-tag v-for="tag in scope.row.tags" size="small" :key="tag">{{ tag }}</el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ruleConfidence" :label="$t('message.threat.tableTitle.ruleConfidence')" :width="120" />
                </el-table>
                </div>
            </el-row>
            <!-- Pagination -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="pageIdx" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]"
                    :layout='exhausted ? "sizes, prev, pager, jumper" : "sizes, prev, pager, next, jumper"'
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import api from '/@/api/grpc';
import { ActivityDetails, ListActivityReply, ListActivityReq } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { Search } from '@element-plus/icons-vue';
import { listActivityOptions, listDchostOptions } from '/@/api/grpc/method';
import { getLevelOptions2 } from '/@/utils/constant';

const pageIdx = ref(1);
const pageSize = ref(10);
const total = ref(0);
const exhausted = ref(false);
const threatLevel = ref<number[]>([]);
const levelOptions = getLevelOptions2();
const lastOccurenceTime = ref<string[]>([]);
const idInput = ref('');

const dchostSelected = ref<string[]>([]);
const dchostOptions = ref<any[]>([]);

const titleSelected = ref<string[]>([]);
const titleOptions = ref<any[]>([]);

const loading = ref(false);
const data = ref([] as ActivityDetails[]);
const activityTable = ref();

// Checkbox states for "Check All"
const levelCheckAll = ref(false);
const levelIndeterminate = ref(false);
const dchostCheckAll = ref(false);
const dchostIndeterminate = ref(false);
const titleCheckAll = ref(false);
const titleIndeterminate = ref(false);

const filterFieldDataKey = (fieldData: Object) => {
    return Object.keys(fieldData).filter(key => key.toLowerCase() !== 'hostname');
}

const resetReqParams = () => {
    threatLevel.value = [];
    lastOccurenceTime.value = [];
};

const handleRowClick = (row: ActivityDetails) => {
    activityTable.value?.toggleRowExpansion(row);
};

const getLevelType = (level: number): string => {
    const typeMap: Record<number, string> = {
        1: 'info',
        2: 'success',
        3: 'warning',
        4: 'danger',
        5: 'danger',
    };
    return typeMap[level] || 'info';
};

const refreshActivity = () => {
    const req: ListActivityReq = {
        pageIdx: pageIdx.value,
        pageSize: pageSize.value,
        level: threatLevel.value, // Threat levels and severity
        iD: '', // Optional. If provided, query the threat activity that matches the given activity ID
        startTm: '', // Optional start time
        endTm: '', // Optional end time
        orderCreateTm: -1, // Optional sort order: 1 or -1
        dcHostname: dchostSelected.value,
        title: [],
    };

    loading.value = true;

    api.listActivity(req)
    .then(resp => resp.response)
    .then((reply: ListActivityReply) => {
        console.log(reply);
        exhausted.value = reply.exhausted;
        data.value = reply.list;
        total.value = reply.page?.total || total.value;
        pageIdx.value = reply.page?.pageIdx || pageIdx.value;
        pageSize.value = reply.page?.pageSize || pageSize.value;
    })
    .catch(err => alertApiError(err))
    .finally(() => loading.value = false);
};

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    refreshActivity();
};

const handleCurrentChange = (val: number) => {
    pageIdx.value = val;
    refreshActivity();
};

// Handle level Select All
const handleLevelCheckAll = (val: boolean) => {
    levelIndeterminate.value = false;
    if (val) {
        threatLevel.value = levelOptions.map(opt => opt.value);
    } else {
        threatLevel.value = [];
    }
};

// Handle dchost Select All
const handleDchostCheckAll = (val: boolean) => {
    dchostIndeterminate.value = false;
    if (val) {
        dchostSelected.value = dchostOptions.value.map(opt => opt.value);
    } else {
        dchostSelected.value = [];
    }
};

// Handle title Select All
const handleTitleCheckAll = (val: boolean) => {
    titleIndeterminate.value = false;
    if (val) {
        titleSelected.value = titleOptions.value.map(opt => opt.value);
    } else {
        titleSelected.value = [];
    }
};

onMounted(() => {
    refreshActivity();

    listDchostOptions().then(res => dchostOptions.value = res);
    listActivityOptions().then(res => titleOptions.value = res);
});

watch(threatLevel, (val) => {
    levelIndeterminate.value = false;
    if (val.length === 0) {
        levelCheckAll.value = false;
    } else if (val.length === levelOptions.length) {
        levelCheckAll.value = true;
    } else {
        levelIndeterminate.value = true;
    }
    refreshActivity();
});

watch(dchostSelected, (val) => {
    dchostIndeterminate.value = false;
    if (val.length === 0) {
        dchostCheckAll.value = false;
    } else if (val.length === dchostOptions.value.length) {
        dchostCheckAll.value = true;
    } else {
        dchostIndeterminate.value = true;
    }
    refreshActivity();
});

watch(titleSelected, (val) => {
    titleIndeterminate.value = false;
    if (val.length === 0) {
        titleCheckAll.value = false;
    } else if (val.length === titleOptions.value.length) {
        titleCheckAll.value = true;
    } else {
        titleIndeterminate.value = true;
    }
    refreshActivity();
});

watch(() => [lastOccurenceTime.value, idInput.value], refreshActivity);

</script>

<style lang="scss" scoped>
.json-viewer-wrapper {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin: 16px;
}
</style>
