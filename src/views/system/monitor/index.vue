<template>
    <div class="layout-pd">
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
import { defineAsyncComponent } from 'vue';

const ThroughputChart = defineAsyncComponent(() => import('./networkThroughput.vue'));
const CpuChart = defineAsyncComponent(() => import('./cpuUsage.vue'));
const MemChart = defineAsyncComponent(() => import('./memUsage.vue'));
const SysParams = defineAsyncComponent(() => import('./sysParams.vue'));
const SysStatsCfg = defineAsyncComponent(() => import('./sysStatsCfg.vue'));
</script>
