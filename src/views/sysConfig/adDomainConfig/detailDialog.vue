<template>
	<div class="system-menu-dialog-container">
		<el-dialog title="所在域详情" v-model="state.show" width="1000px">
			
			<el-row>
				<el-form :model="state.detail">
					<el-form-item label-width="100px">
						<template #label><h3>所在域：</h3></template>
						{{ state.detail.name }}
					</el-form-item>
					<el-form-item label-width="100px">
						<template #label><h3>添加时间：</h3></template>
						{{ state.detail.createTm }}
					</el-form-item>
					<el-form-item label-width="100px">
						<template #label><h3>DNS：</h3></template>
						{{ state.detail.dns }}
					</el-form-item>
				</el-form>
			</el-row>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import api from '/@/api/grpc/index';
import * as proto from '/@/api/grpc/ada';
import { ElMessage } from 'element-plus';

// 打开弹窗
const getSensorList = (domain: string) => {
	const req: proto.ListSensorReq = {
		pageIdx: 1,
		pageSize: 10,
		domain: [domain],
		status: [],
		keyword: '',
		tmSort: -1,
	}
	api.listSensor(req).then(response => response.response)
	.then(data => {
		console.log(data);
	})
	.catch(err => {
		const message = decodeURIComponent(err.message);
		console.log(err.code, message);
		ElMessage.error(message);
	}) 
};

const open = (detail: any) => {
    state.show = true;
	state.detail = {
		name: detail.name,
		createTm: detail.createTm,
		dns: detail.domainInfo.dns,
	};
	console.log(detail.domainInfo);
	getSensorList(detail.name);
};

const state = reactive({
    show: false,
    detail: {
		name: '',
		createTm: '',
		dns: '',
	},
});

// 页面加载时
onMounted(() => {
});

// 暴露变量
defineExpose({
	open,
});
</script>