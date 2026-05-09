<template>
	<div class="layout-pd threat-events-page">
		<section class="events-command-panel">
			<div class="events-command-main">
				<div class="events-command-copy">
					<div class="events-kicker">{{ $t('message.threat.alarmList.eventConsole') }}</div>
					<p>{{ $t('message.threat.alarmList.eventConsoleDesc') }}</p>
				</div>
				<div class="events-command-actions">
					<el-switch v-model="isAdvanceSearch" size="default" :active-text="$t('message.threat.advanceSearch')" />
					<el-switch v-model="isAutoRefresh" size="default" :active-text="$t('message.threat.autoRefresh')" @change="onAutoRefresh" />
					<el-button type="primary" size="default" :icon="Refresh" @click="refreshThreatTable">
						{{ $t('message.threat.refreshManually') }}
					</el-button>
				</div>
			</div>

			<div class="events-metrics">
				<div class="metric-card">
					<span class="metric-label">{{ $t('message.threat.alarmList.totalEvents') }}</span>
					<strong>{{ total }}</strong>
					<span>{{ $t('message.threat.alarmList.filteredScope') }}</span>
				</div>
				<div class="metric-card metric-hot">
					<span class="metric-label">{{ $t('message.threat.alarmList.highRiskEvents') }}</span>
					<strong>{{ highRiskCount }}</strong>
					<span>{{ $t('message.threat.alarmList.currentPage') }}</span>
				</div>
				<div class="metric-card">
					<span class="metric-label">{{ $t('message.threat.alarmList.pendingEvents') }}</span>
					<strong>{{ pendingCount }}</strong>
					<span>{{ $t('message.threat.alarmList.currentPage') }}</span>
				</div>
				<div class="metric-card">
					<span class="metric-label">{{ $t('message.threat.alarmList.selectedEvents') }}</span>
					<strong>{{ tableRowsSelected.length }}</strong>
					<span>{{ $t('message.threat.alarmList.bulkQueue') }}</span>
				</div>
			</div>

			<div class="events-filter-panel">
				<el-form v-if="isAdvanceSearch" class="filter-form alarm-advanced-form">
					<div class="advanced-search-stack">
						<div v-for="(value, index) in advancedSearchRef" :key="index" class="advanced-search-row">
							<AdvancedSearch v-model="advancedSearchRef[index]" />
							<button
								v-if="advancedSearchRef.length !== 1"
								class="advanced-icon-button advanced-remove-btn"
								type="button"
								:title="$t('message.tableCommon.delete')"
								:aria-label="$t('message.tableCommon.delete')"
								@click="() => handleCloseAdvancedSearch(index)"
							>
								<el-icon><Close /></el-icon>
							</button>
						</div>

						<button
							class="advanced-icon-button advanced-add-btn"
							type="button"
							:title="$t('message.threat.addAdvancedSearch')"
							:aria-label="$t('message.threat.addAdvancedSearch')"
							@click="handleAddAdvancedSearch"
						>
							<el-icon><Plus /></el-icon>
						</button>
					</div>
				</el-form>

				<el-form v-if="!isAdvanceSearch" :inline="true" class="filter-form events-basic-filter">
					<el-form-item :label="$t('message.threat.threatName')">
						<el-select v-model="threatIds" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" class="filter-threat-select" :placeholder="$t('message.threat.alarmList.selectThreatName')" popper-class="custom-header">
							<template #header>
								<el-checkbox v-model="threatIdsCheckAll" :indeterminate="threatIdsIndeterminate" @change="handleThreatIdsCheckAll">
									{{ $t('message.tableCommon.checkAll') }}
								</el-checkbox>
							</template>
							<el-option v-for="option in threatIdOptions" :key="option.value" :label="option.label" :value="option.value" />
						</el-select>
					</el-form-item>
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
					<el-form-item :label="$t('message.threat.tableTitle.eventStatus')">
						<el-select v-model="eventStatus" size="default" class="filter-status-select">
							<el-option v-for="status in eventStatusOptions" :key="status" :value="status" :label="getEventStatusLabel(status)" />
						</el-select>
					</el-form-item>
					<el-form-item :label="$t('message.threat.lastOccurenceTime')">
						<el-date-picker
							v-model="lastOccurenceTime"
							class="filter-date-range"
							size="default"
							type="datetimerange"
							format="YY-MM-DD HH:mm"
							:range-separator="$t('message.time.to')"
							:start-placeholder="$t('message.time.start')"
							:end-placeholder="$t('message.time.end')"
							:shortcuts="shortcuts"
						/>
					</el-form-item>
				</el-form>
			</div>
		</section>

		<section class="events-list-panel" v-loading="tableLoading">
			<div class="events-list-header">
				<div>
					<span>{{ $t('message.threat.alarmList.attackName') }}</span>
					<strong>{{ tableRows.length }}</strong>
				</div>
				<el-button class="bulk-close-button" type="primary" size="default" :disabled="tableRowsSelected.length === 0" @click="handleClose(tableRowsSelected)">
					{{ $t('message.tableCommon.closeBulk') }}
				</el-button>
			</div>

			<el-empty v-if="!tableLoading && tableRows.length === 0" :description="$t('message.threat.alarmList.noEvents')" />

			<div v-else class="event-card-list">
				<article v-for="(item, index) in tableRows" :key="item.iD || index" class="event-card" :class="{ 'is-selected': isSelected(item) }" @click="handleDetail(item)">
					<div class="event-card-rail" :style="{ '--level-color': getLevelColor(item.level) }">
						<span class="event-index">{{ String((pageIdx - 1) * pageSize + index + 1).padStart(2, '0') }}</span>
						<span class="event-dot"></span>
					</div>

					<div class="event-card-body">
						<div class="event-title-row">
							<div class="event-title-main">
								<div class="event-title">
									{{ item.title || unknownText }}
								</div>
								<div class="event-tags">
									<span class="level-chip" :style="{ '--level-color': getLevelColor(item.level) }">{{ getLevelLabel(item.level) }}</span>
									<span class="status-chip" :class="`status-${item.eventStatus}`">{{ getEventStatusLabel(item.eventStatus) }}</span>
									<span v-if="item.status" class="soft-chip">{{ formatRuleStatus(item.status) }}</span>
								</div>
							</div>
							<div class="event-actions" @click.stop>
								<el-checkbox :model-value="isSelected(item)" @change="toggleSelect(item)" />
								<el-tooltip :content="$t('message.tableCommon.detail')" placement="top">
									<el-button class="operation-icon-button" size="small" type="primary" :icon="ArrowRight" :aria-label="$t('message.tableCommon.detail')" @click="handleDetail(item)" />
								</el-tooltip>
							</div>
						</div>

						<div class="event-info-grid">
							<div v-for="node in getFlowNodes(item)" :key="node.key" class="flow-node">
								<div class="flow-node-icon">
									<el-icon><component :is="node.icon" /></el-icon>
								</div>
								<div class="flow-node-copy">
									<span>{{ node.label }}</span>
									<strong :title="node.value">{{ node.value }}</strong>
								</div>
							</div>

							<div class="flow-node method-node">
								<div class="flow-node-icon method-icon">
									<el-icon><Aim /></el-icon>
								</div>
								<div class="flow-node-copy">
									<span>{{ $t('message.threat.alarmList.attackMethod') }}</span>
									<strong :title="getAttackMethod(item).summary">{{ getAttackMethod(item).summary }}</strong>
									<div class="method-tags">
										<span v-for="tag in getAttackMethod(item).tags" :key="tag">{{ tag }}</span>
									</div>
								</div>
							</div>
						</div>

						<div class="attack-path">
							<div class="attack-path-line" v-html="formatAttackDescription(item)" />
						</div>

						<div class="event-meta-row">
							<span><el-icon><Timer /></el-icon>{{ formatApiTime(item.startTm) }} - {{ formatApiTime(item.endTm) }}</span>
							<span><el-icon><Connection /></el-icon>{{ item.domain || getDomainLabel(item) }}</span>
							<span><el-icon><Monitor /></el-icon>{{ item.dcHostname || unknownText }}</span>
							<span><el-icon><Flag /></el-icon>{{ formatDuration(item.duration) }}</span>
						</div>
					</div>
				</article>
			</div>

			<div class="events-pagination">
				<el-pagination
					v-model:current-page="pageIdx"
					v-model:page-size="pageSize"
					:page-sizes="[10, 20, 30, 40, 50]"
					layout="sizes, prev, pager, next, jumper"
					:total="total"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
				/>
			</div>
		</section>

		<DetailDrawer ref="detailDrawerRef" />
		<AddWhiteDialog v-model="addWhiteVisiable" :fields="addWhiteFields" :title="addWhiteTitle" :domain="addWhiteDomain" :flow-id="addWhiteFlowId" />
	</div>
</template>

<script setup lang="ts">

import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatApiTime, formatDate, getPrev1Year, shortcuts } from '/@/utils/formatTime';
import { ListThreatReply, ListThreatReply_Details, ListThreatReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { closeThreats } from './operation';
import AddWhiteDialog from './AddWhiteDialog.vue';
import { Aim, ArrowRight, Close, Connection, Flag, Monitor, Plus, Refresh, Timer, User } from '@element-plus/icons-vue';
import { getLevelColor, getLevelOptions2, OptionType } from '/@/utils/constant';
import { listThreatRuleOptions } from '/@/api/grpc/method';

const { t } = useI18n();

const DetailDrawer = defineAsyncComponent(() => import('./detailDrawer.vue'));
const AdvancedSearch = defineAsyncComponent(() => import('/@/components/form/advancedSearch.vue'));

const detailDrawerRef = ref();
const isAdvanceSearch = ref(false);
const isAutoRefresh = ref(false);
const lastOccurenceTime = ref(getPrev1Year());
const threatIds = ref<string[]>([]);
const threatIdOptions = ref<OptionType[]>([]);
const levelOptions = getLevelOptions2();
const threatLevel = ref<number[]>([]);
const eventStatus = ref<number>(0);
const eventStatusOptions = [-1, 0, 1, 2, 3];

// Checkbox states for "Check All"
const threatIdsCheckAll = ref(false);
const threatIdsIndeterminate = ref(false);
const levelCheckAll = ref(false);
const levelIndeterminate = ref(false);

const pageIdx = ref(1);
const pageSize = ref(10);
const tableRows = ref<ListThreatReply_Details[]>([]);
const tableRowsSelected = ref<ListThreatReply_Details[]>([]);
const tableLoading = ref(false);
const exhausted = ref(false);
const advancedSearchRef = ref([] as AdvancedSearchType[]);
const total = ref(0);

// Add to whitelist
const addWhiteFields = ref<any[]>([]);
const addWhiteVisiable = ref<boolean>(false);
const addWhiteTitle = ref<string>('');
const addWhiteDomain = ref<string>('');
const addWhiteFlowId = ref<string>('');
const unknownText = 'Unknown';

const highRiskCount = computed(() => tableRows.value.filter(item => item.level >= 4).length);
const pendingCount = computed(() => tableRows.value.filter(item => item.eventStatus === 0).length);

const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const titleCase = (value: string) => value
    .replace(/^attack\./i, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const normalizeFieldValue = (value?: string) => {
    if (!value) return unknownText;
    return value.replace(/^::ffff:/i, '').trim() || unknownText;
};

const findFlowField = (row: ListThreatReply_Details, objects: string[], keys: string[] = []) => {
    const fields = row.attackFlow?.fields ?? [];
    const normalizedObjects = objects.map(item => item.toLowerCase());
    const normalizedKeys = keys.map(item => item.toLowerCase());

    return fields.find(field => normalizedObjects.includes((field.obj || '').toLowerCase()) && field.value)
        ?? fields.find(field => normalizedKeys.some(key => (field.key || '').toLowerCase().includes(key)) && field.value);
};

const findFlowValue = (row: ListThreatReply_Details, objects: string[], keys: string[] = []) => {
    return normalizeFieldValue(findFlowField(row, objects, keys)?.value);
};

const findFlowValueByKey = (row: ListThreatReply_Details, key: string) => {
    const normalizedKey = key.toLowerCase();
    const field = (row.attackFlow?.fields ?? []).find(item => (item.key || '').toLowerCase() === normalizedKey);
    return normalizeFieldValue(field?.value);
};

const getAttackSource = (row: ListThreatReply_Details) => findFlowValue(row, ['ip'], ['ipaddress', 'source_ip', 'src_ip']);
const getAttackAccount = (row: ListThreatReply_Details) => findFlowValue(row, ['user'], ['targetusername', 'username', 'user']);
const getAttackTarget = (row: ListThreatReply_Details) => findFlowValue(row, ['computer', 'dc'], ['hostname', 'target', 'computer']);

const getFlowNodes = (row: ListThreatReply_Details) => [
    {
        key: 'source',
        label: t('message.threat.alarmList.attackSource'),
        value: getAttackSource(row),
        icon: Connection,
    },
    {
        key: 'account',
        label: t('message.threat.alarmList.account'),
        value: getAttackAccount(row),
        icon: User,
    },
    {
        key: 'target',
        label: t('message.threat.alarmList.attackTarget'),
        value: getAttackTarget(row),
        icon: Monitor,
    },
];

const getAttackMethod = (row: ListThreatReply_Details) => {
    const tags = row.tags ?? [];
    const techniques = tags.filter(tag => /^attack\.t/i.test(tag)).map(tag => tag.replace(/^attack\./i, '').toUpperCase());
    const tactics = tags.filter(tag => /^attack\.(?!t)/i.test(tag)).map(titleCase);
    const matrices = tags.filter(tag => /^TA\d+/i.test(tag)).map(tag => tag.toUpperCase());
    const methodTags = [...techniques, ...tactics, ...matrices].filter(Boolean);

    return {
        summary: methodTags.slice(0, 2).join(' / ') || row.attckId || unknownText,
        tags: methodTags.slice(0, 4),
    };
};

const formatRuleStatus = (status: string) => titleCase(status || unknownText);

const getLevelLabel = (level: number) => t(`message.threat.level.${level}`);

const getEventStatusLabel = (status: number) => {
    if (status === -1) return t('message.threat.alarmList.eventStatusAll');
    return t(`message.threat.status.${status}`);
};

const getDomainLabel = (row: ListThreatReply_Details) => {
    const hostname = row.dcHostname || '';
    const parts = hostname.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : unknownText;
};

const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '<1s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;
    if (minutes < 60) return restSeconds > 0 ? `${minutes}m ${restSeconds}s` : `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return restMinutes > 0 ? `${hours}h ${restMinutes}m` : `${hours}h`;
};

const formatAttackDescription = (row: ListThreatReply_Details) => {
    const template = row.attackFlow?.desc || row.desc || row.title || '';
    if (!template) return unknownText;

    return escapeHtml(template).replace(/\[([^\]]+)\]/g, (_, key: string) => {
        const value = findFlowValueByKey(row, key);
        return `<span class="flow-token">${escapeHtml(value === unknownText ? `[${key}]` : value)}</span>`;
    });
};

const normalizeAdvancedValue = (value: unknown) => {
    if (value instanceof Date) {
        return formatDate(value, 'YYYY-mm-dd HH:MM:SS');
    }

    return String(value ?? '').trim();
};

const getEffectiveAdvancedSearch = () => {
    return advancedSearchRef.value
        .map((item) => {
            const rawValues = Array.isArray(item.value) ? item.value : [item.value];
            const value = rawValues.map(normalizeAdvancedValue).filter(Boolean);

            return {
                name: item.name,
                type: item.type,
                value,
            };
        })
        .filter((item) => {
            if (!item.name || !item.type || item.value.length === 0) return false;
            if (item.name === 'time' && item.type === 'bt') return item.value.length >= 2;
            return true;
        });
};

const refreshThreatTable = () => {
    const effectiveAdvancedSearch = isAdvanceSearch.value ? getEffectiveAdvancedSearch() : [];
    const hasAdvancedSearch = effectiveAdvancedSearch.length > 0;
    const req: ListThreatReq = {
        pageIdx: pageIdx.value,
        pageSize: pageSize.value,
        iDs: hasAdvancedSearch ? [] : threatIds.value, // Threat ID list
        level: hasAdvancedSearch ? [] : threatLevel.value, // Threat levels and severity
        startTm: hasAdvancedSearch ? '' : formatDate(lastOccurenceTime.value[0], 'YYYY-mm-dd HH:MM:SS'), // Start time
        endTm: hasAdvancedSearch ? '' : formatDate(lastOccurenceTime.value[1], 'YYYY-mm-dd HH:MM:SS'), // End time
        searchType: hasAdvancedSearch ? 1 : 0,
        advancedSearch: hasAdvancedSearch ? effectiveAdvancedSearch : [],
        sortTm: -1, // Sort by time: `1` asc, `-1` desc
        eventStatus: hasAdvancedSearch ? -1 : eventStatus.value,
    };
    
    tableLoading.value = true;

    api.listThreat(req)
    .then(response => response.response)
    .then((data: ListThreatReply) => {
        exhausted.value = data.exhausted;
        tableRows.value = data.list;
        total.value = data.page?.total ?? 0;
    })
    .catch(err => {
        const msg = decodeURIComponent(err.message);
        ElMessage.error(msg);

    })
    .finally(() => {
        tableLoading.value = false;
        tableRowsSelected.value = [];
    });
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
};

const handleClose = (rows: ListThreatReply_Details[]) => {
    if (!rows || rows.length === 0) {
        return;
    }

    closeThreats(rows, t);
};

const handleDetail = (row: ListThreatReply_Details) => {
    detailDrawerRef.value.open(t('message.threat.detail.title'), row.iD);
}

const handleCloseAdvancedSearch = (index: number) => {
    // advancedSearchRef.value = advancedSearchRef.value.filter((v, i) => i !== index);
    advancedSearchRef.value.splice(index, 1);
}

const handleAddAdvancedSearch = () => {
    advancedSearchRef.value = [...advancedSearchRef.value, { name: '', type: '', value: [] }];
}

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  refreshThreatTable();
}

const handleCurrentChange = (val: number) => {
  pageIdx.value = val;
  refreshThreatTable();
}

let intervalId: ReturnType<typeof setInterval> | null = null;

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

const onAutoRefresh = (val: boolean) => {
    if (val) {
        enableAutoRefresh();
    } else {
        disalbeAutoRefresh();
    }
};

// Handle threatIds Select All
const handleThreatIdsCheckAll = (val: boolean) => {
    threatIdsIndeterminate.value = false;
    if (val) {
        threatIds.value = threatIdOptions.value.map(opt => opt.value);
    } else {
        threatIds.value = [];
    }
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

onMounted(() => {
    refreshThreatTable();

    listThreatRuleOptions().then(options => threatIdOptions.value = options);
});

onUnmounted(() => {
    disalbeAutoRefresh();
});

watch(advancedSearchRef,
    () => {
        if (!isAdvanceSearch.value) return;
        pageIdx.value = 1;
        refreshThreatTable();
    }, { deep: true }
);

watch(isAdvanceSearch, (value) => {
    pageIdx.value = 1;
    if (value === true) {
        if (advancedSearchRef.value.length === 0) {
            advancedSearchRef.value = [{ name: '', type: '', value: [] }];
        } else {
            refreshThreatTable();
        }
    } else {
        refreshThreatTable();
    }
});

watch(threatIds, (val) => {
    threatIdsIndeterminate.value = false;
    if (val.length === 0) {
        threatIdsCheckAll.value = false;
    } else if (val.length === threatIdOptions.value.length) {
        threatIdsCheckAll.value = true;
    } else {
        threatIdsIndeterminate.value = true;
    }
    refreshThreatTable();
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
    refreshThreatTable();
});

watch([lastOccurenceTime, eventStatus], () => {
    refreshThreatTable();
});

</script>

<style lang="scss">
.threat-events-page {
	display: flex;
	flex-direction: column;
	gap: 14px;
	background: #f5f7fb;

	.events-command-panel,
	.events-list-panel {
		border: 1px solid #dfe6ef;
		border-radius: 8px;
		background: #ffffff;
		box-shadow: 0 10px 28px rgba(31, 45, 61, 0.06);
	}

	.events-command-panel {
		overflow: hidden;
	}

	.events-command-main {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 18px;
		padding: 18px 20px;
		color: #17233d;
		background:
			linear-gradient(135deg, rgba(22, 143, 122, 0.1), rgba(245, 184, 75, 0.08)),
			#ffffff;
		border-bottom: 1px solid rgba(220, 232, 229, 0.86);
	}

	.events-kicker {
		margin-bottom: 6px;
		color: var(--ada-primary);
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
	}

	.events-command-copy {
		min-width: 0;

		p {
			margin: 0;
			max-width: 760px;
			color: #64748b;
			font-size: 13px;
			line-height: 1.5;
		}
	}

	.events-command-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 12px;
		min-width: 360px;

		.el-switch__label {
			color: #475569;
		}
	}

	.events-metrics {
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

	.events-filter-panel {
		padding: 14px 18px 6px;

		.filter-form {
			display: flex;
			align-items: flex-start;
			flex-wrap: wrap;
			column-gap: 12px;
		}
	}

	.filter-threat-select {
		width: 220px;
	}

	.filter-level-select {
		width: 150px;
	}

	.filter-status-select {
		width: 132px;
	}

	.alarm-advanced-form {
		display: block;
		width: 100%;
	}

	.advanced-search-stack {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		width: 100%;
	}

	.advanced-search-row {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 100%;

		.el-space {
			align-items: center;
			padding: 3px;
			border: 1px solid rgba(220, 232, 229, 0.92);
			border-radius: 8px;
			background: #fbfcfe;
		}
	}

	.advanced-icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid rgba(22, 143, 122, 0.24);
		border-radius: 8px;
		background: #ffffff;
		color: var(--ada-primary);
		cursor: pointer;
		transition: border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease, transform 0.16s ease;

		&:hover {
			border-color: rgba(22, 143, 122, 0.5);
			background: rgba(22, 143, 122, 0.08);
			transform: translateY(-1px);
		}
	}

	.advanced-remove-btn {
		width: 28px;
		height: 28px;
		border-color: transparent;
		background: transparent;
		color: var(--ada-danger);

		&:hover {
			border-color: transparent;
			background: rgba(217, 86, 86, 0.08);
			transform: none;
		}
	}

	.advanced-add-btn {
		flex: 0 0 auto;
		background: rgba(22, 143, 122, 0.1);
	}

	.advanced-add-btn .el-icon,
	.advanced-remove-btn .el-icon {
		font-size: 16px;
	}

	.events-list-panel {
		padding: 16px 18px;
	}

	.events-list-header,
	.events-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.events-list-header {
		margin-bottom: 12px;

		div {
			display: flex;
			align-items: baseline;
			gap: 8px;
		}

		span {
			color: #536271;
			font-size: 13px;
			font-weight: 700;
			text-transform: uppercase;
		}

		strong {
			color: #17233d;
			font-size: 20px;
		}

		.bulk-close-button {
			border: 0;
			background: linear-gradient(135deg, #14b8a6, #059669);
			box-shadow: 0 10px 24px rgba(20, 184, 166, 0.22);
			color: #ffffff !important;
			font-weight: 800;
			letter-spacing: 0;

			&.is-disabled,
			&.is-disabled:hover,
			&.is-disabled:focus {
				background: linear-gradient(135deg, rgba(20, 184, 166, 0.72), rgba(5, 150, 105, 0.72)) !important;
				box-shadow: none;
				color: rgba(255, 255, 255, 0.86) !important;
			}
		}
	}

	.event-card-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.event-card {
		position: relative;
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr);
		min-width: 0;
		overflow: hidden;
		border: 1px solid #dfe6ef;
		border-radius: 8px;
		background: #ffffff;
		cursor: pointer;
		transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

		&:hover {
			border-color: #9bc8ff;
			box-shadow: 0 12px 28px rgba(31, 45, 61, 0.1);
			transform: translateY(-1px);
		}

		&.is-selected {
			border-color: #409eff;
			box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.16);
		}
	}

	.event-card-rail {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid rgba(220, 232, 229, 0.86);
		background:
			linear-gradient(180deg, rgba(248, 251, 255, 0.98), rgba(238, 247, 245, 0.96)),
			#f8fbff;

		&::before {
			content: '';
			position: absolute;
			inset: 0 auto 0 0;
			width: 4px;
			background: linear-gradient(180deg, var(--level-color), rgba(22, 143, 122, 0.42));
		}

		&::after {
			content: '';
			position: absolute;
			top: 18px;
			bottom: 18px;
			left: 50%;
			width: 1px;
			background: linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.34), transparent);
			transform: translateX(-50%);
		}
	}

	.event-index {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: 1px solid rgba(22, 143, 122, 0.2);
		border-radius: 10px;
		background:
			linear-gradient(180deg, #ffffff, #f6fafc),
			#ffffff;
		box-shadow: 0 8px 18px rgba(31, 45, 61, 0.08), inset 0 0 0 3px rgba(22, 143, 122, 0.05);
		color: #17233d;
		font-size: 12px;
		font-weight: 800;
		transition: border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
	}

	.event-card:hover .event-index,
	.event-card.is-selected .event-index {
		border-color: var(--level-color);
		box-shadow: 0 10px 22px rgba(31, 45, 61, 0.11), inset 0 0 0 3px rgba(64, 158, 255, 0.08);
		color: var(--level-color);
	}

	.event-dot {
		position: absolute;
		right: -5px;
		z-index: 2;
		width: 10px;
		height: 10px;
		border: 2px solid #ffffff;
		border-radius: 50%;
		background: var(--level-color);
		box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
	}

	.event-card-body {
		min-width: 0;
		padding: 14px 16px 13px 18px;
	}

	.event-title-row,
	.event-meta-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.event-title-main {
		min-width: 0;
	}

	.event-title {
		overflow: hidden;
		color: #17233d;
		font-size: 16px;
		font-weight: 800;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.event-tags,
	.method-tags,
	.event-meta-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 7px;
	}

	.level-chip,
	.status-chip,
	.soft-chip,
	.method-tags span {
		display: inline-flex;
		align-items: center;
		max-width: 180px;
		min-height: 22px;
		padding: 2px 8px;
		overflow: hidden;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.level-chip {
		color: var(--level-color);
		background: color-mix(in srgb, var(--level-color) 12%, #ffffff);
	}

	.status-chip {
		color: #52606d;
		background: #eef2f6;

		&.status-0 {
			color: #c2412f;
			background: #fff0ed;
		}

		&.status-1 {
			color: #2f7a43;
			background: #edf8ee;
		}

		&.status-2 {
			color: #536271;
			background: #eef2f6;
		}

		&.status-3 {
			color: #a16207;
			background: #fff6df;
		}
	}

	.soft-chip,
	.method-tags span {
		color: #536271;
		background: #f2f5f8;
	}

	.event-actions {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		flex: 0 0 auto;
	}

	.event-info-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 10px;
		margin-top: 14px;
	}

	.flow-node {
		display: grid;
		grid-template-columns: 34px minmax(0, 1fr);
		align-items: center;
		gap: 9px;
		min-width: 0;
		padding: 10px;
		border: 1px solid #edf1f5;
		border-radius: 8px;
		background: #fbfcfe;
	}

	.flow-node-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 8px;
		color: #0b6fb3;
		background: #eaf5ff;
	}

	.method-icon {
		color: #c2412f;
		background: #fff0ed;
	}

	.flow-node-copy {
		min-width: 0;

		span {
			display: block;
			color: #7a8795;
			font-size: 12px;
		}

		strong {
			display: block;
			overflow: hidden;
			color: #17233d;
			font-size: 13px;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.attack-path {
		margin-top: 12px;
		padding: 10px 12px;
		border: 1px solid #dfe6ef;
		border-left: 4px solid #409eff;
		border-radius: 8px;
		background: linear-gradient(90deg, #f7fbff, #ffffff);
	}

	.attack-path-line {
		display: -webkit-box;
		overflow: hidden;
		color: #3d4c5c;
		font-size: 13px;
		line-height: 1.55;
		text-overflow: ellipsis;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.flow-token {
		display: inline-flex;
		max-width: 220px;
		margin: 0 2px;
		padding: 0 6px;
		overflow: hidden;
		border-radius: 5px;
		color: #0b6fb3;
		background: #eaf5ff;
		font-weight: 800;
		text-overflow: ellipsis;
		vertical-align: bottom;
		white-space: nowrap;
	}

	.event-meta-row {
		margin-top: 12px;
		color: #697789;
		font-size: 12px;

		span {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			min-width: 0;
		}
	}

	.events-pagination {
		margin-top: 14px;
	}
}

@media (max-width: 1200px) {
	.threat-events-page {
		.events-command-main,
		.event-title-row {
			flex-direction: column;
			align-items: stretch;
		}

		.events-command-actions {
			justify-content: flex-start;
			min-width: 0;
		}

		.events-metrics,
		.event-info-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
}

@media (max-width: 768px) {
	.threat-events-page {
		.events-metrics,
		.event-info-grid {
			grid-template-columns: 1fr;
		}

		.event-card {
			grid-template-columns: 52px minmax(0, 1fr);
		}

		.event-index {
			width: 28px;
			height: 28px;
			border-radius: 8px;
			font-size: 11px;
		}

		.events-list-header,
		.events-pagination {
			align-items: flex-start;
			flex-direction: column;
		}
	}
}
</style>
