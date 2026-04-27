<template>
    <el-drawer class="leak-detail-drawer" :size="1276" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <div class="drawer-header">
                <div class="drawer-title-block">
                    <span class="drawer-kicker">{{ $t('message.risk.leak.detailTitle') }}</span>
                    <h3>{{ state.data?.name || '-' }}</h3>
                </div>
            </div>
        </template>
        <template #default>
            <div class="leak-detail">
                <section :class="['risk-hero', state.data?.result === 0 ? 'risk-hero--safe' : 'risk-hero--danger']" v-if="state.data">
                    <div class="risk-verdict">
                        <div class="verdict-icon">
                            <el-icon>
                                <CircleCheckFilled v-if="state.data.result === 0" />
                                <WarningFilled v-else />
                            </el-icon>
                        </div>
                        <div class="verdict-copy">
                            <span>{{ $t('message.risk.result') }}</span>
                            <strong>{{ $t(`message.risk.baseline.result_${state.data.result}`) }}</strong>
                        </div>
                    </div>
                    <div :class="['level-panel', `level-panel--${getLevelClass(state.data.level)}`]">
                        <span>{{ $t('message.tableCommon.level.name') }}</span>
                        <strong>{{ $t(`message.tableCommon.level.${state.data.level}`) }}</strong>
                    </div>
                </section>

                <div class="summary-grid" v-if="state.data">
                    <div class="summary-item">
                        <el-icon><Connection /></el-icon>
                        <div>
                            <span class="summary-label">{{ $t('message.tableCommon.domain') }}</span>
                            <strong>{{ state.data.domain || '-' }}</strong>
                        </div>
                    </div>
                    <div class="summary-item">
                        <el-icon><DataAnalysis /></el-icon>
                        <div>
                            <span class="summary-label">{{ $t('message.tableCommon.dcHostname') }}</span>
                            <strong>{{ state.data.dcHostname || '-' }}</strong>
                        </div>
                    </div>
                    <div class="summary-item">
                        <el-icon><CollectionTag /></el-icon>
                        <div>
                            <span class="summary-label">{{ $t('message.risk.ruleConfig.leakDetailTitle_type') }}</span>
                            <strong>{{ $t(`message.risk.ruleConfig.leakDetailValue_${state.data.subType}`) }}</strong>
                        </div>
                    </div>
                    <div class="summary-item">
                        <el-icon><TrendCharts /></el-icon>
                        <div>
                            <span class="summary-label">{{ $t('message.risk.updateTm') }}</span>
                            <strong>{{ formatApiTime(state.data.updateTm) }}</strong>
                        </div>
                    </div>
                </div>

                <section class="detail-section detail-section--object" v-if="state.data">
                    <div class="section-heading">
                        <el-icon><Document /></el-icon>
                        <h4>{{ $t('message.risk.ruleConfig.leakDetailTitle_name') }}</h4>
                    </div>
                    <div class="object-title">{{ state.data.name || '-' }}</div>
                </section>

                <div class="section-grid" v-if="state.data">
                    <section class="detail-section detail-section--action">
                        <div class="section-heading">
                            <el-icon><Memo /></el-icon>
                            <h4>{{ $t('message.risk.suggestion') }}</h4>
                        </div>
                        <div class="markdown-content" v-html="md2html(state.data.suggestion ?? '')" />
                    </section>
                    <section class="detail-section detail-section--reference">
                        <div class="section-heading">
                            <el-icon><Link /></el-icon>
                            <h4>{{ $t('message.risk.reference') }}</h4>
                        </div>
                        <div class="markdown-content" v-html="md2html(state.data.reference ?? '')" />
                    </section>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="drawer-footer">
                <el-button @click="() => state.open = false">{{ $t('message.tableCommon.close') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import { ListLeakReply_Details } from '/@/api/grpc/ada';
import { md2html } from '/@/utils/markdown';
import { formatApiTime } from '/@/utils/formatTime';
import {
    CircleCheckFilled,
    CollectionTag,
    Connection,
    DataAnalysis,
    Document,
    Link,
    Memo,
    TrendCharts,
    WarningFilled,
} from '@element-plus/icons-vue';

const state = reactive({
    open: false,
    data: null as ListLeakReply_Details | null,
});

const getLevelClass = (level: number) => {
    if (level >= 5) return 'critical';
    if (level >= 4) return 'high';
    if (level >= 3) return 'medium';
    return 'low';
};

const open = (data: ListLeakReply_Details) => {
    state.open = true;
    state.data = data;
}

defineExpose({
    open,
});
</script>

<style scoped>
.drawer-header {
    display: flex;
    align-items: center;
    width: 100%;
}

.drawer-title-block {
    min-width: 0;
}

.drawer-title-block h3 {
    margin: 4px 0 0;
    color: var(--ada-ink, #17202a);
    font-size: 20px;
    font-weight: 800;
    line-height: 1.35;
}

.drawer-kicker {
    color: var(--ada-primary, #168f7a);
    font-size: 12px;
    font-weight: 800;
}

.leak-detail {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 260px;
}

.risk-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 16px;
    min-height: 126px;
    padding: 18px;
    border: 1px solid rgba(223, 232, 230, 0.92);
    border-radius: 8px;
    background:
        linear-gradient(135deg, rgba(22, 143, 122, 0.12), rgba(245, 184, 75, 0.08)),
        #ffffff;
}

.risk-hero--danger {
    background:
        linear-gradient(135deg, rgba(217, 86, 86, 0.12), rgba(245, 184, 75, 0.1)),
        #ffffff;
}

.risk-hero--safe {
    background:
        linear-gradient(135deg, rgba(67, 166, 107, 0.14), rgba(22, 143, 122, 0.08)),
        #ffffff;
}

.risk-verdict {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}

.verdict-icon {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 8px 22px rgba(31, 54, 61, 0.08);
}

.risk-hero--danger .verdict-icon {
    color: var(--ada-danger, #d95656);
}

.risk-hero--safe .verdict-icon {
    color: var(--ada-success, #43a66b);
}

.verdict-icon .el-icon {
    font-size: 34px;
}

.verdict-copy {
    min-width: 0;
}

.verdict-copy span,
.level-panel span {
    display: block;
    color: var(--ada-muted, #6b7788);
    font-size: 13px;
    font-weight: 800;
}

.verdict-copy strong {
    display: block;
    margin-top: 8px;
    color: var(--ada-ink, #17202a);
    font-size: 30px;
    font-weight: 900;
    line-height: 1.15;
}

.level-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 18px;
    border-radius: 8px;
    color: #ffffff;
    background: linear-gradient(135deg, #6b7788, #526272);
}

.level-panel span {
    color: rgba(255, 255, 255, 0.82);
}

.level-panel strong {
    display: block;
    margin-top: 10px;
    overflow: hidden;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.1;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.level-panel--critical {
    background: linear-gradient(135deg, #d95656, #9f3030);
}

.level-panel--high {
    background: linear-gradient(135deg, #d49a2a, #9f6819);
}

.level-panel--medium {
    background: linear-gradient(135deg, #3b82c4, #245f94);
}

.level-panel--low {
    background: linear-gradient(135deg, #43a66b, #23744a);
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 14px 16px;
    border: 1px solid var(--ada-border, #dfe8e6);
    border-radius: 8px;
    background: #fbfdfc;
}

.summary-item > .el-icon {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    color: var(--ada-primary, #168f7a);
    background: rgba(22, 143, 122, 0.1);
    font-size: 18px;
}

.summary-item > div {
    min-width: 0;
}

.summary-label {
    display: block;
    margin-bottom: 6px;
    color: var(--ada-muted, #6b7788);
    font-size: 12px;
    font-weight: 700;
}

.summary-item strong {
    display: block;
    overflow: hidden;
    color: var(--ada-text, #243142);
    font-size: 15px;
    font-weight: 800;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.section-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
}

.detail-section {
    min-width: 0;
    padding: 16px;
    border: 1px solid var(--ada-border, #dfe8e6);
    border-radius: 8px;
    background: #ffffff;
}

.detail-section--object {
    background: #fbfdfc;
}

.detail-section--action {
    border-color: rgba(22, 143, 122, 0.2);
    background: linear-gradient(180deg, rgba(22, 143, 122, 0.05), #ffffff 118px);
}

.detail-section--reference {
    background: #fbfdfc;
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin-bottom: 12px;
}

.section-heading .el-icon {
    flex: none;
    color: var(--ada-primary, #168f7a);
    font-size: 18px;
}

.section-heading h4 {
    min-width: 0;
    margin: 0;
    color: var(--ada-ink, #17202a);
    font-size: 15px;
    font-weight: 800;
    line-height: 1.35;
}

.object-title {
    color: var(--ada-text, #243142);
    font-size: 15px;
    font-weight: 800;
    line-height: 1.6;
}

.markdown-content {
    min-height: 38px;
    color: var(--ada-text, #243142);
    font-size: 14px;
    line-height: 1.75;
    overflow-wrap: anywhere;
}

.markdown-content :deep(p) {
    margin: 0 0 10px;
}

.markdown-content :deep(p:last-child),
.markdown-content :deep(ul:last-child),
.markdown-content :deep(ol:last-child) {
    margin-bottom: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
    margin: 0 0 10px;
    padding-left: 20px;
}

.markdown-content :deep(code) {
    padding: 2px 5px;
    border-radius: 4px;
    color: #0d5f57;
    background-color: rgba(22, 143, 122, 0.08);
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 960px) {
    .risk-hero,
    .summary-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .drawer-header {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
