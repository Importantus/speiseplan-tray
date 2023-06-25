import { computed, reactive, watch } from "vue";
import { Meal, Speiseplan } from "./API";

interface State {
    date: Date;
    activeFilters: Set<Filter>;
}

export const state: State = reactive({
    date: new Date(),
    activeFilters: new Set()
})

interface Filter {
    name: string;
    func: (meal: Meal) => boolean;
}

export const availableFilters: Filter[] = [
    {
        name: "vegetarisch",
        func: (meal: Meal) => meal.vegetarian
    },
    {
        name: "vegan",
        func: (meal: Meal) => meal.vegan
    },
    {
        name: "mensa",
        func: (meal: Meal) => meal.location === "Mensa"
    },
    {
        name: "cafeteria",
        func: (meal: Meal) => meal.location === "Cafeteria"
    }
];

const savedState = localStorage.getItem("state");
if (savedState) {
    const parsedState = JSON.parse(savedState);
    availableFilters.filter((filter) => parsedState.filters.includes(filter.name)).forEach((filter) => state.activeFilters.add(filter));
}

export const toggleFilter = (filter: Filter) => {
    if (state.activeFilters.has(filter)) {
        state.activeFilters.delete(filter);
    } else {
        state.activeFilters.add(filter);
    }
}

export const setDate = (date: Date) => {
    state.date = date;
};

export function filterMeals(data: Speiseplan): Meal[] {
    return computed(() => {
        if (!data) {
            return [];
        }
        const meals = data.find((day) => day.date.getDate() === state.date.getDate())?.meals ?? [];
        const filtered = meals.filter((meal) => [...state.activeFilters].every((filter) => filter.func(meal)));
        return filtered;
    }).value;
}

watch(state, () => {
    const filters = [...state.activeFilters].map((filter) => filter.name);
    localStorage.setItem("state", JSON.stringify({ filters }));
})
