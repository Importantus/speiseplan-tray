<script setup lang="ts">
import { Meal, speisePlanStore, FilterType, Group } from '../lib/store';
import AllergeneComponent from './AllergeneComponent.vue';

const store = speisePlanStore()

defineProps<{
    meal: Meal;
}>()

</script>

<template>
    <div class="meal">
        <div class="icons">
            <p>{{ meal.vegan ? "🌻" : meal.vegetarian ? "🌽" : "🥩" }}</p>
        </div>
        <div class="text">
            <h2>{{ meal.name }}
                <span>
                    <AllergeneComponent v-if="store.settings.justShowAllergens" v-for="allergene in store.activeFilter.filter((filter) => {
                return meal.allergens.some((a) => a.code === filter.code)
            })" :allergene="allergene" />
                </span>
            </h2>
            <p>{{ meal.price[store.activeFilter.filter((e) => e.type === FilterType.Group)[0].code as
                Group].toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                }) + " | " + (meal.location.name) }}</p>
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