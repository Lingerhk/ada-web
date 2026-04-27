<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row class="table-filter-row">
                <!-- Search controls -->
                <el-form :inline="true">
                    <el-form-item :label="$t('message.risk.task.cycle')">
                        <el-select size="default" v-model="state.req.cycle" collapse-tags popper-class="custom-header"
                            :max-collapse-tags="1" style="width: 200px">
                            <el-option v-for="option in CycleOptions" :key="option.value" :value="option.value"
                                :label="option.label"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.task.type')">
                        <el-select size="default" v-model="state.req.type" collapse-tags popper-class="custom-header"
                            :max-collapse-tags="1" style="width: 200px">
                            <el-option v-for="option in RiekTypeOptions" :key="option.value" :value="option.value"
                                :label="option.label"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.task.status')">
                        <el-select size="default" v-model="state.req.status" collapse-tags popper-class="custom-header"
                            :max-collapse-tags="1" style="width: 200px">
                            <el-option v-for="option in StatusOptions" :key="option.value" :value="option.value"
                                :label="option.label"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.updateTm')">
                        <el-date-picker class="filter-date-range" size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- Result list below -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" :border="true" row-class-name="pointer-cursor" style="width: 100%">
                    <el-table-column type="index" width="80" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="type" :label="$t('message.risk.task.type')">
                        <template #default="props">
                            {{ $t(`message.router.${props.row.type}Index`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('message.risk.task.status')">
                        <template #default="props">
                            <span :class="`status-${props.row.status}`">{{
                                $t(`message.risk.task.status_${props.row.status}`) }}</span>
                            <el-tooltip v-if="props.row.errorMsg !== ''" :content="props.row.errorMsg"
                                placement="top-start">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="progress" :label="$t('message.risk.task.progress')">
                        <template #default="props">
                            {{ `${(100*props.row.subtasksFinish/props.row.subTasks).toFixed(2)}%` }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTm" :label="$t('message.risk.task.createTm')">
                        <template #default="props">
                            {{ formatApiTime(props.row.createTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.risk.task.updateTm')">
                        <template #default="props">
                            {{ props.row.updateTm === '' ? '--' : formatApiTime(props.row.updateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="cycle" :label="$t('message.risk.task.cycle')">
                        <template #default="props">
                            {{ $t(`message.risk.task.cycle_${props.row.cycle}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="operation" :label="$t('message.tableCommon.operation')" width="140" fixed="right" align="center">
                        <template #default="prop">
                            <el-button size="small" @click="handleDetail(prop.row)">
                                {{ $t('message.tableCommon.detail') }}
                            </el-button>
                            <el-button size="small" type="danger" @click="handleDelete(prop.row)">
                                {{ $t('message.tableCommon.delete') }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- Pagination -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total ?? 0" @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
        </el-card>
        <Drawer :id="dstate.id" v-model="dstate.open" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ListLeakReply_Details, ListScanTaskReply, ListScanTaskReply_Details, ListScanTaskReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { shortcuts } from '/@/utils/formatTime';
import { getRiskTypeOptions, getTaskCycleOptions, getTaskStatusOptions } from '../constant';
import { QuestionFilled } from '@element-plus/icons-vue';
import Drawer from './drawer.vue';
import { ElMessageBox } from 'element-plus';

const DetailDrawerRef = ref();

const { t } = useI18n();

const RiekTypeOptions = getRiskTypeOptions(t);
const CycleOptions = getTaskCycleOptions(t);
const StatusOptions = getTaskStatusOptions(t);

const timeRange = ref([] as string[]);

const state = reactive({
    loading: false,
    req: {
        pageIdx: 1,
        pageSize: 10,
        cycle: 'all', // Required. One of `all`, `cycle`, or `once`
        type: 'all', // all|baseline|leak|weakpwd
        status: 'all', // Optional status: `all|PENDING|RUNNING|FINISH|FAILURE`
        startTm: '', // Optional start time
        endTm: '', // Optional end time
        orderCreateTm: -1, // Sort by created time: 1 ascending, -1 descending. Default: -1.
        orderUpdateTm: 0, // Sort by end time: `1` asc, `-1` desc; default is unsorted
    } as ListScanTaskReq,
    reply: {} as ListScanTaskReply,
});

const dstate = reactive({
    open: false,
    id: '',
});

const handleAdd = () => {
};

const handleDetail = (data: ListLeakReply_Details) => {
    dstate.open = true;
    dstate.id = data.iD;
};

const handleDelete = (data: ListLeakReply_Details) => {
    ElMessageBox.confirm(
        t('message.risk.task.deleteTask'),
        t('message.dialog.prompt')
    )
    .then(() => {
        api.deleteScanTask({iD: data.iD})
        .then(resp => resp.response)
        .then(data => alertResult(data.result, t('message.risk.task.delSucc'), t('message.risk.task.delFail')))
        .catch(err => alertApiError(err))
        .finally(() => refresh());
    })
    .catch(err => {});
};


const handleScan = (data: ListLeakReply_Details) => {
};

const refresh = () => {
    // console.log('listScanTask', state.req);

    state.loading = true;

    api.listScanTask(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
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

let intervalId: NodeJS.Timer | null = null;

onMounted(() => {
    refresh();

    intervalId = setInterval(() => {
        refresh();
    }, 5000);
});

onUnmounted(() => {
    if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
    }
});
</script>

<style scoped>
.el-form--inline .el-form-item {
    margin-right: 10px;
}

.status-FINISH {
    color: rgb(3, 189, 105);
}
</style>
