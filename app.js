const https = require('https');
const http = require('http');

const TYPES = {
    characters: 'characters',
    planets: 'planets',
    starships: 'starships',
    vehicles: 'vehicles',
    species: 'species'
}

let Film = class {
    constructor() {

    }
};

const runAPI = async () => {
    let films = [],
        planets = [],
        starships = [];
    for (let i = 1; i <= 6; i++) {
        try {
            const res = await makeRequest(`https://swapi.dev/api/people/${i}/`);
            films = films.concat(res.films);
        } catch (error) {
            console.log(error);
        }
    }

    films = [... new Set(films)];
    for (const filmUrl of films) {
        try {
            console.log(filmUrl)
            const filmItems = await makeRequest(filmUrl);
            planets = planets.concat(filmItems.planets);
            starships = starships.concat(filmItems.starships);
        } catch (error) {
            console.log(error);
        }
    }
    planets = [... new Set(planets)];
    starships = [... new Set(starships)];
    console.log(films);
    console.log(planets);
    console.log(starships);

}

const makeRequest = url => {
    return new Promise((resolve, reject) => {
        if (/^https/.test(url)) {
            https.get(url, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    body = JSON.parse(body);
                    resolve(body);
                });
            });
        } else {
            http.get(url, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    body = JSON.parse(body);
                    resolve(body);
                });
            });
        }
    });
};

runAPI();