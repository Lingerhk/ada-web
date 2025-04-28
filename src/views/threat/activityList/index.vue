<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true" class="filter-form">
                    <el-form-item :label="$t('message.threat.levelName')">
                        <LevelCheckbox v-model="threatLevel" />
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.dcHostname')">
                        <MultiSelector v-model:selected="dchostSelected" :options="dchostOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.activityTitle')">
                        <MultiSelector v-model:selected="titleSelected" :options="titleOptions" />
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker size="default" v-model="lastOccurenceTime" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content:right; align-items: flex-start; padding-top: 5px;">
                    <el-input v-model="idInput" size="default" :placeholder="$t('message.threat.idInput')"
                        style="width: 290px;" :suffix-icon="Search" clearable></el-input>
                    <el-button type="primary" size="default" @click="resetReqParams">{{
                        $t('message.threat.reset') }}</el-button>
                    <el-button type="primary" size="default" @click="refreshActivity">{{
                        $t('message.threat.refreshManually') }}</el-button>
                    <!-- <el-button type="primary" size="default">{{ $t('message.threat.print') }}</el-button> -->
                </el-space>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="data" v-loading="loading" :border="true" row-class-name="pointer-cursor"
                    style="width: 100%">
                    <el-table-column type="expand">
                        <template #default="props">
                            <JsonViewer :value="JSON.parse(props.row.rawLog)" copyable boxed sort></JsonViewer>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="70" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="title" :label="$t('message.threat.tableTitle.title')"
                        show-overflow-tooltip />
                    <el-table-column prop="dcHostname" :label="$t('message.threat.tableTitle.dcHostname')" />
                    <el-table-column :label="$t('message.threat.tableTitle.createTm')">
                        <template #default="scope">{{ formatApiTime(scope.row.createTm) }}</template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.level')" :width="100">
                        <template #default="scope">
                            <LevelImage :level="scope.row.level" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="ruleConfidence" :label="$t('message.threat.tableTitle.ruleConfidence')"
                        :width="100" />
                    <el-table-column prop="desc" :label="$t('message.threat.tableTitle.desc')" :width="300"
                        show-overflow-tooltip />
                    <el-table-column prop="fieldData" :label="$t('message.threat.tableTitle.fieldData')">
                        <template #default="scope">
                            <el-space wrap size="small">
                                <el-tooltip v-for="key in filterFieldDataKey(scope.row.fieldData)" :key="key"
                                    class="box-item" effect="dark" :content="scope.row.fieldData[key]" placement="top">
                                    <el-tag size="small">{{ key }}</el-tag>
                                </el-tooltip>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.tags')">
                        <template #default="scope">
                            <el-space wrap size="small">
                                <el-tag v-for="tag in scope.row.tags" size="small" :key="tag">{{ tag }}</el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="pageIdx" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]"
                    :layout='exhausted ? "sizes, prev, pager, jumper" : "sizes, prev, pager, next, jumper"'
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-row>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import api from '/@/api/grpc';
import { ActivityDetails, ListActivityReply, ListActivityReq } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import { Search } from '@element-plus/icons-vue';
import LevelCheckbox from '/@/components/level/checkbox.vue';
import LevelImage from '/@/components/level/image.vue';
import { listActivityOptions, listDchostOptions } from '/@/api/grpc/method';
import MultiSelector from '/@/components/form/multiSelector.vue';

const pageIdx = ref(1);
const pageSize = ref(10);
const total = ref(0);
const exhausted = ref(false);
const threatLevel = ref([]);
const lastOccurenceTime = ref([]);
const idInput = ref('');

const dchostSelected = ref([]);
const dchostOptions = ref([]);

const titleSelected = ref([]);
const titleOptions = ref([]);

const loading = ref(false);
const data = ref([] as ActivityDetails[]);

const filterFieldDataKey = (fieldData: Object) => {
    return Object.keys(fieldData).filter(key => key.toLowerCase() !== 'hostname');
}

const resetReqParams = () => {
    threatLevel.value = [];
    lastOccurenceTime.value = [];
};

const refreshActivity = () => {
    const req: ListActivityReq = {
        pageIdx: pageIdx.value,
        pageSize: pageSize.value,
        level: threatLevel.value, // 威胁等级,严重性
        iD: '', // 可选，如果存在查询对应activityID的威胁活动
        startTm: '', //  可选，开始时间
        endTm: '', //  可选，结束时间
        orderCreateTm: -1, // 可选，排序 1|-1
        dcHostname: dchostSelected.value,
        title: [],
    };

    loading.value = true;

    api.listActivity(req)
    .then(resp => resp.response)
    .then((reply: ListActivityReply) => {
        console.log(reply);
        exhausted.value = reply.exhausted;
        data.value = reply.list;
        total.value = reply.page?.total || total.value;
        pageIdx.value = reply.page?.pageIdx || pageIdx.value;
        pageSize.value = reply.page?.pageSize || pageSize.value;
    })
    .catch(err => alertApiError(err))
    .finally(() => loading.value = false);
};

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    refreshActivity();
};

const handleCurrentChange = (val: number) => {
    pageIdx.value = val;
    refreshActivity();
};

onMounted(() => {
    refreshActivity();

    listDchostOptions().then(res => dchostOptions.value = res);
    listActivityOptions().then(res => titleOptions.value = res);
});

watch(() => [threatLevel.value, lastOccurenceTime.value, idInput.value, pageIdx.value, pageSize.value, dchostSelected.value, titleSelected.value], refreshActivity);

</script>

<style type="scss" scoped>
</style>