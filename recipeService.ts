import * as request from 'request-promise';

export function getRecipes() {
    return request('http://pequod-recipe-api.azurewebsites.net/recipes')
        .then(response => JSON.parse(response));
}