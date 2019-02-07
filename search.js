var request = require('request');
var fetch = require("node-fetch");
var water_access_token = 'J7UbRTNYzE_BG8uxv-K5';
var geocode_token = '	545773061045388591244x1764';
var express = require('express');
var app = express();
var geocode_url = 'https://geocode.xyz/';
var metaweather_url = 'https://www.metaweather.com/api/location/search/';
var woeid_url = 'https://www.metaweather.com/api/location/';
var onwater_url = 'https://api.onwater.io/api/v1/results/'
var PORT ="5000";

//search API , takes city name as its parameter
app.get('/search', function(req, res, next) {
  const requester = {
      lastRequest: new Date(),
      makeRequest: async function(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
      }
  };
  requester.makeRequest(geocode_url +`?locate=${req.query.q}&json=1`
    + geocode_token)
  .then(function(city){
    var final_result = []
    var lat = city.latt;
    var long = city.longt;
    // request to get list of cities closer to that location,
    //takes latitude and longitude as parameters
    requester.makeRequest(metaweather_url + '?lattlong='
     + lat + ',' + long)
    .then(function(closer_cities) {
      var cities_len = closer_cities.length
      for(i = 0; i < closer_cities.length; i++) {
        woeid = closer_cities[i].woeid
        //request to get weather using woeid parameter
        requester.makeRequest(woeid_url + woeid)
        .then(function(weather) {
          var lattlong = weather.latt_long;
          requester.makeRequest(onwater_url+ lattlong +
          '?access_token=' + water_access_token)
          .then(function(onwater) {
            var temp = Object.assign(weather, onwater)
            final_result.push(temp)
            if (final_result.length == cities_len) {
              res.status(200).json({error: false,
                data: {message: final_result}})
            }
          })
        })
       }
      })
    })
  })

app.use(express.static(__dirname+'/public'));

app.listen(PORT,function(err){
    if(!err){
        console.log('Server started @ :'+ PORT);
    }
});
