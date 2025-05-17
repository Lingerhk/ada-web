<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item :label="$t('message.system.message.msgType')">
                        <MultiSelector v-model:selected="state.req.msgType" :options="MsgTypeOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.system.message.status')">
                        <MultiSelector v-model:selected="state.req.status" :options="StatusOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.system.message.timeRange')">
                        <el-date-picker size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    @selection-change="(val: ListNotifyReply_Details[]) => state.selected = val" row-class-name="pointer-cursor"
                    style="width: 100%"
                    row-key="iD"
                    :expand-row-keys="state.expandedRowKeys"
                    @sort-change="handleSortChange"
                    >
                    <el-table-column type="expand" width="30">
                        <template #default="props">
                            <div style="padding: 10px 20px;">
                                <p style="margin-bottom: 8px;"><strong>{{ $t('message.threat.detail.description') }}:</strong> {{ props.row.desc }}</p>
                                <JsonViewer :value="props.row.params" copyable sort></JsonViewer>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="55" />
                    <el-table-column type="index" width="70" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="title" width="500" :label="$t('message.system.message.title')">
                        <template #default="scope">
                            <span @click="toggleRowExpansion(scope.row)" 
                                  :style="scope.row.status === 0 ? 'color:rgb(64, 158, 255); cursor: pointer;' : 'cursor: pointer;'">
                                <Bell v-if="scope.row.status === 0" style="width:12px; margin-right: 4px;"/>
                                {{ scope.row.title }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="msgType" :label="$t('message.system.message.msgType')">
                        <template #default="prop">
                            {{ $t(`message.system.message.msgType_${prop.row.msgType}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="eventType" :label="$t('message.system.message.eventType')">
                        <template #default="prop">
                            {{ prop.row.eventType }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTm" :label="$t('message.system.message.createTm')" sortable="custom" width="180" header-align="center" align="center">
                        <template #default="prop">
                            {{ formatApiTime(prop.row.createTm) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div>
                    <el-button type="primary" size="default" :disabled="state.selected.length === 0"
                        @click="markReaded">{{ $t('message.system.message.markReaded') }}</el-button>
                    <el-button type="primary" size="default" @click="markAllReaded">{{
                        $t('message.system.message.markAllReaded') }}</el-button>
                </div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 30, 60, 100]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total" />
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import api from '/@/api/grpc';
import { ListNotifyReply, ListNotifyReply_Details, ListNotifyReq, UpdateNotifyReq } from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { getMessageStatusOptions, getMessageTypeOptions } from '/@/utils/constant';
import { shortcuts } from '/@/utils/formatTime';
import { ElMessageBox } from 'element-plus';
import { Bell } from '@element-plus/icons-vue';

const { t } = useI18n();

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));

const MsgTypeOptions = getMessageTypeOptions(t);
const StatusOptions = getMessageStatusOptions(t);

const timeRange = ref([] as string[]);
const expandedRowKeys = ref<string[]>([]);

const state = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        msgType: [], // 消息类型,Leak漏洞监测，Baseline主动检测，Alert告警事件,System系统告警
        status: [0], // 消息状态: 0未读，1已读
        startTm: '', //  可选，开始时间
        endTm: '', //  可选，结束时间
        orderCreateTm: -1, // 创建时间排序 1升序 -1降序, 默认-1
    } as ListNotifyReq,
    reply: {
        list: [],
        exhausted: false,
    } as ListNotifyReply,
    selected: [] as ListNotifyReply_Details[],
    loading: false,
    expandedRowKeys: [] as string[],
});

const toggleRowExpansion = (row: ListNotifyReply_Details) => {
    const index = state.expandedRowKeys.indexOf(row.iD);
    if (index > -1) {
        state.expandedRowKeys.splice(index, 1);
    } else {
        state.expandedRowKeys.push(row.iD);
    }
};

const markReaded = () => {
    if (!state.selected) {
        return;
    }

    const req: UpdateNotifyReq = {
        iDs: state.selected.map(v => v.iD),
    };

    console.log("updateNotify", req);
    ElMessageBox.confirm(
        t('message.system.message.markReadedTitle', [req.iDs.length]),
        t('message.system.message.markReadedPrompt')
    )
    .then(() => {
        api.updateNotify(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, t('message.system.message.markReadedSucc'), t('message.system.message.markReadedFail'));
        })
        .catch(err => alertApiError(err))
        .finally(() => refresh());
    })
    .catch(() => { });
};

const markAllReaded = () => {
    state.selected = [...state.reply.list];
    markReaded();
};

const refresh = () => {
    state.loading = true;

    console.log('listNotify', state.req);

    api.listNotify(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

const handleSortChange = ({ column, prop, order }: { column: any, prop: string, order: 'ascending' | 'descending' | null }) => {
  if (prop === 'createTm') {
    if (order === 'ascending') {
      state.req.orderCreateTm = 1;
    } else if (order === 'descending') {
      state.req.orderCreateTm = -1;
    } else {
      state.req.orderCreateTm = -1; // Default to descending as per proto or clear sort
    }
  } else {
    // If sorting on other columns in the future, clear createTm sort
    state.req.orderCreateTm = -1;
  }
  refresh();
};

watch(timeRange, (val) => {
    if (val && val.length === 2) {
        state.req.startTm = formatApiTime(val[0]);
        state.req.endTm = formatApiTime(val[1]);
    } else {
        state.req.startTm = '';
        state.req.endTm = '';
    }
    refresh(); // Explicitly call refresh
});

// Remove old generic watcher for state.req
// watch(state.req, () => refresh(), { deep: true });

// Add specific watchers for status and msgType arrays
watch(() => [...state.req.status], (newStatus, oldStatus) => {
    console.log('Status changed, refreshing. New:', newStatus, 'Old:', oldStatus);
    refresh();
}, { deep: false }); // deep: false as we are watching a shallow copy

watch(() => [...state.req.msgType], (newMsgType, oldMsgType) => {
    console.log('MsgType changed, refreshing. New:', newMsgType, 'Old:', oldMsgType);
    refresh();
}, { deep: false }); // deep: false as we are watching a shallow copy

onMounted(() => {
    refresh();
});

</script>