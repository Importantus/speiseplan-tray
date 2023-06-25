const ENDPOINT = "https://speiseplan.mcloud.digital/meals";

enum Week {
    Current = "current",
    Next = "next"
}

interface Allergenes {
    code: string;
    name: string;
}

interface Meal {
    name: string;
    price: string;
    vegetarian: boolean;
    vegan: boolean;
    location: string;
    allergens: Allergenes[];
}

interface Day {
    date: Date;
    week: Week;
    open: boolean;
    meals: Meal[];
}

type Speiseplan = Day[];

export default async function getData(): Promise<Speiseplan> {
    const response = await fetch(`${ENDPOINT}`);
    const data: Speiseplan = await response.json();

    // Make sure the date is a Date object.
    data.forEach((day) => {
        day.date = new Date(day.date);
    });

    return data;
}

export type { Speiseplan, Day, Meal, Allergenes };
