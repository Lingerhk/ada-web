<template>
    <el-drawer size="800" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ $t('message.risk.ruleConfig.editScanConfig') }}</h3>
        </template>
        <template #default>
            <div style="padding: 20px;">
                <!-- Config Info Display -->
                <el-descriptions :column="2" border style="margin-bottom: 20px;">
                    <el-descriptions-item :label="$t('message.risk.ruleConfig.confName')">
                        {{ state.configData?.name }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('message.risk.ruleConfig.confType')">
                        {{ state.configData?.type ? $t(`message.risk.ruleConfig.${state.configData.type}`) : '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <span>{{ $t('message.risk.ruleConfig.confCycleType') }}</span>
                            <el-tooltip
                                :content="$t('message.risk.ruleConfig.cycleTypeTooltip')"
                                placement="top"
                                :show-after="200"
                            >
                                <el-icon style="margin-left: 4px; cursor: help; vertical-align: middle;">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </template>
                        <el-radio-group v-model="state.cycleType" size="default">
                            <el-radio
                                v-for="option in cycleTypeOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </el-radio>
                        </el-radio-group>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- Domain-Template Mapping Table -->
                <h4 style="margin-bottom: 15px;">{{ $t('message.risk.ruleConfig.domainTmplMapping') }}</h4>

                <el-table :data="state.mappings" :border="true" style="width: 100%;" :row-class-name="getRowClassName">
                    <el-table-column prop="domain" :label="$t('message.risk.ruleConfig.domain')" width="250">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.domain"
                                size="default"
                                style="width: 100%"
                                :placeholder="$t('message.risk.ruleConfig.selectDomain')"
                                filterable
                                @change="handleDomainChange(scope.$index)"
                            >
                                <el-option
                                    v-for="domain in availableDomains()"
                                    :key="domain.value"
                                    :label="domain.label"
                                    :value="domain.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="templateId" :label="$t('message.risk.ruleConfig.scanTemplate')">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.templateId"
                                size="default"
                                style="width: 100%"
                                :placeholder="$t('message.risk.ruleConfig.selectTemplate')"
                                filterable
                                :class="{ 'is-error': isDuplicateMapping(scope.$index) }"
                            >
                                <el-option
                                    v-for="tmpl in availableTemplates(scope.$index)"
                                    :key="tmpl.iD"
                                    :label="tmpl.name"
                                    :value="tmpl.iD"
                                />
                            </el-select>
                            <div v-if="isDuplicateMapping(scope.$index)" class="error-text">
                                {{ $t('message.risk.ruleConfig.duplicateMapping') }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.tableCommon.operation')" width="64" align="center">
                        <template #default="scope">
                            <div class="operation-icon-group">
                                <el-tooltip :content="$t('message.tableCommon.delete')" placement="top">
                                    <el-button class="operation-icon-button" size="small" type="danger" :icon="Delete" :aria-label="$t('message.tableCommon.delete')" @click="handleRemoveMapping(scope.$index)" />
                                </el-tooltip>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <el-button style="margin-top: 15px;" size="default" type="primary" @click="handleAddMapping" :disabled="!canAddMapping">
                    <el-icon><Plus /></el-icon>
                    {{ $t('message.risk.ruleConfig.addDomainMapping') }}
                </el-button>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button @click="state.open = false">{{ $t('message.drawer.close') }}</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="state.loading">
                    {{ $t('message.tableCommon.save') }}
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Delete, Plus, QuestionFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import {
    scanConfDetail,
    ListDomainReq,
    ListDomainReply_Details,
    ListScanTmplReq,
    ListScanTmplReply_Details,
    UpdateScanConfReq,
    SetScanConfReq,
} from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { listScanTmpl } from '/@/api/grpc/method';

const { t } = useI18n();

interface DomainTemplateMapping {
    domain: string;
    templateId: string;
}

const state = reactive({
    open: false,
    loading: false,
    configData: null as scanConfDetail | null,
    domainOptions: [] as ListDomainReply_Details[],
    templateOptions: [] as ListScanTmplReply_Details[],
    mappings: [] as DomainTemplateMapping[],
    cycleType: 1 as number,
    onClose: () => {},
});

// Cycle type options
const cycleTypeOptions = computed(() => [
    { value: 1, label: t('message.risk.ruleConfig.cycleTypeDay') },
    { value: 2, label: t('message.risk.ruleConfig.cycleTypeWeek') },
    { value: 3, label: t('message.risk.ruleConfig.cycleTypeMonth') },
]);

// Get all domains as options (allow same domain multiple times)
const availableDomains = () => {
    return state.domainOptions.map(d => ({ label: d.name, value: d.name }));
};

// Get available templates for a specific row (exclude already used templates for the same domain)
const availableTemplates = (currentIndex: number) => {
    const currentDomain = state.mappings[currentIndex]?.domain;
    if (!currentDomain) {
        return state.templateOptions;
    }

    // Get all template IDs already used for this domain (excluding current row)
    const usedTemplateIds = state.mappings
        .filter((m, index) => index !== currentIndex && m.domain === currentDomain)
        .map(m => m.templateId);

    return state.templateOptions.filter(t => !usedTemplateIds.includes(t.iD));
};

// Check if we can add more mappings (always allow if there are domains and templates)
const canAddMapping = computed(() => {
    return state.domainOptions.length > 0 && state.templateOptions.length > 0;
});

// Check if a mapping is duplicate (same domain + template combination)
const isDuplicateMapping = (index: number): boolean => {
    const current = state.mappings[index];
    if (!current.domain || !current.templateId) return false;

    return state.mappings.some((m, i) => 
        i !== index && m.domain === current.domain && m.templateId === current.templateId
    );
};

// Load domains list
const loadDomains = async () => {
    const req: ListDomainReq = {
        pageIdx: 1,
        pageSize: 1000, // Get all domains (use large page size)
        filterDomain: '',
        filterStatus: '',
        filterKeyword: '',
    };

    try {
        const resp = await api.listDomain(req).then(r => r.response);
        state.domainOptions = resp.list;
    } catch (err) {
        alertApiError(err);
    }
};

// Load templates list (filtered by config type)
const loadTemplates = async (type: string) => {
    const req: ListScanTmplReq = {
        pageIdx: 1,
        pageSize: 100,
        type: type, // Filter by the config's type
    };

    try {
        const resp = await listScanTmpl(req);
        state.templateOptions = resp.list;
    } catch (err) {
        alertApiError(err);
    }
};

// Add new mapping row
const handleAddMapping = () => {
    state.mappings.push({
        domain: '',
        templateId: '',
    });
};

// Remove mapping row
const handleRemoveMapping = (index: number) => {
    state.mappings.splice(index, 1);
};

// Handle domain change - clear template if domain changes to avoid invalid selection
const handleDomainChange = (index: number) => {
    // Optionally clear the template when domain changes
    // state.mappings[index].templateId = '';
};

// Get row class name for highlighting duplicate rows
const getRowClassName = ({ row, rowIndex }: { row: DomainTemplateMapping, rowIndex: number }): string => {
    return isDuplicateMapping(rowIndex) ? 'duplicate-row' : '';
};

// Check if there are any duplicate mappings
const hasDuplicateMappings = computed(() => {
    return state.mappings.some((_, index) => isDuplicateMapping(index));
});

// Submit the configuration update
const handleSubmit = async () => {
    if (!state.configData) return;

    // Check for duplicate mappings
    if (hasDuplicateMappings.value) {
        ElMessage.error(t('message.risk.ruleConfig.duplicateMappingError'));
        return;
    }

    // Validate mappings - filter out incomplete rows
    const validMappings = state.mappings.filter(m => m.domain && m.templateId);

    // Build plans map - group by domain, collect all template IDs
    // Note: The backend API uses map<string, string>, so we join multiple templates with comma
    const domainTemplateMap: Record<string, string[]> = {};
    validMappings.forEach(m => {
        if (!domainTemplateMap[m.domain]) {
            domainTemplateMap[m.domain] = [];
        }
        domainTemplateMap[m.domain].push(m.templateId);
    });

    // Build plans - join multiple templates with comma for same domain
    const plans: Record<string, string> = {};
    Object.entries(domainTemplateMap).forEach(([domain, templateIds]) => {
        plans[domain] = templateIds.join(',');
    });

    state.loading = true;
    try {
        // Update cycle type via SetScanConf
        const setConfReq: SetScanConfReq = {
            iD: state.configData.iD,
            isEnable: state.configData.isEnable,
            cycleType: state.cycleType,
        };
        const setConfResp = await api.setScanConf(setConfReq).then(r => r.response);
        if (setConfResp.result !== 'SUCCESS') {
            alertResult(setConfResp.result, '', t('message.risk.ruleConfig.confUpdateFail'));
            return;
        }

        // Update plans via UpdateScanConf
        const updateConfReq: UpdateScanConfReq = {
            iD: state.configData.iD,
            plans: plans,
        };
        const updateConfResp = await api.updateScanConf(updateConfReq).then(r => r.response);
        const ok = alertResult(updateConfResp.result, t('message.risk.ruleConfig.confUpdateSucc'), t('message.risk.ruleConfig.confUpdateFail'));
        if (ok) {
            state.open = false;
            if (state.onClose) {
                state.onClose();
            }
        }
    } catch (err) {
        alertApiError(err);
    } finally {
        state.loading = false;
    }
};

// Open the drawer
const open = async (configData: scanConfDetail, onClose: () => void) => {
    state.open = true;
    state.configData = configData;
    state.onClose = onClose;
    state.cycleType = configData.cycleType || 1;

    // Initialize mappings from existing plans
    // Handle comma-separated template IDs (one domain can have multiple templates)
    const mappings: DomainTemplateMapping[] = [];
    Object.entries(configData.plans || {}).forEach(([domain, templateIdStr]) => {
        // Split by comma in case of multiple templates
        const templateIds = templateIdStr.split(',').filter(id => id.trim());
        templateIds.forEach(templateId => {
            mappings.push({
                domain,
                templateId: templateId.trim(),
            });
        });
    });
    state.mappings = mappings;

    // Load domains and templates
    await Promise.all([
        loadDomains(),
        loadTemplates(configData.type),
    ]);
};

defineExpose({
    open,
});
</script>

<style scoped>
.el-descriptions {
    margin-bottom: 20px;
}

.error-text {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 4px;
}

:deep(.duplicate-row) {
    background-color: #fef0f0 !important;
}

:deep(.is-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px #f56c6c inset;
}
</style>
