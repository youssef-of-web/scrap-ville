const express = require('express');

const rp = require('request-promise');
const cheerio = require('cheerio')
const Router = express.Router();
const fs = require('fs');
const { toXML } = require("jstoxml");
const data = require('./data/CountriesV1.json')
const dataCity = require('./data/CitiesV2.json')
/* scrap data */
const scrap = async (req, res) => {

    await rp("http://www.levoyageur.net/distances/distance.html")
        .then(async (html) => {
            const countries = [];
            const $ = cheerio.load(html)
            await $('#pays option').each(async (i, el) => {
                const country_name = $(el).html()
                const country_value = $(el).attr('value')
                let object = {
                    CountryName: country_name,
                    CountryValue: country_value,
                    City: []
                }


                await rp(
                    {
                        method: 'POST',
                        uri: 'http://www.levoyageur.net/distances/ville.php',
                        form: {
                            idPays: country_value
                        }
                    })
                    .then(async (data2) => {
                        const $city = cheerio.load(data2)
                        await $city('option').each(async (e, el2) => {
                            const city_name = $city(el2).html()
                            const city_value = $city(el2).attr('value')

                            const object_city = {
                                CityName: city_name
                            }
                            object.City.push(object_city)

                        })

                        countries.push(object);

                        if (countries.length === 214) {
                            await fs.writeFile(`./data/CountriesV1.json`, JSON.stringify({ Country: countries }), (err, res) => {
                                if (err) {
                                    console.log(`${err}`);
                                }
                                console.log(`success`);
                            })
                        }


                    })
                    .catch(err => console.log(`${err}`))


            })

        })
        .catch(err => console.log(`${err}`))
}

/* scrap distance  */
const scrap_ds = async (req, res) => {
    /* const all = []

    for (var index = 0; index < data.Country.length; index++) {
        const element = data.Country[index];

        for (var index2 = 0; index2 < element.City.length; index2++) {
            const element2 = element.City[index2];
            all.push(element2)

        }

    } */
    /* await fs.writeFile(`./data/CitiesV2.json`, JSON.stringify({ City: all }), (err, res) => {
        if (err) {
            console.log(`${err}`);
        }
        console.log(`success`);
    }) */
    /* scrap data */

    const all = []
    for (let index = 0; index < dataCity.City.length; index++) {
        for (let index2 = 0; index2 < dataCity.City.length; index2++) {
            const element = dataCity.City[index].CityValue;
            const IncElement = dataCity.City[index2].CityValue;
            const object = {
                CountryStart: '',
                CountryEnd: '',
                CityStart: '',
                CityEnd: '',
                Distance: ''
            }
            await rp(`http://www.levoyageur.net/distances/distance-${element}-${IncElement}.html`)
                .then(html => {
                    const $ = cheerio.load(html)
                    $('.tableau_50g').eq(0).each((i, el) => {
                        object.CountryStart = $(el).find('.bleu12g').find('b').text()
                        object.CityStart = $(el).find('b').eq(1).text()
                    })
                    $('.tableau_50g').eq(1).each((i, el) => {
                        object.CountryEnd = $(el).find('.bleu12g').find('b').text()
                        object.CityEnd = object.CityEnd = $(el).find('b').eq(1).text()
                    })
                    object.Distance = $('.tableau_100').eq(1).text().trim()
                })
                .catch(err => console.log(err))
            all.push(object)

        }

    }
    console.log("WAITING PLEASE")
    await fs.writeFile(`./data/DistanceV1.json`, JSON.stringify(all), (err, res) => {

        if (err) {
            console.log(`${err}`);
        }
        console.log(`SUCCESS`);
    })




}

Router.get('/ville', scrap)
Router.get('/distance', scrap_ds)







module.exports = Router;