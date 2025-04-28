<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <!-- serching -->
            <el-row justify="space-between">
                <el-form :inline="true" class="filter-form">
                    <el-form-item><el-button type="primary" @click="handleNew">{{ T('new') }}</el-button></el-form-item>
                    <el-form-item :label="T('domain')">
                        <MultiSelector v-model:selected="state.req.domain" :options="state.domainOptions" />
                    </el-form-item>
                    <el-form-item :label="T('origin')">
                        <MultiSelector v-model:selected="state.req.origin" :options="originOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker size="default" v-model="lastOccurenceTime" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
                <el-form :inline="true">
                    <el-input size="default" v-model="state.req.search" :placeholder="T('searchPlaceholder')"
                        style="width: 250px;" />
                </el-form>
            </el-row>
            <!-- 列表 -->
            <el-row>
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true" style="width: 100%">
                    <!-- @selection-change="(val) => tableRowsSelected.value = val" -->
                    <!-- <el-table-column type="selection" width="55" /> -->
                    <el-table-column type="index" :label="$t('message.tableCommon.index')" width="70" />
                    <el-table-column prop="name" :label="T('name')" min-width="300" show-overflow-tooltip />
                    <el-table-column prop="domain" :label="T('domain')" width="100" show-overflow-tooltip />
                    <el-table-column prop="userList" :label="T('userList')" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="ipList" :label="T('ipList')" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="updateTm" :label="T('updateTm')" min-width="200" show-overflow-tooltip
                        :formatter="(_, __, value, ___) => formatApiTime(value)" />
                    <el-table-column prop="origin" :label="T('origin')"
                        :formatter="(_, __, value, ___) => T(`origin_${value}`)" />
                    <el-table-column :label="T('operation')">
                        <template #default="scope">
                            <el-space size="small" spacer="|">
                                <el-button text type="primary" @click="handleDetail(scope.row)">{{ T('detail')
                                    }}</el-button>
                                <el-button text type="primary" @click="handleEdit(scope.row)">{{ T('edit')
                                    }}</el-button>
                                <el-button text type="danger" @click="handleDelete(scope.row)">{{ T('delete')
                                    }}</el-button>
                            </el-space>
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
                    :total="state.reply.page?.total ?? 0" @size-change="(s) => state.req.pageSize = s"
                    @current-change="(idx) => state.req.pageIdx = idx" />
            </el-row>
        </el-card>
        <AddModDrawer ref="drawerRef" />
        <DetailModDrawer ref="detailRef" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ListThreatBlockReply, ListThreatBlockReply_Details, ListThreatBlockReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { transThreatBlock as T } from '/@/utils/translator';
import { getThreatBlockOriginOptions, OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import MultiSelector from '/@/components/form/multiSelector.vue';
import AddModDrawer from './addModDrawer.vue';
import DetailModDrawer from './detailDrawer.vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';

const drawerRef = ref();
const detailRef = ref();

const originOptions = getThreatBlockOriginOptions();

const lastOccurenceTime = ref(['', '']);

const state = reactive({
    req: {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 10,
        domain: [], // 可选,为空则查询所有域
        origin: [], // 可选，来源，1:手动, 2:自动
        startTm: '', //  可选，开始时间
        endTm: '', //  可选，结束时间
        search: '', // 可选，搜索关键字（阻断用户/IP）
    } as ListThreatBlockReq,

    reply: {
        list: [],
        exhausted: false,
    } as ListThreatBlockReply,

    loading: false,
    domainOptions: [] as OptionType[],
});

const refresh = () => {
    state.loading = true;

    console.log("listThreatBlock", JSON.stringify(state.req));

    api.listThreatBlock(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

const handleDetail = (detail: ListThreatBlockReply_Details) => {
    detailRef.value.open(detail, refresh);
};

const handleNew = () => {
    drawerRef.value.open(null, refresh);
};

const { t } = useI18n();

const handleEdit = (detail: ListThreatBlockReply_Details) => {
    drawerRef.value.open(detail, refresh);
};

const handleDelete = (detail: ListThreatBlockReply_Details) => {
    ElMessageBox.confirm(T('confirmDelete', [detail.name]), t('message.dialog.prompt'), {
        confirmButtonText: t('message.dialog.confirm'),
        cancelButtonText: t('message.dialog.cancel'),
        type: 'warning',
    })
        .then(() => {

            api.deleteThreatBlock({ iD: detail.iD })
                .then(resp => resp.response)
                .then(data => alertResult(data.result, T('deleteSucc'), T('deleteFail')))
                .finally(refresh);
        })
        .catch(() => { });
};

onMounted(() => {
    refresh();

    listDomainOptions().then(options => state.domainOptions = options);
});

watch(() => state.req, () => {
    refresh();
}, { deep: true });

watch(() => lastOccurenceTime, () => {
    if (lastOccurenceTime.value.length !== 2) {
        state.req.startTm = '';
        state.req.endTm = '';
    } else {
        state.req.startTm = formatApiTime(lastOccurenceTime.value[0]);
        state.req.endTm = formatApiTime(lastOccurenceTime.value[1]);
    }
});
</script>

<style lang="scss" scoped>
</style>