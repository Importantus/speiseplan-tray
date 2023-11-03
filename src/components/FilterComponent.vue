<script setup lang="ts">
import { Filter, speisePlanStore } from '../lib/store';

const store = speisePlanStore()

const props = defineProps<{
    filter: Filter,
    strech: boolean,
}>()
</script>

<template>
    <div class="wrapper" @click="store.toggleFilter(props.filter)"
        :class="{ 'stretch': props.strech, 'active': $props.filter.active, 'icon-padding': props.filter.icon }">
        <props.filter.icon! v-if="props.filter.icon" class="icon" />
        <div>{{ $props.filter.name }}</div>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--color-card-background);
    padding: 0.3rem 0.5rem;
    border-radius: 5px;
    font-size: 0.8rem;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    flex-grow: 1;
}

.stretch {
    padding: 0.5rem 0.5rem;
}

.icon {
    height: 0.8rem;
}

.icon-padding {
    padding-left: 0.25rem;
}

.active {
    background-color: var(--accent-color);
}
</style>