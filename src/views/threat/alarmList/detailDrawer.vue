<template>
	<el-drawer v-model="state.open" size="90%" class="threat-detail-drawer">
		<template #header>
			<div class="drawer-header">
				<h2>{{ state.title }}</h2>
			</div>
		</template>
		<template #default>
			<div class="threat-detail-container">
				<!-- Header Card - Threat Overview -->
				<el-card class="header-card" shadow="hover">
					<div class="header-content">
						<div class="header-left">
							<h2 class="threat-title">{{ state.data?.title }}</h2>
							<div class="threat-meta">
								<el-tag :type="getEventStatusType(state.data?.eventStatus)" size="small" effect="dark">
									{{ getEventStatusText(state.data?.eventStatus) }}
								</el-tag>
								<el-divider direction="vertical" />
								<span class="time-range">
									<el-icon><Clock /></el-icon>
									{{ $t('message.time.from') }}{{ formatApiTime(state.data?.startTm) }} {{ $t('message.time.to')
									}}{{ formatApiTime(state.data?.endTm) }}
								</span>
							</div>
						</div>
						<div class="header-right">
							<el-dropdown @command="handleOperation" trigger="click">
								<el-button type="primary" size="large">
									{{ $t('message.tableCommon.operation') }}
									<el-icon class="el-icon--right"><arrow-down /></el-icon>
								</el-button>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item command="close">
											<el-icon><CircleClose /></el-icon>
											{{ $t('message.tableCommon.close') }}
										</el-dropdown-item>
										<el-dropdown-item command="addWhite">
											<el-icon><Plus /></el-icon>
											{{ T('addWhiteTitle') }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
					</div>
					<!-- Attack Flow Fields Tags -->
					<div class="field-tags" v-if="filteredFieldData.length">
						<el-space wrap :size="8">
							<el-tooltip v-for="field in filteredFieldData" :key="field.fullKey" placement="top">
								<template #content>
									<div style="max-width: 300px">
										<strong>{{ field.key }}</strong
										><br />
										{{ field.fullKey }}
									</div>
								</template>
								<el-tag type="info" size="default">
									<strong>{{ field.key }}:</strong> {{ field.value }}
								</el-tag>
							</el-tooltip>
						</el-space>
					</div>
				</el-card>

				<!-- Attack Flow Explanation Card -->
				<el-card class="explanation-card" shadow="hover" v-if="state.data?.attackFlow">
					<template #header>
						<div class="card-header">
							<el-icon class="header-icon"><InfoFilled /></el-icon>
							<span class="card-title">{{ $t('message.threat.detail.explanation') }}</span>
						</div>
					</template>
					<div class="explanation-content">
						<div class="explanation-text" v-html="formattedTmpl"></div>
					</div>
					<!-- Attack Flow Visualization -->
					<div class="attack-flow-visualization" v-if="state.data?.attackFlow?.fields?.length">
						<el-divider content-position="center">Attack Flow</el-divider>
						<div class="flow-container">
							<div class="flow-items">
								<div
									v-for="(field, index) in state.data?.attackFlow?.fields"
									:key="field.key"
									class="flow-item-wrapper"
									:style="{ '--item-index': index }"
								>
									<div class="flow-item">
										<el-tooltip :content="field.key" placement="top">
											<div class="flow-icon-wrapper">
												<div class="pulse-ring"></div>
												<el-image class="flow-icon" :src="getImage(field.obj)" fit="contain" />
											</div>
										</el-tooltip>
										<el-tooltip :content="field.key" placement="bottom">
											<div class="flow-label">{{ field.value }}</div>
										</el-tooltip>
									</div>
									<!-- Arrow/Relation -->
									<div v-if="index < state.data?.attackFlow?.relates?.length" class="flow-arrow">
										<div class="arrow-line">
											<div class="arrow-particle"></div>
										</div>
										<div class="arrow-label">{{ state.data?.attackFlow?.relates[index] }}</div>
										<div class="arrow-head"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</el-card>

				<!-- Evidence Card -->
				<el-card class="evidence-card" shadow="hover">
					<template #header>
						<div class="card-header">
							<el-icon class="header-icon"><Document /></el-icon>
							<span class="card-title">{{ $t('message.threat.detail.evidence') }}</span>
							<el-badge :value="state.activity.data?.length || 0" class="evidence-badge" type="primary" />
						</div>
					</template>
					<el-table
						:data="state.activity.data"
						v-loading="state.activity.loading"
						row-class-name="pointer-cursor"
						style="width: 100%"
						@row-click="handleRowClick"
						ref="evidenceTable"
						:header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
					>
						<el-table-column type="expand">
							<template #default="props">
								<div class="json-viewer-wrapper">
									<JsonViewer :value="JSON.parse(props.row.rawLog)" copyable boxed sort></JsonViewer>
								</div>
							</template>
						</el-table-column>
						<el-table-column type="index" width="60" label="#" align="center" />
						<el-table-column prop="title" :label="$t('message.threat.tableTitle.title')" min-width="200" show-overflow-tooltip />
						<el-table-column :label="$t('message.threat.tableTitle.createTm')" width="180" align="center">
							<template #default="scope">
								<el-icon style="margin-right: 4px"><Clock /></el-icon>
								{{ formatApiTime(scope.row.createTm) }}
							</template>
						</el-table-column>
						<el-table-column :label="$t('message.threat.tableTitle.level')" width="100" align="center">
							<template #default="scope">
								<el-tag :type="getLevelType(scope.row.level)" effect="dark">
									{{ $t(`message.threat.level.${scope.row.level}`) }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column :label="$t('message.threat.tableTitle.tags')" min-width="150">
							<template #default="scope">
								<el-space wrap :size="4">
									<el-tag v-for="(tag, index) in scope.row.tags" :key="index" size="small" effect="plain">{{ tag }}</el-tag>
								</el-space>
							</template>
						</el-table-column>
						<el-table-column :label="$t('message.tableCommon.operate')" width="200" align="center" fixed="right">
							<template #default="scope">
								<el-button size="small" type="primary" link @click.stop="handleViewRule(scope.row)">
									<el-icon style="margin-right: 4px"><View /></el-icon>
									{{ $t('message.tableCommon.view') }}
								</el-button>
								<el-button size="small" type="success" link @click.stop="handleViewInKibana(scope.row, scope.$index)">
									<el-icon style="margin-right: 4px"><Link /></el-icon>
									Kibana
								</el-button>
							</template>
						</el-table-column>
					</el-table>
					<!-- Pagination -->
					<div class="pagination-wrapper">
						<el-pagination
							v-model:current-page="state.activity.pageIdx"
							v-model:page-size="state.activity.pageSize"
							:page-sizes="[10, 20, 30, 40, 50]"
							layout="total, sizes, prev, pager, next, jumper"
							:total="state.activity.total"
							@size-change="handleSizeChange"
							@current-change="handleCurrentChange"
							background
						/>
					</div>
				</el-card>

				<!-- Detail Information Card -->
				<el-card class="detail-info-card" shadow="hover">
					<template #header>
						<div class="card-header">
							<el-icon class="header-icon"><Notebook /></el-icon>
							<span class="card-title">{{ $t('message.threat.detail.description') }}</span>
						</div>
					</template>
					<el-collapse v-model="state.activeCollapse" accordion>
						<!-- Threat Description -->
						<el-collapse-item name="desc">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><Tickets /></el-icon>
									<span>{{ T('threatDesc') }}</span>
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!state.data?.desc" description="No description available" :image-size="60" />
								<p v-else class="content-text">{{ state.data?.desc }}</p>
							</div>
						</el-collapse-item>
						<!-- Remediation Suggestions -->
						<el-collapse-item name="suggestion">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><Warning /></el-icon>
									<span>{{ T('suggestion') }}</span>
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!state.data?.suggestion" description="No suggestion available" :image-size="60" />
								<p v-else class="content-text">{{ state.data?.suggestion }}</p>
							</div>
						</el-collapse-item>
						<!-- References -->
						<el-collapse-item name="verify">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><Link /></el-icon>
									<span>{{ T('verifyDesc') }}</span>
									<el-badge v-if="state.data?.references?.length" :value="state.data.references.length" class="reference-badge" type="primary" />
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!state.data?.references?.length" description="No references available" :image-size="60" />
								<div v-else class="reference-list">
									<div v-for="(ref, index) in state.data.references" :key="index" class="reference-item">
										<el-icon class="reference-icon"><Document /></el-icon>
										<a v-if="isUrl(ref)" :href="ref" target="_blank" rel="noopener noreferrer" class="reference-link">
											{{ ref }}
											<el-icon class="external-link-icon"><TopRight /></el-icon>
										</a>
										<span v-else class="reference-text">{{ ref }}</span>
									</div>
								</div>
							</div>
						</el-collapse-item>
						<!-- Remarks -->
						<el-collapse-item name="remark">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><EditPen /></el-icon>
									<span>{{ T('remark') }}</span>
									<el-badge v-if="remarkHistory.length" :value="remarkHistory.length" class="reference-badge" type="primary" />
									<el-button v-if="state.data" size="small" type="primary" link @click.stop="openRemarkDialog" style="margin-left: auto">
										<el-icon><Edit /></el-icon>
										{{ $t('message.tableCommon.edit') }}
									</el-button>
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!remarkHistory.length" description="No remarks available" :image-size="60" />
								<el-timeline v-else class="remark-timeline">
									<el-timeline-item v-for="(item, index) in remarkHistory" :key="index" :color="index === 0 ? '#409eff' : '#909399'">
										<div class="remark-item">
											<div class="remark-header">
												<el-tag size="small" type="info">{{ item.user }}</el-tag>
												<span class="remark-time">{{ item.time }}</span>
											</div>
											<div class="remark-text">{{ item.text }}</div>
										</div>
									</el-timeline-item>
								</el-timeline>
							</div>
						</el-collapse-item>
					</el-collapse>
				</el-card>
			</div>
		</template>
	</el-drawer>
	<AddWhiteDialog
		v-model="state.addWhite.visible"
		:fields="state.addWhite.fields"
		:title="state.addWhite.title"
		:domain="state.addWhite.domain"
		:flow-id="state.addWhite.flowId"
	/>
	<!-- Sigma Rule View Dialog -->
	<el-dialog v-model="state.ruleView.visible" :title="$t('message.ruleManage.viewActivityRule')" width="700px">
		<div class="yaml-viewer">
			<pre><code class="language-yaml" v-html="state.ruleView.highlightedYaml"></code></pre>
		</div>
		<template #footer>
			<el-button @click="state.ruleView.visible = false">{{ $t('message.tableCommon.close') }}</el-button>
		</template>
	</el-dialog>

	<!-- Remark Edit Dialog -->
	<el-dialog v-model="state.remarkDialog.visible" :title="T('remark')" width="600px">
		<el-form :model="state.remarkDialog" label-width="100px">
			<el-form-item :label="$t('message.tableCommon.remark')">
				<el-input
					v-model="state.remarkDialog.text"
					type="textarea"
					:rows="4"
					:maxlength="128"
					show-word-limit
					:placeholder="$t('message.threat.remarkPlaceholder')"
				/>
			</el-form-item>
			<el-alert
				v-if="remarkHistory.length >= 10"
				:title="$t('message.threat.remarkLimitWarning')"
				type="warning"
				:closable="false"
				show-icon
				style="margin-bottom: 16px"
			/>
		</el-form>
		<template #footer>
			<el-button @click="state.remarkDialog.visible = false">{{ $t('message.tableCommon.cancel') }}</el-button>
			<el-button
				type="primary"
				@click="handleSaveRemark"
				:loading="state.remarkDialog.saving"
				:disabled="!state.remarkDialog.text.trim() || remarkHistory.length >= 10"
			>
				{{ $t('message.tableCommon.save') }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { ActivityDetails, AttackFlowReply_Field, GetThreatReply, GetThreatReq, GetActivityRuleReq, ActionThreatReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessage } from 'element-plus';
import {
	ArrowDown,
	Clock,
	CircleClose,
	Plus,
	InfoFilled,
	Document,
	View,
	Notebook,
	Tickets,
	Warning,
	EditPen,
	Link,
	TopRight,
	Edit,
} from '@element-plus/icons-vue';
import { closeThreats } from './operation';
import { useI18n } from 'vue-i18n';
import { JsonViewer } from 'vue3-json-viewer';
import { transAlarmList as T } from '/@/utils/translator';
import AddWhiteDialog from './AddWhiteDialog.vue';
import { Local } from '/@/utils/storage';
import DcImage from '/@/assets/dc.jpg';
import IpImage from '/@/assets/ip.jpg';
import UserImage from '/@/assets/user.jpg';
import ComputerImage from '/@/assets/computer.jpg';
import yaml from 'js-yaml';
import hljs from 'highlight.js/lib/core';
import yamlLang from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css';
import { openKibanaDocInNewTab } from '/@/utils/kibana';

// Register YAML language
hljs.registerLanguage('yaml', yamlLang);

const { t } = useI18n();

const evidenceTable = ref();

interface RemarkItem {
	time: string;
	user: string;
	text: string;
}

const state = reactive({
	open: false,
	loading: false,
	title: '',
	data: null as GetThreatReply | null,
	activeCollapse: 'desc',
	activity: {
		loading: false,
		pageIdx: 1,
		pageSize: 10,
		total: 0,
		allData: [] as ActivityDetails[], // Store all activities
		data: [] as ActivityDetails[], // Current page data
	},
	addWhite: {
		flowId: '',
		domain: '',
		visible: false,
		title: '',
		fields: [] as AttackFlowReply_Field[],
	},
	ruleView: {
		visible: false,
		yamlContent: '',
		highlightedYaml: '',
	},
	remarkDialog: {
		visible: false,
		text: '',
		saving: false,
	},
});

const handleSizeChange = (val: number) => {
	state.activity.pageSize = val;
	state.activity.pageIdx = 1; // Reset to first page when page size changes
	updateActivityPage();
};

const handleCurrentChange = (val: number) => {
	state.activity.pageIdx = val;
	updateActivityPage();
};

const updateActivityPage = () => {
	const start = (state.activity.pageIdx - 1) * state.activity.pageSize;
	const end = start + state.activity.pageSize;
	state.activity.data = state.activity.allData.slice(start, end);
};

const remarkHistory = computed<RemarkItem[]>(() => {
	if (!state.data?.remark) {
		return [];
	}
	try {
		const parsed = JSON.parse(state.data.remark);
		if (Array.isArray(parsed)) {
			return parsed as RemarkItem[];
		}
		return [];
	} catch {
		// If remark is not valid JSON, treat as legacy single remark
		return [];
	}
});

const openRemarkDialog = () => {
	state.remarkDialog.text = '';
	state.remarkDialog.visible = true;
};

const handleSaveRemark = async () => {
	if (!state.data || !state.remarkDialog.text.trim()) {
		return;
	}

	// Validate: max 10 remarks
	if (remarkHistory.value.length >= 10) {
		ElMessage.warning(t('message.threat.remarkLimitWarning'));
		return;
	}

	state.remarkDialog.saving = true;

	try {
		// Get current user from Local storage (set during login)
		const currentUser = Local.get('userName') || 'Unknown User';

		// Create new remark item
		const newRemark: RemarkItem = {
			time: new Date().toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			}),
			user: currentUser,
			text: state.remarkDialog.text.trim(),
		};

		// Add new remark to the beginning of the array
		const updatedRemarks = [newRemark, ...remarkHistory.value];

		// Convert to JSON string
		const remarkJson = JSON.stringify(updatedRemarks);

		// Call ActionThreat API
		const req: ActionThreatReq = {
			iD: state.data.iD,
			eventStatus: state.data.eventStatus || 0,
			remark: remarkJson,
		};

		const result = await api.actionThreat(req).then((resp) => resp.response);

		if (result.result.toUpperCase() === 'SUCCESS') {
			ElMessage.success(t('message.tableCommon.saveSuccess'));

			// Update local state
			if (state.data) {
				state.data.remark = remarkJson;
			}

			// Close dialog
			state.remarkDialog.visible = false;
			state.remarkDialog.text = '';
		} else {
			ElMessage.error(t('message.tableCommon.saveFailed'));
		}
	} catch (err: any) {
		alertApiError(err);
	} finally {
		state.remarkDialog.saving = false;
	}
};

const getImage = (type: string) => {
	const m: Record<string, any> = {
		dc: DcImage,
		ip: IpImage,
		user: UserImage,
		computer: ComputerImage,
	};

	return m[type] ?? '';
};

const open = (title: string, id: string) => {
	state.open = true;
	state.title = title;
	state.addWhite.visible = false;

	// Reset activity pagination state
	state.activity.pageIdx = 1;
	state.activity.pageSize = 10;
	state.activity.allData = [];
	state.activity.data = [];
	state.activity.total = 0;

	const req: GetThreatReq = {
		iD: id,
	};

	state.loading = true;

	// 获取threat详情
	api
		.getThreat(req)
		.then((resp) => resp.response)
		.then((data: GetThreatReply) => {
			state.data = data;

			// Store all activities and setup pagination
			state.activity.allData = data.activities || [];
			state.activity.total = state.activity.allData.length;

			// Load first page
			updateActivityPage();
		})
		.catch((err) => alertApiError(err))
		.finally(() => (state.loading = false));
};

const handleOperation = (command: string | number | object) => {
	if (!state.data) {
		return;
	}

	if (command === 'close') {
		closeThreats([state.data], t);
	} else if (command === 'addWhite') {
		state.addWhite.visible = true;
	}
};

const handleRowClick = (row: ActivityDetails) => {
	evidenceTable.value?.toggleRowExpansion(row);
};

watch(
	() => state.data,
	() => {
		if (!state.data) {
			return;
		}

		state.addWhite.domain = state.data.domain;
		state.addWhite.flowId = state.data.flowId;
		state.addWhite.title = state.data.title;
		state.addWhite.fields = state.data.attackFlow?.fields ?? [];
	}
);

const formattedTmpl = computed(() => {
	// Parse explanation template and replace [xxx] with fieldData values
	if (!state.data || !state.data.attackFlow?.desc) {
		return '';
	}

	const fieldData = state.data.fieldData || {};
	const template = state.data.attackFlow.desc;

	// Helper function to get field value from fieldData
	const getFieldValue = (fieldKey: string): string | null => {
		// Try different possible key formats
		const possibleKeys = [`$s1.field_${fieldKey}`, `$s1.${fieldKey}`, `field_${fieldKey}`, fieldKey];

		for (const key of possibleKeys) {
			if (fieldData[key] && fieldData[key] !== '' && fieldData[key] !== '-') {
				return fieldData[key];
			}
		}
		return null;
	};

	// Split template by [xxx] placeholders
	const parts = template.split(/(\[[^\]]+\])/);

	return parts
		.map((part) => {
			if (part.startsWith('[') && part.endsWith(']')) {
				// Extract field key(s) from [xxx]
				const fieldKeys = part.slice(1, -1); // Remove [ and ]

				// Handle multiple keys separated by comma: [key1,key2,key3]
				// Loop through keys and return the FIRST non-empty value
				const keys = fieldKeys.split(',').map((k) => k.trim());

				// Find first non-empty value
				for (const key of keys) {
					const value = getFieldValue(key);
					if (value) {
						// Found first valid value, return it immediately
						return `<span style="color: #67c23a; font-weight: 600;">${value}</span>`;
					}
				}

				// No valid values found, show placeholder in gray
				return `<span style="color: #909399; font-style: italic;">[${fieldKeys}]</span>`;
			}
			return part;
		})
		.join('');
});

const filteredFieldData = computed(() => {
	if (!state.data?.fieldData) {
		return [];
	}

	// Internal/system fields to exclude (prefixed with $ or internal metadata)
	const excludeFields = ['eid', 'sid', 'timestamp', 'unique_key', 'mid', 'unique_id'];

	// Filter and format fieldData
	return Object.entries(state.data.fieldData)
		.filter(([key, value]) => {
			// Exclude empty values and "-" values
			if (!value || value === '' || value === '-') {
				return false;
			}
			// Exclude internal fields
			const fieldName = key.replace(/^\$s\d+\./, ''); // Remove $s1. prefix
			if (excludeFields.includes(fieldName)) {
				return false;
			}
			return true;
		})
		.map(([key, value]) => {
			// Extract the field name (remove $s1. prefix if exists)
			const cleanKey = key.replace(/^\$s\d+\.field_/, '').replace(/^\$s\d+\./, '');
			return {
				key: cleanKey,
				fullKey: key,
				value: value,
			};
		});
});

const isUrl = (text: string): boolean => {
	try {
		const url = new URL(text);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
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

const getEventStatusType = (eventStatus: number | undefined): string => {
	if (eventStatus === undefined || eventStatus === null) {
		return t('message.threat.status.type_undefined');
	}
	return t(`message.threat.status.type_${eventStatus}`);
};

const getEventStatusText = (eventStatus: number | undefined): string => {
	if (eventStatus === undefined || eventStatus === null) {
		return t('message.threat.status.0');
	}
	return t(`message.threat.status.${eventStatus}`);
};

const handleViewRule = async (row: ActivityDetails) => {
	const levelMap: Record<number, string> = { 1: 'info', 2: 'low', 3: 'medium', 4: 'high', 5: 'critical' };

	// Format date from "2006-01-02 15:04:05" to "2006/01/02"
	const formatDate = (time: string): string => {
		if (!time) return '';
		return time.split(' ')[0].replace(/-/g, '/');
	};

	try {
		// Call GetActivityRule RPC
		const req: GetActivityRuleReq = {
			iD: row.ruleId,
		};

		const ruleData = await api.getActivityRule(req).then((resp) => resp.response);

		// Build YAML object
		const ruleObject = {
			title: ruleData.title,
			id: ruleData.iD || '',
			status: ruleData.status,
			description: ruleData.description || '',
			references: ruleData.references || [],
			author: ruleData.author || '',
			date: formatDate(ruleData.createTm),
			modified: formatDate(ruleData.updateTm),
			tags: ruleData.tags || [],
			logsource: ruleData.logsource || '',
			detection: ruleData.detection || '',
			fields: ruleData.fields || [],
			unique_fields: ruleData.uniqueFields || [],
			level: levelMap[ruleData.level] || 'medium',
		};

		state.ruleView.yamlContent = yaml.dump(ruleObject, {
			indent: 2,
			lineWidth: -1,
			noRefs: true,
			sortKeys: false,
		});

		state.ruleView.highlightedYaml = hljs.highlight(state.ruleView.yamlContent, { language: 'yaml' }).value;
		state.ruleView.visible = true;
	} catch (err: any) {
		alertApiError(err);
	}
};

const handleViewInKibana = async (row: ActivityDetails, rowIndex: number) => {
	if (!state.data?.fieldData) {
		ElMessage.error('Field data not available');
		return;
	}

	try {
		// Calculate the correct index based on current page
		// rowIndex is 0-based within current page
		const actualIndex = rowIndex + 1; // Convert to 1-based index

		// Look for eid in fieldData with the pattern $s{index}.eid
		const eidKey = `$s${actualIndex}.eid`;
		const eid = state.data.fieldData[eidKey];

		if (!eid) {
			ElMessage.error(`Document ID not found for row ${actualIndex}`);
			return;
		}

		// Open in new tab
		await openKibanaDocInNewTab(eid);
		ElMessage.success('Opening in Kibana...');
	} catch (err: any) {
		ElMessage.error(err?.message || 'Failed to open Kibana document');
	}
};

defineExpose({
	open,
});
</script>

<style lang="scss" scoped>
.threat-detail-drawer {
	:deep(.el-drawer__header) {
		margin-bottom: 0;
		padding: 20px 24px;
		border-bottom: 1px solid #e4e7ed;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

		.drawer-header {
			h2 {
				margin: 0;
				font-size: 20px;
				font-weight: 600;
				color: #ffffff;
			}
		}
	}

	:deep(.el-drawer__body) {
		padding: 0;
		background-color: #f5f7fa;
	}
}

.threat-detail-container {
	padding: 20px;
	min-height: 100vh;

	// Header Card Styles
	.header-card {
		margin-bottom: 20px;
		border-radius: 12px;
		border: none;
		overflow: hidden;

		:deep(.el-card__body) {
			padding: 24px;
		}

		.header-content {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 20px;
			margin-bottom: 16px;

			.header-left {
				flex: 1;
				min-width: 0;

				.threat-title {
					margin: 0 0 12px 0;
					font-size: 24px;
					font-weight: 600;
					color: #303133;
					line-height: 1.4;
				}

				.threat-meta {
					display: flex;
					align-items: center;
					gap: 12px;
					flex-wrap: wrap;

					.time-range {
						display: flex;
						align-items: center;
						gap: 6px;
						font-size: 14px;
						color: #606266;

						.el-icon {
							font-size: 16px;
						}
					}
				}
			}

			.header-right {
				flex-shrink: 0;
			}
		}

		.field-tags {
			padding-top: 16px;
			border-top: 1px solid #ebeef5;
		}
	}

	// Explanation Card Styles
	.explanation-card {
		margin-bottom: 20px;
		border-radius: 12px;
		border: none;

		.explanation-content {
			padding: 0 0 16px 0;

			.explanation-text {
				font-size: 15px;
				line-height: 1.8;
				color: #606266;

				:deep(span) {
					font-weight: 600;
					color: #67c23a;
				}
			}
		}

		.attack-flow-visualization {
			margin-top: 20px;

			.flow-container {
				padding: 24px;
				background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
				border-radius: 8px;

				.flow-items {
					display: flex;
					align-items: center;
					justify-content: center;
					flex-wrap: wrap;
					gap: 16px;

					.flow-item-wrapper {
						display: flex;
						align-items: center;
						gap: 16px;
						opacity: 0;
						animation: fadeInUp 0.6s ease forwards;
						animation-delay: calc(var(--item-index) * 0.2s);
					}

					@keyframes fadeInUp {
						from {
							opacity: 0;
							transform: translateY(30px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}

					.flow-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						gap: 12px;
						padding: 16px;
						background: white;
						border-radius: 12px;
						box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
						transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

						&:hover {
							transform: translateY(-8px) scale(1.05);
							box-shadow: 0 8px 30px rgba(64, 158, 255, 0.3);

							.flow-icon-wrapper {
								.pulse-ring {
									animation: pulse 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
								}
							}
						}

						.flow-icon-wrapper {
							position: relative;
							width: 80px;
							height: 80px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							border-radius: 50%;
							padding: 12px;
							box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

							.pulse-ring {
								position: absolute;
								width: 100%;
								height: 100%;
								border: 3px solid #667eea;
								border-radius: 50%;
								opacity: 0;
							}

							@keyframes pulse {
								0% {
									transform: scale(0.95);
									opacity: 0.7;
								}
								50% {
									transform: scale(1.15);
									opacity: 0.3;
								}
								100% {
									transform: scale(1.35);
									opacity: 0;
								}
							}

							.flow-icon {
								width: 100%;
								height: 100%;
								border-radius: 8px;
								position: relative;
								z-index: 1;
							}
						}

						.flow-label {
							font-size: 14px;
							font-weight: 500;
							color: #303133;
							text-align: center;
							max-width: 120px;
							word-wrap: break-word;
						}
					}

					.flow-arrow {
						display: flex;
						flex-direction: column;
						align-items: center;
						gap: 6px;
						padding: 0 12px;

						.arrow-line {
							position: relative;
							width: 40px;
							height: 2px;
							background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
							overflow: hidden;

							.arrow-particle {
								position: absolute;
								width: 8px;
								height: 8px;
								background: radial-gradient(circle, #fff 0%, #409eff 100%);
								border-radius: 50%;
								top: 50%;
								transform: translateY(-50%);
								animation: flowParticle 2s linear infinite;
								box-shadow: 0 0 10px #409eff;
							}

							@keyframes flowParticle {
								0% {
									left: -8px;
									opacity: 0;
								}
								10% {
									opacity: 1;
								}
								90% {
									opacity: 1;
								}
								100% {
									left: 40px;
									opacity: 0;
								}
							}
						}

						.arrow-label {
							font-size: 12px;
							color: #909399;
							white-space: nowrap;
							padding: 4px 8px;
							background: #f0f9ff;
							border-radius: 4px;
							font-weight: 500;
							transition: all 0.3s ease;

							&:hover {
								background: #409eff;
								color: white;
								transform: scale(1.1);
							}
						}

						.arrow-head {
							width: 0;
							height: 0;
							border-left: 8px solid #67c23a;
							border-top: 5px solid transparent;
							border-bottom: 5px solid transparent;
							animation: arrowBounce 1.5s ease-in-out infinite;
						}

						@keyframes arrowBounce {
							0%,
							100% {
								transform: translateX(0);
							}
							50% {
								transform: translateX(4px);
							}
						}
					}
				}
			}
		}
	}

	// Evidence Card Styles
	.evidence-card {
		margin-bottom: 20px;
		border-radius: 12px;
		border: none;

		.evidence-badge {
			margin-left: 12px;
		}

		.json-viewer-wrapper {
			padding: 16px;
			background: #f5f7fa;
			border-radius: 8px;
			margin: 16px;
		}

		.pagination-wrapper {
			display: flex;
			justify-content: flex-end;
			padding: 16px 0 0 0;
			border-top: 1px solid #ebeef5;
			margin-top: 16px;
		}
	}

	// Detail Info Card Styles
	.detail-info-card {
		margin-bottom: 20px;
		border-radius: 12px;
		border: none;

		.collapse-title {
			display: flex;
			align-items: center;
			gap: 10px;
			font-size: 15px;
			font-weight: 500;
			color: #303133;

			.collapse-icon {
				font-size: 18px;
				color: #409eff;
			}

			.reference-badge {
				margin-left: 8px;
			}
		}

		.collapse-content {
			padding: 16px 20px;
			background: #f9fafb;
			border-radius: 8px;
			margin: 12px 0;

			.content-text {
				margin: 0;
				font-size: 14px;
				line-height: 1.8;
				color: #606266;
				white-space: pre-wrap;
			}

			.remark-timeline {
				padding: 8px 0;

				.remark-item {
					.remark-header {
						display: flex;
						align-items: center;
						gap: 12px;
						margin-bottom: 8px;

						.remark-time {
							font-size: 13px;
							color: #909399;
						}
					}

					.remark-text {
						font-size: 14px;
						line-height: 1.6;
						color: #606266;
						padding: 12px;
						background: #ffffff;
						border-radius: 6px;
						border: 1px solid #e4e7ed;
						white-space: pre-wrap;
						word-break: break-word;
					}
				}
			}

			.reference-list {
				display: flex;
				flex-direction: column;
				gap: 12px;

				.reference-item {
					display: flex;
					align-items: flex-start;
					gap: 10px;
					padding: 12px;
					background: #ffffff;
					border-radius: 8px;
					border: 1px solid #e4e7ed;
					transition: all 0.3s ease;

					&:hover {
						border-color: #409eff;
						box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
					}

					.reference-icon {
						flex-shrink: 0;
						margin-top: 2px;
						font-size: 16px;
						color: #909399;
					}

					.reference-link {
						flex: 1;
						font-size: 14px;
						color: #409eff;
						text-decoration: none;
						word-break: break-all;
						line-height: 1.6;
						display: flex;
						align-items: center;
						gap: 6px;

						&:hover {
							color: #66b1ff;
							text-decoration: underline;
						}

						.external-link-icon {
							flex-shrink: 0;
							font-size: 14px;
						}
					}

					.reference-text {
						flex: 1;
						font-size: 14px;
						color: #606266;
						line-height: 1.6;
						word-break: break-all;
					}
				}
			}
		}
	}

	// Card Header Common Styles
	.card-header {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 16px;
		font-weight: 600;
		color: #303133;

		.header-icon {
			font-size: 20px;
			color: #409eff;
		}

		.card-title {
			flex: 1;
		}
	}

	// Table Styles
	:deep(.el-table) {
		.pointer-cursor {
			cursor: pointer;

			&:hover {
				background-color: #f5f7fa;
			}
		}

		.el-table__expand-icon {
			color: #409eff;
		}
	}
}

// YAML Viewer Styles
.yaml-viewer {
	pre {
		margin: 0;
		padding: 20px;
		background-color: #0d1117;
		border-radius: 8px;
		overflow-x: auto;

		code {
			font-family: 'Fira Code', 'Courier New', Courier, monospace;
			font-size: 13px;
			line-height: 1.6;
		}
	}
}

// Responsive Design
@media (max-width: 768px) {
	.threat-detail-container {
		padding: 12px;

		.header-card .header-content {
			flex-direction: column;

			.header-right {
				width: 100%;

				.el-dropdown {
					width: 100%;

					.el-button {
						width: 100%;
					}
				}
			}
		}

		.explanation-card .attack-flow-visualization .flow-container .flow-items {
			flex-direction: column;

			.flow-arrow {
				transform: rotate(90deg);
			}
		}
	}
}
</style>
