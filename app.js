process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const planets = [];
const films = [];
const characters = [];
const species = [];
const starshipss = [];

class Planet {
    constructor(name, terrain, gravity, diameter, population, url) {
        this.name = name;
        this.terrain = terrain;
        this.gravity = gravity;
        this.diameter = diameter;
        this.population = population;
        this.url = url
    }
    static async create(url) {
        let planetObj;
        if (planets.length) {
            planetObj = planets.find(planet => planet.url === url);
        }
        if (!planetObj) {
            const { name, terrain, gravity, diameter, population } = await makeRequest(url);
            planetObj = new Planet(name, terrain, gravity, diameter, population, url);
            planets.push(planetObj);
        };
        return planetObj;
    }
}

class Character {
    constructor(name, gender, hairColor, skinColor, eyeColor, height, homeworld, url) {
        this.name = name;
        this.gender = gender;
        this.hairColor = hairColor;
        this.skinColor = skinColor;
        this.eyeColor = eyeColor;
        this.height = height;
        this.homeworld = homeworld;
        this.url = url;
    }
    static async create(url) {
        let character;
        if (characters.length) {
            character = characters.find(character => character.url === url);
        }
        if (!character) {
            const { name, gender, hair_color, skin_color, eye_color, height, homeworld } = await makeRequest(url);
            const homeworldObj = await Planet.create(homeworld);
            character = new Character(name, gender, hair_color, skin_color, eye_color, height, homeworldObj.name, url);
            characters.push(character);
        };
        return character;
    }
}

class Specie {
    constructor(name, language, averageHeight, url) {
        this.name = name;
        this.language = language;
        this.averageHeight = averageHeight;
        this.url = url
    }
    static async create(url) {
        let specieObj;
        if (species.length) {
            specieObj = species.find(specie => specie.url === url);
        }
        if (!specieObj) {
            const { name, language, average_height } = await makeRequest(url);
            specieObj = new Specie(name, language, average_height, url);
            species.push(specieObj);
        };
        return specieObj;
    }
}

class Starship {
    constructor(name, model, manufacturer, passengers, url) {
        this.name = name;
        this.model = model;
        this.manufacturer = manufacturer;
        this.passengers = passengers;
        this.url = url
    }

    static create(obj) {
        if (!(obj instanceof Starship)) {
            obj = new Starship(obj.name, obj.model, obj.manufacturer, obj.passengers, obj.url);
            starshipss.push(obj);
        }
        return obj;
    }
}

class Film {
    constructor(name, planets, characters, species, largestStarship, url) {
        this.name = name;
        this.planets = planets;
        this.characters = characters;
        this.species = species;
        this.largestStarship = largestStarship;
        this.url = url;
    };

    static async create(url) {
        let film;
        console.log(`Creating Film: ${url}`);
        let planetsObjs = [],
            charactersObjs = [],
            speciesObjs = [],
            largestStarship;
        const { title, planets, characters, species, starships } = await makeRequest(url);
        for (const planet of planets) {
            const planetObj = await Planet.create(planet);
            planetsObjs.push(planetObj);
        }
        console.log(`Finished planets creation`);
        for (const character of characters) {
            const characterObj = await Character.create(character);
            charactersObjs.push(characterObj);
        }
        console.log(`Finished characters creation`);
        for (const specie of species) {
            const specieObj = await Specie.create(specie);
            speciesObjs.push(specieObj);
        }
        console.log(`Finished species creation`);
        for (const starship of starships) {
            let starshipRes;
            if (starshipss.length) {
                starshipRes = starshipss.find(starship => starship.url === starship);
            }
            if (!starshipRes) {
                starshipRes = await makeRequest(starship);
            }
            if (!largestStarship) {
                largestStarship = starshipRes;
            }
            if (parseFloat(starshipRes.length) > parseFloat(largestStarship.length)) {
                largestStarship = starshipRes
            }
        }
        largestStarship = Starship.create(largestStarship);
        console.log(`Finished starship creation \n`);
        film = new Film(title, planetsObjs, charactersObjs, speciesObjs, largestStarship, url);
        films.push(film);
    }
}

const runAPI = async () => {
    for (let i = 1; i <= 2; i++) { //films = 6
        try {
            await Film.create(`https://swapi.dev/api/films/${i}/`);
        } catch (error) {
            console.log(error);
        };
    }

    console.log(films);
    console.log(planets);
}

const makeRequest = url => {
    return new Promise((resolve, reject) => get(httpToHttps(url), resolve, reject));
}

const httpToHttps = url => /^http:\/\//.test(url) ? url.replace('http', 'https') : url;

const get = (url, resolve, reject) => {
    https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            return get(httpToHttps(res.headers.location), resolve, reject)
        }

        let body = [];

        res.on("data", (chunk) => {
            body.push(chunk);
        });

        res.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(body).toString()));
            } catch (err) {
                reject(err);
            }
        });
    });
}

runAPI();