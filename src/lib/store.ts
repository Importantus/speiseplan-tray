import { Icon, LeafyGreenIcon, EggFried, Beef, Utensils, Coffee } from 'lucide-vue-next';
import { defineStore } from 'pinia';

const ENDPOINT = "https://speiseplan.mcloud.digital/v2";

export enum Week {
    Current = "current",
    Next = "next"
}

interface LocationRequest {
    last_updated: Date;
    data: Location[]
}

interface AllergeneRequest {
    last_updated: Date;
    data: Allergene[];
}

interface MealRequest {
    last_updated: Date,
    data: Meal[]
}

export interface Meal {
    name: string;
    vegetarian: boolean;
    vegan: boolean;
    location: Location;
    price: PriceByGroup;
    allergens: Allergene[];
    date: Date;
}

export interface Allergene {
    code: string;
    name: string;
}

export interface Location {
    code: string;
    city: string;
    name: string;
}

export interface PriceByGroup {
    [Group.Students]: number;
    [Group.Employees]: number;
    [Group.Guests]: number;
}

export enum Group {
    Students = "students",
    Employees = "employees",
    Guests = "guests"
}

export interface Day {
    date: Date;
    meals: Meal[]
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

export enum Route {
    Meals = "meals",
    Allergens = "allergenes",
    Locations = "locations"
}

export enum FilterType {
    DietaryPreference,
    Location,
    Allergen,
    Group
}

export enum DietaryPreferenceCodes {
    Vegetarian = "vegetarian",
    Vegan = "vegan",
    All = "all"
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
            allLocations: [] as Location[],
            selectedCity: (localStorage.getItem("city") || "Lübeck") as string,
            locationsInCity: [] as Location[],
            allergenes: [] as Allergene[],
            mealPlan: {} as Speiseplan,
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
            this.checkLocalStorageVersion();
            this.loadSettings();
            await this.loadLocations();
            await this.loadAllergens();
            await this.loadMeals();
            this.loadFilter();
            this.filter();
        },
        async checkLocalStorageVersion() {
            const version = localStorage.getItem("version");
            if (version !== "1") {
                localStorage.clear();
                localStorage.setItem("version", "1");
            }
        },
        async loadLocations() {
            const reponse = await fetch(`${ENDPOINT}/${Route.Locations}`);
            const locations = await reponse.json() as LocationRequest;
            console.log(locations)
            this.allLocations = locations.data;
            this.locationsInCity = locations.data.filter((location) => location.city === this.selectedCity);
        },
        async loadAllergens() {
            const allergens = await this.makeRequest<AllergeneRequest>(Route.Allergens);
            this.allergenes = allergens.data;
        },
        async loadMeals() {
            const meals = await this.makeRequest<MealRequest>(Route.Meals);
            meals.data.forEach(m => {
                m.date = new Date(m.date)
            })
            console.log(meals.data)
            this.mealPlan = {
                lastUpdate: new Date(meals.last_updated),
                days: meals.data.reduce((a: Days, m: Meal) => {
                    const day = a.find((d) => d.date.getDate() === m.date.getDate() && d.date.getMonth() === m.date.getMonth() && d.date.getFullYear() === m.date.getFullYear()) || { date: m.date, meals: [] };
                    day.meals.push(m);
                    a.push(day);
                    return a;
                }, [] as Days)
            }
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
            this.allergenes.sort((a, b) => a.name.localeCompare(b.name));

            this.allergenes.forEach((allergen) => {
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

            const locations = this.locationsInCity.map((loc) => {
                return {
                    name: loc.name,
                    type: FilterType.Location,
                    code: loc.code,
                    active: true
                }
            })
            availableFilter.push(...locations)

            const groups = [
                {
                    name: "Studi",
                    type: FilterType.Group,
                    code: Group.Students,
                    active: true
                },
                {
                    name: "Mitarbeiti",
                    type: FilterType.Group,
                    code: Group.Employees,
                    active: false
                },
                {
                    name: "Gasti",
                    type: FilterType.Group,
                    code: Group.Guests,
                    active: false
                }
            ]

            availableFilter.push(...groups);

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
            console.log(this.selectedLocations)
            const url = `${ENDPOINT}/${route}?location=${this.selectedLocations.map((location) => location.code).join(",")}`;
            console.log(url)
            const response = await fetch(url);
            return await response.json() as T;
        },
        filter() {
            const meals = this.mealPlan.days.find((day) => day.date.getDate() === this.date.getDate())?.meals ?? [];

            const filtered = meals.filter((meal) => {
                let location = false;
                let dietaryPreference = false;
                let allergen = false;

                const locations = this.activeFilter.filter((filter) => filter.type === FilterType.Location)
                if (locations.filter((e) => e.code === meal.location.code).length > 0) location = true;

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
        async setCity(city: string) {
            this.selectedCity = city;
            this.locationsInCity = this.allLocations.filter((location) => location.city === city);
            localStorage.setItem("city", city);
            await this.init();
        },
        toggleFilter(filter: Filter) {
            if (filter.type === FilterType.DietaryPreference) {
                this.allFilter.forEach((f) => {
                    if (f.type === FilterType.DietaryPreference) {
                        f.active = false;
                    }
                })
            }

            if (filter.type === FilterType.Group) {
                this.allFilter.forEach((f) => {
                    if (f.type === FilterType.Group) {
                        f.active = false;
                    }
                })
            }

            filter.active = !filter.active;
            localStorage.setItem("allFilter", JSON.stringify(this.allFilter));
            this.filter();
        },
    },
    getters: {
        activeFilter(): Filter[] {
            return this.allFilter.filter((filter) => filter.active);
        },
        selectedLocations(): Location[] {
            let filterToUse;
            if (this.allFilter.length > 0) {
                filterToUse = this.allFilter
            } else {
                filterToUse = JSON.parse(localStorage.getItem("allFilter") || "[]") as Filter[];
                console.log(filterToUse)
            }
            const locationFilters = filterToUse.filter((filter) => filter.type === FilterType.Location)

            if (locationFilters.length === 0) {
                return this.locationsInCity;
            } else {
                return locationFilters.filter((filter) => filter.active).map((filter) => this.allLocations.find((location) => location.code === filter.code) as Location).filter((location) => location !== undefined) as Location[];
            }
        }
    }
})

