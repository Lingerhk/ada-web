<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item :label="$t('message.system.audit.event')">
                        <el-select v-model="state.req.filterEvent" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 250px" :placeholder="$t('message.system.audit.selectEvent')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="eventCheckAll" :indeterminate="eventIndeterminate" @change="handleEventCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in EventOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.system.audit.timeRange')">
                        <el-date-picker size="default" v-model="timeRange" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
                <el-form :inline="true">
                    <el-space>
                        <el-input v-model="state.keyword" style="width: 350px" :suffix-icon="Search"
                            :placeholder="$t('message.system.audit.searchPlaceholder')" clearable
                            @change="onKeywordChanged" />
                        <ExportButton type="audit" />
                    </el-space>
                </el-form>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    row-class-name="pointer-cursor" style="width: 100%">
                    <el-table-column type="index" width="70" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="username" width="150" :label="$t('message.system.audit.username')"
                        show-overflow-tooltip />
                    <el-table-column prop="clientIp" width="150" :label="$t('message.system.audit.clientIp')"
                        show-overflow-tooltip />
                    <el-table-column prop="event" width="200" :label="$t('message.system.audit.event')"
                        show-overflow-tooltip />
                    <el-table-column prop="eventArgs" width="200" :label="$t('message.system.audit.eventArgs')"
                        show-overflow-tooltip />
                    <el-table-column prop="eventResult" width="200" :label="$t('message.system.audit.eventResult')"
                        show-overflow-tooltip />
                    <el-table-column prop="createTm" :label="$t('message.system.audit.createTm')" show-overflow-tooltip>
                        <template #default="prop">
                            {{ formatApiTime(prop.row.createTm) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div>
                </div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total" />
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import api from '/@/api/grpc';
import * as proto from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { getAuditEventOptions } from '/@/utils/constant';
import { shortcuts } from '/@/utils/formatTime';
import { Search } from '@element-plus/icons-vue';
import ExportButton from '/@/views/system/export/exportButton.vue';

const { t } = useI18n();

const EventOptions = getAuditEventOptions(t);

const timeRange = ref([] as string[]);

// Checkbox states for "Check All"
const eventCheckAll = ref(false);
const eventIndeterminate = ref(false);

const onKeywordChanged = (val: string) => {
    state.req.keyword = val;
};

const state = reactive({
    req: {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 10,
        startTm: '', // 开始时间
        endTm: '', // 结束时间
        keyword: '',
        filterEvent: [], // 事件
        createSort: -1, // 审计时间 1升级 -1降序
    } as proto.ListAuditLogReq,
    reply: {} as proto.ListAuditLogReply,
    exhausted: false,
    loading: false,
    keyword: '',
});

const refresh = () => {
    state.loading = true;

    console.log('listAuditLog', state.req);

    api.listAuditLog(state.req)
    .then(resp => resp.response)
    .then(data => {
        console.log(data);
        state.reply = data;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(timeRange, (val) => {
    if (val && val.length === 2) {
        state.req.startTm = formatApiTime(val[0]);
        state.req.endTm = formatApiTime(val[1]);
    } else {
        state.req.startTm = '';
        state.req.endTm = '';
    }
    refresh();
});

// Handle event Select All
const handleEventCheckAll = (val: boolean) => {
    eventIndeterminate.value = false;
    if (val) {
        state.req.filterEvent = EventOptions.map(opt => opt.value);
    } else {
        state.req.filterEvent = [];
    }
};

// Watch individual filter properties
watch(() => state.req.filterEvent, (val) => {
    eventIndeterminate.value = false;
    if (val.length === 0) {
        eventCheckAll.value = false;
    } else if (val.length === EventOptions.length) {
        eventCheckAll.value = true;
    } else {
        eventIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.keyword, () => {
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.pageIdx, () => {
    refresh();
});

watch(() => state.req.pageSize, () => {
    refresh();
});

onMounted(() => {
    refresh();
});

</script>
