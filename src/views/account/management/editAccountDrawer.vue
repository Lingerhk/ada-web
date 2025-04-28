<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step title="基本信息" />
                    <el-step title="权限分配" />
                    <el-step title="完成" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <el-form v-if="state.active === 0" class="drawer-form" label-position="left" label-width="120px">
                    <h3>设置基本信息</h3>
                    <p style="margin-top: 10px;">请编辑您所需要修改的子账户的相关信息。</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>用户名:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.username" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>手机号:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.mobile" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>邮箱:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.email" size="middle"></el-input>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>备注:</h4>
                        </template>
                        <template #default>
                            <el-input v-model="state.data.remark" size="middle" type="textarea"></el-input>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active === 1" class="drawer-form" label-position="left" label-width="120px">
                    <h3>请为用户分配权限</h3>
                    <p style="margin-top: 10px;">请编辑您所需要修改的子账户的相关权限。</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>用户角色:</h4>
                        </template>
                        <template #default>
                            <el-select v-model="state.data.role" style="width: 240px">
                                <el-option v-for="item in role" :key="item.value" :value="item.value" :label="item.label"></el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                </el-form>
                <el-form v-else-if="state.active >= 2" class="drawer-form" label-position="left" label-width="120px">
                    <h3>确认信息并完成编辑</h3>
                    <p style="margin-top: 10px;">请确认您所编辑的子账号的相关信息。</p>
                    <el-form-item style="margin-top: 10px;">
                        <template #label>
                            <h4>用户名:</h4>
                        </template>
                        <template #default>
                            {{ state.data.username }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>用户角色:</h4>
                        </template>
                        <template #default>
                            {{ state.data.role }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>手机号:</h4>
                        </template>
                        <template #default>
                            {{ state.data.confirmPass }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>邮箱:</h4>
                        </template>
                        <template #default>
                            {{ state.data.confirmPass }}
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>备注:</h4>
                        </template>
                        <template #default>
                            {{ state.data.remark }}
                        </template>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">关闭</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">上一步</el-button>
                <el-button @click="nextStep" type="primary"> {{ state.active < 2 ? "下一步" : "确定" }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { ListUserReply_Details } from '/@/api/grpc/ada';

const initData = {
    // step 1
    username: '',
    mobile: '',
    email: '',
    remark: '',
    // step 2
    role: '',
};

const role = [
    { label: '超级管理员', value: 'mgr' },
    { label: '开发人员', value: 'dev' },
    { label: '运维人员', value: 'ops' },
    { label: '安全人员', value: 'sec' },
];

const state = reactive({
    open: false,
    title: '编辑子账户',
    data: initData,
    active: 0,
})

const open = (row: ListUserReply_Details) => {
    state.open = true;
    state.active = 0;
    state.data = {
        // step 1
        username: row.username,
        mobile: row.mobile,
        email: row.email,
        remark: row.remark,
        // step 2
        role: row.role,
    };
    console.log(row);
}

const nextStep = () => {
    state.active++;
    if (state.active == 3) {
        // TODO: grpc api

        setTimeout(() => {
            state.open = false;
        }, 500);
    }
};

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
}

defineExpose({
    open,
});
</script>

<style>
.el-step__icon-inner {
    font-size: 18px !important;
}

.drawer-form {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 40px;
}

.slider-block {
    width: 600px;
    align-items: center;
}

.slider-block .el-slider {
  margin-top: 0;
}

</style>