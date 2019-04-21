let express = require('express');
let router = express.Router();
let http = require('http');
var parser = require('xml2js').parseString;
let station = require('../schemas/station');
let promiseLimit = require('promise-limit');


/* GET station name from public data portal */
router.get('/', function(req, res, next) {
  /*시도 이름 (서울, 부산, 대구, 인천, 광주,
            대전, 울산, 경기, 강원, 충북,
            충남, 전북, 전남, 경북, 경남,
            제주, 세종)*/
  let city = ['%EC%84%9C%EC%9A%B8','%EB%B6%80%EC%82%B0','%EB%8C%80%EA%B5%AC','%EC%9D%B8%EC%B2%9C','%EA%B4%91%EC%A3%BC',
              '%EB%8C%80%EC%A0%sBC','%EC%84%B8%EC%A2%85'];
  let options = {
    hostname: 'openapi.airkorea.or.kr',
    path: ''
  };
  let prevUri = '/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=100&pageNo=1&addr=';
  let limit = promiseLimit(1);
  let countStation = 0;
  function dataRequest(element){
    return new Promise((resolve, reject)=>{
      setTimeout(
        function(){
          console.log('start request ',element);
          options.path = prevUri+element;
          http.request(options, function(response){
          resolve(response);
      }).end()}, 1000);
    })
  }
  function extractData(response){
    return new Promise ((resolve, reject)=>{
      let data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        resolve(data);
      });
    });
  }
  Promise.all(city.map((element)=>{
    return limit(()=>dataRequest(element));
  }))
  .then(responses=>{
    Promise.all(responses.map(function(response){
      return extractData(response);
    }))
    .then(xmls=>{
      xmls.map((xml)=>{
        parser(xml, async function(err, object){
          for (let item of object.response.body[0].items[0].item){
            countStation++;
            let doc, temp;
            doc = await station.findOne({name:item.stationName[0]});
            if(doc != undefined){
              doc.dmx = item.dmX[0];
              doc.dmx = item.dmY[0];
              await doc.save();
            }
            else{
              let newStation = new station({
                name : item.stationName[0],
                dmx : item.dmX[0],
                dmy : item.dmY[0]
              })
              await newStation.save();
            }
          }
          console.log('numberOfcount : ',countStation);
        });
      });

    });
  });
  res.render('index', { title: 'Express'});
});

module.exports = router;
