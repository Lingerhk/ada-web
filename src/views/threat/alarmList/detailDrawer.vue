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
									{{ $t('message.time.from') }}{{ formatApiTime(state.data?.startTm) }}
									{{ $t('message.time.to') }}{{ formatApiTime(state.data?.endTm) }}
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
					<div class="field-tags" v-if="state.data?.attackFlow?.fields?.length">
						<el-space wrap :size="8">
							<el-tooltip v-for="field in state.data?.attackFlow?.fields" :key="field.key" :content="field.key" placement="top">
								<el-tag type="info" size="default">{{ field.value }}</el-tag>
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
								<div v-for="(field, index) in state.data?.attackFlow?.fields" :key="field.key" class="flow-item-wrapper">
									<div class="flow-item">
										<el-tooltip :content="field.key" placement="top">
											<div class="flow-icon-wrapper">
												<el-image class="flow-icon" :src="getImage(field.obj)" fit="contain" />
											</div>
										</el-tooltip>
										<el-tooltip :content="field.key" placement="bottom">
											<div class="flow-label">{{ field.value }}</div>
										</el-tooltip>
									</div>
									<!-- Arrow/Relation -->
									<div v-if="index < state.data?.attackFlow?.relates?.length" class="flow-arrow">
										<div class="arrow-line"></div>
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
								<el-icon style="margin-right: 4px;"><Clock /></el-icon>
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
						<el-table-column :label="$t('message.tableCommon.operate')" width="120" align="center" fixed="right">
							<template #default="scope">
								<el-button size="small" type="primary" link @click.stop="handleViewRule(scope.row)">
									<el-icon style="margin-right: 4px;"><View /></el-icon>
									{{ $t('message.tableCommon.view') }}
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
						<!-- False Positive Verification -->
						<el-collapse-item name="verify">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><Search /></el-icon>
									<span>{{ T('verifyDesc') }}</span>
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!state.data?.references" description="No reference available" :image-size="60" />
								<p v-else class="content-text">{{ state.data?.references }}</p>
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
						<!-- Remarks -->
						<el-collapse-item name="remark">
							<template #title>
								<div class="collapse-title">
									<el-icon class="collapse-icon"><EditPen /></el-icon>
									<span>{{ T('remark') }}</span>
								</div>
							</template>
							<div class="collapse-content">
								<el-empty v-if="!state.data?.remark" description="No remarks available" :image-size="60" />
								<p v-else class="content-text">{{ state.data?.remark }}</p>
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
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { ActivityDetails, AttackFlowReply_Field, GetThreatReply, GetThreatReq, ListActivityReply, ListActivityReq, GetActivityRuleReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
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
	Search,
	EditPen
} from '@element-plus/icons-vue';
import { closeThreats } from './operation';
import { useI18n } from 'vue-i18n';
import { JsonViewer } from 'vue3-json-viewer';
import { transAlarmList as T } from '/@/utils/translator';
import AddWhiteDialog from './AddWhiteDialog.vue';
import DcImage from '/@/assets/dc.jpg';
import IpImage from '/@/assets/ip.jpg';
import UserImage from '/@/assets/user.jpg';
import ComputerImage from '/@/assets/computer.jpg';
import yaml from 'js-yaml';
import hljs from 'highlight.js/lib/core';
import yamlLang from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css';

// Register YAML language
hljs.registerLanguage('yaml', yamlLang);

const { t } = useI18n();

const evidenceTable = ref();

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
	console.log(`Showing activities ${start + 1} to ${Math.min(end, state.activity.total)} of ${state.activity.total}`);
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
			console.log('threatDetail:', data);
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
	// 使用正则表达式匹配并处理文本
	if (!state.data || !state.data.attackFlow?.desc) {
		return '';
	}

	const parts = state.data.attackFlow.desc.split(/(\[[^\]]+\])/);
	return parts
		.map((part) => {
			if (part.startsWith('[') && part.endsWith(']')) {
				return `<span style="color: green;">${part}</span>`;
			}
			return part;
		})
		.join('');
});

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
	} catch (err) {
		alertApiError(err);
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
						transition: all 0.3s ease;

						&:hover {
							transform: translateY(-4px);
							box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
						}

						.flow-icon-wrapper {
							width: 80px;
							height: 80px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: #f5f7fa;
							border-radius: 50%;
							padding: 12px;

							.flow-icon {
								width: 100%;
								height: 100%;
								border-radius: 8px;
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
							width: 40px;
							height: 2px;
							background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
						}

						.arrow-label {
							font-size: 12px;
							color: #909399;
							white-space: nowrap;
							padding: 4px 8px;
							background: #f0f9ff;
							border-radius: 4px;
							font-weight: 500;
						}

						.arrow-head {
							width: 0;
							height: 0;
							border-left: 8px solid #67c23a;
							border-top: 5px solid transparent;
							border-bottom: 5px solid transparent;
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
