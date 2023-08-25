<script setup lang="ts">
import { Allergene } from '../lib/store';


const props = defineProps<{
    allergene: Allergene,
}>()
</script>

<template>
    <span>{{ props.allergene.name }}</span>
</template>

<style scoped>
span {
    background-color: #303430;
    padding: 0.1rem 0.25rem;
    border-radius: 5px;
    font-size: 0.65rem;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 0.25rem;
}
</style>