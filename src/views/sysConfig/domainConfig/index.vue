<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab">
                <!-- AD domain configuration tab -->
                <el-tab-pane :label="$t('message.router.adDomainConfigIndex')" name="adDomain">
                    <AdDomainConfig />
                </el-tab-pane>

                <!-- Sensor configuration tab -->
                <el-tab-pane :label="$t('message.router.sensorConfigIndex')" name="sensor">
                    <SensorConfig />
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

const AdDomainConfig = defineAsyncComponent(() => import('./adDomainTab.vue'));
const SensorConfig = defineAsyncComponent(() => import('./sensorTab.vue'));

const activeTab = ref('adDomain');
</script>

<style scoped lang="scss">
</style>
