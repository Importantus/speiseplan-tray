<script setup lang="ts">
import { X } from "lucide-vue-next";
import { FilterType, speisePlanStore } from "../lib/store.ts";
import FilterComponent from "./FilterComponent.vue";

let store = speisePlanStore();

</script>

<template>
    <div class="outer-wrapper">
        <button class="close-button" @click="$emit('close')">
            <X height="20px" />
        </button>
        <div class="outer-filter-wrapper">
            <h2 class="filter-heading">
                Wo isst du?
            </h2>
            <div class="filter-wrapper one-line">
                <FilterComponent v-for="filter in store.allFilter.filter((e) => e.type === FilterType.Location) "
                    :filter="filter" :key="filter.code" strech />
            </div>
        </div>
        <div class="outer-filter-wrapper">
            <h2 class="filter-heading">
                Was isst du?
            </h2>
            <div class="filter-wrapper one-line">
                <FilterComponent v-for="filter in store.allFilter.filter((e) => e.type === FilterType.DietaryPreference)"
                    :filter="filter" :key="filter.code" strech />
            </div>
        </div>
        <div class="outer-filter-wrapper">
            <h2 class="filter-heading">
                Was bist du?
            </h2>
            <div class="filter-wrapper one-line">
                <FilterComponent v-for="filter in store.allFilter.filter((e) => e.type === FilterType.Group)"
                    :filter="filter" :key="filter.code" strech />
            </div>
        </div>
        <div class="outer-filter-wrapper">
            <h2 class="filter-heading">
                Wogegen bist du allergisch?
            </h2>
            <div class="switch-wrapper">
                <p class="switch-label">{{ store.settings.justShowAllergens.description }}</p>
                <label class="switch">
                    <input type="checkbox" class="watched-slider" v-model="store.settings.justShowAllergens.value">
                    <span class="slider round"></span>
                </label>
            </div>

            <div class="filter-wrapper">
                <FilterComponent v-for="filter in store.allFilter.filter((e) => e.type === FilterType.Allergen)"
                    :filter="filter" :key="filter.code" :strech="false" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.switch-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
    margin-bottom: 10px;
}

.switch-label {
    line-height: 1;
}

.switch {
    --width: 30px;
    --height: 15px;
    --border-radius: 20px;
    display: inline-block;
    height: var(--height);
    position: relative;
    width: var(--width)
}

.switch input {
    height: 0;
    opacity: 0;
    width: 0
}

.slider {
    background-color: var(--color-card-background);
    border: none;
    border-radius: 20px;
    bottom: 0;
    cursor: pointer;
    left: 0;
    outline: none;
    right: 0;
    top: 0
}

.slider,
.slider:before {
    position: absolute;
    transition: transform .4s
}

.slider:before {
    background-color: var(--accent-color-tuned);
    border-radius: 50%;
    content: "";
    height: var(--height);
    width: var(--height)
}

input:checked+.slider {
    background-color: var(--color-card-background)
}

input:checked+.slider:before {
    background-color: var(--accent-color);
    -webkit-transform: translateX(calc(var(--width) - var(--height)));
    -ms-transform: translateX(calc(var(--width) - var(--height)));
    transform: translateX(calc(var(--width) - var(--height)))
}

.outer-wrapper {
    max-width: 100vw;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 1rem 1rem 1rem 1rem;
    box-sizing: border-box;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

::-webkit-scrollbar {
    display: none;
}

.close-button {
    position: fixed;
    top: 12px;
    right: 12px;
    border: none;
    background: none;
    cursor: pointer;
    width: 30px;
    height: 30px;
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.filter-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.one-line {
    flex-wrap: nowrap;
}

.filter-heading {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
}
</style>