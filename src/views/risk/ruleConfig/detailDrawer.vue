<template>
    <el-drawer class="scan-template-detail-drawer" size="92vw" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <h3>{{ $t('message.risk.ruleConfig.detailDrawerTitle') }}</h3>
        </template>
        <template #default>
            <div class="detail-drawer-content" v-loading="state.loading">
                <section class="template-summary">
                    <div class="template-summary__main">
                        <div class="template-summary__label">{{ getRiskTypeText(state.dataMore?.type || state.data?.type || '') }}</div>
                        <h4>{{ state.dataMore?.name || state.data?.name || '-' }}</h4>
                    </div>
                    <div v-if="state.data?.type !== 'weakpwd'" class="template-summary__metrics">
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.detailTotalPlugins') }}</span>
                            <strong>{{ pluginStats.total }}</strong>
                        </div>
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.detailEnabledPlugins') }}</span>
                            <strong>{{ pluginStats.enabled }}</strong>
                        </div>
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.detailDisabledPlugins') }}</span>
                            <strong>{{ pluginStats.disabled }}</strong>
                        </div>
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.detailParameterizedPlugins') }}</span>
                            <strong>{{ pluginStats.parameterized }}</strong>
                        </div>
                    </div>
                    <div v-else class="template-summary__metrics template-summary__metrics--weakpwd">
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.weakpwdPasswordCount') }}</span>
                            <strong>{{ weakpwdStats.passwordCount }}</strong>
                        </div>
                        <div class="summary-metric">
                            <span>{{ $t('message.risk.ruleConfig.weakpwdImportCount') }}</span>
                            <strong>{{ state.weakpwdImport.count }}</strong>
                        </div>
                    </div>
                </section>

                <template v-if="state.data?.type !== 'weakpwd'">
                    <section class="plugin-filter-bar">
                        <el-input
                            v-model="state.filters.keyword"
                            size="default"
                            clearable
                            :prefix-icon="Search"
                            :placeholder="$t('message.risk.ruleConfig.detailKeywordPlaceholder')"
                            class="plugin-filter-bar__keyword"
                        />
                        <el-select v-model="state.filters.enable" size="default" class="plugin-filter-bar__select">
                            <el-option value="all" :label="$t('message.risk.ruleConfig.detailAllStatus')" />
                            <el-option value="1" :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailValue_1`)" />
                            <el-option value="0" :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailValue_0`)" />
                        </el-select>
                        <el-select v-model="state.filters.type" size="default" class="plugin-filter-bar__select" filterable>
                            <el-option value="all" :label="$t('message.risk.ruleConfig.detailAllTypes')" />
                            <el-option v-for="option in pluginTypeOptions" :key="option.value" :value="option.value" :label="option.label" />
                        </el-select>
                        <el-select v-model="state.filters.level" size="default" class="plugin-filter-bar__select">
                            <el-option value="all" :label="$t('message.risk.ruleConfig.detailAllLevels')" />
                            <el-option v-for="option in pluginLevelOptions" :key="option.value" :value="option.value" :label="option.label" />
                        </el-select>
                        <el-select v-model="state.filters.params" size="default" class="plugin-filter-bar__select">
                            <el-option value="all" :label="$t('message.risk.ruleConfig.detailAllParameters')" />
                            <el-option value="with" :label="$t('message.risk.ruleConfig.detailWithParameters')" />
                            <el-option value="without" :label="$t('message.risk.ruleConfig.detailWithoutParameters')" />
                        </el-select>
                        <el-button size="default" :icon="RefreshLeft" @click="resetPluginFilters">
                            {{ $t('message.risk.ruleConfig.detailResetFilters') }}
                        </el-button>
                    </section>

                    <el-table
                        ref="tableRef"
                        :data="paginatedPlugins"
                        :border="true"
                        row-class-name="pointer-cursor"
                        row-key="iD"
                        class="plugin-detail-table"
                        :expand-row-keys="state.expandedPluginKeys"
                        @expand-change="handlePluginExpandChange"
                    >
                        <el-table-column type="index" width="70" :index="getPluginRowIndex" :label="$t('message.tableCommon.index')" />
                        <el-table-column
                            prop="name"
                            min-width="260"
                            show-overflow-tooltip
                            :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_name`)"
                        >
                            <template #default="props">
                                <button
                                    class="plugin-name-toggle"
                                    :class="{ 'is-expanded': isPluginExpanded(props.row) }"
                                    type="button"
                                    :aria-expanded="isPluginExpanded(props.row)"
                                    @click.stop="togglePluginDetails(props.row)"
                                >
                                    <el-icon class="plugin-name-toggle__icon">
                                        <ArrowRight />
                                    </el-icon>
                                    <span>{{ props.row.name || '-' }}</span>
                                </button>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="type"
                            width="180"
                            show-overflow-tooltip
                            :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_type`)"
                        >
                            <template #default="props">{{ getPluginTypeText(props.row.type) }}</template>
                        </el-table-column>
                        <el-table-column
                            prop="level"
                            width="120"
                            align="center"
                            :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_level`)"
                        >
                            <template #default="props">
                                <el-tag :type="getLevelType(props.row.level)" effect="dark">
                                    {{ getPluginLevelText(props.row.level) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="enable"
                            width="120"
                            align="center"
                            :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_enable`)"
                        >
                            <template #default="props">
                                <el-tag :type="props.row.enable === 1 ? 'success' : 'info'" effect="plain">
                                    {{ getPluginEnableText(props.row.enable) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="metaData"
                            width="170"
                            align="center"
                            :label="$t(`message.risk.ruleConfig.${state.data?.type}DetailTitle_metaData`)"
                        >
                            <template #default="props">
                                <div class="operation-icon-group">
                                    <el-tooltip :content="$t('message.risk.ruleConfig.editMetaDataTitle')" placement="top">
                                        <span class="operation-icon-trigger">
                                            <el-button
                                                class="operation-icon-button"
                                                size="small"
                                                type="primary"
                                                :icon="Edit"
                                                :aria-label="$t('message.risk.ruleConfig.editMetaDataTitle')"
                                                :disabled="!hasMetaData(props.row.metaData)"
                                                @click="handleEditMetaData(props.row)"
                                            />
                                        </span>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column type="expand" width="1" class-name="plugin-expand-column">
                            <template #default="props">
                                <section class="plugin-expand-panel">
                                    <div class="plugin-expand-panel__header">
                                        <div class="plugin-expand-title">
                                            <el-tag effect="plain" size="small">#{{ props.row.iD }}</el-tag>
                                            <div>
                                                <h4>{{ getPluginDetailTitle(props.row) }}</h4>
                                            </div>
                                        </div>
                                        <div class="plugin-expand-tags">
                                            <el-tag size="small" effect="plain">{{ getPluginTypeText(props.row.type) }}</el-tag>
                                            <el-tag size="small" :type="getLevelType(props.row.level)" effect="dark">{{ getPluginLevelText(props.row.level) }}</el-tag>
                                            <el-tag size="small" :type="props.row.enable === 1 ? 'success' : 'info'" effect="plain">
                                                {{ getPluginEnableText(props.row.enable) }}
                                            </el-tag>
                                        </div>
                                    </div>

                                    <div class="plugin-detail-grid">
                                        <div v-for="item in getPluginOverviewItems(props.row)" :key="item.key" class="plugin-detail-cell">
                                            <span>{{ item.label }}</span>
                                            <strong>{{ item.value }}</strong>
                                        </div>
                                    </div>

                                    <div class="plugin-detail-sections">
                                        <article
                                            v-for="item in getPluginNarrativeItems(props.row)"
                                            :key="item.key"
                                            class="plugin-detail-section"
                                            :class="`plugin-detail-section--${item.key}`"
                                        >
                                            <h5>{{ item.label }}</h5>
                                            <div v-if="item.key === 'reference'" class="plugin-reference-list">
                                                <template v-for="reference in splitReferenceValue(item.value)" :key="reference">
                                                    <a v-if="isUrl(reference)" :href="reference" target="_blank" rel="noreferrer">{{ reference }}</a>
                                                    <span v-else>{{ reference }}</span>
                                                </template>
                                            </div>
                                            <p v-else>{{ item.value }}</p>
                                        </article>
                                    </div>

                                    <div v-if="getPluginAdditionalItems(props.row).length" class="plugin-detail-more">
                                        <h5>{{ $t('message.risk.ruleConfig.detailAdditionalFields') }}</h5>
                                        <div class="plugin-detail-more__grid">
                                            <div v-for="item in getPluginAdditionalItems(props.row)" :key="item.key" class="plugin-detail-more__item">
                                                <span>{{ item.label }}</span>
                                                <strong>{{ item.value }}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-row class="detail-pagination-row" justify="space-between">
                        <div class="filtered-count">
                            {{ $t('message.risk.ruleConfig.detailFilteredPlugins', [filteredPlugins.length, pluginStats.total]) }}
                        </div>
                        <el-pagination
                            v-model:current-page="state.pageIdx"
                            v-model:page-size="state.pageSize"
                            :page-sizes="[10, 20, 30, 40, 50]"
                            layout="sizes, prev, pager, next, jumper"
                            :total="filteredPlugins.length"
                            @size-change="handlePageSizeChange"
                            @current-change="(val: number) => state.pageIdx = val"
                        />
                    </el-row>
                </template>

                <template v-else>
                    <section class="weakpwd-panel">
                        <div class="weakpwd-panel__content">
                            <h4>{{ $t('message.risk.ruleConfig.detailWeakpwd') }}</h4>
                            <p>{{ $t('message.risk.ruleConfig.detailWeakpwdTooltip') }}</p>
                            <p>{{ $t('message.risk.ruleConfig.weakpwdCsvHint') }}</p>
                        </div>
                        <div class="weakpwd-panel__actions">
                            <input
                                ref="weakpwdImportInputRef"
                                type="file"
                                accept=".csv,text/csv"
                                class="weakpwd-file-input"
                                @change="handleWeakpwdCsvChange"
                            />
                            <el-button size="default" :icon="Upload" @click="handleWeakpwdImportClick">
                                {{ $t('message.risk.ruleConfig.weakpwdImportCsv') }}
                            </el-button>
                            <el-button size="default" type="primary" @click="handleSaveWeakpwd">
                                {{ $t('message.tableCommon.save') }}
                            </el-button>
                        </div>
                    </section>
                    <div v-if="state.weakpwdImport.fileName" class="weakpwd-import-note">
                        {{ $t('message.risk.ruleConfig.weakpwdImportedFile', [state.weakpwdImport.fileName, state.weakpwdImport.count]) }}
                    </div>
                    <Codemirror
                        v-for="plugin in allPlugins"
                        :value="getPasswordString(plugin.metaData.password)"
                        @update:value="(val: string) => updatePassword(plugin.iD, val)"
                        :options="{ ...state.cmOptions, readOnly: false }"
                        border
                        placeholder=""
                        :height="500"
                        class="weakpwd-editor"
                        :key="plugin.iD"
                    />
                </template>
            </div>
        </template>
        <template #footer>
            <div class="drawer-footer">
                <el-button @click="() => state.open = false">{{ $t('message.tableCommon.close') }}</el-button>
            </div>
        </template>
    </el-drawer>

    <el-dialog v-model="editDialog.open" :title="$t('message.risk.ruleConfig.editMetaDataTitle')" width="600px">
        <el-form label-position="left" label-width="180px">
            <el-form-item v-for="(value, key) in editDialog.metaData" :key="key" :label="String(key)">
                <el-input v-model="editDialog.metaData[key]" :disabled="!isCustomTemplate" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="editDialog.open = false">{{ $t('message.tableCommon.cancel') }}</el-button>
            <el-button type="primary" @click="handleSaveMetaData" :disabled="!isCustomTemplate">
                {{ $t('message.tableCommon.save') }}
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { GetScanTmplReply, ListScanTmplReply_Details, UpdateScanTmplReq, pluginInfo, pluginInfoV2 } from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';
import { getScanTmpl } from '/@/api/grpc/method';
import api from '/@/api/grpc';
import { ElMessage } from 'element-plus';
import { ArrowRight, Edit, RefreshLeft, Search, Upload } from '@element-plus/icons-vue';
import Codemirror from 'codemirror-editor-vue3';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';

const { t, te } = useI18n();

const tableRef = ref();
const weakpwdImportInputRef = ref<HTMLInputElement>();

const state = reactive({
    open: false,
    loading: false,
    data: null as ListScanTmplReply_Details | null,
    dataMore: null as GetScanTmplReply | null,
    pageIdx: 1,
    pageSize: 10,
    expandedPluginKeys: [] as number[],
    filters: {
        keyword: '',
        enable: 'all',
        type: 'all',
        level: 'all',
        params: 'all',
    },
    weakpwdImport: {
        fileName: '',
        count: 0,
    },
    cmOptions: {
        lineNumbers: true,
        mode: 'htmlmixed',
    },
});

const editDialog = reactive({
    open: false,
    pluginId: null as number | null,
    metaData: {} as Record<string, any>,
});

const allPlugins = computed(() => state.dataMore?.plugins ?? []);

const isCustomTemplate = computed(() => state.data?.tmplType === 2 || state.dataMore?.tmplType === 2);

const pluginStats = computed(() => {
    const total = allPlugins.value.length;
    const enabled = allPlugins.value.filter(plugin => plugin.enable === 1).length;
    const parameterized = allPlugins.value.filter(plugin => hasMetaData(plugin.metaData)).length;

    return {
        total,
        enabled,
        disabled: total - enabled,
        parameterized,
    };
});

const weakpwdStats = computed(() => ({
    passwordCount: getWeakpwdPasswordList().length,
}));

const pluginTypeOptions = computed(() => {
    const types = Array.from(new Set(allPlugins.value.map(plugin => plugin.type).filter(Boolean)));
    return types.map(value => ({
        value,
        label: getPluginTypeText(value),
    }));
});

const pluginLevelOptions = computed(() => {
    const levels = Array.from(new Set(allPlugins.value.map(plugin => plugin.level))).sort((a, b) => a - b);
    return levels.map(value => ({
        value: String(value),
        label: getPluginLevelText(value),
    }));
});

const filteredPlugins = computed(() => {
    const keyword = state.filters.keyword.trim().toLowerCase();

    return allPlugins.value.filter(plugin => {
        if (state.filters.enable !== 'all' && String(plugin.enable) !== state.filters.enable) {
            return false;
        }
        if (state.filters.type !== 'all' && plugin.type !== state.filters.type) {
            return false;
        }
        if (state.filters.level !== 'all' && String(plugin.level) !== state.filters.level) {
            return false;
        }
        if (state.filters.params === 'with' && !hasMetaData(plugin.metaData)) {
            return false;
        }
        if (state.filters.params === 'without' && hasMetaData(plugin.metaData)) {
            return false;
        }
        if (!keyword) {
            return true;
        }

        return getPluginSearchValues(plugin).some(value => value.toLowerCase().includes(keyword));
    });
});

const paginatedPlugins = computed(() => {
    const start = (state.pageIdx - 1) * state.pageSize;
    return filteredPlugins.value.slice(start, start + state.pageSize);
});

const translateOrFallback = (key: string, fallback: string) => te(key) ? t(key) : fallback;

const getRiskTypeText = (type: string) => translateOrFallback(`message.risk.ruleConfig.${type}`, type || '-');

const getPluginTypeText = (type: string) => {
    const templateType = state.data?.type || state.dataMore?.type;
    return translateOrFallback(`message.risk.ruleConfig.${templateType}DetailValue_${type}`, type || '-');
};

const getPluginLevelText = (level: number) => {
    const templateType = state.data?.type || state.dataMore?.type;
    return translateOrFallback(`message.risk.ruleConfig.${templateType}DetailValue_${level}`, String(level));
};

const getPluginEnableText = (enable: number) => {
    const templateType = state.data?.type || state.dataMore?.type;
    return translateOrFallback(`message.risk.ruleConfig.${templateType}DetailValue_${enable}`, String(enable));
};

const hasMetaData = (metaData: Record<string, any> | undefined) => {
    return Object.keys(metaData ?? {}).length > 0;
};

const getLevelType = (level: number): string => {
    const typeMap: Record<number, string> = {
        1: 'info',
        2: 'success',
        3: 'warning',
        4: 'danger',
        5: 'danger',
    };
    return typeMap[level] || 'info';
};

const stringifyMetaValue = (value: any): string => {
    if (Array.isArray(value)) {
        return value.join('\n');
    }
    if (value && typeof value === 'object') {
        return JSON.stringify(value);
    }
    return value === undefined || value === null ? '' : String(value);
};

const getPluginSearchValues = (plugin: pluginInfo) => {
    const metaValues = Object.entries(plugin.metaData ?? {}).flatMap(([key, value]) => [key, stringifyMetaValue(value)]);
    const detailValues = getPluginDetailItems(plugin).flatMap(item => [item.label, item.value]);

    return [
        String(plugin.iD),
        plugin.name,
        plugin.display,
        plugin.type,
        getPluginTypeText(plugin.type),
        String(plugin.level),
        getPluginLevelText(plugin.level),
        String(plugin.enable),
        getPluginEnableText(plugin.enable),
        ...metaValues,
        ...detailValues,
    ].filter(Boolean);
};

const convertToPluginInfoV2 = (plugins: pluginInfo[]): pluginInfoV2[] => {
    return plugins.map(plugin => ({
        iD: plugin.iD,
        enable: plugin.enable,
        metaData: Object.fromEntries(
            Object.entries(plugin.metaData).map(([key, value]) => [key, stringifyMetaValue(value)])
        ),
    }));
};

const resetPluginFilters = () => {
    state.filters.keyword = '';
    state.filters.enable = 'all';
    state.filters.type = 'all';
    state.filters.level = 'all';
    state.filters.params = 'all';
    state.pageIdx = 1;
    state.expandedPluginKeys = [];
};

const handlePageSizeChange = (value: number) => {
    state.pageSize = value;
    state.pageIdx = 1;
    state.expandedPluginKeys = [];
};

const getPluginRowIndex = (index: number) => {
    return (state.pageIdx - 1) * state.pageSize + index + 1;
};

type PluginDetailItem = {
    key: string;
    label: string;
    value: string;
};

const pluginOverviewFields = ['name', 'display', 'points', 'version', 'updateTm'];
const pluginNarrativeFields = ['desc', 'verifyDesc', 'suggestion', 'reference'];
const pluginDetailReservedFields = new Set([
    'iD',
    'name',
    'display',
    'version',
    'points',
    'updateTm',
    'verifyDesc',
    'reference',
    'desc',
    'suggestion',
    'metaData',
    'enable',
    'level',
    'type',
]);

const formatFieldName = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const getPluginDetailLabel = (key: string) => translateOrFallback(`message.risk.ruleConfig.detailField_${key}`, formatFieldName(key));

const normalizeDetailValue = (value: any): string => {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'bigint') {
        return value === 0n ? '' : value.toString();
    }
    if (typeof value === 'number') {
        return value === 0 ? '' : String(value);
    }
    if (Array.isArray(value)) {
        return value.map(item => normalizeDetailValue(item)).filter(Boolean).join('\n');
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value).filter(([, itemValue]) => normalizeDetailValue(itemValue));
        return entries.length ? entries.map(([key, itemValue]) => `${key}: ${normalizeDetailValue(itemValue)}`).join('\n') : '';
    }

    return String(value).trim();
};

const formatTimestampValue = (value: any): string => {
    const rawValue = typeof value === 'bigint' ? Number(value) : Number(value);
    if (!Number.isFinite(rawValue) || rawValue <= 0) {
        return '';
    }

    const timestamp = rawValue > 100000000000 ? rawValue : rawValue * 1000;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getDetailValue = (plugin: pluginInfo, key: string): string => {
    const pluginRecord = plugin as unknown as Record<string, any>;
    if (key === 'updateTm') {
        return formatTimestampValue(pluginRecord[key]);
    }
    if (key === 'type') {
        return getPluginTypeText(plugin.type);
    }
    if (key === 'level') {
        return getPluginLevelText(plugin.level);
    }
    if (key === 'enable') {
        return getPluginEnableText(plugin.enable);
    }

    return normalizeDetailValue(pluginRecord[key]);
};

const getPluginDetailTitle = (plugin: pluginInfo) => getDetailValue(plugin, 'display') || plugin.name || `#${plugin.iD}`;

const createPluginDetailItem = (plugin: pluginInfo, key: string): PluginDetailItem | null => {
    const value = getDetailValue(plugin, key);
    if (!value) {
        return null;
    }

    return {
        key,
        label: getPluginDetailLabel(key),
        value,
    };
};

const getPluginOverviewItems = (plugin: pluginInfo): PluginDetailItem[] => {
    return pluginOverviewFields
        .map(key => createPluginDetailItem(plugin, key))
        .filter((item): item is PluginDetailItem => Boolean(item));
};

const getPluginNarrativeItems = (plugin: pluginInfo): PluginDetailItem[] => {
    return pluginNarrativeFields
        .map(key => createPluginDetailItem(plugin, key))
        .filter((item): item is PluginDetailItem => Boolean(item));
};

const getPluginAdditionalItems = (plugin: pluginInfo): PluginDetailItem[] => {
    const pluginRecord = plugin as unknown as Record<string, any>;
    return Object.keys(pluginRecord)
        .filter(key => !pluginDetailReservedFields.has(key))
        .map(key => createPluginDetailItem(plugin, key))
        .filter((item): item is PluginDetailItem => Boolean(item));
};

const getPluginDetailItems = (plugin: pluginInfo): PluginDetailItem[] => [
    ...getPluginOverviewItems(plugin),
    ...getPluginNarrativeItems(plugin),
    ...getPluginAdditionalItems(plugin),
];

const splitReferenceValue = (value: string): string[] => {
    return value
        .split(/\r?\n|,\s*(?=https?:\/\/)/)
        .map(item => item.trim())
        .filter(Boolean);
};

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const isPluginExpanded = (plugin: pluginInfo) => state.expandedPluginKeys.includes(plugin.iD);

const togglePluginDetails = (plugin: pluginInfo) => {
    tableRef.value?.toggleRowExpansion(plugin, !isPluginExpanded(plugin));
};

const handlePluginExpandChange = (_row: pluginInfo, expandedRows: pluginInfo[]) => {
    state.expandedPluginKeys = expandedRows.map(row => row.iD);
};

const getPasswordString = (password: any): string => {
    if (Array.isArray(password)) {
        return password.join('\n');
    }
    return password ?? '';
};

const getWeakpwdPlugin = () => {
    return allPlugins.value[0];
};

const getWeakpwdPasswordList = () => {
    const plugin = getWeakpwdPlugin();
    if (!plugin) {
        return [];
    }

    return getPasswordString(plugin.metaData.password)
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
};

const updatePassword = (pluginId: number, value: string) => {
    const plugin = state.dataMore?.plugins.find(item => item.iD === pluginId);
    if (plugin) {
        plugin.metaData.password = value;
    }
};

const parseCsvRows = (content: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let index = 0; index < content.length; index++) {
        const char = content[index];
        const nextChar = content[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                cell += '"';
                index++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            row.push(cell);
            cell = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                index++;
            }
            row.push(cell);
            if (row.some(value => value.trim() !== '')) {
                rows.push(row);
            }
            row = [];
            cell = '';
            continue;
        }

        cell += char;
    }

    row.push(cell);
    if (row.some(value => value.trim() !== '')) {
        rows.push(row);
    }

    return rows;
};

const extractWeakPasswordsFromCsv = (content: string): string[] => {
    const rows = parseCsvRows(content);
    if (rows.length === 0) {
        return [];
    }

    const normalizeCsvValue = (value: string) => value.replace(/^\uFEFF/, '').trim();
    const normalizedHeaders = rows[0].map(value => normalizeCsvValue(value).toLowerCase());
    const passwordHeaderIndex = normalizedHeaders.findIndex(value =>
        ['password', 'weak_password', 'weak password', 'weakpwd', 'pwd', '密码', '弱口令'].includes(value)
    );
    const startRow = passwordHeaderIndex >= 0 ? 1 : 0;
    const columnIndex = passwordHeaderIndex >= 0 ? passwordHeaderIndex : 0;
    const passwords = rows
        .slice(startRow)
        .map(row => normalizeCsvValue(row[columnIndex] ?? ''))
        .filter(Boolean);

    return Array.from(new Set(passwords));
};

const setWeakpwdPasswords = (passwords: string[]) => {
    const plugin = getWeakpwdPlugin();
    if (!plugin) {
        return;
    }

    plugin.metaData.password = passwords.join('\n');
};

const handleWeakpwdImportClick = () => {
    weakpwdImportInputRef.value?.click();
};

const handleWeakpwdCsvChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';

    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        ElMessage.warning(t('message.risk.ruleConfig.weakpwdCsvOnly'));
        return;
    }

    try {
        const content = await file.text();
        const passwords = extractWeakPasswordsFromCsv(content);
        if (passwords.length === 0) {
            ElMessage.warning(t('message.risk.ruleConfig.weakpwdCsvEmpty'));
            return;
        }

        setWeakpwdPasswords(passwords);
        state.weakpwdImport.fileName = file.name;
        state.weakpwdImport.count = passwords.length;
        ElMessage.success(t('message.risk.ruleConfig.weakpwdCsvImported', [passwords.length]));
    } catch (err) {
        ElMessage.error(t('message.risk.ruleConfig.weakpwdCsvFailed'));
    }
};

const handleEditMetaData = (row: pluginInfo) => {
    if (!hasMetaData(row.metaData)) {
        return;
    }

    editDialog.pluginId = row.iD;
    editDialog.metaData = JSON.parse(JSON.stringify(row.metaData));
    editDialog.open = true;
};

const handleSaveMetaData = async () => {
    if (!state.dataMore || !state.data || editDialog.pluginId === null) return;

    const pluginIndex = state.dataMore.plugins.findIndex(plugin => plugin.iD === editDialog.pluginId);
    if (pluginIndex === -1) return;

    state.dataMore.plugins[pluginIndex].metaData = editDialog.metaData;

    try {
        const req: UpdateScanTmplReq = {
            iD: state.data.iD,
            name: state.dataMore.name,
            plugins: convertToPluginInfoV2(state.dataMore.plugins),
        };
        const resp = await api.updateScanTmpl(req).then(resp => resp.response);
        const ok = alertResult(resp.result, t('message.risk.ruleConfig.updateSucc'), t('message.risk.ruleConfig.updateFail'));
        if (ok) {
            editDialog.open = false;
            refresh();
        }
    } catch (err) {
        alertApiError(err);
    }
};

const handleSaveWeakpwd = async () => {
    if (!state.dataMore || !state.data) return;

    try {
        const req: UpdateScanTmplReq = {
            iD: state.data.iD,
            name: state.dataMore.name,
            plugins: convertToPluginInfoV2(state.dataMore.plugins),
        };
        const resp = await api.updateScanTmpl(req).then(resp => resp.response);
        const ok = alertResult(resp.result, t('message.risk.ruleConfig.updateSucc'), t('message.risk.ruleConfig.updateFail'));
        if (ok) {
            refresh();
        }
    } catch (err) {
        alertApiError(err);
    }
};

const refresh = () => {
    if (!state.data?.iD) {
        return;
    }

    state.loading = true;
    getScanTmpl(state.data.iD)
        .then(data => {
            state.dataMore = data;
        })
        .catch(err => alertApiError(err))
        .finally(() => state.loading = false);
};

const open = (data: ListScanTmplReply_Details) => {
    state.open = true;
    state.data = data;
    state.dataMore = null;
    state.pageIdx = 1;
    state.weakpwdImport.fileName = '';
    state.weakpwdImport.count = 0;
    resetPluginFilters();

    refresh();
};

watch(
    () => [state.filters.keyword, state.filters.enable, state.filters.type, state.filters.level, state.filters.params],
    () => {
        state.pageIdx = 1;
        state.expandedPluginKeys = [];
    }
);

watch(
    () => filteredPlugins.value.length,
    () => {
        const maxPage = Math.max(1, Math.ceil(filteredPlugins.value.length / state.pageSize));
        if (state.pageIdx > maxPage) {
            state.pageIdx = maxPage;
        }
    }
);

defineExpose({
    open,
});
</script>

<style scoped>
:deep(.scan-template-detail-drawer) {
    max-width: 1180px;
}

.detail-drawer-content {
    padding: 20px;
}

.template-summary {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 20px;
    border: 1px solid #e5efec;
    border-radius: 8px;
    background: #fbfdfc;
}

.template-summary__main {
    min-width: 0;
    flex: 1;
}

.template-summary__label {
    color: #6b7b88;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
}

.template-summary__main h4 {
    margin: 8px 0 0;
    color: #17233c;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
}

.template-summary__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(100px, 1fr));
    gap: 12px;
    min-width: 520px;
}

.summary-metric {
    padding: 12px;
    border: 1px solid #edf3f1;
    border-radius: 8px;
    background: #ffffff;
}

.summary-metric span {
    display: block;
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
}

.summary-metric strong {
    display: block;
    margin-top: 6px;
    color: #17233c;
    font-size: 24px;
    line-height: 1;
}

.plugin-filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 18px 0 12px;
}

.plugin-filter-bar__keyword {
    width: 280px;
}

.plugin-filter-bar__select {
    width: 170px;
}

.plugin-detail-table {
    width: 100%;
}

.plugin-detail-table :deep(.plugin-expand-column),
.plugin-detail-table :deep(.el-table__expand-column) {
    width: 1px;
    padding: 0;
}

.plugin-detail-table :deep(.plugin-expand-column .cell),
.plugin-detail-table :deep(.el-table__expand-icon) {
    display: none;
}

.plugin-name-toggle {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #17233c;
    font: inherit;
    font-weight: 600;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
}

.plugin-name-toggle:hover,
.plugin-name-toggle.is-expanded {
    color: var(--el-color-primary);
}

.plugin-name-toggle__icon {
    flex: 0 0 auto;
    color: #94a3b8;
    font-size: 13px;
    transition: transform 0.16s ease, color 0.16s ease;
}

.plugin-name-toggle.is-expanded .plugin-name-toggle__icon {
    color: var(--el-color-primary);
    transform: rotate(90deg);
}

.plugin-name-toggle span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.plugin-expand-panel {
    margin: 4px 12px 12px;
    padding: 18px;
    border: 1px solid #e5efec;
    border-radius: 8px;
    background: #fbfdfc;
}

.plugin-expand-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #edf3f1;
}

.plugin-expand-title {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
}

.plugin-expand-title h4 {
    margin: 0;
    color: #17233c;
    font-size: 16px;
    line-height: 1.35;
    font-weight: 700;
}

.plugin-expand-title p {
    margin: 6px 0 0;
    color: #526272;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
}

.plugin-expand-tags {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
}

.plugin-detail-grid {
    display: grid;
    grid-template-columns: minmax(160px, 1.4fr) minmax(160px, 1.4fr) minmax(90px, 0.75fr) minmax(110px, 0.85fr) minmax(150px, 1fr);
    gap: 10px;
    margin-top: 14px;
}

.plugin-detail-cell {
    min-width: 0;
    padding: 12px;
    border: 1px solid #edf3f1;
    border-radius: 8px;
    background: #ffffff;
}

.plugin-detail-cell span,
.plugin-detail-more__item span {
    display: block;
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
}

.plugin-detail-cell strong,
.plugin-detail-more__item strong {
    display: block;
    margin-top: 6px;
    color: #17233c;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 600;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
}

.plugin-detail-sections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
        "desc suggestion"
        "verifyDesc reference";
    gap: 12px;
    margin-top: 14px;
}

.plugin-detail-section {
    padding: 14px;
    border: 1px solid #edf3f1;
    border-radius: 8px;
    background: #ffffff;
}

.plugin-detail-section--desc {
    grid-area: desc;
}

.plugin-detail-section--verifyDesc {
    grid-area: verifyDesc;
}

.plugin-detail-section--suggestion {
    grid-area: suggestion;
}

.plugin-detail-section--reference {
    grid-area: reference;
}

.plugin-detail-section h5,
.plugin-detail-more h5 {
    margin: 0 0 8px;
    color: #17233c;
    font-size: 13px;
    font-weight: 700;
}

.plugin-detail-section p {
    margin: 0;
    color: #526272;
    font-size: 13px;
    line-height: 1.65;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
}

.plugin-reference-list {
    display: grid;
    gap: 6px;
    color: #526272;
    font-size: 13px;
    line-height: 1.55;
}

.plugin-reference-list a {
    color: var(--el-color-primary);
    overflow-wrap: anywhere;
}

.plugin-detail-more {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #edf3f1;
}

.plugin-detail-more__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.plugin-detail-more__item {
    min-width: 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: #ffffff;
}

.detail-pagination-row {
    align-items: center;
    margin-top: 12px;
}

.filtered-count {
    color: #64748b;
    font-size: 13px;
}

.weakpwd-panel {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin: 18px 0 12px;
    padding: 16px 18px;
    border: 1px solid #dbece8;
    border-radius: 8px;
    background: #f6fbf9;
}

.weakpwd-panel__content {
    min-width: 0;
    flex: 1;
}

.weakpwd-panel__content h4 {
    margin: 0 0 8px;
    color: #17233c;
    font-size: 16px;
    font-weight: 700;
}

.weakpwd-panel__content p {
    margin: 4px 0 0;
    color: #526272;
    font-size: 13px;
    line-height: 1.6;
}

.weakpwd-panel__actions {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}

.weakpwd-file-input {
    display: none;
}

.weakpwd-import-note {
    margin: 0 0 12px;
    color: #64748b;
    font-size: 13px;
}

.weakpwd-editor {
    margin-top: 12px;
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
}

@media (max-width: 900px) {
    .template-summary {
        flex-direction: column;
    }

    .template-summary__metrics {
        min-width: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .plugin-filter-bar__keyword,
    .plugin-filter-bar__select {
        width: 100%;
    }

    .plugin-expand-panel__header {
        flex-direction: column;
    }

    .plugin-detail-grid,
    .plugin-detail-sections,
    .plugin-detail-more__grid {
        grid-template-columns: 1fr;
    }

    .plugin-detail-sections {
        grid-template-areas:
            "desc"
            "verifyDesc"
            "suggestion"
            "reference";
    }

    .weakpwd-panel {
        flex-direction: column;
    }

    .weakpwd-panel__actions {
        justify-content: flex-start;
    }
}
</style>
