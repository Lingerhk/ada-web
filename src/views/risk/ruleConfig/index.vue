<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item>
                        <el-button size="default" type="primary" @click="handleAdd">
                            <el-icon><Plus /></el-icon>
                            {{ $t('message.tableCommon.new') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.ruleConfig.templateType')">
                        <el-select size="default" v-model="state.req.type" clearable
                            style="width: 240px" :placeholder="$t('message.risk.ruleConfig.selectType')">
                            <el-option v-for="option in RiskTypeOptions" :key="option.value" :label="option.label"
                                :value="option.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.data" v-loading="state.loading" :border="true" row-class-name="pointer-cursor"
                    style="width: 100%">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="name" :label="$t('message.risk.ruleConfig.templateName')" />
                    <el-table-column prop="type" :label="$t('message.risk.ruleConfig.templateType')">
                        <template #default="scope">
                            {{ $t(`message.risk.ruleConfig.${scope.row.type}`) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.risk.ruleConfig.updateTm')">
                        <template #default="scope">{{ formatApiTime(scope.row.updateTm) }}</template>
                    </el-table-column>
                    <el-table-column :label="$t('message.tableCommon.operation')">
                        <template #default="scope">
                            <el-button size="large" text type="primary" @click="handleEdit(scope.row)"
                                :disabled="scope.row.tmplType !== 2">{{
                                    $t('message.tableCommon.edit') }}</el-button>
                            <el-button size="large" text type="primary" @click="handleDetail(scope.row)">{{
                                $t('message.tableCommon.detail') }}</el-button>
                            <el-button size="large" text type="danger" @click="handleDelete(scope.row)"
                                :disabled="scope.row.tmplType !== 2">{{
                                    $t('message.tableCommon.delete') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <DetailDrawer ref="DetailDrawerRef" />
            <EditDrawer ref="EditDrawerRef" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { DeleteScanTmplReq, ListScanTmplReply, ListScanTmplReply_Details, ListScanTmplReq } from '/@/api/grpc/ada';
import { listScanTmpl } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { getRiskTypeOptions } from '../constant';
import { useI18n } from 'vue-i18n';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessageBox, alertEffects } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '/@/api/grpc';

const DetailDrawerRef = ref();
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const EditDrawerRef = ref();
const EditDrawer = defineAsyncComponent(() => import('./editDrawer.vue'));
const { t } = useI18n();

const RiskTypeOptions = getRiskTypeOptions(t);

const state = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        type: 'all',
    } as ListScanTmplReq,
    data: [] as ListScanTmplReply_Details[],
    exhausted: false,
    loading: false,
})

const handleAdd = () => {
    EditDrawerRef.value.open(t('message.risk.ruleConfig.addRule'), null, refresh);
};

const handleEdit = (data: ListScanTmplReply_Details) => {
    if (data.tmplType !== 2) {
        return;
    }

    EditDrawerRef.value.open(t('message.risk.ruleConfig.addRule'), data, refresh);
};

const handleDetail = (data: ListScanTmplReply_Details) => {
    DetailDrawerRef.value.open(data);
};

const handleDelete = (data: ListScanTmplReply_Details) => {
    if (data.tmplType !== 2) {
        return;
    }

    ElMessageBox.confirm(
        t('message.risk.ruleConfig.deleteOne'),
        t('message.dialog.prompt')
    )
    .then(() => {
        api.deleteScanTmpl({iD: data.iD})
        .then(resp => resp.response)
        .then(data => alertResult(data.result, t('message.risk.ruleConfig.delSucc'), t('message.risk.ruleConfig.delFail')))
        .catch(err => alertApiError(err))
        .finally(() => refresh());
    })
    .catch(err => {});
};

const refresh = () => {
    state.loading = true;
    listScanTmpl(state.req)
        .then((data: ListScanTmplReply) => {
            state.exhausted = data.exhausted;
            state.data = data.list;
            console.log(data);
        })
        .catch(err => alertApiError(err))
        .finally(() => state.loading = false);
};

// Watch type filter
watch(() => state.req.type, () => {
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