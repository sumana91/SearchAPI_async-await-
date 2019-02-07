var request = require('request');
var fetch = require("node-fetch");
var water_access_token = 'J7UbRTNYzE_BG8uxv-K5';
var geocode_token = '545960717004592958118x1766';
var express = require('express');
var app = express();
var geocode_url = 'https://geocode.xyz/';
var metaweather_url = 'https://www.metaweather.com/api/location/search/';
var woeid_url = 'https://www.metaweather.com/api/location/';
var onwater_url = 'https://api.onwater.io/api/v1/results/'

var PORT ="5000";

const requester = {
    makeRequest: async function(url) {
      const response = await fetch(url);
      const json = await response.json();
      return json;
    }
};

//search API , takes city name as its parameter
app.get('/search', function(req, res, next) {
  getCityInfo(req, res)
})

async function getCityInfo(req, res)
{
  try{
      var city = await requester.makeRequest(`${geocode_url}?locate=${req.query.q}
        &json=1&auth=${geocode_token}`);
        var final_result = []

        // request to get list of cities closer to that location,
        //takes latitude and longitude as parameters
        var closer_cities = await requester.makeRequest(
          `${metaweather_url}?lattlong=${city.latt},${city.longt}`);
          var cities_len = closer_cities.length;

          for (i = 0; i < closer_cities.length; i++) {
            woeid = closer_cities[i].woeid
            //request to get weather using woeid parameter
            var weather = await requester.makeRequest(woeid_url + woeid);
            var onwater = await requester.makeRequest(
              `${onwater_url}${weather.latt_long}?access_token=${water_access_token}`);

              var result = Object.assign(weather, onwater)
              final_result.push(result)

              if (final_result.length == cities_len) {
                res.status(200).json({error: false, data: {message: final_result}
                })
              }
            }
        } catch (err) {
          res.status(500).json({error: true, data: {message:'Location not found'}})
        }
    }

app.use(express.static(__dirname+'/public'));

app.listen(PORT,function(err){
    if(!err){
        console.log('Server started @ :'+ PORT);
    }
});
