<!-- Extension guide: 1. update `searchCandidates`; 2. extend the `v-if` branches inside `el-space`; 3. add the default value in `watch(() => model.value.name, ...)`. -->
<template>
    <el-space wrap size="small">
        <!-- Field type -->
        <el-select v-model="model.name" style="width: 160px;" size="default" :placeholder="model.name">
            <el-option v-for="option in searchCandidates" :value="option.name"
                :label="$t(`message.advancedSearch.${option.name}`)" :key="option.name"></el-option>
        </el-select>
        <!-- Operator type -->
        <el-select v-if="model.name !== ''" v-model="model.type" style="width: 160px;" size="default"
            :placeholder="model.type">
            <el-option v-for="option in getTypeOptions()" :value="option.value"
                :label="$t(`message.advancedSearch.${option.label}`)" :key="option.value"></el-option>
        </el-select>
        <!-- Input -->
        <!-- 1. level -->
        <MultiSelector v-if="model.name === 'level'" v-model:selected="model.value" :options="getSelectOptions()" />
        <!-- 2. status -->
        <MultiSelector v-if="model.name === 'status'" v-model:selected="model.value" :options="getSelectOptions()" />
        <!-- 3. time -->
        <el-date-picker v-if="model.name === 'time'" size="default" v-model="model.value"
            :type="model.type === 'bt' ? 'datetimerange' : 'datetime'" :range-separator="$t('message.time.to')"
            :start-placeholder="$t('message.time.start')" :end-placeholder="$t('message.time.end')"
            :style="model.type !== 'bt' ? { width: '240px' } : {}" />
        <!-- 4. User -->
        <el-input v-if="model.name === 'username'" size="default" v-model="model.value[0]"></el-input>
        <!-- 5. eventStatus -->
        <el-radio-group v-if="model.name === 'eventStatus'" v-model="model.value[0]">
            <el-radio-button v-for="opt in getSelectOptions()" :key="opt.value" :value="opt.value" :label="opt.label">
            </el-radio-button>
        </el-radio-group>
        <!-- 6. Threat name -->
        <MultiSelector v-if="model.name === 'title'" v-model:selected="model.value" :options="getSelectOptions()" />
        <!-- 7. Domain -->
        <MultiSelector v-if="model.name === 'dcHostname'" v-model:selected="model.value" :options="getSelectOptions()" />
        <!-- 8. Computer IP -->
        <el-input v-if="model.name === 'ip'" size="default" v-model="model.value[0]"></el-input>
    </el-space>
</template>

<script setup lang="ts" name="AdvancedSearch">

import { ref, watch, defineAsyncComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { OptionType } from '/@/utils/constant';
import { listDomainOptions, listThreatRuleOptions } from '/@/api/grpc/method';

const { locale, t } = useI18n();
const MultiSelector = defineAsyncComponent(() => import('./multiSelector.vue'));

const model = defineModel({
    required: true,
    default: {
        name: '',
        type: '',
        value: [] as any[],
    }
});

const searchCandidates = [{
    name: 'level',
    type: [
        { label: 'eq', value: 'eq', },
        { label: 'ne', value: 'ne', },
    ],
    options: [
        { label: t('message.threat.level.2'), value: '2' },
        { label: t('message.threat.level.3'), value: '3' },
        { label: t('message.threat.level.4'), value: '4' },
        { label: t('message.threat.level.5'), value: '5' },
    ],
},
{
    name: 'eventStatus',
    type: [
        { label: 'eq', value: 'eq', },
        { label: 'ne', value: 'ne', },
    ],
    options: [
        { label: t('message.threat.status.0'), value: 0, },
        { label: t('message.threat.status.1'), value: 1, },
    ],
},
{
    name: 'time',
    type: [
        { label: 'tmLt', value: 'lt', },
        { label: 'tmGt', value: 'gt', },
        { label: 'tmBt', value: 'bt', },
    ],
},
{
    name: 'title',
    type: [
        { label: 'eq', value: 'eq', },
    ],
    options: []
},
{
    name: 'dcHostname',
    type: [
        { label: 'eq', value: 'eq', },
    ],
    options: [],
},
{
    name: 'username',
    type: [
        { label: 'eq', value: 'eq', },
        { label: 'ne', value: 'ne', },
        { label: 'contain', value: 'contain', },
    ],
},
{
    name: 'ip',
    type: [
        { label: 'eq', value: 'eq', },
        { label: 'ne', value: 'ne', },
        { label: 'contain', value: 'contain', },
    ],
},
];

const titleOptions = ref<OptionType[]>([]);
const domainOptions = ref<OptionType[]>([]);

onMounted(() => {
    listThreatRuleOptions().then(options => titleOptions.value = options);
    listDomainOptions().then(options => domainOptions.value = options);
});

// Initialize
watch(() => model.value.name, (value) => {
        if (value === 'level') {
            model.value.type = 'eq';
            model.value.value = ['2', '3', '4', '5'];
        } else if (value === 'status') {
            model.value.type = 'eq';
            model.value.value = ['pending', 'finished'];
        } else if (value === 'time') {
            model.value.type = 'lt';
            model.value.value = [];
        } else if (value === 'eventStatus') {
            model.value.type = 'eq';
            model.value.value = [0];
        } else if (value === 'title' || value === 'dcHostname') {
            model.value.type = 'eq';
            model.value.value = [];
        } else {
            // Default string value
            model.value.type = 'eq';
            model.value.value = [''];
        }
});

const getCandidate = () => {
    return searchCandidates.find(v => v.name === model.value.name);
}

const getTypeOptions = () => {
    const cand = getCandidate();
    if (!cand) {
        return [];
    }

    return cand.type;
}

const getSelectOptions = () => {
    const cand = getCandidate();
    if (!cand) {
        return [];
    }

    if (cand.name === 'title') {
        return titleOptions.value;
    } else if (cand.name === 'dcHostname') {
        return domainOptions.value;
    }

    return cand.options;
}

</script>

<style type="scss">
</style>