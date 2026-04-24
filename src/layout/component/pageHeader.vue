<template>
	<section v-if="title" class="layout-page-header">
		<div class="layout-page-header__main">
			<div class="layout-page-header__kicker">{{ $t('message.pageHeader.kicker') }}</div>
			<h1>{{ title }}</h1>
			<p>{{ description }}</p>
		</div>
	</section>
</template>

<script setup lang="ts" name="layoutPageHeader">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t, te } = useI18n();

const title = computed(() => {
	const routeTitle = route.meta?.title;
	return routeTitle ? t(routeTitle as string) : '';
});

const routeKey = computed(() => (typeof route.name === 'string' ? route.name : route.path));
const description = computed(() => {
	const key = `message.pageHeader.descriptions.${routeKey.value}`;
	return te(key) ? t(key) : t('message.pageHeader.descriptions.default');
});
</script>
