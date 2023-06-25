<script setup lang="ts">
import getData, { Speiseplan } from "../lib/API.ts";
import MealComponent from "./MealComponent.vue";
import { filterMeals, setDate, state, availableFilters, toggleFilter } from "../lib/filter.ts";

let data: Speiseplan = await getData();

async function reload() {
    data = await getData();
}

function incrementDay() {
    setDate(new Date(state.date.setDate(state.date.getDate() + 1)));
}

function decrementDay() {
    setDate(new Date(state.date.setDate(state.date.getDate() - 1)));
}
</script>

<template>
    <div class="wrapper">
        <dialog>
            <button class="close" @click="closeDialog">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
            <h1>Filter</h1>
            <div class="filter-wrapper" v-for="filter in availableFilters" :key="filter.name">
                <input type="checkbox" @input="() => toggleFilter(filter)" :checked="state.activeFilters.has(filter)"
                    :id="filter.name" />
                <label :for="filter.name">{{ filter.name }}</label>
            </div>
        </dialog>
        <div class="header">
            <div class="header-text">
                <h1>Speiseplan</h1>
                <p>{{ state.date.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                }) }}</p>
            </div>
            <div class="header-buttons">
                <button class="header-button" @click="openDialog">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                </button>
                <button class="header-button" @click="reload">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                    </svg>
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
            <p v-if="filterMeals(data).length === 0">Heute gibt es nichts zu essen</p>
            <div class="meal-item" v-for="meal in filterMeals(data)" :key="meal.name">
                <MealComponent :meal="meal" />
            </div>

        </div>
    </div>
</template>

<script lang="ts">
function openDialog() {
    const dialog = document.querySelector("dialog");
    dialog?.showModal();
}

function closeDialog() {
    const dialog = document.querySelector("dialog");
    dialog?.close();
}
</script>

<style scoped>
dialog {
    position: relative;
    border: none;
    border-radius: 10px;
}

dialog h1 {
    margin-bottom: 6px;
}

.close {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 1rem;
    border: none;
    background: none;
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 5px;
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
    padding-bottom: 5rem;
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
    background: linear-gradient(180deg, rgba(23, 25, 23, 0) 0%, #171917 74.36%);
    z-index: 10;
}

.change-day {
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    width: 60px;
    background-color: rgba(23, 25, 23, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
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
    background: black;
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
    padding: 5px;
}
</style>