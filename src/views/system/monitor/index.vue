<template>
    <div class="layout-pd" v-if="false">
        <el-row :gutter="24">
            <el-col v-for="item in state.stat" :key="item" :span="6" class="stat-container">
                <el-card body-class="state-content">
                    <el-icon size="36px"><span v-html="item.icon"></span></el-icon>
                    <el-statistic :title="item.title" :value="item.value" />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="12">
                <el-card style="min-width: 600px;">
                    <OnlineUserChart />
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card style="min-width: 600px;">
                    <ThroughputChart />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="12">
                <el-card style="min-width: 600px;">
                    <CpuChart />
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card style="min-width: 600px;">
                    <MemChart />
                </el-card>
            </el-col>
        </el-row>
    </div>
    <div class="layout-pd" v-else>
        <el-row :gutter="24">
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="24">
                <el-card style="min-width: 1000px;">
                    <SysParams />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="24">
                <el-card style="min-width: 1000px;">
                    <SysStatsCfg />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="24">
                <el-card style="min-width: 600px;">
                    <ThroughputChart />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="24">
                <el-card style="min-width: 600px;">
                    <CpuChart />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" :gutter="12">
            <el-col :span="24">
                <el-card style="min-width: 600px;">
                    <MemChart />
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { reactive, defineAsyncComponent, onMounted } from 'vue';
import api from '/@/api/grpc';
import { GetSystemStatsReq } from '/@/api/grpc/ada';

const OnlineUserChart = defineAsyncComponent(() => import('./onlineUserChart.vue'));
const ThroughputChart = defineAsyncComponent(() => import('./networkThroughput.vue'));
const CpuChart = defineAsyncComponent(() => import('./cpuUsage.vue'));
const MemChart = defineAsyncComponent(() => import('./memUsage.vue'));
const SysParams = defineAsyncComponent(() => import('./sysParams.vue'));
const SysStatsCfg = defineAsyncComponent(() => import('./sysStatsCfg.vue'));

const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0"></path></svg>'; 
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M128 192v640h768V320H485.76L357.504 192zm-32-64h287.872l128.384 128H928a32 32 0 0 1 32 32v576a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32"></path></svg>';
const docIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path></svg>';

const state = reactive({
    stat: [
        { title: '在线数', value: 1, icon: userIcon },
        { title: '用户数', value: 6, icon: userIcon },
        { title: '用户组数', value: 4, icon: folderIcon },
        { title: 'IP映射数', value: 1, icon: docIcon },
    ]
});

</script>

<style>
.state-content {
    padding-left: 40px;
    padding-right: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
</style>