<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item :label="transExport('type')">
                        <MultiSelector v-model:selected="state.req.type" :options="typeOptions" />
                    </el-form-item>
                    <el-form-item :label="transExport('status')">
                        <MultiSelector v-model:selected="state.req.status" :options="statusOpitons" />
                    </el-form-item>
                    <el-form-item :label="transExport('createTm')">
                        <el-date-picker size="default" v-model="timeRangeRef" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content:right; align-items: flex-start; padding-top: 5px;">
                </el-space>
            </el-row>
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    row-class-name="pointer-cursor" style="width: 100%">
                    <el-table-column type="index" width="70" :label="transExport('index')" />
                    <el-table-column min-width="250" prop="name" :label="transExport('name')" />
                    <el-table-column min-width="100" prop="type" :label="transExport('type')"
                        :formatter="(_, __, value, ___) => transExport(`type_${value}`)" />
                    <el-table-column min-width="100" prop="status" :label="transExport('status')">
                        <template #default="prop">
                            <span :class="`status-${prop.row.status}`">{{ transExport(`status_${prop.row.status}`)
                                }}</span>
                            <el-tooltip v-if="prop.row.errMsg !== ''" :content="prop.row.errMsg" placement="top-start">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column min-width="100" prop="fileType" :label="transExport('fileType')" />
                    <el-table-column min-width="250" prop="createTm" :label="transExport('createTm')"
                        :formatter="(_, __, value, ___) => formatApiTime(value)" />
                    <el-table-column min-width="250" prop="updateTm" :label="transExport('updateTm')"
                        :formatter="(_, __, value, ___) => formatApiTime(value)" />
                    <el-table-column :label="transExport('operation')">
                        <template #default="prop">
                            <el-space spacer="|">
                                <el-button type="primary" text @click="handleDownload(prop.row)"
                                    :disabled="prop.row.status !== 'finish'"
                                    :loading="downloadingTask.findIndex((id) => id === prop.row.iD) !== -1">{{
                                    transExport('download')
                                    }}</el-button>
                                <el-button type="danger" text @click="handleDelete(prop.row)">{{ transExport('delete')
                                    }}</el-button>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- pagination -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]"
                    layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total" @size-change="val => state.req.pageSize = val"
                    @current-change="val => state.req.pageIdx = val" />
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import api from '/@/api/grpc';
import { DeleteExportTaskReq, ListExportTaskReply, ListExportTaskReply_Details, ListExportTaskReq } from '/@/api/grpc/ada';
import { alertApiError, alertError, alertResult } from '/@/utils/error';
import { getExportTaskStatusOpitions, getExportTaskTypeOptions } from '/@/utils/constant';
import { transExport } from '/@/utils/translator';
import MultiSelector from '/@/components/form/multiSelector.vue';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { QuestionFilled } from '@element-plus/icons-vue';
import { downloadFile } from '/@/utils/download';

const { t } = useI18n();

const typeOptions = getExportTaskTypeOptions();
const statusOpitons = getExportTaskStatusOpitions();
const timeRangeRef = ref([]);
const downloadingTask = ref([] as string[]);

const state = reactive({
    req: {
        pageIdx: 1, // start index with 1
        pageSize: 10, // if pageSize is -1, we will return all nodes
        type: [], // [(validator.field) = {regex: "all|alert|baseline|leak|weakpwd|system|audit"}];  // alert/baseline/leak/weakpwd/system/audit
        status: [], // [(validator.field) = {regex: "all|padding|doing|finish|failed"}]; // 任务状态: padding,doing,finish,failed
        startTm: '', //  可选，开始时间
        endTm: '', //  可选，结束时间
        sortTime: -1, // 根据时间排序，1升序，-1降序,0为默认顺序
    } as ListExportTaskReq,
    reply: {} as ListExportTaskReply,
    loading: false,
});

const refresh = () => {

    state.loading = true;

    api.listExportTask(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(timeRangeRef, (value) => {
    if (!value) {
        state.req.startTm = '';
        state.req.endTm = '';
    } else if (value.length === 2) {
        state.req.startTm = formatApiTime(value[0]);
        state.req.endTm = formatApiTime(value[1]);
    } else {
        state.req.startTm = '';
        state.req.endTm = '';
    }

    refresh();
});

const handleDownload = (data: ListExportTaskReply_Details) => {
    if (data.status !== 'finish') {
        return;
    }

    if (downloadingTask.value.findIndex((id) => id === data.iD) !== -1) {
        return;
    }

    const downloadUrl = `/download/report/${data.filePath}.${data.fileType}`;

    downloadingTask.value = [...downloadingTask.value, data.iD];
    downloadFile(downloadUrl, `${data.name}.${data.fileType}`)
    .catch(err => { alertError(err) })
    .finally(() => {
        downloadingTask.value = downloadingTask.value.filter(id => id !== data.iD);
    });
};

const handleDelete = (data: ListExportTaskReply_Details) => {
    ElMessageBox.confirm(transExport('deleteTask', [data.name]), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
    })
    .then(() => {
        const req: DeleteExportTaskReq = {
            iD: data.iD,
        };
        api.deleteExportTask(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, transExport('delSucc'), transExport('delFail'));
        })
        .catch(err => alertApiError(err))
        .finally(() => refresh());
    })
    .catch(() => {});
};

watch(() => state.req, () => {
    refresh();
}, { deep: true });

onMounted(() => {
    refresh();
});
</script>

<style lang="scss" scoped>
.status-failed {
    color: rgb(138, 34, 18);
}
.status-finish {
    color: #498334
}
.status-padding {
    color: #545892
}
.status-doing {
    color: #545892
}
</style>