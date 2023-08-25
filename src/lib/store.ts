import { Icon, LeafyGreenIcon, EggFried, Beef, Utensils, Coffee } from 'lucide-vue-next';
import { defineStore } from 'pinia';

const ENDPOINT = "https://speiseplan.mcloud.digital";

export enum Week {
    Current = "current",
    Next = "next"
}

export interface Allergene {
    code: string;
    name: string;
}

export interface Meal {
    name: string;
    price: string;
    vegetarian: boolean;
    vegan: boolean;
    location: LocationCodes;
    allergens: Allergene[];
}

export interface Day {
    date: Date;
    week: Week;
    open: boolean;
    hasError: string;
    meals: Meal[];
}

export type Speiseplan = Day[];

export interface MensaData {
    speiseplan: Speiseplan;
    allergens: Allergene[];
}

export enum Ort {
    TH = "th",
    MH = "mh",
}

export enum Route {
    Meals = "meals",
    Allergens = "allergens"
}

export enum FilterType {
    DietaryPreference,
    Location,
    Allergen
}

export enum DietaryPreferenceCodes {
    Vegetarian = "vegetarian",
    Vegan = "vegan",
    All = "all"
}

export enum LocationCodes {
    Mensa = "Mensa",
    Cafeteria = "Cafeteria"
}

export interface Filter {
    name: string;
    type: FilterType;
    code: string;
    icon?: Icon;
}

export interface Setting {
    name: string;
    description: string;
    value: boolean
}

export interface Settings {
    [key: string]: Setting
}

export const speisePlanStore = defineStore("speiseplanStore", {
    state: () => {
        return {
            mensaData: {} as MensaData,
            ort: (localStorage.getItem("ort") || Ort.TH) as Ort,
            date: new Date(),
            activeFilter: JSON.parse(localStorage.getItem("activeFilter") || "[]") as Filter[],
            availableFilter: [] as Filter[],
            filteredMeals: [] as Meal[],
            firstStart: JSON.parse(localStorage.getItem("firstStart") || "true") as boolean,
            settings: {
                justShowAllergens: {
                    name: "Allergene nur anzeigen",
                    description: "Allergene nur anzeigen, statt Gerichte auszublenden",
                    value: false
                }
            } as Settings
        }
    },
    actions: {
        async init() {
            this.loadSettings();
            await this.loadData();
            this.loadFilter();
            this.filter();

            if (this.firstStart) {
                this.firstStart = false;
                localStorage.setItem("firstStart", JSON.stringify(this.firstStart));
            }
        },
        async loadData() {
            const speiseplan = await this.makeRequest<Speiseplan>(Route.Meals);
            const allergens = await this.makeRequest<Allergene[]>(Route.Allergens);

            // Make sure the date is a Date object.
            speiseplan.forEach((day) => {
                day.date = new Date(day.date);
            });

            this.mensaData = {
                speiseplan,
                allergens
            };
        },
        loadSettings() {
            const setSettings = JSON.parse(localStorage.getItem("settings") || "{}") as Settings;

            for (const key in setSettings) {
                if (setSettings.hasOwnProperty(key)) {
                    const setting = setSettings[key];
                    if (this.settings.hasOwnProperty(key)) {
                        this.settings[key].value = setting.value;
                    }
                }
            }
        },
        loadFilter() {
            this.availableFilter = [];

            this.mensaData.allergens.forEach((allergen) => {
                this.addFilter({
                    name: allergen.name,
                    type: FilterType.Allergen,
                    code: allergen.code
                })
            });

            const dietaryPreferences = [
                {
                    name: "Alles",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.All,
                    icon: Beef
                },
                {
                    name: "Vegetarisch",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.Vegetarian,
                    icon: EggFried
                },
                {
                    name: "Vegan",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.Vegan,
                    icon: LeafyGreenIcon
                }
            ]
            this.addAllFilter(dietaryPreferences);

            if (this.firstStart) {
                this.activateFilter(dietaryPreferences[0]);
            }

            if (this.ort === Ort.TH) {
                const locations = [
                    {
                        name: "Mensa",
                        type: FilterType.Location,
                        code: LocationCodes.Mensa,
                        icon: Utensils
                    },
                    {
                        name: "Cafeteria",
                        type: FilterType.Location,
                        code: LocationCodes.Cafeteria,
                        icon: Coffee
                    }
                ]
                this.addAllFilter(locations);

                if (this.firstStart) {
                    this.activateAllFilter(locations);
                }
            }
        },
        async makeRequest<T>(route: Route): Promise<T> {
            const url = `${ENDPOINT}/${route}?mensa=${this.ort}`;
            const response = await fetch(url);
            return await response.json() as T;
        },
        filter() {
            const meals = this.mensaData.speiseplan.find((day) => day.date.getDate() === this.date.getDate())?.meals ?? [];

            const filtered = meals.filter((meal) => {
                let location = false;
                let dietaryPreference = false;
                let allergen = false;

                const locations = this.activeFilter.filter((filter) => filter.type === FilterType.Location)
                if (locations.filter((e) => e.code === meal.location).length > 0) location = true;

                const dietaryPreferences = this.activeFilter.filter((filter) => filter.type === FilterType.DietaryPreference)
                if (dietaryPreferences.filter((e) => meal.vegetarian && e.code === DietaryPreferenceCodes.Vegetarian || meal.vegan && e.code === DietaryPreferenceCodes.Vegan || e.code === DietaryPreferenceCodes.All).length > 0) dietaryPreference = true;

                if (!this.settings.justShowAllergens.value) {
                    const allergens = this.activeFilter.filter((filter) => filter.type === FilterType.Allergen)
                    if (allergens.length === 0 || allergens.filter((e) => !meal.allergens.find((allergen) => allergen.code === e.code)).length === allergens.length) allergen = true;
                }

                return location && dietaryPreference && (allergen || this.settings.justShowAllergens.value)
            });

            this.filteredMeals = filtered;
        },
        activateFilter(filter: Filter) {
            if (this.activeFilter.find((f) => f.code === filter.code)) return;

            if (filter.type === FilterType.DietaryPreference) {
                const indexToRemove = this.activeFilter.findIndex(f => f.type === FilterType.DietaryPreference);
                if (indexToRemove !== -1) {
                    this.activeFilter.splice(indexToRemove, 1);
                }
            }
            this.activeFilter.push(filter);


            localStorage.setItem("activeFilter", JSON.stringify(this.activeFilter));
            this.filter()
        },
        activateAllFilter(filter: Filter[]) {
            filter.forEach((f) => this.activateFilter(f));
        },
        deactivateFilter(filter: Filter) {
            this.activeFilter.splice(this.activeFilter.indexOf(filter), 1);
            localStorage.setItem("activeFilter", JSON.stringify(this.activeFilter));
            this.filter()
        },
        toggleFilter(filter: Filter) {
            if (this.activeFilter.find((f) => f.code === filter.code)) {
                this.deactivateFilter(filter);
            } else {
                this.activateFilter(filter);
            }
        },
        addFilter(filter: Filter) {
            if (this.availableFilter.find((f) => f.code === filter.code)) return;
            this.availableFilter.push(filter);
        },
        addAllFilter(filter: Filter[]) {
            filter.forEach((f) => this.addFilter(f));
        },
        removeFilter(filter: Filter) {
            this.availableFilter.splice(this.availableFilter.indexOf(filter), 1);
        },
        incrementDate() {
            this.date.setDate(this.date.getDate() + 1);
            this.filter()
        },
        decrementDate() {
            this.date.setDate(this.date.getDate() - 1);
            this.filter()
        },
        setOrt(ort: Ort) {
            this.ort = ort;
            localStorage.setItem("ort", JSON.stringify(this.ort));
            this.init();
        }
    }
})

