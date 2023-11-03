<script setup lang="ts">
import MealComponent from "./MealComponent.vue";
import { speisePlanStore } from "../lib/store.ts";
import SettingsPage from "./SettingsPage.vue";
import { Filter } from "lucide-vue-next";
import { RefreshCw } from "lucide-vue-next";
import { ref, watch } from "vue";


let store = speisePlanStore();

await store.init();

function incrementDay() {
    store.incrementDate();
}

function decrementDay() {
    store.decrementDate();
}

let showSettings = ref(false);

function reload() {
    store.$reset()
    store.init();
}

watch(store.settings, () => {
    localStorage.setItem('settings', JSON.stringify(store.settings));
    store.filter()
}, { deep: true })
</script>

<template>
    <SettingsPage v-if="showSettings" @close="showSettings = false" />

    <div v-if="!showSettings" class="wrapper">
        <div class="header">
            <div class="header-text">
                <h1>Speiseplan</h1>
                <p>{{
                    (store.date.getDate() === new Date().getDate() &&
                        store.date.getMonth() === new Date().getMonth() &&
                        store.date.getFullYear() === new Date().getFullYear()
                        ? 'Heute, ' : '') +
                    store.date.toLocaleDateString('de-DE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                    }) }}</p>
            </div>
            <div class="header-buttons">
                <button class="header-button" @click="showSettings = true">
                    <Filter height="20px" />
                </button>
                <button class="header-button" @click="reload">
                    <RefreshCw height="20px" />
                </button>
            </div>
        </div>

        <div class="meal-list-wrapper">
            <div class="change-day left" @click="decrementDay">
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            </div>
            <div class="change-day right" @click="incrementDay">
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
            <div class="gradient"></div>
            <p v-if="store.filteredMeals.length === 0">Heute gibt es nichts zu essen</p>
            <div class="meal-item" v-for="meal in store.filteredMeals" :key="meal.name">
                <MealComponent :meal="meal" />
            </div>
            <p class="last-update">Letztes Update {{ store.mensaData.speiseplan.lastUpdate.toLocaleString() }}</p>
        </div>
    </div>
</template>

<style scoped>
.last-update {
    width: 100%;
    text-align: center;
    margin-top: 10px;
    z-index: 10;
    font-size: 10px;
    opacity: 0.7;
    position: sticky;
    top: 100vh;
}

.wrapper {
    padding: 1rem 1rem 0 1rem;
    box-sizing: border-box;
    height: 100vh;
    --header-height: 65px;
}

.meal-list-wrapper {
    margin-top: var(--header-height);
    position: relative;
    height: 260px;
    box-sizing: border-box;
    overflow-y: scroll;
    /* padding-bottom: 3rem; */
    display: flex;
    flex-direction: column;
    gap: 1.3rem;
}

::-webkit-scrollbar {
    display: none;
}

.gradient {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5rem;
    background: linear-gradient(180deg, var(--color-background-transparent) 0%, var(--color-background) 74.36%);
    z-index: 10;
}

.change-day {
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

.change-day:hover {
    opacity: 1;
}

.left {
    left: 0;
}

.right {
    right: 0;
}

.change-day button {
    width: 30px;
    height: 30px;
    background: var(--color-card-background);
    border: none;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transform: translate(0, -50%);
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--header-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background-color: var(--color-background);
    box-sizing: border-box;
    padding: 0 1rem;
}

.header-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}

.header-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.header-button {
    width: 30px;
    height: 30px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>