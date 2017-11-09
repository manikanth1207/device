import * as request from 'request-promise';

export function getRecipes() {
    return [{
        key: "verona",
        name: "Verona",
        version: "1.0.0",
        ingredients: [
            {
                name: "water",
                amount: 17,
                temperature: 170
            },
            {
                name: "verona",
                amount: 30
            }
        ]
    },
    {
        key: "hotchoc",
        name: "Hot Chocolate",
        version: "1.0.0",
        ingredients: [
            {
                name: "water",
                amount: 17,
                temperature: 170
            },
            {
                name: "chocolate",
                amount: 30
            }
        ]
    }
    ]
}