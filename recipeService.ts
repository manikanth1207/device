import * as request from 'request-promise';

export function getRecipes() {
    return [{
        key: "verona",
        name: "Verona",
        version: "1.0.0",
        ingredients: {
            water: {
                amount: 17,
                temperature: 170
            },
            verona: {
                amount: 30
            }
        }
    },
    {
        key: "hotchoc",
        name: "Hot Chocolate",
        version: "1.0.0",
        ingredients: {
            water: {
                amount: 17,
                temperature: 170
            },
            chocolate: {
                amount: 30
            }
        }
    }
    ]
}