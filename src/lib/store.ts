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

export interface Speiseplan {
    lastUpdate: Date;
    days: Days;
}

export type Days = Day[];

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
    Allergens = "allergens",
    MealsUpdate = "meals/last-update",
    AllergensUpdate = "allergens/last-update"
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
    active: boolean;
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

export interface LastUpdate {
    lastUpdate: Date;
}

export const speisePlanStore = defineStore("speiseplanStore", {
    state: () => {
        return {
            mensaData: {} as MensaData,
            ort: (localStorage.getItem("ort") || Ort.TH) as Ort,
            date: new Date(),
            allFilter: [] as Filter[],
            filteredMeals: [] as Meal[],
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
            this.ort = Ort.TH
            this.loadSettings();
            await this.loadData();
            this.loadFilter();
            this.filter();
        },
        async loadData() {
            const days = await this.makeRequest<Days>(Route.Meals);
            const allergens = await this.makeRequest<Allergene[]>(Route.Allergens);
            const mealsLastUpdate = await this.makeRequest<LastUpdate>(Route.MealsUpdate);

            // Make sure the date is a Date object.
            days.forEach((day) => {
                day.date = new Date(day.date);
            });

            const speiseplan: Speiseplan = {
                lastUpdate: new Date(mealsLastUpdate.lastUpdate),
                days
            }

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
            const availableFilter: Filter[] = [];

            // Sort allergens by name
            this.mensaData.allergens.sort((a, b) => a.name.localeCompare(b.name));

            this.mensaData.allergens.forEach((allergen) => {
                availableFilter.push({
                    name: allergen.name,
                    type: FilterType.Allergen,
                    code: allergen.code,
                    active: false
                })
            });

            const dietaryPreferences = [
                {
                    name: "Alles",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.All,
                    active: true,
                    icon: Beef
                },
                {
                    name: "Vegetarisch",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.Vegetarian,
                    active: false,
                    icon: EggFried
                },
                {
                    name: "Vegan",
                    type: FilterType.DietaryPreference,
                    code: DietaryPreferenceCodes.Vegan,
                    active: false,
                    icon: LeafyGreenIcon
                }
            ]
            availableFilter.push(...dietaryPreferences);

            const locations = [
                {
                    name: "Mensa",
                    type: FilterType.Location,
                    code: LocationCodes.Mensa,
                    active: true,
                    icon: Utensils
                },
                {
                    name: "Cafeteria",
                    type: FilterType.Location,
                    code: LocationCodes.Cafeteria,
                    active: true,
                    icon: Coffee
                }
            ]
            if (this.ort === Ort.TH) {
                availableFilter.push(...locations);
            } else {
                availableFilter.push(locations[1]);
            }

            const oldFilter = JSON.parse(localStorage.getItem("allFilter") || "[]") as Filter[];

            this.allFilter = availableFilter

            oldFilter.forEach((filter) => {
                const newFilter = this.allFilter.find((f) => f.code === filter.code)
                if (newFilter) {
                    newFilter.active = filter.active;
                }
            })

            localStorage.setItem("allFilter", JSON.stringify(this.allFilter));
        },
        async makeRequest<T>(route: Route): Promise<T> {
            const url = `${ENDPOINT}/${route}?mensa=${this.ort}`;
            const response = await fetch(url);
            return await response.json() as T;
        },
        filter() {
            const meals = this.mensaData.speiseplan.days.find((day) => day.date.getDate() === this.date.getDate())?.meals ?? [];

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
        },
        toggleOrt() {
            this.setOrt(this.ort === Ort.TH ? Ort.MH : Ort.TH);
        },
        toggleFilter(filter: Filter) {
            if (filter.type === FilterType.DietaryPreference) {
                this.allFilter.forEach((f) => {
                    if (f.type === FilterType.DietaryPreference) {
                        f.active = false;
                    }
                })
            }

            filter.active = !filter.active;
            localStorage.setItem("allFilter", JSON.stringify(this.allFilter));
            this.filter();
        }
    },
    getters: {
        activeFilter(): Filter[] {
            return this.allFilter.filter((filter) => filter.active);
        }
    }
})

