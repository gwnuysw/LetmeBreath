let express = require('express');
let router = express.Router();
let http = require('http');
let station = require('../schemas/station');
let pinedust = require('../schemas/pinedust');
let promiseLimit = require('promise-limit');
var parser = require('xml2js').parseString;
/* GET station name from public data portal */
router.get('/', function(req, res, next) {

  // let stations = [];
  let options = {
    hostname: 'openapi.airkorea.or.kr',
    path: ''
  };
  let prevUri = '/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=24&pageNo=1&stationName=';
  let postUri = '&dataTerm=DAILY&ver=1.3';
  let limit = promiseLimit(1);
  let countStation = 0;
  function dataRequest(element, city){
    return new Promise((resolve, reject)=>{
      setTimeout(
        function(){
          options.path = prevUri+element+postUri;
          http.request(options, function(response){
            resolve([response, city]);
          }).end()
        }, 1000);
    })
  }
  function extractData(response, element){
    return new Promise ((resolve, reject)=>{
      let data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        resolve([data, element]);
      });
    });
  }

/**/
  station.find({})
  .then((result)=>{
    stations = result;
    Promise.all(stations.map((element)=>{
      return limit(()=>dataRequest(encodeURI(element.name), element.name));
    }))
    .then((responses)=>{
      Promise.all(responses.map(function(response){
        return extractData(response[0], response[1]);
      }))
      .then((xmls)=>{
        xmls.map((xml)=>{
          parser(xml, async function(err, object){
            pinedust.find({name:xml[1]})
            .then((result)=>{
              result.pinedust = json.response.body.items.item;
              result.save();
            })
          })
          //미세먼지 데이터 초기화
          // let newPindust = new pinedust({
          //   name : xml[1],
          //   pinedust : json.response.body.items.item
          // })
          // newPindust.save();
          // countStation++;
        });
        console.log('numberOfcount : ',countStation);
      });
    });
  })

  res.render('index', { title: 'Express'});
});

module.exports = router;
