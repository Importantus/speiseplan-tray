<script setup lang="ts">
import { Meal } from '../lib/API.ts';


defineProps<{
    meal: Meal;
}>()

</script>

<template>
    <div class="meal">
        <div class="icons">
            <p>{{ meal.vegetarian ? "🥬" : "🥩" }}</p>
            <p v-if="meal.allergens.some((a) => a.code === 'GlW')">🌾</p>
        </div>
        <div class="text">
            <h2>{{ meal.name }}</h2>
            <p>{{ meal.price }}</p>
        </div>
    </div>
</template>

<style scoped>
.meal {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.5rem;
}

.icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}
</style>