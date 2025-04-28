<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item :label="$t('message.system.audit.event')">
                        <MultiSelector v-model:selected="state.req.filterEvent" :options="EventOptions" />
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
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
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

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));

const EventOptions = getAuditEventOptions(t);

const timeRange = ref([] as string[]);

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
});

watch(state.req, () => refresh(), { deep: true });

onMounted(() => {
    refresh();
});

</script>
