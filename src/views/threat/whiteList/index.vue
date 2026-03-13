<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <!-- serching -->
            <el-row justify="space-between" style="margin-bottom: 15px;">
                <el-form :inline="true" class="filter-form">
                    <el-form-item>
                        <el-button type="primary" @click="handleNew">
                            <el-icon><Plus /></el-icon>
                            {{ $t('message.tableCommon.new') }}
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
                    <el-form-item :label="T('ruleId')">
                        <el-select v-model="state.req.ruleId" style="width: 240px">
                            <el-option v-for="item in state.ruleOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker size="default" v-model="lastOccurenceTime" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>

                    <el-form-item style="width: 260px;">
                        <el-input size="default" v-model="state.req.search" :placeholder="T('searchPlaceholder')" />
                    </el-form-item>
                </el-form>

            </el-row>
            <!-- table -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true"
                    @selection-change="(val: ListThreatWhitelistReply_Details[]) => state.tableRowsSelected = val" row-class-name="pointer-cursor">
                    <el-table-column type="selection" :width="55" />
                    <el-table-column type="index" :width="55" :label="$t('message.tableCommon.index')" />
                    <el-table-column :min-width="250" :label="T('ruleName')" prop="ruleName" />
                    <el-table-column :min-width="200" :label="T('ruleType')" prop="ruleType" />
                    <el-table-column :min-width="150" :label="T('domain')" prop="domain" />
                    <el-table-column :min-width="100" :label="T('origin')" prop="origin"
                        :formatter="(row: any, column: any, cellValue: any, index: number) => T(`origin_${cellValue}`)" />
                    <el-table-column :min-width="200" :label="T('createTm')" prop="createTm"
                        :formatter="(row: any, column: any, cellValue: any, index: number) => formatApiTime(cellValue)" />
                    <el-table-column :min-width="200" :label="T('updateTm')" prop="updateTm"
                        :formatter="(row: any, column: any, cellValue: any, index: number) => formatApiTime(cellValue)" />
                    <el-table-column :width="200" :label="T('remark')" prop="remark" show-overflow-tooltip />
                    <el-table-column :label="T('operation')" width="160" fixed="right" align="center">
                        <template #default="prop">
                            <el-button size="small" @click="handleUpdate(prop.row)">{{
                                T('updateRule')
                                }}</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(prop.row)">{{
                                T('deleteRule')
                                }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- pagination -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div>

                    <el-button type="primary" size="default" :disabled="state.tableRowsSelected.length === 0"
                        @click="handleCloseBulk">{{
                        $t('message.tableCommon.closeBulk') }}</el-button>
                </div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper"
                    :total="state.reply.page?.total" @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
        </el-card>
        <UpdateWhiteDialog v-model="update.open" :rules="update.rules" :flow-id="update.flowId" :remark="update.remark"
            :domain="update.domain" :title="update.ruleName" :id="update.id" />
        <AddGlobalWhiteDialog v-model="dstate.open" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { DeleteThreatWhitelistReq, ListThreatWhitelistReply, ListThreatWhitelistReply_Details, ListThreatWhitelistReq, UpdateThreatWhitelistReq_ruleInfo } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { listDomainOptions, listAlertRuleNameOptions } from '/@/api/grpc/method';
import { getWhiteListOriginOptions, OptionType } from '/@/utils/constant';
import { transWhiteList as T } from '/@/utils/translator';
import { formatApiTime, getPrev7Days, shortcuts } from '/@/utils/formatTime';
import UpdateWhiteDialog from './UpdateWhiteDialog.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import AddGlobalWhiteDialog from './AddGlobalWhiteDialog.vue';

const { t } = useI18n();

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const originCheckAll = ref(false);
const originIndeterminate = ref(false);

const state = reactive({
    req: {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 10,
        ruleId: '', // Optional. If not empty, only return whitelist rules for this rule ID
        domain: [], // Optional. If empty, query all domains
        origin: [], // Optional source filter: 1 for manual add, 2 for automatic add
        startTm: '', // Optional start time
        endTm: '', // Optional end time
        search: '', // Optional search keyword (rule name)
        orderUpdateTm: -1, // Sort by updated time: 1 ascending, -1 descending. Default: -1.
    } as ListThreatWhitelistReq,
    loading: false,
    reply: {} as ListThreatWhitelistReply,
    whiteList: [] as ListThreatWhitelistReply_Details[],
    exhausted: false,
    domainOptions: [] as OptionType[],
    tableRowsSelected: [] as ListThreatWhitelistReply_Details[],
    ruleOptions: [] as OptionType[],
});

const dstate = reactive({
    open: false,
});

const update = reactive({
    open: false,
    id: '',
    flowId: '',
    rules: [] as UpdateThreatWhitelistReq_ruleInfo[],
    remark: '',
    ruleName: '',
    domain: '',
});

const originOptions = getWhiteListOriginOptions();

const lastOccurenceTime = ref(getPrev7Days());

const refresh = () => {
    state.loading = true;

    api.listThreatWhitelist(state.req)
    .then(resp => resp.response)
    .then(data => {
        // state.exhausted = data.exhausted;
        // state.whiteList = data.list;
        state.reply = data;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

const handleUpdate = (rule: ListThreatWhitelistReply_Details) => {
    update.id = rule.iD;
    update.flowId = rule.ruleId;
    update.remark = rule.remark;
    update.rules = [...rule.rules];
    update.ruleName = rule.ruleName;
    update.domain = rule.domain;
    update.open = true;
};

const handleDelete = (rule: ListThreatWhitelistReply_Details) => {
    ElMessageBox.confirm(T('confirmDeleteRule', [rule.ruleName]), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
    })
    .then(() => {
        const req: DeleteThreatWhitelistReq = {
            iD: rule.iD,
        };
        api.deleteThreatWhitelist(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, T('deleteRuleSucc'), T('deleteRuleFail'));
        })
        .catch(err => alertApiError(err))
        .finally(() => refresh());
    })
    .catch(() => {});
};

const handleNew = () => {
    dstate.open = true;
};

const handleCloseBulk = () => {
    if (!state.tableRowsSelected || state.tableRowsSelected.length === 0) {
        return
    }

    const title = T('deleteWhiteBulk', [state.tableRowsSelected.length]);

    return ElMessageBox.confirm(title, t('message.threat.confirm.prompt'), {
        confirmButtonText: t('message.threat.confirm.confirm'),
        cancelButtonText: t('message.threat.confirm.cancel'),
        type: 'warning',
    })
    .then(() => {
        let promises = state.tableRowsSelected.map(async (rule) => {
            try {
                const result = await api.deleteThreatWhitelist({ iD: rule.iD } as DeleteThreatWhitelistReq).then(resp => resp.response);
                return result.result.toUpperCase() === 'SUCCESS';
            } catch (err) {
                console.error(err);
                return false;
            }
        });

        Promise.all(promises)
        .then(results => {
            const succCount = results.filter(r => r).length;
            ElMessage.info(T('deleteWhiteBulkSucc', [succCount]));
        })
        .finally(() => refresh());
    })
    .catch(err => {
        console.error(err);
        refresh();
    });
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
    state.tableRowsSelected = [];
    refresh();
    listDomainOptions().then(options => state.domainOptions = options);
    listAlertRuleNameOptions().then(options => state.ruleOptions = [{ label: T('ruleAll'), value: '', }, ...options]);
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

watch(() => state.req.ruleId, () => {
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
        state.req.startTm = formatApiTime(lastOccurenceTime.value[0].toString());
        state.req.endTm = formatApiTime(lastOccurenceTime.value[1].toString());
    }
    refresh();
});

watch(() => update.open, (newValue) => {
    if (!newValue) {
        refresh();
    }
});

watch(() => dstate.open, (newValue) => {
    if (!newValue) {
        refresh();
    }
});

</script>

<style scoped lang="scss">
.filter-form {
    :deep(.el-form-item) {
        margin-right: 12px;
    }
}
</style>
