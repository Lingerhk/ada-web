<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <!-- serching -->
            <el-row class="table-filter-row">
                <el-form :inline="true" class="filter-form">
                    <el-form-item>
                        <el-button type="primary" @click="handleNew">
                            <el-icon><Plus /></el-icon>
                            {{ T('new') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item :label="T('domain')">
                        <el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="T('selectDomain')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in state.domainOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="T('origin')">
                        <el-select v-model="state.req.origin" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="T('selectOrigin')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="originCheckAll" :indeterminate="originIndeterminate" @change="handleOriginCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in originOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker class="filter-date-range" size="default" v-model="lastOccurenceTime" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                    <el-form-item>
                        <el-input class="filter-search-input" size="default" v-model="state.req.search" :placeholder="T('searchPlaceholder')" />
                    </el-form-item>
                </el-form>
            </el-row>
            <!-- List -->
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
                        :formatter="(_: any, __: any, value: string, ___: any) => formatApiTime(value)" />
                    <el-table-column prop="origin" :label="T('origin')"
                        :formatter="(_: any, __: any, value: string, ___: any) => T(`origin_${value}`)" />
                    <el-table-column :label="T('operation')" width="210" fixed="right" align="center">
                        <template #default="scope">
                            <el-button size="small" @click="handleDetail(scope.row)">{{ T('detail')
                                }}</el-button>
                            <el-button size="small" @click="handleEdit(scope.row)">{{ T('edit')
                                }}</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ T('delete')
                                }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- Pagination -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div>
                </div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total ?? 0" @size-change="(s: number) => state.req.pageSize = s"
                    @current-change="(idx: number) => state.req.pageIdx = idx" />
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
import AddModDrawer from './addModDrawer.vue';
import DetailModDrawer from './detailDrawer.vue';
import { ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const drawerRef = ref();
const detailRef = ref();

const originOptions = getThreatBlockOriginOptions();

const lastOccurenceTime = ref(['', '']);

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const originCheckAll = ref(false);
const originIndeterminate = ref(false);

const state = reactive({
    req: {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 10,
        domain: [], // Optional. If empty, query all domains
        origin: [], // Optional source filter: 1 for manual, 2 for automatic
        startTm: '', // Optional start time
        endTm: '', // Optional end time
        search: '', // Optional search keyword (blocked user or IP)
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

    api.listThreatBlock(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.reply = data;
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

// Handle domain Select All
const handleDomainCheckAll = (val: boolean) => {
    domainIndeterminate.value = false;
    if (val) {
        state.req.domain = state.domainOptions.map(opt => opt.value);
    } else {
        state.req.domain = [];
    }
};

// Handle origin Select All
const handleOriginCheckAll = (val: boolean) => {
    originIndeterminate.value = false;
    if (val) {
        state.req.origin = originOptions.map(opt => opt.value);
    } else {
        state.req.origin = [];
    }
};

onMounted(() => {
    refresh();

    listDomainOptions().then(options => state.domainOptions = options);
});

watch(() => state.req.domain, (val) => {
    domainIndeterminate.value = false;
    if (val.length === 0) {
        domainCheckAll.value = false;
    } else if (val.length === state.domainOptions.length) {
        domainCheckAll.value = true;
    } else {
        domainIndeterminate.value = true;
    }
    refresh();
});

watch(() => state.req.origin, (val) => {
    originIndeterminate.value = false;
    if (val.length === 0) {
        originCheckAll.value = false;
    } else if (val.length === originOptions.length) {
        originCheckAll.value = true;
    } else {
        originIndeterminate.value = true;
    }
    refresh();
});

watch(() => state.req.search, () => {
    refresh();
});

watch(() => state.req.pageIdx, () => {
    refresh();
});

watch(() => state.req.pageSize, () => {
    refresh();
});

watch(() => lastOccurenceTime, () => {
    if (lastOccurenceTime.value.length !== 2) {
        state.req.startTm = '';
        state.req.endTm = '';
    } else {
        state.req.startTm = formatApiTime(lastOccurenceTime.value[0]);
        state.req.endTm = formatApiTime(lastOccurenceTime.value[1]);
    }
    refresh();
});
</script>

<style lang="scss" scoped>
</style>
