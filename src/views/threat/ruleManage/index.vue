<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab">
                <!-- Alert Rules (Flow Rules) Tab -->
                <el-tab-pane :label="$t('message.ruleManage.alertRuleTab')" name="alertRule" key="alertRule">
                    <!-- Filter Row with Add Button -->
                    <el-row style="margin-bottom: 1px;">
                        <el-form :inline="true" class="filter-form">
                            <el-form-item>
                                <el-button @click="handleAddAlertRule" type="primary" size="default">
                                    <el-icon><Plus /></el-icon>
                                    {{ $t('message.ruleManage.createRule') }}
                                </el-button>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.title')">
                                <el-input v-model="alertRules.filters.title" :placeholder="$t('message.ruleManage.searchTitle')" size="default" style="width: 200px" clearable />
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.level')">
                                <el-select v-model="alertRules.filters.level" multiple :placeholder="$t('message.ruleManage.selectLevel')" size="default" style="width: 130px" clearable>
                                    <el-option label="Info" :value="1" />
                                    <el-option label="Low" :value="2" />
                                    <el-option label="Medium" :value="3" />
                                    <el-option label="High" :value="4" />
                                    <el-option label="Critical" :value="5" />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.type')">
                                <el-select v-model="alertRules.filters.type" multiple :placeholder="$t('message.ruleManage.selectType')" size="default" style="width: 150px" clearable>
                                    <el-option
                                        v-for="(value, key) in alertTypesMap"
                                        :key="key"
                                        :label="locale === 'en' ? key : value"
                                        :value="key.toLowerCase()"
                                    />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.status')">
                                <el-select v-model="alertRules.filters.status" multiple :placeholder="$t('message.ruleManage.selectStatus')" size="default" style="width: 130px" clearable>
                                    <el-option label="Test" value="test" />
                                    <el-option label="Experimental" value="experimental" />
                                    <el-option label="Stable" value="stable" />
                                    <el-option label="Deprecated" value="deprecated" />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.tags')">
                                <el-select v-model="alertRules.filters.tags" multiple allow-create filterable :placeholder="$t('message.ruleManage.selectTags')" size="default" style="width: 200px" clearable>
                                    <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-row>

                    <!-- Alert Rules Table -->
                    <el-table :data="alertRules.list" border v-loading="alertRules.loading" style="width: 100%; margin-top: -8px">
                        <el-table-column prop="iD" label="ID" min-width="100" show-overflow-tooltip />
                        <el-table-column prop="title" :label="$t('message.ruleManage.title')" min-width="250" show-overflow-tooltip />
                        <el-table-column prop="enable" :label="$t('message.ruleManage.enable')" width="80" align="center">
                            <template #default="{ row }">
                                <el-switch v-model="row.enable" @change="handleToggleAlertRule(row)" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="level" :label="$t('message.ruleManage.level')" width="90" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getLevelType(row.level)">{{ getLevelText(row.level) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" :label="$t('message.ruleManage.status')" width="120" />
                        <el-table-column prop="tags" :label="$t('message.ruleManage.tags')" min-width="150">
                            <template #default="{ row }">
                                <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 4px;">{{ tag }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" :label="$t('message.ruleManage.type')" min-width="150">
                            <template #default="{ row }">
                                {{ getAlertTypeText(row.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="autoBlock" :label="$t('message.ruleManage.autoBlock')" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.autoBlock ? 'danger' : 'info'" size="small">{{ row.autoBlock ? $t('message.ruleManage.yes') : $t('message.ruleManage.no') }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="updateTm" :label="$t('message.ruleManage.updateTime')" width="160">
                            <template #default="{ row }">
                                {{ formatTime(row.updateTm) }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.tableCommon.operate')" width="210" fixed="right" align="center">
                            <template #default="{ row }">
                                <el-button size="small" @click="handleViewAlertRule(row)">{{ $t('message.tableCommon.view') }}</el-button>
                                <el-button size="small" @click="handleEditAlertRule(row)">{{ $t('message.tableCommon.edit') }}</el-button>
                                <el-button size="small" type="danger" @click="handleDeleteAlertRule(row)">{{ $t('message.tableCommon.delete') }}</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- Pagination -->
                    <el-row style="margin-top: 10px" justify="end">
                        <el-pagination
                            v-model:current-page="alertRules.pageIdx"
                            v-model:page-size="alertRules.pageSize"
                            :page-sizes="[10, 20, 50, 100]"
                            :total="alertRules.total"
                            layout="total, sizes, prev, pager, next, jumper"
                            @size-change="handleAlertRulePageChange"
                            @current-change="handleAlertRulePageChange"
                        />
                    </el-row>
                </el-tab-pane>

                <!-- Activity Rules (Sigma Rules) Tab -->
                <el-tab-pane :label="$t('message.ruleManage.activityRuleTab')" name="activityRule" key="activityRule">
                    <!-- Filter Row with Add Button -->
                    <el-row style="margin-bottom: 1px;">
                        <el-form :inline="true" class="filter-form">
                            <el-form-item>
                                <el-button @click="handleAddActivityRule" type="primary" size="default">
                                    <el-icon><Plus /></el-icon>
                                    {{ $t('message.ruleManage.createRule') }}
                                </el-button>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.title')">
                                <el-input v-model="activityRules.filters.title" :placeholder="$t('message.ruleManage.searchTitle')" size="default" style="width: 200px" clearable />
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.level')">
                                <el-select v-model="activityRules.filters.level" multiple :placeholder="$t('message.ruleManage.selectLevel')" size="default" style="width: 180px" clearable>
                                    <el-option label="Info" :value="1" />
                                    <el-option label="Low" :value="2" />
                                    <el-option label="Medium" :value="3" />
                                    <el-option label="High" :value="4" />
                                    <el-option label="Critical" :value="5" />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.status')">
                                <el-select v-model="activityRules.filters.status" multiple :placeholder="$t('message.ruleManage.selectStatus')" size="default" style="width: 180px" clearable>
                                    <el-option label="Test" value="test" />
                                    <el-option label="Experimental" value="experimental" />
                                    <el-option label="Stable" value="stable" />
                                    <el-option label="Deprecated" value="deprecated" />
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="$t('message.ruleManage.tags')">
                                <el-select v-model="activityRules.filters.tags" multiple allow-create filterable :placeholder="$t('message.ruleManage.selectTags')" size="default" style="width: 200px" clearable>
                                    <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-row>

                    <!-- Activity Rules Table -->
                    <el-table :data="activityRules.list" border v-loading="activityRules.loading" style="width: 100%; margin-top: -8px">
                        <el-table-column prop="iD" label="ID" min-width="130" show-overflow-tooltip />
                        <el-table-column prop="title" :label="$t('message.ruleManage.title')" min-width="300" show-overflow-tooltip />
                        <el-table-column prop="level" :label="$t('message.ruleManage.level')" width="80" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getLevelType(row.level)">{{ getLevelText(row.level) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" :label="$t('message.ruleManage.status')" width="110" />
                        <el-table-column prop="tags" :label="$t('message.ruleManage.tags')" min-width="150">
                            <template #default="{ row }">
                                <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 4px;">{{ tag }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="updateTm" :label="$t('message.ruleManage.updateTime')" width="180">
                            <template #default="{ row }">
                                {{ formatTime(row.updateTm) }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.tableCommon.operate')" width="200" fixed="right" align="center">
                            <template #default="{ row }">
                                <el-button size="small" @click="handleViewActivityRule(row)">{{ $t('message.tableCommon.view') }}</el-button>
                                <el-button size="small" @click="handleEditActivityRule(row)">{{ $t('message.tableCommon.edit') }}</el-button>
                                <el-button size="small" type="danger" @click="handleDeleteActivityRule(row)">{{ $t('message.tableCommon.delete') }}</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- Pagination -->
                    <el-row style="margin-top: 10px" justify="end">
                        <el-pagination
                            v-model:current-page="activityRules.pageIdx"
                            v-model:page-size="activityRules.pageSize"
                            :page-sizes="[10, 20, 50, 100]"
                            :total="activityRules.total"
                            layout="total, sizes, prev, pager, next, jumper"
                            @size-change="handleActivityRulePageChange"
                            @current-change="handleActivityRulePageChange"
                        />
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- Alert Rule Dialog -->
        <el-dialog
            v-model="alertRuleDialog.visible"
            :title="alertRuleDialog.isEdit ? $t('message.ruleManage.editAlertRule') : $t('message.ruleManage.addAlertRule')"
            width="600px"
            @close="handleAlertDialogClose"
        >
            <el-form :model="alertRuleDialog.form" label-width="120px" ref="alertRuleFormRef">
                <el-form-item :label="$t('message.ruleManage.title')" prop="title" required>
                    <el-input v-model="alertRuleDialog.form.title" :placeholder="$t('message.ruleManage.enterTitle')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.description')" prop="description">
                    <el-input v-model="alertRuleDialog.form.description" type="textarea" rows="3" :placeholder="$t('message.ruleManage.enterDescription')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.enable')" prop="enable">
                    <el-switch v-model="alertRuleDialog.form.enable" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.level')" prop="level" required>
                    <el-select v-model="alertRuleDialog.form.level" :placeholder="$t('message.ruleManage.selectLevel')" style="width: 100%">
                        <el-option label="Info" :value="1" />
                        <el-option label="Low" :value="2" />
                        <el-option label="Medium" :value="3" />
                        <el-option label="High" :value="4" />
                        <el-option label="Critical" :value="5" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.status')" prop="status" required>
                    <el-select v-model="alertRuleDialog.form.status" :placeholder="$t('message.ruleManage.selectStatus')" style="width: 100%">
                        <el-option label="Test" value="test" />
                        <el-option label="Experimental" value="experimental" />
                        <el-option label="Stable" value="stable" />
                        <el-option label="Deprecated" value="deprecated" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.tags')" prop="tags" required>
                    <el-select v-model="alertRuleDialog.form.tags" multiple allow-create filterable :placeholder="$t('message.ruleManage.selectTags')" style="width: 100%">
                        <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.type')" prop="type" required>
                    <el-select v-model="alertRuleDialog.form.type" :placeholder="$t('message.ruleManage.selectType')" style="width: 100%">
                        <el-option
                            v-for="(value, key) in alertTypesMap"
                            :key="key"
                            :label="locale === 'en' ? `${key} (${value})` : `${value} (${key})`"
                            :value="key.toLowerCase()"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.autoBlock')" prop="autoBlock">
                    <el-switch v-model="alertRuleDialog.form.autoBlock" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.logsource')" prop="logsource">
                    <el-input v-model="alertRuleDialog.form.logsource" :placeholder="$t('message.ruleManage.enterLogsource')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.detection')" prop="detection" required>
                    <Codemirror
                        ref="alertCodeMirrorRef"
                        v-model:value="alertRuleDialog.form.detection"
                        :options="{
                            mode: 'yaml',
                            theme: 'material',
                            lineNumbers: true,
                            lineWrapping: false
                        }"
                        height="200px"
                        width="100%"
                        :placeholder="$t('message.ruleManage.enterDetection')"
                    />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.reference')" prop="references">
                    <div v-for="(ref, index) in alertRuleDialog.form.references" :key="index" style="display: flex; margin-bottom: 8px; align-items: center;">
                        <el-input v-model="alertRuleDialog.form.references[index]" :placeholder="$t('message.ruleManage.enterReference')" style="flex: 1; margin-right: 8px;" />
                        <el-button type="primary" :icon="Plus" circle size="small" style="width: 18px; height: 18px;" @click="addAlertReference" />
                        <el-button type="danger" :icon="Minus" circle size="small" style="width: 18px; height: 18px;" @click="removeAlertReference(index)" /> 
                    </div>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.suggestion')" prop="suggestion">
                    <el-input v-model="alertRuleDialog.form.suggestion" type="textarea" rows="3" :placeholder="$t('message.ruleManage.enterSuggestion')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.author')" prop="author">
                    <el-input v-model="alertRuleDialog.form.author" :placeholder="$t('message.ruleManage.enterAuthor')" />
                </el-form-item>
                <el-form-item v-if="alertRuleDialog.isEdit" :label="$t('message.ruleManage.createTime')" prop="createTm">
                    <el-input v-model="alertRuleDialog.form.createTmFormatted" disabled />
                </el-form-item>
                <el-form-item v-if="alertRuleDialog.isEdit" :label="$t('message.ruleManage.updateTime')" prop="updateTm">
                    <el-input v-model="alertRuleDialog.form.updateTmFormatted" disabled />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="alertRuleDialog.visible = false">{{ $t('message.tableCommon.cancel') }}</el-button>
                <el-button type="primary" @click="handleSaveAlertRule" :loading="alertRuleDialog.saving">{{ $t('message.ruleManage.save') }}</el-button>
            </template>
        </el-dialog>

        <!-- Activity Rule Dialog -->
        <el-dialog
            v-model="activityRuleDialog.visible"
            :title="activityRuleDialog.isEdit ? $t('message.ruleManage.editActivityRule') : $t('message.ruleManage.addActivityRule')"
            width="600px"
            @close="handleActivityDialogClose"
        >
            <el-form :model="activityRuleDialog.form" label-width="120px" ref="activityRuleFormRef">
                <el-form-item label="ID" prop="iD" required>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <el-input
                                v-model="activityRuleDialog.form.iD"
                                placeholder="Enter Rule ID (e.g., winlog-0001-0001)"
                                :disabled="activityRuleDialog.isEdit"
                                style="flex: 0 0 300px;"
                                @input="validateActivityRuleId"
                                :class="{ 'is-error': activityRuleDialog.idValidationError }"
                            />
                            <el-tag v-if="activityRuleDialog.form.iD" :type="isInternalRule(activityRuleDialog.form.iD) ? 'danger' : 'success'" size="small">
                                {{ getRuleTypeText(activityRuleDialog.form.iD) }}
                            </el-tag>
                        </div>
                        <div v-if="activityRuleDialog.idValidationError" style="color: #f56c6c; font-size: 12px; margin-left: 0;">
                            {{ activityRuleDialog.idValidationError }}
                        </div>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.title')" prop="title" required>
                    <el-input v-model="activityRuleDialog.form.title" :placeholder="$t('message.ruleManage.enterTitle')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.description')" prop="description">
                    <el-input v-model="activityRuleDialog.form.description" type="textarea" rows="3" :placeholder="$t('message.ruleManage.enterDescription')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.level')" prop="level" required>
                    <el-select v-model="activityRuleDialog.form.level" :placeholder="$t('message.ruleManage.selectLevel')" style="width: 100%">
                        <el-option label="Info" :value="1" />
                        <el-option label="Low" :value="2" />
                        <el-option label="Medium" :value="3" />
                        <el-option label="High" :value="4" />
                        <el-option label="Critical" :value="5" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.status')" prop="status" required>
                    <el-select v-model="activityRuleDialog.form.status" :placeholder="$t('message.ruleManage.selectStatus')" style="width: 100%">
                        <el-option label="Test" value="test" />
                        <el-option label="Experimental" value="experimental" />
                        <el-option label="Stable" value="stable" />
                        <el-option label="Deprecated" value="deprecated" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.tags')" prop="tags" required>
                    <el-select v-model="activityRuleDialog.form.tags" multiple allow-create filterable :placeholder="$t('message.ruleManage.selectTags')" style="width: 100%">
                        <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.logsource')" prop="logsource">
                    <el-input v-model="activityRuleDialog.form.logsource" :placeholder="$t('message.ruleManage.enterLogsource')" />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.detection')" prop="detection" required>
                    <Codemirror
                        ref="activityCodeMirrorRef"
                        v-model:value="activityRuleDialog.form.detection"
                        :options="{
                            mode: 'yaml',
                            theme: 'material',
                            lineNumbers: true,
                            lineWrapping: false
                        }"
                        height="200px"
                        width="100%"
                        :placeholder="$t('message.ruleManage.enterDetection')"
                    />
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.reference')" prop="references">
                    <div v-for="(ref, index) in activityRuleDialog.form.references" :key="index" style="display: flex; margin-bottom: 8px; align-items: center;">
                        <el-input v-model="activityRuleDialog.form.references[index]" :placeholder="$t('message.ruleManage.enterReference')" style="flex: 1; margin-right: 8px;" />
                        <el-button type="primary" :icon="Plus" circle size="small" style="width: 18px; height: 18px;" @click="addActivityReference" />
                        <el-button type="danger" :icon="Minus" circle size="small" style="width: 18px; height: 18px;" @click="removeActivityReference(index)" />
                    </div>
                </el-form-item>
                <el-form-item prop="rdxKey">
                    <template #label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>CacheKey</span>
                            <el-tooltip content="Set cache for Fields (Internal Rule only)" placement="top">
                                <el-icon style="color: #909399; cursor: help; font-size: 14px;">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                    <el-input v-model="activityRuleDialog.form.rdxKey" placeholder="Enter Redis Key" />
                </el-form-item>
                <el-form-item label="Fields" prop="fields" required>
                    <el-select v-model="activityRuleDialog.form.fields" multiple allow-create filterable placeholder="Enter Fields" style="width: 100%">
                        <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Unique Fields" prop="uniqueFields" required>
                    <el-select v-model="activityRuleDialog.form.uniqueFields" multiple allow-create filterable placeholder="Enter Unique Fields" style="width: 100%">
                        <el-option v-for="field in availableUniqueFields" :key="field" :label="field" :value="field" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('message.ruleManage.author')" prop="author">
                    <el-input v-model="activityRuleDialog.form.author" :placeholder="$t('message.ruleManage.enterAuthor')" />
                </el-form-item>
                <el-form-item v-if="activityRuleDialog.isEdit" :label="$t('message.ruleManage.createTime')" prop="createTm">
                    <el-input v-model="activityRuleDialog.form.createTmFormatted" disabled />
                </el-form-item>
                <el-form-item v-if="activityRuleDialog.isEdit" :label="$t('message.ruleManage.updateTime')" prop="updateTm">
                    <el-input v-model="activityRuleDialog.form.updateTmFormatted" disabled />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="activityRuleDialog.visible = false">{{ $t('message.tableCommon.cancel') }}</el-button>
                <el-button type="primary" @click="handleSaveActivityRule" :loading="activityRuleDialog.saving">{{ $t('message.ruleManage.save') }}</el-button>
            </template>
        </el-dialog>

        <!-- Alert Rule View Dialog -->
        <el-dialog
            v-model="alertRuleViewDialog.visible"
            :title="$t('message.ruleManage.viewAlertRule')"
            width="700px"
        >
            <div class="yaml-viewer">
                <pre><code class="language-yaml" v-html="alertRuleViewDialog.highlightedYaml"></code></pre>
            </div>
            <template #footer>
                <el-button @click="alertRuleViewDialog.visible = false">{{ $t('message.tableCommon.close') }}</el-button>
            </template>
        </el-dialog>

        <!-- Activity Rule View Dialog -->
        <el-dialog
            v-model="activityRuleViewDialog.visible"
            :title="$t('message.ruleManage.viewActivityRule')"
            width="700px"
        >
            <div class="yaml-viewer">
                <pre><code class="language-yaml" v-html="activityRuleViewDialog.highlightedYaml"></code></pre>
            </div>
            <template #footer>
                <el-button @click="activityRuleViewDialog.visible = false">{{ $t('message.tableCommon.close') }}</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Minus, QuestionFilled } from '@element-plus/icons-vue';
import { listAlertRules, addAlertRule, updateAlertRule, deleteAlertRule, listActivityRules, addActivityRule, updateActivityRule, deleteActivityRule, getAlertTypes, getAlertRuleTags, getActivityRuleFields, getActivityRuleUniqueFields } from '/@/api/grpc/method';
import type { ListAlertRuleReq, AddAlertRuleReq, UpdateAlertRuleReq, ListActivityRuleReq, AddActivityRuleReq, UpdateActivityRuleReq, AlertRuleInfo, ActivityRuleInfo } from '/@/api/grpc/ada';
import yaml from 'js-yaml';
import hljs from 'highlight.js/lib/core';
import yamlLang from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css';
import Codemirror from 'codemirror-editor-vue3';
import 'codemirror/mode/yaml/yaml.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

// Register YAML language
hljs.registerLanguage('yaml', yamlLang);

// Language detection
const { locale, t } = useI18n();

const activeTab = ref('alertRule');
const alertRuleFormRef = ref();
const activityRuleFormRef = ref();
const alertCodeMirrorRef = ref();
const activityCodeMirrorRef = ref();

// Alert types map from backend
const alertTypesMap = ref<Record<string, string>>({});

// All available tags from backend
const availableTags = ref<string[]>([]);

// All available fields and uniqueFields from backend
const availableFields = ref<string[]>([]);
const availableUniqueFields = ref<string[]>([]);

// Alert Rules State
const alertRules = reactive({
    list: [] as AlertRuleInfo[],
    total: 0,
    pageIdx: 1,
    pageSize: 10,
    loading: false,
    filters: {
        title: '',
        level: [] as number[],
        type: [] as string[],
        status: [] as string[],
        tags: [] as string[],
    },
});

// Activity Rules State
const activityRules = reactive({
    list: [] as ActivityRuleInfo[],
    total: 0,
    pageIdx: 1,
    pageSize: 10,
    loading: false,
    filters: {
        title: '',
        level: [] as number[],
        status: [] as string[],
        tags: [] as string[],
    },
});

// Alert Rule Dialog State
const alertRuleDialog = reactive({
    visible: false,
    isEdit: false,
    saving: false,
    form: {
        iD: '',
        title: '',
        description: '',
        level: 3,
        status: 'stable',
        enable: true,
        tags: [] as string[],
        logsource: '',
        type: '',
        autoBlock: false,
        detection: '',
        references: [] as string[],
        suggestion: '',
        author: '',
        createTmFormatted: '',
        updateTmFormatted: '',
    },
});

// Activity Rule Dialog State
const activityRuleDialog = reactive({
    visible: false,
    isEdit: false,
    saving: false,
    idValidationError: '',
    form: {
        iD: '',
        title: '',
        description: '',
        level: 3,
        status: 'stable',
        tags: [] as string[],
        logsource: '',
        detection: '',
        references: [] as string[],
        rdxKey: '',
        fields: [] as string[],
        uniqueFields: [] as string[],
        author: '',
        createTmFormatted: '',
        updateTmFormatted: '',
    },
});

// Alert Rule View Dialog State
const alertRuleViewDialog = reactive({
    visible: false,
    yamlContent: '',
    highlightedYaml: '',
});

// Activity Rule View Dialog State
const activityRuleViewDialog = reactive({
    visible: false,
    yamlContent: '',
    highlightedYaml: '',
});

// Fetch Alert Rules
const fetchAlertRules = async () => {
    alertRules.loading = true;
    try {
        const req: ListAlertRuleReq = {
            pageIdx: alertRules.pageIdx,
            pageSize: alertRules.pageSize,
            level: alertRules.filters.level,
            status: alertRules.filters.status,
            enable: false,
            keyword: alertRules.filters.title,
            tags: alertRules.filters.tags,
            sortTm: -1,
        };

        const response = await listAlertRules(req);

        // Filter by type on frontend if type filter is applied
        let filteredRules = response.rules || [];
        if (alertRules.filters.type.length > 0) {
            filteredRules = filteredRules.filter(rule =>
                alertRules.filters.type.includes(rule.type.toLowerCase())
            );
        }

        alertRules.list = filteredRules;
        alertRules.total = response.page?.total || 0;
    } catch (error) {
        console.error('Failed to fetch alert rules:', error);
        ElMessage.error(t('message.ruleManage.loadAlertRulesFailed'));
    } finally {
        alertRules.loading = false;
    }
};

// Fetch Activity Rules
const fetchActivityRules = async () => {
    activityRules.loading = true;
    try {
        const req: ListActivityRuleReq = {
            pageIdx: activityRules.pageIdx,
            pageSize: activityRules.pageSize,
            iDs: [],
            level: activityRules.filters.level,
            status: activityRules.filters.status,
            keyword: activityRules.filters.title,
            tags: activityRules.filters.tags,
            logsource: '',
            ruleType: '',
            sortTm: -1,
        };

        const response = await listActivityRules(req);
        activityRules.list = response.rules || [];
        activityRules.total = response.page?.total || 0;
    } catch (error) {
        console.error('Failed to fetch activity rules:', error);
        ElMessage.error(t('message.ruleManage.loadActivityRulesFailed'));
    } finally {
        activityRules.loading = false;
    }
};

// Handlers for Alert Rules
const handleAddAlertRule = () => {
    alertRuleDialog.visible = true;
    alertRuleDialog.isEdit = false;
    alertRuleDialog.form = {
        iD: '',
        title: '',
        description: '',
        level: 3,
        status: 'stable',
        enable: true,
        tags: [],
        logsource: '',
        type: '',
        autoBlock: false,
        detection: '',
        references: [''],
        suggestion: '',
        author: '',
        createTmFormatted: '',
        updateTmFormatted: '',
    };
};

const handleViewAlertRule = (row: AlertRuleInfo) => {
    const levelMap: Record<number, string> = { 1: 'info', 2: 'low', 3: 'medium', 4: 'high', 5: 'critical' };

    // Format date from "2006-01-02 15:04:05" to "2006/01/02"
    const formatDate = (time: string): string => {
        if (!time) return '';
        return time.split(' ')[0].replace(/-/g, '/');
    };

    const ruleObject = {
        title: row.title,
        id: row.iD || '',
        status: row.status,
        description: row.description || '',
        references: row.references || [],
        author: row.author || '',
        date: formatDate(row.createTm),
        modified: formatDate(row.updateTm),
        tags: row.tags || [],
        logsource: row.logsource || '',
        type: row.type || '',
        enable: row.enable,
        autoBlock: row.autoBlock,
        suggestion: row.suggestion || '',
        level: levelMap[row.level] || 'medium'
    };

    alertRuleViewDialog.yamlContent = yaml.dump(ruleObject, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
    });
    alertRuleViewDialog.highlightedYaml = hljs.highlight(alertRuleViewDialog.yamlContent, { language: 'yaml' }).value;
    alertRuleViewDialog.visible = true;
};

const handleEditAlertRule = (row: AlertRuleInfo) => {
    alertRuleDialog.visible = true;
    alertRuleDialog.isEdit = true;
    alertRuleDialog.form = {
        iD: row.iD,
        title: row.title,
        description: row.description,
        level: row.level,
        status: row.status,
        enable: row.enable,
        tags: [...row.tags],
        logsource: row.logsource,
        type: row.type,
        autoBlock: row.autoBlock,
        detection: row.detection || '',
        references: row.references.length > 0 ? [...row.references] : [''],
        suggestion: row.suggestion,
        author: row.author,
        createTmFormatted: formatTime(row.createTm),
        updateTmFormatted: formatTime(row.updateTm),
    };
};

const handleSaveAlertRule = async () => {
    // Validate YAML syntax
    try {
        yaml.load(alertRuleDialog.form.detection);
    } catch (error) {
        ElMessage.error(t('message.ruleManage.invalidYamlFormat') + ': ' + (error as Error).message);
        return;
    }

    alertRuleDialog.saving = true;
    try {
        if (alertRuleDialog.isEdit) {
            const req: UpdateAlertRuleReq = {
                iD: alertRuleDialog.form.iD,
                title: alertRuleDialog.form.title,
                description: alertRuleDialog.form.description,
                level: alertRuleDialog.form.level,
                status: alertRuleDialog.form.status,
                enable: alertRuleDialog.form.enable,
                tags: alertRuleDialog.form.tags,
                logsource: alertRuleDialog.form.logsource,
                type: alertRuleDialog.form.type,
                autoBlock: alertRuleDialog.form.autoBlock,
                detection: alertRuleDialog.form.detection,
                references: alertRuleDialog.form.references.filter(ref => ref.trim() !== ''),
                suggestion: alertRuleDialog.form.suggestion,
                author: alertRuleDialog.form.author,
            };
            await updateAlertRule(req);
            ElMessage.success(t('message.ruleManage.updateAlertRuleSuccess'));
        } else {
            const req: AddAlertRuleReq = {
                title: alertRuleDialog.form.title,
                description: alertRuleDialog.form.description,
                level: alertRuleDialog.form.level,
                status: alertRuleDialog.form.status,
                enable: alertRuleDialog.form.enable,
                tags: alertRuleDialog.form.tags,
                logsource: alertRuleDialog.form.logsource,
                type: alertRuleDialog.form.type,
                autoBlock: alertRuleDialog.form.autoBlock,
                detection: alertRuleDialog.form.detection,
                references: alertRuleDialog.form.references.filter(ref => ref.trim() !== ''),
                suggestion: alertRuleDialog.form.suggestion,
                author: alertRuleDialog.form.author,
            };
            await addAlertRule(req);
            ElMessage.success(t('message.ruleManage.addAlertRuleSuccess'));
        }
        alertRuleDialog.visible = false;
        fetchAlertRules();
    } catch (error: any) {
        console.error('Failed to save alert rule:', error);
        ElMessage.error(alertRuleDialog.isEdit ? t('message.ruleManage.updateAlertRuleFailed') : t('message.ruleManage.addAlertRuleFailed'));
    } finally {
        alertRuleDialog.saving = false;
    }
};

const handleDeleteAlertRule = async (row: AlertRuleInfo) => {
    try {
        await ElMessageBox.confirm(t('message.ruleManage.confirmDeleteRule', { title: row.title }), t('message.ruleManage.confirmTitle'), {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });

        await deleteAlertRule({ iD: row.iD });
        ElMessage.success(t('message.ruleManage.deleteRuleSuccess'));
        fetchAlertRules();
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('Failed to delete alert rule:', error);
            ElMessage.error(t('message.ruleManage.deleteRuleFailed'));
        }
    }
};

// Helper methods for managing references
const addAlertReference = () => {
    alertRuleDialog.form.references.push('');
};

const removeAlertReference = (index: number) => {
    alertRuleDialog.form.references.splice(index, 1);
};

// Helper function to refresh CodeMirror to fix line numbers gutter width
const refreshCodeMirror = (codeMirrorRef: any) => {
    if (codeMirrorRef.value && codeMirrorRef.value.refresh) {
        // Use nextTick to wait for DOM updates and setTimeout for dialog animation
        nextTick(() => {
            setTimeout(() => {
                codeMirrorRef.value.refresh();
            }, 300); // Increased delay for dialog animation
        });
    }
};

// Helper function to determine if a rule is internal
const isInternalRule = (ruleId: string): boolean => {
    return ruleId.startsWith('winlog-0000-') || ruleId.startsWith('pktlog-0000-');
};

// Helper function to get rule type text
const getRuleTypeText = (ruleId: string): string => {
    return isInternalRule(ruleId) ? 'Internal Rule' : 'Public Rule';
};

// Helper function to validate ID format
const validateRuleIdFormat = (ruleId: string): { isValid: boolean; message: string } => {
    if (!ruleId) {
        return { isValid: true, message: '' };
    }

    // Regular expressions for the two valid formats
    const winlogPattern = /^winlog-\d{4}-\d{4}$/;
    const pktlogPattern = /^pktlog-\d{4}-\d{4}$/;

    if (winlogPattern.test(ruleId)) {
        return { isValid: true, message: '' };
    }

    if (pktlogPattern.test(ruleId)) {
        return { isValid: true, message: '' };
    }

    return {
        isValid: false,
        message: 'ID format must be: winlog-dddd-dddd or pktlog-dddd-dddd'
    };
};

// Validation function for activity rule ID
const validateActivityRuleId = () => {
    if (activityRuleDialog.isEdit) {
        // Don't validate when editing existing rules
        activityRuleDialog.idValidationError = '';
        return;
    }

    const validation = validateRuleIdFormat(activityRuleDialog.form.iD);
    activityRuleDialog.idValidationError = validation.message;
};

const addActivityReference = () => {
    activityRuleDialog.form.references.push('');
};

const removeActivityReference = (index: number) => {
    activityRuleDialog.form.references.splice(index, 1);
};


const handleToggleAlertRule = async (row: AlertRuleInfo) => {
    try {
        const req: UpdateAlertRuleReq = {
            iD: row.iD,
            title: row.title,
            description: row.description,
            level: row.level,
            status: row.status,
            enable: row.enable,
            tags: row.tags,
            logsource: row.logsource,
            type: row.type,
            autoBlock: row.autoBlock,
            detection: '',
            references: [...row.references],
            suggestion: row.suggestion,
            author: row.author,
        };
        await updateAlertRule(req);
        ElMessage.success(row.enable ? t('message.ruleManage.ruleEnabled') : t('message.ruleManage.ruleDisabled'));
    } catch (error) {
        console.error('Failed to toggle alert rule:', error);
        ElMessage.error(t('message.ruleManage.updateRuleStatusFailed'));
        row.enable = !row.enable;
    }
};

const handleAlertRulePageChange = () => {
    fetchAlertRules();
};

const handleAlertDialogClose = () => {
    alertRuleFormRef.value?.resetFields();
};

// Handlers for Activity Rules
const handleAddActivityRule = () => {
    activityRuleDialog.visible = true;
    activityRuleDialog.isEdit = false;
    activityRuleDialog.idValidationError = '';
    activityRuleDialog.form = {
        iD: '',
        title: '',
        description: '',
        level: 3,
        status: 'stable',
        tags: [],
        logsource: '',
        detection: '',
        references: [''],
        rdxKey: '',
        fields: [],
        uniqueFields: [],
        author: '',
        createTmFormatted: '',
        updateTmFormatted: '',
    };
};

const handleViewActivityRule = (row: ActivityRuleInfo) => {
    const levelMap: Record<number, string> = { 1: 'info', 2: 'low', 3: 'medium', 4: 'high', 5: 'critical' };

    // Format date from "2006-01-02 15:04:05" to "2006/01/02"
    const formatDate = (time: string): string => {
        if (!time) return '';
        return time.split(' ')[0].replace(/-/g, '/');
    };

    const ruleObject = {
        title: row.title,
        id: row.iD || '',
        status: row.status,
        description: row.description || '',
        references: row.references || [],
        author: row.author || '',
        date: formatDate(row.createTm),
        modified: formatDate(row.updateTm),
        tags: row.tags || [],
        logsource: row.logsource || '',
        detection: row.detection || '',
        fields: row.fields || [],
        unique_fields: row.uniqueFields || [],
        level: levelMap[row.level] || 'medium'
    };

    activityRuleViewDialog.yamlContent = yaml.dump(ruleObject, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
    });
    activityRuleViewDialog.highlightedYaml = hljs.highlight(activityRuleViewDialog.yamlContent, { language: 'yaml' }).value;
    activityRuleViewDialog.visible = true;
};

const handleEditActivityRule = (row: ActivityRuleInfo) => {
    activityRuleDialog.visible = true;
    activityRuleDialog.isEdit = true;
    activityRuleDialog.idValidationError = '';
    activityRuleDialog.form = {
        iD: row.iD,
        title: row.title,
        description: row.description,
        level: row.level,
        status: row.status,
        tags: [...row.tags],
        logsource: row.logsource,
        detection: row.detection || '',
        references: row.references.length > 0 ? [...row.references] : [''],
        rdxKey: row.rdxKey,
        fields: [...row.fields],
        uniqueFields: [...row.uniqueFields],
        author: row.author,
        createTmFormatted: formatTime(row.createTm),
        updateTmFormatted: formatTime(row.updateTm),
    };
};

const handleSaveActivityRule = async () => {
    // Validate ID format for new rules
    if (!activityRuleDialog.isEdit) {
        validateActivityRuleId();
        if (activityRuleDialog.idValidationError) {
            ElMessage.error('Please fix the ID format before saving');
            return;
        }
    }

    // Validate YAML syntax
    try {
        yaml.load(activityRuleDialog.form.detection);
    } catch (error) {
        ElMessage.error(t('message.ruleManage.invalidYamlFormat') + ': ' + (error as Error).message);
        return;
    }

    activityRuleDialog.saving = true;
    try {
        if (activityRuleDialog.isEdit) {
            const req: UpdateActivityRuleReq = {
                iD: activityRuleDialog.form.iD,
                title: activityRuleDialog.form.title,
                description: activityRuleDialog.form.description,
                level: activityRuleDialog.form.level,
                status: activityRuleDialog.form.status,
                tags: activityRuleDialog.form.tags,
                logsource: activityRuleDialog.form.logsource,
                detection: activityRuleDialog.form.detection,
                references: activityRuleDialog.form.references.filter(ref => ref.trim() !== ''),
                rdxKey: activityRuleDialog.form.rdxKey,
                fields: activityRuleDialog.form.fields,
                uniqueFields: activityRuleDialog.form.uniqueFields,
                author: activityRuleDialog.form.author,
            };
            await updateActivityRule(req);
            ElMessage.success(t('message.ruleManage.updateActivityRuleSuccess'));
        } else {
            const req: AddActivityRuleReq = {
                iD: activityRuleDialog.form.iD,
                title: activityRuleDialog.form.title,
                description: activityRuleDialog.form.description,
                level: activityRuleDialog.form.level,
                status: activityRuleDialog.form.status,
                tags: activityRuleDialog.form.tags,
                logsource: activityRuleDialog.form.logsource,
                detection: activityRuleDialog.form.detection,
                references: activityRuleDialog.form.references.filter(ref => ref.trim() !== ''),
                rdxKey: activityRuleDialog.form.rdxKey,
                fields: activityRuleDialog.form.fields,
                uniqueFields: activityRuleDialog.form.uniqueFields,
                author: activityRuleDialog.form.author,
            };
            await addActivityRule(req);
            ElMessage.success(t('message.ruleManage.addActivityRuleSuccess'));
        }
        activityRuleDialog.visible = false;
        fetchActivityRules();
    } catch (error: any) {
        console.error('Failed to save activity rule:', error);
        ElMessage.error(activityRuleDialog.isEdit ? t('message.ruleManage.updateActivityRuleFailed') : t('message.ruleManage.addActivityRuleFailed'));
    } finally {
        activityRuleDialog.saving = false;
    }
};

const handleDeleteActivityRule = async (row: ActivityRuleInfo) => {
    try {
        await ElMessageBox.confirm(t('message.ruleManage.confirmDeleteRule', { title: row.title }), t('message.ruleManage.confirmTitle'), {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });

        await deleteActivityRule({ iD: row.iD });
        ElMessage.success(t('message.ruleManage.deleteRuleSuccess'));
        fetchActivityRules();
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('Failed to delete activity rule:', error);
            ElMessage.error(t('message.ruleManage.deleteRuleFailed'));
        }
    }
};

const handleActivityRulePageChange = () => {
    fetchActivityRules();
};

const handleActivityDialogClose = () => {
    activityRuleFormRef.value?.resetFields();
    activityRuleDialog.idValidationError = '';
};

// Utility functions
const getLevelType = (level: number): string => {
    const types: Record<number, string> = {
        1: 'info',
        2: 'success',
        3: 'warning',
        4: 'danger',
        5: 'danger',
    };
    return types[level] || 'info';
};

const getLevelText = (level: number): string => {
    const texts: Record<number, string> = {
        1: 'Info',
        2: 'Low',
        3: 'Medium',
        4: 'High',
        5: 'Critical',
    };
    return texts[level] || 'Unknown';
};

const getAlertTypeText = (type: string): string => {
    if (!type) return '';

    // Convert lowercase type to CamelCase to match alertTypesMap keys
    const camelCaseType = type
        .split(/[\s_-]+/)
        .map((word, index) => {
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');

    // If locale is English, return the key, otherwise return the value
    if (locale.value === 'en') {
        return camelCaseType || type;
    }

    return alertTypesMap.value[camelCaseType] || type;
};

const formatTime = (time: string): string => {
    if (!time) return '';
    // Time is already in format "2006-01-02 15:04:05" from backend
    return time;
};

// Fetch alert types from backend
const fetchAlertTypes = async () => {
    try {
        const response = await getAlertTypes();
        alertTypesMap.value = response.alertTypes || {};
    } catch (error) {
        console.error('Failed to fetch alert types:', error);
    }
};

const fetchAlertRuleTags = async () => {
    try {
        const response = await getAlertRuleTags();
        availableTags.value = response.tags || [];
    } catch (error) {
        console.error('Failed to fetch alert rule tags:', error);
    }
};

const fetchActivityRuleFields = async () => {
    try {
        const response = await getActivityRuleFields();
        availableFields.value = response.fields || [];
    } catch (error) {
        console.error('Failed to fetch activity rule fields:', error);
    }
};

const fetchActivityRuleUniqueFields = async () => {
    try {
        const response = await getActivityRuleUniqueFields();
        availableUniqueFields.value = response.uniqueFields || [];
    } catch (error) {
        console.error('Failed to fetch activity rule unique fields:', error);
    }
};

// Watch for tab changes
watch(activeTab, (newTab) => {
    if (newTab === 'activityRule' && activityRules.list.length === 0) {
        fetchActivityRules();
    }
});

// Watch for filter changes on alert rules
watch(() => alertRules.filters, () => {
    alertRules.pageIdx = 1;
    fetchAlertRules();
}, { deep: true });

// Watch for filter changes on activity rules
watch(() => activityRules.filters, () => {
    activityRules.pageIdx = 1;
    fetchActivityRules();
}, { deep: true });

// Watch for dialog visibility changes to refresh CodeMirror
watch(() => alertRuleDialog.visible, (newVal) => {
    if (newVal) {
        refreshCodeMirror(alertCodeMirrorRef);
    }
});

watch(() => activityRuleDialog.visible, (newVal) => {
    if (newVal) {
        refreshCodeMirror(activityCodeMirrorRef);
    }
});

// Initialize
onMounted(() => {
    fetchAlertTypes();
    fetchAlertRuleTags();
    fetchActivityRuleFields();
    fetchActivityRuleUniqueFields();
    fetchAlertRules();
});
</script>

<style scoped lang="scss">
.filter-form {
    margin-bottom: 20px;

    :deep(.el-form-item) {
        margin-right: 12px;
    }
}

.yaml-viewer {
    pre {
        margin: 0;
        padding: 16px;
        background-color: #0d1117;
        border-radius: 6px;
        overflow-x: auto;

        code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            line-height: 1.6;
        }
    }
}
</style>
