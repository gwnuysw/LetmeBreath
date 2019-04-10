let express = require('express');
let router = express.Router();
let http = require('http');
var parser = require('xml2json');
let station = require('../schemas/station');
let promiseLimit = require('promise-limit');


/* GET station name from public data portal */
router.get('/', function(req, res, next) {
  /*시도 이름 (서울, 부산, 대구, 인천, 광주,
            대전, 울산, 경기, 강원, 충북,
            충남, 전북, 전남, 경북, 경남,
            제주, 세종)*/
  let city = ['%EC%84%9C%EC%9A%B8','%EB%B6%80%EC%82%B0','%EB%8C%80%EA%B5%AC','%EC%9D%B8%EC%B2%9C','%EA%B4%91%EC%A3%BC',
              '%EB%8C%80%EC%A0%84','%EC%9A%B8%EC%82%B0','%EA%B2%BD%EA%B8%B0','%EA%B0%95%EC%9B%90','%EC%B6%A9%EB%B6%81',
              '%EC%B6%A9%EB%82%A8','%EC%A0%84%EB%B6%81','%EC%A0%84%EB%82%A8','%EA%B2%BD%EB%B6%81','%EA%B2%BD%EB%82%A8',
              '%EC%A0%9C%EC%A3%BC','%EC%84%B8%EC%A2%85'];
  let options = {
    hostname: 'openapi.airkorea.or.kr',
    path: ''
  };
  let prevUri = '/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=100&pageNo=1&sidoName=';
  let postUri = '&ver=1.3';
  let limit = promiseLimit(1);
  let countStation = 0;
  function dataRequest(element){
    return new Promise((resolve, reject)=>{
      console.log('start request ',element);
      options.path = prevUri+element+postUri;
      http.request(options, function(response){
        resolve(response);
      }).end();
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
        let json = JSON.parse(parser.toJson(xml));
        for (let item of json.response.body.items.item){
          countStation++;
          let newStation = new station({
            name : item.stationName
          })
          newStation.save();
        }
      });
      console.log('numberOfcount : ',countStation);
    });
  });
  res.render('index', { title: 'Express'});
});

module.exports = router;
