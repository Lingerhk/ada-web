<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="state.req.type">
                <el-tab-pane v-for="option in typeOptions" :label="$t(option.label)" :name="option.value"
                    :key="option.value">
                    <el-row>
                        <!-- 搜索 -->
                        <el-form :inline="true" class="filter-form">
                            <el-form-item>
                                <el-button @click="handleNewSensityEntry" type="primary" size="default">
                                    <el-icon><Plus /></el-icon>
                                    {{ $t('message.tableCommon.new') }}
                                </el-button>
                            </el-form-item>
                            <el-form-item :label="$t('message.threat.sensitive.origin')">
                                <el-select v-model="state.req.origin" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.threat.sensitiveEntryList.selectOrigin')" popper-class="custom-header">
                                    <template #header>
                                        <el-checkbox v-model="originCheckAll" :indeterminate="originIndeterminate" @change="handleOriginCheckAll">
                                            {{ $t('message.tableCommon.checkAll') }}
                                        </el-checkbox>
                                    </template>
                                    <el-option v-for="option in OriginOptions" :key="option.value" :label="option.label" :value="option.value" />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.time.createTm')">
                                <el-date-picker size="default" v-model="timeRangeRef" type="datetimerange"
                                    :range-separator="$t('message.time.to')"
                                    :start-placeholder="$t('message.time.start')"
                                    :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                            </el-form-item>
                            <el-form-item :label="$t('message.tableCommon.domain')">
                                <el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.threat.sensitiveEntryList.selectDomain')" popper-class="custom-header">
                                    <template #header>
                                        <el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
                                            {{ $t('message.tableCommon.checkAll') }}
                                        </el-checkbox>
                                    </template>
                                    <el-option v-for="option in state.domainOptions" :key="option.value" :label="option.label" :value="option.value" />
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <!-- 列表 -->
                    <el-row>
                        <el-table :data="state.data" v-loading="state.loading" :border="true" style="width: 100%">
                            <!-- @selection-change="(val) => tableRowsSelected.value = val" -->
                            <!-- <el-table-column type="selection" width="55" /> -->
                            <el-table-column type="index" :label="$t('message.tableCommon.index')" width="70" />
                            <el-table-column prop="name" :label="$t(`message.threat.sensitive.${state.req.type}`)" />
                            <el-table-column prop="domain" :label="$t('message.advancedSearch.domain')" />
                            <el-table-column :label="$t('message.threat.sensitive.origin')">
                                <template #default="scope">
                                    {{ $t(`message.threat.sensitive.origin_${scope.row.origin}`) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('message.time.createTm')">
                                <template #default="scope">
                                    {{ formatApiTime(scope.row.createTm) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('message.time.updateTm')">
                                <template #default="scope">
                                    {{ formatApiTime(scope.row.updateTm) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('message.tableCommon.operation')">
                                <template #default="scope">
                                    <el-button text size="default" type="danger" style="color: red"
                                        @click="() => handleClose(scope.row)">
                                        {{ $t('message.tableCommon.delete') }}
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                    <!-- 分页 -->
                    <el-row style="margin-top: 10px" justify="space-between">
                        <div>
                            <!-- <el-button type="primary" size="default" :disabled="!tableRowsSelected.value"
                                @click="handleClose(tableRowsSelected.value)">{{ $t('message.tableCommon.closeBulk')
                                }}</el-button> -->
                        </div>
                        <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                            :page-sizes="[10, 20, 30, 40, 50]"
                            :layout='state.exhausted ? "sizes, prev, jumper" : "sizes, prev, next, jumper"' :total="400"
                            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                    </el-row>

                </el-tab-pane>
            </el-tabs>
        </el-card>
        <AddEntryDrawer ref="addEntryDrawerRef" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch  } from 'vue';
import { DeleteSensitiveEntryReply, DeleteSensitiveEntryReq, ListSensitiveEntryReply, ListSensitiveEntryReply_Details, ListSensitiveEntryReq } from '/@/api/grpc/ada';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { typeOptions, originOptions } from './constant';
import { OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';

const { t } = useI18n();

const AddEntryDrawer = defineAsyncComponent(() => import('./addEntryDrawer.vue'));

const OriginOptions = originOptions.map(o => ({ ...o, ['label']: t(o.label) }));

const timeRangeRef = ref([]);
const addEntryDrawerRef = ref();
// const tableRowsSelected = ref<ListSensitiveEntryReply_Details[]>([]);

// Checkbox states for "Check All"
const originCheckAll = ref(false);
const originIndeterminate = ref(false);
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);

const state = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        type: 'user',
        domain: [] as string[],
        origin: [] as number[],
        startTm: '',
        endTm: '',
        orderCreateTm: -1,
        orderUpdateTm: 0,
    } as ListSensitiveEntryReq,
    loading: false,
    exhausted: false,
    data: [] as ListSensitiveEntryReply_Details[],
    domainOptions: [] as OptionType[],
});

const handleSizeChange = (val: number) => {
    state.req.pageSize = val;
    refreshList();
}

const handleCurrentChange = (val: number) => {
    state.req.pageIdx = val;
    refreshList();
}
const handleNewSensityEntry = () => {
    addEntryDrawerRef.value.open(state.req.type, () => refreshList());
};

const doClose = (obj: ListSensitiveEntryReply_Details) => {
    const req: DeleteSensitiveEntryReq = {
        iD: obj.iD,
    };

    console.log('delete', obj, 'req', req);

    api.deleteSensitiveEntry(req)
    .then(resp => resp.response)
    .then((data: DeleteSensitiveEntryReply) => {
        console.log('result:', data);
        if (data.result === 'success') {
            ElMessage.success(t('message.threat.confirm.closeSucc'));
        } else {
            ElMessage.warning(t('message.threat.confirm.closeFail'));
        }
    })
    .catch(err => alertApiError(err))
    .finally(() => refreshList());
};

const handleClose = (obj: ListSensitiveEntryReply_Details) => {
    if (!obj) {
        return;
    }
    ElMessageBox.confirm(
        t('message.threat.confirm.singleSensitive'),
        t('message.threat.confirm.prompt')
    )
    .then(() => {
        doClose(obj);
    })
    .catch(err => {

    });

}

const refreshList = () => {
    console.log(state.req);

    state.loading = true;

    api.listSensitiveEntry(state.req)
    .then(resp => resp.response)
    .then((data: ListSensitiveEntryReply) => {
        console.log(data);
        state.req.pageIdx = data.page?.pageIdx || state.req.pageIdx;
        state.req.pageSize = data.page?.pageSize || state.req.pageSize;
        state.exhausted = data.exhausted;
        state.data = data.list;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

// Handle origin Select All
const handleOriginCheckAll = (val: boolean) => {
    originIndeterminate.value = false;
    if (val) {
        state.req.origin = OriginOptions.map(opt => opt.value);
    } else {
        state.req.origin = [];
    }
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

onMounted(() => {
    refreshList();
    listDomainOptions().then(opts => state.domainOptions = opts);
});

watch(timeRangeRef, (value) => {
    console.log(value);
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

    refreshList();
});

watch(() => state.req.origin, (val) => {
    originIndeterminate.value = false;
    if (val.length === 0) {
        originCheckAll.value = false;
    } else if (val.length === OriginOptions.length) {
        originCheckAll.value = true;
    } else {
        originIndeterminate.value = true;
    }
    refreshList();
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
    refreshList();
});

watch(() => state.req.type, () => {
    refreshList();
});

watch(() => state.req.pageIdx, () => {
    refreshList();
});

watch(() => state.req.pageSize, () => {
    refreshList();
});

</script>

<style type="scss">
</style>