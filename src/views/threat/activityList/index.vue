<template>
    <div class="layout-pd activity-page">
        <section class="activity-command-panel">
            <div class="activity-command-main">
                <div class="activity-command-copy">
                    <div class="activity-kicker">{{ $t('message.threat.activityList.activityConsole') }}</div>
                    <p>{{ $t('message.threat.activityList.activityConsoleDesc') }}</p>
                </div>
                <div class="activity-command-actions">
                    <el-button size="default" :icon="RefreshLeft" @click="resetReqParams">
                        {{ $t('message.threat.reset') }}
                    </el-button>
                    <el-button type="primary" size="default" :icon="Refresh" @click="refreshActivity">
                        {{ $t('message.threat.refreshManually') }}
                    </el-button>
                </div>
            </div>

            <div class="activity-metrics">
                <div class="metric-card">
                    <span class="metric-label">{{ $t('message.threat.activityList.totalActivities') }}</span>
                    <strong>{{ total }}</strong>
                    <span>{{ $t('message.threat.activityList.filteredScope') }}</span>
                </div>
                <div class="metric-card metric-hot">
                    <span class="metric-label">{{ $t('message.threat.activityList.highRiskRows') }}</span>
                    <strong>{{ highRiskCount }}</strong>
                    <span>{{ $t('message.threat.activityList.currentPage') }}</span>
                </div>
                <div class="metric-card">
                    <span class="metric-label">{{ $t('message.threat.activityList.visibleRows') }}</span>
                    <strong>{{ data.length }}</strong>
                    <span>{{ exhausted ? $t('message.threat.activityList.lastPage') : $t('message.threat.activityList.morePages') }}</span>
                </div>
                <div class="metric-card">
                    <span class="metric-label">{{ $t('message.threat.activityList.activeControllers') }}</span>
                    <strong>{{ dcCount }}</strong>
                    <span>{{ $t('message.threat.activityList.currentPage') }}</span>
                </div>
            </div>

            <div class="activity-filter-panel">
                <el-form :inline="true" class="filter-form activity-filter-form">
                    <el-form-item :label="$t('message.threat.levelName')">
                        <el-select v-model="threatLevel" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="filter-level-select" :placeholder="$t('message.threat.alarmList.selectLevel')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="levelCheckAll" :indeterminate="levelIndeterminate" @change="handleLevelCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in levelOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.dcHostname')">
                        <el-select v-model="dchostSelected" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="filter-host-select" :placeholder="$t('message.threat.activityList.selectDcHostname')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="dchostCheckAll" :indeterminate="dchostIndeterminate" @change="handleDchostCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in dchostOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.activityTitle')">
                        <el-select v-model="titleSelected" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="filter-title-select" :placeholder="$t('message.threat.activityList.selectTitle')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="titleCheckAll" :indeterminate="titleIndeterminate" @change="handleTitleCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in titleOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.threat.lastOccurenceTime')">
                        <el-date-picker class="filter-date-range" size="default" v-model="lastOccurenceTime" type="datetimerange"
                            format="YY-MM-DD HH:mm"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-form-item>
                    <el-form-item>
                        <el-input class="filter-search-input" v-model="idInput" size="default" :placeholder="$t('message.threat.activityList.searchActivityId')"
                            :suffix-icon="Search" clearable></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </section>

        <section class="activity-table-panel">
            <div class="activity-list-header">
                <div>
                    <span>{{ $t('message.threat.activityList.activityFeed') }}</span>
                    <strong>{{ data.length }}</strong>
                </div>
            </div>

            <div class="activity-table-shell">
                <el-table :data="data" v-loading="loading" :border="false" row-class-name="activity-row"
                    class="activity-table" style="width: 100%;" @row-click="handleRowClick" ref="activityTable">
                    <el-table-column type="expand" width="52">
                        <template #default="props">
                            <div class="json-viewer-wrapper">
                                <div class="raw-log-header">
                                    <div>
                                        <strong>{{ $t('message.threat.activityList.rawLog') }}</strong>
                                        <span>{{ $t('message.threat.activityList.rawLogDesc') }}</span>
                                    </div>
                                    <code>{{ getCompactId(props.row.iD) }}</code>
                                </div>
                                <JsonViewer class="activity-json-viewer" :value="parseRawLog(props.row.rawLog)" copyable sort></JsonViewer>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.title')" min-width="300" show-overflow-tooltip>
                        <template #default="scope">
                            <div class="activity-title-cell">
                                <strong>{{ scope.row.title || unknownText }}</strong>
                                <span>{{ scope.row.desc || unknownText }}</span>
                                <div class="activity-id-row">
                                    <span v-if="scope.row.ruleId">{{ $t('message.threat.activityList.ruleId') }} {{ scope.row.ruleId }}</span>
                                    <span v-if="scope.row.attckId">{{ $t('message.threat.activityList.attackId') }} {{ scope.row.attckId }}</span>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.createTm')" width="170">
                        <template #default="scope">
                            <span class="time-chip">{{ formatApiTime(scope.row.createTm) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.dcHostname')" min-width="180">
                        <template #default="scope">
                            <span class="host-chip">{{ scope.row.dcHostname || unknownText }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.level')" width="115" align="center">
                        <template #default="scope">
                            <span class="level-chip" :style="{ '--level-color': getLevelColor(scope.row.level) }">
                                {{ $t(`message.threat.level.${scope.row.level}`) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.activityList.keyFields')" min-width="260">
                        <template #default="scope">
                            <div class="field-chip-group">
                                <el-tooltip v-for="entry in getFieldEntries(scope.row.fieldData)" :key="entry.key" effect="dark" :content="entry.value" placement="top">
                                    <span class="field-chip">
                                        <b>{{ entry.key }}</b>
                                        <em>{{ entry.value }}</em>
                                    </span>
                                </el-tooltip>
                                <span v-if="getRemainingFieldCount(scope.row.fieldData) > 0" class="more-chip">
                                    {{ $t('message.threat.activityList.moreFields', [getRemainingFieldCount(scope.row.fieldData)]) }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.tableTitle.tags')" min-width="180">
                        <template #default="scope">
                            <div class="tag-chip-group">
                                <span v-for="tag in getDisplayTags(scope.row.tags)" :key="tag" class="soft-chip">{{ tag }}</span>
                                <span v-if="getRemainingTagCount(scope.row.tags) > 0" class="more-chip">
                                    {{ $t('message.threat.activityList.moreTags', [getRemainingTagCount(scope.row.tags)]) }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.threat.activityList.confidence')" width="140" align="center">
                        <template #default="scope">
                            <span class="confidence-chip" :class="`confidence-${normalizeConfidence(scope.row.ruleConfidence)}`">
                                {{ formatConfidence(scope.row.ruleConfidence) }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="activity-pagination">
                <el-pagination v-model:current-page="pageIdx" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]"
                    :layout='exhausted ? "sizes, prev, pager, jumper" : "sizes, prev, pager, next, jumper"'
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import api from '/@/api/grpc';
import { ActivityDetails, ListActivityReply, ListActivityReq } from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { formatApiTime, formatDate, shortcuts } from '/@/utils/formatTime';
import { Refresh, RefreshLeft, Search } from '@element-plus/icons-vue';
import { listActivityOptions, listDchostOptions } from '/@/api/grpc/method';
import { getLevelOptions2 } from '/@/utils/constant';
import { JsonViewer } from 'vue3-json-viewer';

const pageIdx = ref(1);
const pageSize = ref(10);
const total = ref(0);
const exhausted = ref(false);
const threatLevel = ref<number[]>([]);
const levelOptions = getLevelOptions2();
const lastOccurenceTime = ref<Array<Date | string>>([]);
const idInput = ref('');
const unknownText = '-';

const dchostSelected = ref<string[]>([]);
const dchostOptions = ref<any[]>([]);

const titleSelected = ref<string[]>([]);
const titleOptions = ref<any[]>([]);

const loading = ref(false);
const data = ref([] as ActivityDetails[]);
const activityTable = ref();

// Checkbox states for "Check All"
const levelCheckAll = ref(false);
const levelIndeterminate = ref(false);
const dchostCheckAll = ref(false);
const dchostIndeterminate = ref(false);
const titleCheckAll = ref(false);
const titleIndeterminate = ref(false);

const highRiskCount = computed(() => data.value.filter(item => item.level >= 4).length);
const dcCount = computed(() => new Set(data.value.map(item => item.dcHostname).filter(Boolean)).size);

const fieldEntries = (fieldData?: Record<string, string>) => {
    const seen = new Set<string>();

    return Object.entries(fieldData || {}).filter(([key]) => {
        const normalizedKey = key.toLowerCase();
        if (normalizedKey === 'hostname' || normalizedKey === 'computer' || seen.has(normalizedKey)) return false;
        seen.add(normalizedKey);
        return true;
    });
};

const getFieldEntries = (fieldData?: Record<string, string>) => fieldEntries(fieldData)
    .slice(0, 4)
    .map(([key, value]) => ({ key, value }));

const getRemainingFieldCount = (fieldData?: Record<string, string>) => Math.max(fieldEntries(fieldData).length - 4, 0);

const getDisplayTags = (tags: string[] = []) => tags.slice(0, 3);

const getRemainingTagCount = (tags: string[] = []) => Math.max(tags.length - 3, 0);

const getCompactId = (id: string) => id ? id.slice(0, 10) : unknownText;

const getLevelColor = (level: number) => {
    const colorMap: Record<number, string> = {
        1: '#2f8af5',
        2: '#2fa66a',
        3: '#f0a51b',
        4: '#e56b3f',
        5: '#c2412f',
    };
    return colorMap[level] || '#64748b';
};

const normalizeConfidence = (confidence = '') => confidence.toLowerCase().replace(/[^a-z0-9]/g, '') || 'unknown';

const formatConfidence = (confidence = '') => {
    if (!confidence) return unknownText;
    return confidence.replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const formatRequestTime = (value?: Date | string) => {
    if (!value) return '';
    if (value instanceof Date) return formatDate(value, 'YYYY-mm-dd HH:MM:SS');
    return value;
};

const parseRawLog = (rawLog?: string) => {
    if (!rawLog) return {};

    try {
        return JSON.parse(rawLog);
    } catch {
        return rawLog;
    }
};

const resetReqParams = () => {
    threatLevel.value = [];
    lastOccurenceTime.value = [];
    dchostSelected.value = [];
    titleSelected.value = [];
    idInput.value = '';
    pageIdx.value = 1;
};

const handleRowClick = (row: ActivityDetails) => {
    activityTable.value?.toggleRowExpansion(row);
};

const refreshActivity = () => {
    const req: ListActivityReq = {
        pageIdx: pageIdx.value,
        pageSize: pageSize.value,
        level: threatLevel.value, // Threat levels and severity
        iD: idInput.value.trim(), // Optional. If provided, query the threat activity that matches the given activity ID
        startTm: formatRequestTime(lastOccurenceTime.value[0]), // Optional start time
        endTm: formatRequestTime(lastOccurenceTime.value[1]), // Optional end time
        orderCreateTm: -1, // Optional sort order: 1 or -1
        dcHostname: dchostSelected.value,
        title: titleSelected.value,
    };

    loading.value = true;

    api.listActivity(req)
    .then(resp => resp.response)
    .then((reply: ListActivityReply) => {
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

// Handle level Select All
const handleLevelCheckAll = (val: boolean) => {
    levelIndeterminate.value = false;
    if (val) {
        threatLevel.value = levelOptions.map(opt => opt.value);
    } else {
        threatLevel.value = [];
    }
};

// Handle dchost Select All
const handleDchostCheckAll = (val: boolean) => {
    dchostIndeterminate.value = false;
    if (val) {
        dchostSelected.value = dchostOptions.value.map(opt => opt.value);
    } else {
        dchostSelected.value = [];
    }
};

// Handle title Select All
const handleTitleCheckAll = (val: boolean) => {
    titleIndeterminate.value = false;
    if (val) {
        titleSelected.value = titleOptions.value.map(opt => opt.value);
    } else {
        titleSelected.value = [];
    }
};

onMounted(() => {
    refreshActivity();

    listDchostOptions().then(res => dchostOptions.value = res);
    listActivityOptions().then(res => titleOptions.value = res);
});

watch(threatLevel, (val) => {
    levelIndeterminate.value = false;
    if (val.length === 0) {
        levelCheckAll.value = false;
    } else if (val.length === levelOptions.length) {
        levelCheckAll.value = true;
    } else {
        levelIndeterminate.value = true;
    }
    pageIdx.value = 1;
    refreshActivity();
});

watch(dchostSelected, (val) => {
    dchostIndeterminate.value = false;
    if (val.length === 0) {
        dchostCheckAll.value = false;
    } else if (val.length === dchostOptions.value.length) {
        dchostCheckAll.value = true;
    } else {
        dchostIndeterminate.value = true;
    }
    pageIdx.value = 1;
    refreshActivity();
});

watch(titleSelected, (val) => {
    titleIndeterminate.value = false;
    if (val.length === 0) {
        titleCheckAll.value = false;
    } else if (val.length === titleOptions.value.length) {
        titleCheckAll.value = true;
    } else {
        titleIndeterminate.value = true;
    }
    pageIdx.value = 1;
    refreshActivity();
});

watch(() => [lastOccurenceTime.value, idInput.value], () => {
    pageIdx.value = 1;
    refreshActivity();
});

</script>

<style lang="scss" scoped>
.activity-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #f5f7fb;
}

.activity-command-panel,
.activity-table-panel {
    border: 1px solid #dfe6ef;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(31, 45, 61, 0.06);
}

.activity-command-panel {
    overflow: hidden;
}

.activity-command-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(220, 232, 229, 0.86);
    background:
        linear-gradient(135deg, rgba(22, 143, 122, 0.1), rgba(64, 158, 255, 0.08)),
        #ffffff;
}

.activity-command-copy {
    min-width: 0;

    p {
        margin: 0;
        max-width: 780px;
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
    }
}

.activity-kicker {
    margin-bottom: 6px;
    color: var(--ada-primary);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
}

.activity-command-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    min-width: 240px;
}

.activity-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    background: rgba(220, 232, 229, 0.86);
}

.metric-card {
    min-width: 0;
    padding: 14px 18px;
    background: linear-gradient(180deg, #ffffff, #f8fbff);

    .metric-label,
    span:last-child {
        display: block;
        color: #6b778c;
        font-size: 12px;
    }

    strong {
        display: block;
        margin: 4px 0;
        color: #17233d;
        font-size: 25px;
        line-height: 1;
    }

    &.metric-hot strong {
        color: #c2412f;
    }
}

.activity-filter-panel {
    padding: 14px 18px 6px;
}

.activity-filter-form {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    column-gap: 12px;
}

.filter-level-select {
    width: 150px;
}

.filter-host-select,
.filter-title-select {
    width: 220px;
}

.activity-table-panel {
    padding: 16px 18px;
}

.activity-list-header,
.activity-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.activity-list-header {
    margin-bottom: 12px;

    div {
        display: flex;
        align-items: baseline;
        gap: 8px;
    }

    span {
        color: #536271;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
    }

    strong {
        color: #17233d;
        font-size: 20px;
    }
}

.activity-table-shell {
    overflow: hidden;
    border: 1px solid #dfe6ef;
    border-radius: 8px;
    background: #ffffff;
}

.activity-table {
    :deep(.el-table__header-wrapper th) {
        height: 44px;
        background: #f8fbff;
        color: #536271;
        font-size: 12px;
        font-weight: 800;
    }

    :deep(.el-table__row) {
        cursor: pointer;
    }

    :deep(.el-table__row:hover > td.el-table__cell) {
        background: #f5fbff;
    }

    :deep(td.el-table__cell) {
        border-bottom-color: #edf1f5;
    }

    :deep(.el-table__expanded-cell) {
        padding: 0;
        background: #f7f9fc;
    }
}

.activity-title-cell {
    min-width: 0;

    strong {
        display: block;
        overflow: hidden;
        color: #17233d;
        font-size: 14px;
        font-weight: 800;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    > span {
        display: -webkit-box;
        margin-top: 4px;
        overflow: hidden;
        color: #64748b;
        font-size: 12px;
        line-height: 1.45;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }
}

.activity-id-row,
.tag-chip-group,
.field-chip-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.activity-id-row {
    margin-top: 8px;

    span {
        max-width: 180px;
        padding: 2px 7px;
        overflow: hidden;
        border-radius: 6px;
        background: #f2f5f8;
        color: #536271;
        font-size: 11px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.time-chip,
.host-chip,
.level-chip,
.confidence-chip,
.soft-chip,
.more-chip {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 24px;
    padding: 3px 8px;
    overflow: hidden;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time-chip {
    color: #536271;
    background: #f2f5f8;
}

.host-chip {
    color: #0b6fb3;
    background: #eaf5ff;
}

.level-chip {
    color: var(--level-color);
    background: color-mix(in srgb, var(--level-color) 12%, #ffffff);
}

.confidence-chip {
    color: #536271;
    background: #eef2f6;
}

.confidence-stable {
    color: #2f7a43;
    background: #edf8ee;
}

.confidence-test {
    color: #a16207;
    background: #fff6df;
}

.confidence-experimental {
    color: #c2412f;
    background: #fff0ed;
}

.soft-chip,
.more-chip {
    color: #536271;
    background: #f2f5f8;
}

.more-chip {
    color: #0b6fb3;
    background: #eaf5ff;
}

.field-chip-group {
    align-items: stretch;
}

.field-chip {
    display: inline-grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    max-width: 220px;
    min-height: 25px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fbfcfe;

    b,
    em {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    b {
        padding: 4px 7px;
        color: #0b6fb3;
        font-size: 11px;
        font-style: normal;
        font-weight: 800;
        background: #eaf5ff;
    }

    em {
        padding: 4px 8px;
        color: #334155;
        font-size: 11px;
        font-style: normal;
    }
}

.activity-pagination {
    margin-top: 14px;
}

.json-viewer-wrapper {
    margin: 14px 18px;
    padding: 16px;
    max-height: 520px;
    overflow: auto;
    background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 10px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);

    .raw-log-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;

        div {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        strong {
            color: #17233d;
            font-size: 14px;
        }

        span {
            color: #64748b;
            font-size: 12px;
        }

        code {
            padding: 4px 8px;
            border-radius: 6px;
            background: #eaf5ff;
            color: #0b6fb3;
            font-size: 12px;
            font-weight: 800;
        }
    }

    :deep(.jv-container) {
        border-color: rgba(148, 163, 184, 0.26);
        border-radius: 8px;
        background: #ffffff;
        color: #273449;
        font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 13px;
        line-height: 1.72;
        white-space: pre-wrap;
    }

    :deep(.jv-container:hover) {
        border-color: rgba(37, 99, 235, 0.22);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    }

    :deep(.jv-code) {
        padding: 18px 20px;
    }

    :deep(.jv-node) {
        margin: 2px 0;
    }

    :deep(.jv-node .jv-node) {
        margin-left: 28px;
    }

    :deep(.jv-key) {
        margin-right: 8px;
        color: #1d4ed8;
        font-weight: 600;
    }

    :deep(.jv-item.jv-string) {
        color: #047857;
        word-break: break-word;
        white-space: pre-wrap;
    }

    :deep(.jv-item.jv-number),
    :deep(.jv-item.jv-boolean) {
        color: #b45309;
        font-weight: 600;
    }

    :deep(.jv-toggle) {
        width: 12px;
        height: 12px;
        margin-right: 6px;
        opacity: 0.72;
    }

    :deep(.jv-button) {
        padding: 6px 8px;
        color: #2563eb;
        font-size: 12px;
    }
}

@media (max-width: 1200px) {
    .activity-command-main {
        align-items: stretch;
        flex-direction: column;
    }

    .activity-command-actions {
        justify-content: flex-start;
        min-width: 0;
    }

    .activity-metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .activity-metrics {
        grid-template-columns: 1fr;
    }

    .activity-list-header,
    .activity-pagination {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
