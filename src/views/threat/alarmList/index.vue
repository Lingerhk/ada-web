<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 高级搜索 -->
                <el-form v-if="isAdvanceSearch">
                    <el-form-item v-for="(value, index) in advancedSearchRef" style="margin-bottom: 5px;" size="default"
                        :key="index">
                        <template #label>
                            <el-col v-if="advancedSearchRef.length !== 1"
                                style="align-items: center; justify-content: center; cursor: pointer;"
                                @click="() => handleCloseAdvancedSearch(index)">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </el-col>
                        </template>
                        <AdvancedSearch v-model="advancedSearchRef[index]"></AdvancedSearch>
                    </el-form-item>

                    <el-form-item @click="handleAddAdvancedSearch" style="cursor: pointer;">
                        <template #label>
                            <el-col style="align-items: center; justify-content: center;">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </el-col>
                        </template>
                        <span>{{ $t('message.threat.addAdvancedSearch') }}</span>
                        <!-- <el-button @click="handleAddAdvancedSearch">add</el-button> -->
                    </el-form-item>
                </el-form>

                <!-- 基础搜索 -->
                <el-form v-if="!isAdvanceSearch" :inline="true" class="filter-form">
                    <!-- 威胁类型 -->
                    <el-form-item :label="$t('message.threat.threatName')">
                        <MultiSelector v-model:selected="threatIds" :options="threatIdOptions"></MultiSelector>
                    </el-form-item>
                    <!-- 威胁等级 -->
                    <el-form-item :label="$t('message.threat.levelName')">
                        <LevelCheckbox v-model="threatLevel" />
                    </el-form-item>
                    <!-- 处理状态 -->
                    <el-form-item :label="$t('message.threat.tableTitle.eventStatus')">
                        <el-radio-group v-model="eventStatus" size="default">
                            <el-radio-button v-for="(level, index) in eventStatusOptions" :key="level" :value="index">
                                {{ $t(`message.threat.status.${level}`)}}
                            </el-radio-button>
                        </el-radio-group>
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
                    <el-switch v-model="isAdvanceSearch" size="default"
                        :active-text="$t('message.threat.advanceSearch')" style="float:right" />
                    <el-switch v-model="isAutoRefresh" size="default" :active-text="$t('message.threat.autoRefresh')"
                        @change="onAutoRefresh" />
                    <el-button type="primary" size="default" @click="refreshThreatTable">{{
                        $t('message.threat.refreshManually') }}</el-button>
                    <!-- <el-button type="primary" size="default">{{ $t('message.threat.print') }}</el-button> -->
                </el-space>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 30px; padding-left: 28px;">
                <el-col :span="4" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackSource') }}
                </el-col>
                <el-col :span="6" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackMethod') }}
                </el-col>
                <el-col :span="3" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackTarget') }}
                </el-col>
                <el-col :span="1" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackLevel') }}
                </el-col>
                <el-col :span="4" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackName') }}
                </el-col>
                <el-col :span="4" class="attackFlow-container-text">
                    {{ $t('message.threat.alarmList.attackDomain') }}
                </el-col>
                <el-row :span="1" class="attackFlow-container-text">
                </el-row>
            </el-row>
            <el-scrollbar>
                <el-row>
                    <el-timeline style="width: 100%;">
                        <el-timeline-item v-for="(item, index) in tableRows" :key="index"
                            :timestamp="formatApiTime(item.startTm)" placement="top" :color="getLevelColor(item.level)"
                            center>
                            <el-row>
                                <el-card :class="{'pointer-cursor timeline-card': true, 'selected-card': isSelected(item)}" @click="toggleSelect(item)">
                                    <el-row>
                                        <el-col :span="4" class="attackFlow-container">
                                            <el-space>
                                                <el-icon :size="32">
                                                    <Monitor />
                                                </el-icon>
                                                {{ item.attackFlow?.fields[1].item.value ?? 'Unknown' }}
                                            </el-space>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-row>
                                                <el-tooltip :content="item.eventTmpl" placement="top">
                                                    <!-- <span class="eventTmpl-container">{{ item.eventTmpl }}</span> -->
                                                    <div v-html="formatTemplate(item.eventTmpl)"
                                                        class="eventTmpl-container" />
                                                </el-tooltip>
                                            </el-row>
                                            <div class="arrowRight"></div>
                                        </el-col>
                                        <el-col :span="3" class="attackFlow-container">
                                            <el-space>
                                                <svg class="icon"
                                                    style="width: 32px;height: 32px;vertical-align: middle;fill: currentColor;overflow: hidden;"
                                                    viewBox="0 0 1024 1024" version="1.1"
                                                    xmlns="http://www.w3.org/2000/svg" p-id="25713">
                                                    <path
                                                        d="M901.12 0c67.8656 0 122.88 55.0144 122.88 122.88v778.24c0 67.8656-55.0144 122.88-122.88 122.88H122.88c-67.8656 0-122.88-55.0144-122.88-122.88V122.88C0 55.0144 55.0144 0 122.88 0h778.24z m0 40.96H122.88C78.17728 40.96 41.8304 76.76928 40.97536 121.2672L40.96 122.88v778.24c0 44.70272 35.80928 81.0496 80.3072 81.90464L122.88 983.04h778.24c44.70272 0 81.0496-35.80928 81.90464-80.3072L983.04 901.12V122.88c0-44.70272-35.80928-81.0496-80.3072-81.90464L901.12 40.96z m-215.52128 287.86176c35.16416 0.3328 63.83104 10.752 86.00064 31.24736 22.1696 20.66944 36.16768 46.24896 41.99936 76.7488H755.0976c-4.50048-14.66368-12.66688-27.16672-24.4992-37.49888-12.33408-9.8304-27.33568-14.91456-45.0048-15.24736-12.99456 0.3328-24.1664 2.9184-33.49504 7.74656-9.50272 5.00224-17.16736 11.25376-22.99904 18.74944-7.168 7.8336-11.91936 17.92-14.24896 30.25408-2.66752 12.99968-4.00384 37.41696-4.00384 73.24672v2.88256c0.0768 34.2528 1.408 57.5488 4.00384 69.86752 2.3296 12.66688 7.08096 22.91712 14.24896 30.75072 5.83168 7.5008 13.49632 13.58336 22.99904 18.2528 9.33376 5.49888 20.50048 8.2432 33.50016 8.2432 31.0016 0 54.1696-16.57856 69.49888-49.74592h58.50112c-8.00256 33.83296-23.24992 59.83232-45.75232 77.99808-23.16288 18.00192-50.5856 27.00288-82.24768 27.00288-28.672-0.6656-52.5824-7.66464-71.75168-21.00224-19.49696-12.83072-33.664-27.66336-42.496-44.49792a408.5248 408.5248 0 0 1-7.25504-15.74912c-1.9968-5.1712-3.66592-11.66848-4.99712-19.50208-2.49856-14.66368-3.75296-42.83392-3.75296-84.50048v-2.92864c0.06144-40.71424 1.31072-68.0704 3.75296-82.0736 2.6624-14.33088 6.74816-25.91232 12.24704-34.74432 8.83712-16.83456 23.00416-31.83616 42.50112-45.0048 19.16928-13.33248 43.0848-20.16256 71.75168-20.49536z m-309.67808 3.00032c49.3312 0.3328 86.33344 20.83328 111.0016 61.49632 8.832 13.6704 14.4128 28.0064 16.74752 43.00288 1.83296 15.0016 2.74944 40.91392 2.74944 77.7472 0 39.168-1.41824 66.50368-4.2496 82.00192-1.3312 7.8336-3.33312 14.83264-6.00064 20.99712a194.08896 194.08896 0 0 1-10.25024 18.75456c-10.66496 17.16224-25.4976 31.3344-44.49792 42.496-18.83648 12.00128-41.91744 18.00192-69.25312 18.00192H248.4224V331.82208z m-4.16256 52.21888l-2.08896 0.03072h-65.9968v259.9936H369.664c31.0016 0 53.504-10.57792 67.50208-31.744 6.16448-7.8336 10.0864-17.75104 11.7504-29.7472 1.50016-11.83744 2.2528-34.00192 2.2528-66.5088 0-31.66208-0.75264-54.32832-2.2528-67.9936-1.9968-13.6704-6.75328-24.75008-14.25408-33.24928-15.32928-21.1712-36.99712-31.42144-64.9984-30.75072z"
                                                        fill="#444444" p-id="25714"></path>
                                                </svg>
                                                {{ item.attackFlow?.fields[2].item.value }}
                                            </el-space>
                                        </el-col>
                                        <el-col :span="1" class="attackFlow-container">
                                            <LevelImage :level="item.level" />
                                        </el-col>
                                        <el-col :span="4" class="attackFlow-container">
                                            <el-card shadow="never"
                                                :style="{ width: '220px', 'border-left': `5px solid ${getLevelColor(item.level)}` }">
                                                <el-row>{{ item.title }}</el-row></el-card>
                                        </el-col>
                                        <el-col :span="4" class="attackFlow-container">{{ item.dcHostname }}</el-col>
                                        <el-row :span="1" class="attackFlow-container">
                                            <el-button @click.stop="handleDetail(item, null)" :icon="ArrowRight">{{
                                                $t('message.tableCommon.detail')
                                                }}</el-button>
                                        </el-row>
                                    </el-row>
                                </el-card>
                            </el-row>
                        </el-timeline-item>
                    </el-timeline>
                </el-row>
            </el-scrollbar>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <el-button type="primary" size="default" :disabled="tableRowsSelected.length === 0"
                    @click="handleClose(tableRowsSelected)">{{ $t('message.tableCommon.closeBulk') }}</el-button>
                <el-pagination v-model:current-page="pageIdx" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]" layout="sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-row>
        </el-card>
        <DetailDrawer ref="detailDrawerRef" />
        <AddWhiteDialog v-model="addWhiteVisiable" :fields="addWhiteFields" :title="addWhiteTitle"
            :domain="addWhiteDomain" :flow-id="addWhiteFlowId" />
    </div>
</template>

<script setup lang="ts">

import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatApiTime, formatDate, getPrev1Year, getPrev7Days, shortcuts } from '/@/utils/formatTime';
import { ListThreatReply, ListThreatReply_Details, ListThreatReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { closeThreats, formatTemplate } from './operation';
import AddWhiteDialog from './AddWhiteDialog.vue';
import LevelCheckbox from '/@/components/level/checkbox.vue';
import { Monitor, ArrowRight  } from '@element-plus/icons-vue';
import { getLevelColor, OptionType } from '/@/utils/constant';
import { listThreatRuleOptions } from '/@/api/grpc/method';
import LevelImage from '/@/components/level/image.vue';

const { t } = useI18n();

const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));
const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const AdvancedSearch = defineAsyncComponent(() => import('/@/components/form/advancedSearch.vue'));

const detailDrawerRef = ref();
const isAdvanceSearch = ref(false);
const isAutoRefresh = ref(false);
const lastOccurenceTime = ref(getPrev1Year());
const threatIds = ref([]);
const threatIdOptions = ref<OptionType[]>([]);
const threatLevel = ref([]);
const eventStatus = ref<number>(0);
const eventStatusOptions = [0, 1];

const pageIdx = ref(1);
const pageSize = ref(10);
const tableRows = ref<ListThreatReply_Details[]>([]);
const tableRowsSelected = ref<ListThreatReply_Details[]>([]);
const tableLoading = ref(false);
const exhausted = ref(false);
const advancedSearchRef = ref([] as AdvancedSearchType[]);
const total = ref(0);

// 加白
const addWhiteFields = ref<any[]>([]);
const addWhiteVisiable = ref<boolean>(false);
const addWhiteTitle = ref<string>('');
const addWhiteDomain = ref<string>('');
const addWhiteFlowId = ref<string>('');

const shortDcName = (name: string) => {
    if (!name) {
        return name;
    }

    return name.split('.')[0];
}

const iconTag = (item: Object) => {
    const name = item.obj;
    const value = item.value;

    const iconMap: Map<string, string> = new Map([
        ["user", "iconfont icon-icon-"],
        ["ip", "iconfont icon-shuxingtu"],
        ["computer", "iconfont icon-diannao1"],
        ["dc", "iconfont icon-diannao1"],
    ]);

    const icon = iconMap.get(name);

    // console.log(name, icon, value);

    return icon;

};

const refreshThreatTable = () => {
    const req: ListThreatReq = {
        pageIdx: pageIdx.value,
        pageSize: pageSize.value,
        iDs: threatIds.value, // 威胁ID list
        level: threatLevel.value, // 威胁等级,严重性
        startTm: formatDate(lastOccurenceTime.value[0], 'YYYY-mm-dd HH:MM:SS'), // 开始时间
        endTm: formatDate(lastOccurenceTime.value[1], 'YYYY-mm-dd HH:MM:SS'), // 结束时间
        searchType: isAdvanceSearch.value ? 1 : 0, // 检索类型,0为普通检索，1为高级检索
        advancedSearch: isAdvanceSearch.value ? advancedSearchRef.value : [], // 高级检索
        sortTm: -1, // 时间排序，1为升序，-1为降序
        eventStatus: eventStatus.value,
    };

    console.log(req)
    tableLoading.value = true;

    api.listThreat(req)
    .then(response => response.response)
    .then((data: ListThreatReply) => {
        exhausted.value = data.exhausted;
        tableRows.value = data.list;
        total.value = data.page?.total ?? 0;
        console.log(data.list);
    })
    .catch(err => {
        const msg = decodeURIComponent(err.message);
        ElMessage.error(msg);
        console.log(err.code, msg);
    })
    .finally(() => {
        tableLoading.value = false;
        tableRowsSelected.value = [];
    });
};

const handleSelect = (row: ListThreatReply_Details, value: boolean) => {
    // console.log(row, value);
    if (value) {
        tableRowsSelected.value = [...tableRowsSelected.value, row];
    } else {
        tableRowsSelected.value = tableRowsSelected.value.filter(v => v.iD !== row.iD);
    }
};

const isSelected = (row: ListThreatReply_Details) => {
    return tableRowsSelected.value.findIndex(v => v.iD === row.iD) !== -1;
};

const toggleSelect = (row: ListThreatReply_Details) => {

    if (isSelected(row)) {
        tableRowsSelected.value = tableRowsSelected.value.filter(v => v.iD !== row.iD);
    } else {
        tableRowsSelected.value = [...tableRowsSelected.value, row];
    }
}

const handleAddWhite = (row: ListThreatReply_Details) => {
    addWhiteFields.value = row.attackFlow?.fields ?? [];
    addWhiteVisiable.value = true;
    addWhiteTitle.value = row.title;
    addWhiteDomain.value = row.domain;
    addWhiteFlowId.value = row.flowId;
};

const handleClose = (rows: ListThreatReply_Details[]) => {
    console.log('close', rows);
    if (!rows || rows.length === 0) {
        return;
    }

    closeThreats(rows, t);
};

const handleDetail = (row: ListThreatReply_Details, col: any) => {
    // if (!col || !col.property) {
    //     return;
    // }

    // detailDrawerRef.value.open(t('message.threat.detail.title'), "66176c29852ef3e39d196cc9");
    detailDrawerRef.value.open(t('message.threat.detail.title'), row.iD);
}

const handleCloseAdvancedSearch = (index: number) => {
    console.log("close advanced search", index);
    console.log("value", advancedSearchRef.value);
    // advancedSearchRef.value = advancedSearchRef.value.filter((v, i) => i !== index);
    advancedSearchRef.value.splice(index, 1);
}

const handleAddAdvancedSearch = () => {
    advancedSearchRef.value = [...advancedSearchRef.value, { name: '', type: '', value: [] }];
}

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)

  pageSize.value = val;
  refreshThreatTable();
}

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)

  pageIdx.value = val;
  refreshThreatTable();
}

let intervalId: NodeJS.Timer | null = null;

const enableAutoRefresh = () => {
    if (!intervalId) {
        ElMessage.info(t('message.threat.alarmList.enableAutoRefresh', ['5']));
        intervalId = setInterval(() => {
            refreshThreatTable();
        }, 5000);
    }
};

const disalbeAutoRefresh = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

const onAutoRefresh = (val) => {
    if (val) {
        enableAutoRefresh();
    } else {
        disalbeAutoRefresh();
    }
};

onMounted(() => {
    refreshThreatTable();

    listThreatRuleOptions().then(options => threatIdOptions.value = options);
});

onUnmounted(() => {
    disalbeAutoRefresh();
});

watch(advancedSearchRef,
    (newValue, oldValue) => {
        // console.log('ref to', newValue);
        refreshThreatTable();
    }, { deep: true }
);

watch(isAdvanceSearch, (value) => {
    if (value === true) {
        advancedSearchRef.value = [{
            name: 'level',
            type: 'eq',
            value: ['2', '3', '4', '5'],
        }];
    } else {
        refreshThreatTable();
    }
});

watch([lastOccurenceTime, threatIds, threatLevel, eventStatus], () => {
    refreshThreatTable();
});

</script>

<style lang="scss">
.pointer-cursor {
    cursor: pointer;
}

.eventTmpl-container {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
}

.attackFlow-container {
    align-items: center;
    justify-content: center;
    /* justify-content: center; */
    display: flex;
}

.attackFlow-container-text {
    align-items: center;
    justify-content: center;
    /* justify-content: center; */
    display: flex;
    font-size: 16px;
    font-weight: bold;
}

.arrowRight {
    // width: 290px;
    width: calc(100% - 20px);
    /* 总宽度 */
    height: 20px;
    /* 总高度，包括边框 */
    border-top: 1px solid black;
    /* 顶部边框作为直线 */
    position: relative;
    /* 设置相对定位，为伪元素定位提供基准 */
    top: 10%;
    /* 将箭头定位到直线的垂直中心 */
}

.arrowRight::after {
    content: '';
    /* 伪元素需要内容来显示 */
    position: absolute;
    /* 绝对定位 */
    right: 0;
    /* 定位到容器的右侧 */
    top: -15%;
    /* 将箭头定位到直线的垂直中心 */
    margin-top: -3px;
    /* 向上调整一半的箭头高度，以确保垂直居中 */
    border-left: 6px solid black;
    /* 左边黑色边框形成箭头 */
    border-top: 6px solid transparent;
    /* 上边透明边框 */
    border-bottom: 6px solid transparent;
    /* 下边透明边框 */
}

.select-button {
    height: 100px;
    width: 50px;
    border: 1px solid var(--el-card-border-color);
    background-color: rgb(233, 235, 239);
    align-items: center;
    justify-content: center;
    display: flex;
}

.timeline-card {
    border-radius: 0;
    width: 100%;
    min-width: 1400px;
}

.selected-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 30px solid #409EFF; /* 左侧蓝色边，形成三角形的另一腰与底边 */
  border-top: 0px solid transparent; /* 顶部透明边，形成等腰三角形的一腰 */
  border-bottom: 30px solid transparent; /* 底部透明边 */
}
</style>