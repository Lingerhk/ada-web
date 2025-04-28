<template>
    <el-drawer v-model="model" :size="1200">
        <template #header>
            <h3>{{ T(`title_${state.reply.headType}`) }}</h3>
        </template>
        <template #default>
            <el-row style="padding: 20px;">
                <el-table :data="state.reply.list" v-loading="state.loading" :border="true">
                    <template v-for="field in state.reply.headField">
                        <el-table-column v-if="T(field) !== 'iD'" :label="field" :key="field" show-overflow-tooltip
                            :width="getWidth(T(field))">
                            <template #default="prop">
                                <LevelImage v-if="T(field) === 'level'" :level="prop.row[T(field)]" />
                                <span v-else-if="T(field) === 'result' || T(field) === 'params.locked'"
                                    :class="`${T(field)}-${prop.row.result}`">{{
                                    T(`${T(field)}_${_.get(prop.row, T(field))}`) }}</span>
                                <span v-else-if="T(field) === 'updateTm'">{{ formatApiTime(prop.row[T(field)]) }}</span>
                                <span v-else>{{ _.get(prop.row, T(field)) }}</span>
                            </template>
                        </el-table-column>
                    </template>
                </el-table>
            </el-row>
            <el-row style="margin-top: 10px; padding: 0 20px;" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.pageIdx" v-model:page-size="state.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper'
                    :total="state.reply.page?.total" @size-change="(val: number) => state.pageSize = val"
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

const getWidth = (field: string): string | number => {
    const width = {
        updateTm: 160,
        'params.expiration_tm': 160,
        'params.last_update_tm': 160,
        'tmplName': 160,
        'params.username': 160,
        'params.sam_name': 160,
        name: 250,
        subType: 200,
        domain: 140,
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