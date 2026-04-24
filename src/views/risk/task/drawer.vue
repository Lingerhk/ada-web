<template>
    <el-drawer v-model="model" :size="1200">
        <template #header>
            <h3>{{ t(`message.risk.task.title_${state.reply.headType}`) }}</h3>
        </template>
        <template #default>
            <el-row style="padding: 20px;">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true">
                    <template v-for="field in state.reply.headField">
                        <el-table-column v-if="field !== 'ID'" :label="translateFieldLabel(field)" :key="field" show-overflow-tooltip
                            :width="getWidth(field)">
                            <template #default="prop">
                                <LevelImage v-if="field === 'level'" :level="getFieldValue(prop.row, field)" />
                                <span v-else-if="field === 'result'"
                                    :class="`result-${prop.row.result}`">{{
                                    T(`result_${getFieldValue(prop.row, field)}`) }}</span>
                                <span v-else-if="field === 'locked'"
                                    :class="`locked-${_.get(prop.row.params, 'locked')}`">{{
                                    T(`locked_${_.get(prop.row.params, 'locked')}`) }}</span>
                                <span v-else-if="field === 'updateTm'">{{ formatApiTime(getFieldValue(prop.row, field)) }}</span>
                                <span v-else>{{ getFieldValue(prop.row, field) }}</span>
                            </template>
                        </el-table-column>
                    </template>
                </el-table>
            </el-row>
            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.pageIdx" v-model:page-size="state.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                    :total="state.reply.page?.total ?? 0" @size-change="(val: number) => state.pageSize = val"
                    @current-change="(val: number) => state.pageIdx = val" />
            </el-row>
        </template>
    </el-drawer>
</template>
    
<script setup lang="ts">
import { reactive, watch } from 'vue';
import { getScanTask } from '/@/api/grpc/method';
import { alertApiError } from '/@/utils/error';
import { GetScanTaskReply } from '/@/api/grpc/ada';
import { transTask as T } from '/@/utils/translator';
import LevelImage from '/@/components/level/image.vue';
import { formatApiTime } from '/@/utils/formatTime';
import { _ } from 'lodash';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const model = defineModel({
    type: Boolean,
    default: false,
});

const props = defineProps({
    id: String,
});

const state = reactive({
    pageIdx: 1,
    pageSize: 10,
    reply: {} as GetScanTaskReply,
    exhausted: false,
    loading: false,
});

// Translate field labels from Chinese to proper i18n keys
const translateFieldLabel = (field: string): string => {
    // Direct i18n key mapping for field labels
    return t(`message.risk.task.${field}`, field);
};

// Get field value from row data based on field name
const getFieldValue = (row: any, field: string): any => {
    // Map field names to actual data paths
    const fieldMap: Record<string, string> = {
        'name': 'name',
        'domain': 'domain',
        'subType': 'subType',
        'level': 'level',
        'result': 'result',
        'dcHostname': 'dcHostname',
        'tmplName': 'tmplName',
        'updateTm': 'updateTm',
        // Weakpwd specific fields from params
        'username': 'params.username',
        'samName': 'params.sam_name',
        'password': 'params.password',
        'expirationTm': 'params.expiration_tm',
        'lastUpdateTm': 'params.last_update_tm',
        'locked': 'params.locked',
        // Baseline specific fields from params
        'entries': 'params.entries',
    };

    const path = fieldMap[field] || field;
    return _.get(row, path, '');
};

const getWidth = (field: string): string | number => {
    const width: Record<string, number> = {
        updateTm: 160,
        expirationTm: 160,
        lastUpdateTm: 160,
        tmplName: 160,
        username: 160,
        samName: 160,
        name: 250,
        subType: 200,
        domain: 140,
        dcHostname: 200,
        password: 120,
        locked: 100,
        entries: 140,
    };

    return width[field] ?? '';
};

const init = async () => {
    if (!props.id) {
        return;
    }

    try {
        state.loading = true;
        const reply = await getScanTask(props.id, state.pageIdx, state.pageSize);
        state.reply = reply;
        console.log('GetScanTaskReply', reply);
    } catch (err) {
        alertApiError(err);
    } finally {
        state.loading = false;
    }
};

watch(() => model.value, (val) => {
    if (val) {
        init();
    }
});

watch(() => [state.pageIdx, state.pageSize], init);

</script>

<style lang="scss">
.result-1 {
    color: green;
}

.result-0 {
    color: red;
}
</style>
