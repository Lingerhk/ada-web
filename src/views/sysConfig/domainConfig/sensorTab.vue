<template>
	<div class="table-filter-row">
		<el-form label-width="auto" :inline="true" class="filter-form">
			<el-form-item>
				<template #label>{{ $t('message.advancedSearch.domain') }}</template>
				<el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.advancedSearch.selectDomain')" popper-class="custom-header">
					<template #header>
						<el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
							{{ $t('message.tableCommon.checkAll') }}
						</el-checkbox>
					</template>
					<el-option v-for="option in state.domainOptions" :key="option.value" :label="option.label" :value="option.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<template #label>{{ $t('message.advancedSearch.status') }}</template>
				<el-select v-model="state.req.status" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.advancedSearch.selectStatus')" popper-class="custom-header">
					<template #header>
						<el-checkbox v-model="statusCheckAll" :indeterminate="statusIndeterminate" @change="handleStatusCheckAll">
							{{ $t('message.tableCommon.checkAll') }}
						</el-checkbox>
					</template>
					<el-option v-for="option in StatusOptions" :key="option.value" :label="option.label" :value="option.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-input class="filter-search-input" v-model="state.req.keyword" size="default"
					:placeholder="$t('message.sysConfig.sensorConfig.searchPlaceholder')" :suffix-icon="Search"
					clearable />
			</el-form-item>
		</el-form>
	</div>
	<el-table :data="state.data" v-loading="state.loading" style="width: 100%">
		<el-table-column type="index" :label="$t('message.tableCommon.index')" width="60px" />
		<el-table-column prop="iP" :label="$t('message.sysConfig.sensorConfig.iP')"></el-table-column>
		<el-table-column prop="domain" :label="$t('message.advancedSearch.domain')"></el-table-column>
		<el-table-column prop="hostname" :label="$t('message.tableCommon.dcHostname')"></el-table-column>
		<el-table-column prop="status" :label="$t('message.advancedSearch.status')" min-width="60">
			<template #default="scope">
				<span :class="scope.row.status === 'Running' ? 'success-color' : 'failed-color'">{{
					$t(`message.sysConfig.sensorConfig.status_${scope.row.status}`) }}</span>
			</template>
		</el-table-column>
		<el-table-column prop="logStatus" :label="$t('message.sysConfig.sensorConfig.logSwitch')" min-width="60">
			<template #default="scope">
				<el-switch v-model="scope.row.logPluginSwitch" active-value="true" class="ml-2" size="small"
					style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
					:before-change="() => handleConfirm(scope.row.logPluginSwitch === 'true' ? $t('message.sysConfig.sensorConfig.disableLogStatus') : $t('message.sysConfig.sensorConfig.enableLogStatus'), scope.row, changeLogStatus)" />
			</template>
		</el-table-column>
		<el-table-column prop="pktStatus" :label="$t('message.sysConfig.sensorConfig.pktSwitch')" min-width="60">
			<template #default="scope">
				<el-switch v-model="scope.row.pktPluginSwitch" active-value="true" class="ml-2" size="small"
					style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
					:before-change="() => handleConfirm(scope.row.pktPluginSwitch === 'true' ? $t('message.sysConfig.sensorConfig.disablePktStatus') : $t('message.sysConfig.sensorConfig.enablePktStatus'), scope.row, changePktStatus)" />
			</template>
		</el-table-column>
		<el-table-column prop="version" :label="$t('message.tableCommon.version')"></el-table-column>
		<el-table-column prop="lastOnlineTm" :label="$t('message.time.lastOnlineTm')" min-width="120">
			<template #default="scope">
				{{ formatApiTime(scope.row.lastOnlineTm) }}
			</template>
		</el-table-column>
		<el-table-column :label="$t('message.tableCommon.operation')" width="124" fixed="right" align="center">
			<template #default="scope">
				<div class="operation-icon-group">
					<el-tooltip :content="$t('message.tableCommon.detail')" placement="top">
						<el-button class="operation-icon-button" size="small" type="primary" :icon="View" :aria-label="$t('message.tableCommon.detail')" @click="onDetail(scope.row)" />
					</el-tooltip>
					<el-tooltip :content="$t('message.tableCommon.edit')" placement="top">
						<el-button class="operation-icon-button" size="small" :icon="Edit" :aria-label="$t('message.tableCommon.edit')" @click="onEdit(scope.row)" />
					</el-tooltip>
					<el-tooltip :content="$t('message.tableCommon.delete')" placement="top">
						<el-button class="operation-icon-button" size="small" type="danger" :icon="Delete" :aria-label="$t('message.tableCommon.delete')" @click="onDelete(scope.row)" />
					</el-tooltip>
				</div>
			</template>
		</el-table-column>
	</el-table>
	<!-- Pagination -->
	<el-row style="margin-top: 10px" justify="space-between">
		<div></div>
		<el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
			:page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper' :total="state.total"
			@size-change="handleSizeChange" @current-change="handleCurrentChange" />
	</el-row>
	<DetailDrawer ref="detailDrawerRef" />
	<EditDrawer ref="editDrawerRef" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { CmdSensorReq, ListSensorReply_Details, ListSensorReq, UpdateSensorReq } from '/@/api/grpc/ada';
import { Delete, Edit, Search, View } from '@element-plus/icons-vue';
import { ElMessageBox, ElCheckbox, type CheckboxValueType } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { OptionType, getSensorStatusOptions } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { formatApiTime } from '/@/utils/formatTime';
import { h } from 'vue';

const DetailDrawer = defineAsyncComponent(() => import('../sensorConfig/detailDrawer.vue'));
const EditDrawer = defineAsyncComponent(() => import('../sensorConfig/editDrawer.vue'));

const detailDrawerRef = ref();
const editDrawerRef = ref();

const { t } = useI18n();

const StatusOptions = getSensorStatusOptions(t);

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const statusCheckAll = ref(false);
const statusIndeterminate = ref(false);

const state = reactive({
	req: {
		pageIdx: 1, // [(validator.field) = {int_gt: 0}];
		pageSize: 10,
		domain: [],
		status: [], // filter: Init|Running|Stopped
		keyword: '', // for search
		tmSort: -1, // Sort by last online time: `1` asc, `-1` desc
	} as ListSensorReq,
	data: [] as ListSensorReply_Details[],
	loading: false,
	exhausted: false,
	total: 0, // Add total for pagination
	domainOptions: [] as OptionType[],
});

// Handle domain Select All
const handleDomainCheckAll = (val: CheckboxValueType) => {
	domainIndeterminate.value = false;
	if (val) {
		state.req.domain = state.domainOptions.map(opt => opt.value);
	} else {
		state.req.domain = [];
	}
};

// Handle status Select All
const handleStatusCheckAll = (val: CheckboxValueType) => {
	statusIndeterminate.value = false;
	if (val) {
		state.req.status = StatusOptions.map(opt => opt.value);
	} else {
		state.req.status = [];
	}
};

// Watch individual filter properties
watch(() => state.req.domain, (val) => {
	domainIndeterminate.value = false;
	if (val.length === 0) {
		domainCheckAll.value = false;
	} else if (val.length === state.domainOptions.length) {
		domainCheckAll.value = true;
	} else {
		domainIndeterminate.value = true;
	}
	state.req.pageIdx = 1;
	refresh();
});

watch(() => state.req.status, (val) => {
	statusIndeterminate.value = false;
	if (val.length === 0) {
		statusCheckAll.value = false;
	} else if (val.length === StatusOptions.length) {
		statusCheckAll.value = true;
	} else {
		statusIndeterminate.value = true;
	}
	state.req.pageIdx = 1;
	refresh();
});

watch(() => state.req.keyword, () => {
	state.req.pageIdx = 1;
	refresh();
});

watch(() => state.req.pageIdx, () => {
	refresh();
});

watch(() => state.req.pageSize, () => {
	refresh();
});

// Refresh the list
const refresh = () => {
	state.loading = true;
	api.listSensor(state.req)
	.then(resp => resp.response)
	.then(data => {
		state.data = data.list;
		state.exhausted = data.exhausted;
		state.total = data.page?.total ?? data.list.length; // Update total from API response
	})
	.catch(err => alertApiError(err))
	.finally(() => state.loading = false);
};

const getUpdateSensorReq = (row: ListSensorReply_Details): UpdateSensorReq => {
	return {
		iD: row.iD,
		bindNetIface: row.bindNetIface,
		perfLimit: row.perfLimit,
		remark: row.remark,
		pktPluginSwitch: row.pktPluginSwitch,
		logPluginSwitch: row.logPluginSwitch,
		rpcFwPluginSwitch: row.rpcFwPluginSwitch,
		ldapFwPluginSwitch: row.ldapFwPluginSwitch,
	};
}

const changePktStatus = (row: ListSensorReply_Details) => {
	let req = getUpdateSensorReq(row);
	req.pktPluginSwitch = row.pktPluginSwitch === 'true' ? 'false' : 'true';

	api.updateSensor(req)
	.then(resp => resp.response)
	.then(data => {
		alertResult(data.result, t('message.sysConfig.sensorConfig.switchPktStatusSucc'), t('message.sysConfig.sensorConfig.switchPktStatusFail'));
	})
	.catch(err => alertApiError(err))
	.finally(() => refresh());
}

const changeLogStatus = (row: ListSensorReply_Details) => {
	let req = getUpdateSensorReq(row);
	req.logPluginSwitch = row.logPluginSwitch === 'true' ? 'false' : 'true';

	api.updateSensor(req)
	.then(resp => resp.response)
	.then(data => {
		alertResult(data.result, t('message.sysConfig.sensorConfig.switchLogStatusSucc'), t('message.sysConfig.sensorConfig.switchLogStatusFail'));
	})
	.catch(err => alertApiError(err))
	.finally(() => refresh());

	refresh();
};

const handleConfirm = (title: string, row: ListSensorReply_Details, done: (row: ListSensorReply_Details) => void) => {
	return ElMessageBox.confirm(title)
		.then(() => {
			return done(row)
		})
		.catch(() => {
			return false;
		});
}

// Action buttons
const onDetail = (row: ListSensorReply_Details) => {
	detailDrawerRef.value.open(t('message.sysConfig.sensorConfig.detailTitle'), row, refresh);
}

const onEdit = (row: ListSensorReply_Details) => {
	editDrawerRef.value.open(t('message.sysConfig.sensorConfig.editTitle'), row, refresh);
}

const onDelete = (row: ListSensorReply_Details) => {
	let uninstallOnServer = false; // Regular variable instead of ref

	ElMessageBox({
		title: t('message.dialog.prompt'),
		message: h('div', null, [
			h('p', null, t('message.dialog.singleSensitive')),
			h(ElCheckbox, {
				checked: uninstallOnServer, // Use checked prop
				onChange: (val: CheckboxValueType) => {
					uninstallOnServer = !!val;
				},
				label: t('message.sysConfig.sensorConfig.deleteSensorOnADServer'),
			}),
		]),
		showCancelButton: true,
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
	}).then(() => {
		const req: CmdSensorReq = {
			iD: row.iD,
			cmd: uninstallOnServer ? 'uninstall' : 'delete',
		};

		api.cmdSensor(req)
			.then(resp => resp.response)
			.then(data => alertResult(data.result, t('message.sysConfig.sensorConfig.deleteSucc'), t('message.sysConfig.sensorConfig.deleteFail')))
			.catch(err => alertApiError(err))
			.finally(() => refresh());
	}).catch(() => {});
}

// Pagination handlers
const handleSizeChange = (val: number) => {
	state.req.pageSize = val;
	refresh();
};

const handleCurrentChange = (val: number) => {
	state.req.pageIdx = val;
	refresh();
};

onMounted(() => {
	refresh();
	listDomainOptions().then(options => state.domainOptions = options);
})

</script>
