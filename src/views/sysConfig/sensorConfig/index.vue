<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <div class="mb15">
                <el-form label-width="auto" :inline="true">
                    <el-form-item>
                        <template #label>{{ $t('message.advancedSearch.domain') }}</template>
                        <MultiSelector v-model:selected="state.req.domain" :options="state.domainOptions">
                        </MultiSelector>
                    </el-form-item>
                    <el-form-item>
                        <template #label>{{ $t('message.advancedSearch.status') }}</template>
                        <MultiSelector v-model:selected="state.req.status" :options="StatusOptions">
                        </MultiSelector>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="state.req.keyword" size="default" style="width: 350px"
                            :placeholder="$t('message.sysConfig.sensorConfig.searchPlaceholder')" :suffix-icon="Search"
                            clearable />
                    </el-form-item>
                </el-form>
            </div>
            <el-table :data="state.data" v-loading="state.loading" style="width: 100%">
                <el-table-column type="index" :label="$t('message.tableCommon.index')" width="40px" />
                <el-table-column prop="iP" :label="$t('message.sysConfig.sensorConfig.iP')"></el-table-column>
                <el-table-column prop="domain" :label="$t('message.advancedSearch.domain')"></el-table-column>
                <el-table-column prop="hostname" :label="$t('message.tableCommon.dcHostname')"></el-table-column>
                <el-table-column prop="status" :label="$t('message.advancedSearch.status')">
                    <template #default="scope">
                        <span :class="scope.row.status === 'Running' ? 'success-color' : 'failed-color'">{{
                            $t(`message.sysConfig.sensorConfig.status_${scope.row.status}`) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="logStatus" :label="$t('message.sysConfig.sensorConfig.logSwitch')">
                    <template #default="scope">
                        <el-switch v-model="scope.row.logPluginSwitch" active-value="true" class="ml-2" size="small"
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                            :before-change="() => handleConfirm(scope.row.logPluginSwitch === 'true' ? $t('message.sysConfig.sensorConfig.disableLogStatus') : $t('message.sysConfig.sensorConfig.enableLogStatus'), scope.row, changeLogStatus)" />
                    </template>
                </el-table-column>
                <el-table-column prop="pktStatus" :label="$t('message.sysConfig.sensorConfig.pktSwitch')">
                    <template #default="scope">
                        <el-switch v-model="scope.row.pktPluginSwitch" active-value="true" class="ml-2" size="small"
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                            :before-change="() => handleConfirm(scope.row.pktPluginSwitch === 'true' ? $t('message.sysConfig.sensorConfig.disablePktStatus') : $t('message.sysConfig.sensorConfig.enablePktStatus'), scope.row, changePktStatus)" />
                    </template>
                </el-table-column>
                
                <el-table-column prop="bindNetIface" :label="$t('message.sysConfig.sensorConfig.bindNetIface')" :formatter="(row: ListSensorReply_Details, _: any, value: string[], __: any) => value.map((idx: string) => row.netIface[idx]).join(', ')"/>
                <el-table-column prop="lastOnlineTm" :label="$t('message.time.lastOnlineTm')">
                    <template #default="scope">
                        {{ formatApiTime(scope.row.lastOnlineTm) }}
                    </template>
                </el-table-column>
                <el-table-column prop="version" :label="$t('message.tableCommon.version')"></el-table-column>
                <el-table-column :label="$t('message.tableCommon.operation')">
                    <template #default="scope">
                        <el-button size="large" text type="primary" @click="onEdit(scope.row)">{{
                            $t('message.tableCommon.edit') }}</el-button>
                        <el-button size="large" text type="primary" @click="onDetail(scope.row)">{{
                            $t('message.tableCommon.detail') }}</el-button>
                        <el-button size="large" text type="primary" @click="onDelete(scope.row)"
                            :disabled="false">{{ $t('message.tableCommon.delete') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <DetailDrawer ref="detailDrawerRef" />
        <EditDrawer ref="editDrawerRef" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { CmdSensorReq, ListSensorReply_Details, ListSensorReq, UpdateSensorReq, UpdateSensorVersionReq } from '/@/api/grpc/ada';
import { Search } from '@element-plus/icons-vue';
import { ElMessageBox, valueEquals } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { OptionType, getSensorStatusOptions } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { formatApiTime } from '/@/utils/formatTime';

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const EditDrawer = defineAsyncComponent(() => import('./editDrawer.vue'));

const detailDrawerRef = ref();
const editDrawerRef = ref();

const { t } = useI18n();

const StatusOptions = getSensorStatusOptions(t);

const state = reactive({
    req: {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 10,
        domain: [],
        status: [], // filter: Init|Running|Stopped
        keyword: '', // for search
        tmSort: -1, // 最后在线时间排序，1为升序，-1为降序
    } as ListSensorReq,
    data: [] as ListSensorReply_Details[],
    loading: false,
    exhausted: false,
    domainOptions: [] as OptionType[],
});

watch(() => state.req, (val) => {
    refresh();
}, { deep: true });

// 刷新列表
const refresh = () => {
    state.loading = true;
    console.log('listSensor', state.req)
    api.listSensor(state.req)
    .then(resp => resp.response)
    .then(data => {
        console.log(data);
        state.data = data.list;
        state.exhausted = data.exhausted;
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

const getUpdateSensorReq = (row: ListSensorReply_Details): UpdateSensorReq => {
    return {
        iD: row.iD,
        bindNetIface: row.bindNetIface,
        perfLimit: row.perfLimit,
        remark: row.remark,
        pktPluginSwitch: row.pktPluginSwitch,
        logPluginSwitch: row.logPluginSwitch,
        rpcFwPluginSwitch: row.rpcFwPluginSwitch,
        ldapFwPluginSwitch: row.ldapFwPluginSwitch,
    };
}

const changePktStatus = (row: ListSensorReply_Details) => {
    let req = getUpdateSensorReq(row);
    req.pktPluginSwitch = row.pktPluginSwitch === 'true' ? 'false' : 'true';

    console.log('updateSensor', req);

    api.updateSensor(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.sysConfig.sensorConfig.switchPktStatusSucc'), t('message.sysConfig.sensorConfig.switchPktStatusFail'));
    })
    .catch(err => alertApiError(err))
    .finally(() => refresh());
}

const changeLogStatus = (row: ListSensorReply_Details) => {
    let req = getUpdateSensorReq(row);
    req.logPluginSwitch = row.logPluginSwitch === 'true' ? 'false' : 'true';

    console.log('updateSensor', req);

    api.updateSensor(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.sysConfig.sensorConfig.switchLogStatusSucc'), t('message.sysConfig.sensorConfig.switchLogStatusFail'));
    })
    .catch(err => alertApiError(err))
    .finally(() => refresh());

    refresh();
};

const handleConfirm = (title: string, row: ListSensorReply_Details, done: (row: ListSensorReply_Details) => void) => {
    return ElMessageBox.confirm(title)
        .then(() => {
            return done(row)
        })
        .catch(() => {
            return false;
        });
}

// 操作按钮
const onDetail = (row: ListSensorReply_Details) => {
    detailDrawerRef.value.open('传感器详情', row, refresh);
}

const onEdit = (row: ListSensorReply_Details) => {
    editDrawerRef.value.open('编辑域控传感器', row, refresh);
}

const onDelete = (row: ListSensorReply_Details) => {
    ElMessageBox.confirm(
        t('message.dialog.singleSensitive'), // Using a generic sensitive delete message for now
        t('message.dialog.prompt'),
        {
            confirmButtonText: t('message.dialog.confirm'),
            cancelButtonText: t('message.dialog.cancel'),
            type: 'warning',
        }
    ).then(() => {
        const req: CmdSensorReq = {
            iD: row.iD,
            cmd: 'delete',
        };

        console.log('cmdSensor', req)
        api.cmdSensor(req)
            .then(resp => resp.response)
            .then(data => alertResult(data.result, t('message.sysConfig.sensorConfig.deleteSucc'), t('message.sysConfig.sensorConfig.deleteFail')))
            .catch(err => alertApiError(err))
            .finally(() => refresh());
    }).catch(() => {
        // User clicked cancel or closed the dialog
        console.log('Delete cancelled');
    });
}

onMounted(() => {
    refresh();
    listDomainOptions().then(options => state.domainOptions = options);
})

</script>