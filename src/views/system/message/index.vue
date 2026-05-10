<template>
    <div class="layout-pd message-page">
        <section class="message-panel">
            <div class="message-filters">
                <el-form :inline="true">
                    <el-form-item :label="$t('message.system.message.msgType')">
                        <el-select v-model="state.req.msgType" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="message-filter-select" :placeholder="$t('message.system.message.selectMsgType')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="msgTypeCheckAll" :indeterminate="msgTypeIndeterminate" @change="handleMsgTypeCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in MsgTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.message.status')">
                        <el-select v-model="state.req.status" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="message-filter-status" :placeholder="$t('message.system.message.selectStatus')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="statusCheckAll" :indeterminate="statusIndeterminate" @change="handleStatusCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in StatusOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.message.timeRange')">
                        <el-date-picker class="message-filter-date" size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
            </div>

            <el-table
                class="message-table"
                :data="state.reply.list"
                v-loading="state.loading"
                row-key="iD"
                :expand-row-keys="state.expandedRowKeys"
                :row-class-name="getRowClassName"
                @selection-change="(val: ListNotifyReply_Details[]) => state.selected = val"
                @sort-change="handleSortChange"
                @row-click="toggleRowExpansion"
            >
                <el-table-column type="expand" width="42">
                    <template #default="props">
                        <div class="message-detail">
                            <div class="message-detail-title">{{ $t('message.system.message.detailTitle') }}</div>
                            <p>{{ props.row.desc || $t('message.system.message.noDetail') }}</p>
                            <div class="message-detail-title message-detail-title--secondary">{{ $t('message.system.message.detailParams') }}</div>
                            <JsonViewer v-if="hasParams(props.row.params)" :value="props.row.params" copyable sort></JsonViewer>
                            <div v-else class="message-detail-empty">{{ $t('message.system.message.noParams') }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column type="selection" width="52" />
                <el-table-column prop="title" min-width="360" :label="$t('message.system.message.title')">
                    <template #default="scope">
                        <div class="message-title-cell">
                            <span class="message-type-icon" :class="`message-type-icon--${scope.row.msgType || 'system'}`">
                                <el-icon><component :is="getMessageIcon(scope.row.msgType)" /></el-icon>
                            </span>
                            <span class="message-title-main">
                                <span class="message-title-line">
                                    <span class="message-unread-dot" v-if="scope.row.status === 0"></span>
                                    {{ scope.row.title }}
                                </span>
                                <span class="message-title-desc">{{ scope.row.desc || scope.row.eventType || '-' }}</span>
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="msgType" :label="$t('message.system.message.msgType')" width="140">
                    <template #default="scope">
                        <el-tag :type="getMessageTagType(scope.row.msgType)" effect="plain">
                            {{ $t(`message.system.message.msgType_${scope.row.msgType}`) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="eventType" :label="$t('message.system.message.eventType')" min-width="140">
                    <template #default="scope">
                        {{ scope.row.eventType || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('message.system.message.status')" width="110" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'" effect="light">
                            {{ $t(`message.system.message.status_${scope.row.status}`) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTm" :label="$t('message.system.message.createTm')" sortable="custom" width="190" header-align="center" align="center">
                    <template #default="scope">
                        <span class="message-time">
                            <el-icon><Clock /></el-icon>
                            {{ formatMessageTime(scope.row.createTm) }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>

            <div class="message-footer">
                <div class="message-bulk-actions">
                    <el-button
                        type="primary"
                        plain
                        size="default"
                        :icon="Check"
                        :disabled="state.selected.length === 0"
                        @click="markReaded"
                    >
                        {{ $t('message.system.message.markReaded') }}
                    </el-button>
                    <span class="message-selected">{{ $t('message.system.message.selectedCount', [state.selected.length]) }}</span>
                </div>
                <el-pagination :current-page="state.req.pageIdx" :page-size="state.req.pageSize"
                    :page-sizes="[10, 30, 60, 100]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total ?? 0"
                    @size-change="handlePageSizeChange"
                    @current-change="handleCurrentPageChange" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import api from '/@/api/grpc';
import { ListNotifyReply, ListNotifyReply_Details, ListNotifyReq, UpdateNotifyReq } from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { getMessageStatusOptions, getMessageTypeOptions } from '/@/utils/constant';
import { shortcuts } from '/@/utils/formatTime';
import { ElMessageBox } from 'element-plus';
import { Check, Clock, InfoFilled, WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue';
import type { Component } from 'vue';

const { t } = useI18n();

const MsgTypeOptions = getMessageTypeOptions(t);
const StatusOptions = getMessageStatusOptions(t);

const timeRange = ref<Array<string | Date>>([]);

const msgTypeCheckAll = ref(true);
const msgTypeIndeterminate = ref(false);
const statusCheckAll = ref(false);
const statusIndeterminate = ref(false);

const state = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        msgType: MsgTypeOptions.map(opt => opt.value),
        status: [0],
        startTm: '',
        endTm: '',
        orderCreateTm: -1,
    } as ListNotifyReq,
    reply: {
        list: [],
        exhausted: false,
    } as ListNotifyReply,
    selected: [] as ListNotifyReply_Details[],
    loading: false,
    expandedRowKeys: [] as string[],
});

const messageIconMap: Record<string, Component> = {
    alert: WarningFilled,
    baseline: InfoFilled,
    leak: WarningFilled,
    system: CircleCheckFilled,
};

const getMessageIcon = (msgType: string) => messageIconMap[msgType] || InfoFilled;

const getMessageTagType = (msgType: string) => {
    if (msgType === 'alert') return 'danger';
    if (msgType === 'baseline' || msgType === 'leak') return 'warning';
    return 'info';
};

const getRowClassName = ({ row }: { row: ListNotifyReply_Details }) => {
    return row.status === 0 ? 'message-row--unread' : 'message-row--read';
};

const hasParams = (params?: Record<string, string>) => {
    return !!params && Object.keys(params).length > 0;
};

const formatMessageTime = (value: string) => {
    return formatApiTime(value) || '-';
};

const toggleRowExpansion = (row: ListNotifyReply_Details) => {
    const index = state.expandedRowKeys.indexOf(row.iD);
    if (index > -1) {
        state.expandedRowKeys.splice(index, 1);
    } else {
        state.expandedRowKeys.push(row.iD);

        if (row.status === 0) {
            const req: UpdateNotifyReq = {
                iDs: [row.iD],
            };

            api.updateNotify(req)
                .then(resp => resp.response)
                .then(data => {
                    if (data.result === 'SUCCESS') {
                        row.status = 1;
                    }
                })
                .catch(err => {
                    console.error('Failed to mark message as read:', err);
                });
        }
    }
};

const markReaded = () => {
    if (state.selected.length === 0) {
        return;
    }

    const req: UpdateNotifyReq = {
        iDs: state.selected.map(v => v.iD),
    };

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

const refresh = () => {
    state.loading = true;

    api.listNotify(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
        state.selected = [];
        state.expandedRowKeys = [];
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

const handlePageSizeChange = (newPageSize: number) => {
    state.req.pageSize = newPageSize;
    state.req.pageIdx = 1;
    refresh();
};

const handleCurrentPageChange = (newPage: number) => {
    state.req.pageIdx = newPage;
    refresh();
};

const handleSortChange = ({ prop, order }: { column: any, prop: string, order: 'ascending' | 'descending' | null }) => {
    if (prop === 'createTm') {
        if (order === 'ascending') {
            state.req.orderCreateTm = 1;
        } else {
            state.req.orderCreateTm = -1;
        }
    } else {
        state.req.orderCreateTm = -1;
    }
    refresh();
};

const handleMsgTypeCheckAll = (val: boolean) => {
    msgTypeIndeterminate.value = false;
    if (val) {
        state.req.msgType = MsgTypeOptions.map(opt => opt.value);
    } else {
        state.req.msgType = [];
    }
};

const handleStatusCheckAll = (val: boolean) => {
    statusIndeterminate.value = false;
    if (val) {
        state.req.status = StatusOptions.map(opt => opt.value);
    } else {
        state.req.status = [];
    }
};

watch(() => state.req.msgType, (val) => {
    msgTypeIndeterminate.value = false;
    if (val.length === 0) {
        msgTypeCheckAll.value = false;
    } else if (val.length === MsgTypeOptions.length) {
        msgTypeCheckAll.value = true;
    } else {
        msgTypeIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
}, { deep: true });

watch(() => state.req.status, (val) => {
    statusIndeterminate.value = false;
    if (val.length === 0) {
        statusCheckAll.value = false;
    } else if (val.length === StatusOptions.length) {
        statusCheckAll.value = true;
    } else {
        statusIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
}, { deep: true });

watch(timeRange, (val) => {
    if (val && val.length === 2) {
        state.req.startTm = formatApiTime(val[0]);
        state.req.endTm = formatApiTime(val[1]);
    } else {
        state.req.startTm = '';
        state.req.endTm = '';
    }
    state.req.pageIdx = 1;
    refresh();
});

onMounted(() => {
    refresh();
});
</script>

<style scoped lang="scss">
.message-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.message-panel {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
    overflow: hidden;
}

.message-filters {
    padding: 16px 16px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    :deep(.el-form-item) {
        margin-bottom: 16px;
    }
}

.message-filter-select {
    width: 220px;
}

.message-filter-status {
    width: 160px;
}

.message-filter-date {
    width: 360px;
}

.message-table {
    width: 100%;
    :deep(.el-table__cell) {
        padding: 12px 0;
    }
    :deep(.message-row--unread td) {
        background: var(--el-color-primary-light-9);
    }
}

.message-title-cell {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
}

.message-type-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    border-radius: 8px;
    color: var(--el-color-info);
    background: var(--el-fill-color);
    &--alert {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
    }
    &--baseline,
    &--leak {
        color: var(--el-color-warning);
        background: var(--el-color-warning-light-9);
    }
    &--system {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
    }
}

.message-title-main {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
}

.message-title-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--el-text-color-primary);
    font-weight: 700;
    line-height: 18px;
    word-break: break-word;
}

.message-unread-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--el-color-primary);
}

.message-title-desc {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 16px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.message-time {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
}

.message-detail {
    padding: 16px 22px 18px 58px;
    background: var(--el-fill-color-light);
    p {
        margin: 6px 0 14px;
        color: var(--el-text-color-regular);
        line-height: 20px;
    }
}

.message-detail-title {
    color: var(--el-text-color-primary);
    font-weight: 700;
    &--secondary {
        margin-bottom: 8px;
    }
}

.message-detail-empty {
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

.message-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border-top: 1px solid var(--el-border-color-lighter);
}

.message-bulk-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.message-selected {
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

@media (max-width: 960px) {
    .message-footer {
        align-items: stretch;
        flex-direction: column;
    }
    .message-bulk-actions {
        justify-content: flex-start;
    }
    .message-filter-date {
        width: 100%;
    }
}
</style>
