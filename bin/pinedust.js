let express = require('express');
let router = express.Router();
let http = require('http');
let station = require('../schemas/station');
let pinedust = require('../schemas/pinedust');
let promiseLimit = require('promise-limit');
var parser = require('xml2js').parseString;
/* GET station name from public data portal */


function askdust() {
  console.log("exe askdust")
  function DustdataRequest(element, city){
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
  function StationdataRequest(element){
    return new Promise((resolve, reject)=>{
      setTimeout(
        function(){
          options.path = stationPrevUri+element;
          http.request(options, function(response){
          resolve(response);
      }).end()}, 1000);
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
  let options = {
    hostname: 'openapi.airkorea.or.kr',
    path: ''
  };
  let limit = promiseLimit(1);
  let countStation = 0;

  //도시별로 측정소 정보를 가져옵니다.
  let stationPrevUri = '/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=100&pageNo=1&addr=';
  /*시도 이름 (서울, 부산, 대구, 인천, 광주,
            대전, 울산, 경기, 강원, 충북,
            충남, 전북, 전남, 경북, 경남,
            제주, 세종)*/
  let city = ['%EC%84%9C%EC%9A%B8','%EB%B6%80%EC%82%B0','%EB%8C%80%EA%B5%AC','%EC%9D%B8%EC%B2%9C','%EA%B4%91%EC%A3%BC',
              '%EB%8C%80%EC%A0%84','%EC%9A%B8%EC%82%B0','%EA%B2%BD%EA%B8%B0','%EA%B0%95%EC%9B%90','%EC%B6%A9%EB%B6%81',
              '%EC%B6%A9%EB%82%A8','%EC%A0%84%EB%B6%81','%EC%A0%84%EB%82%A8','%EA%B2%BD%EB%B6%81','%EA%B2%BD%EB%82%A8',
              '%EC%A0%9C%EC%A3%BC','%EC%84%B8%EC%A2%85'];
  Promise.all(city.map((element)=>{
    return limit(()=>StationdataRequest(element));
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
              doc.dmy = item.dmY[0];
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
        });
      });

    });
  });

  //측정소 정보를 이용해서 미세먼지 측정 정보를 조회 합니다.
  let prevUri = '/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=24&pageNo=1&stationName=';
  let postUri = '&dataTerm=DAILY&ver=1.3';
  station.find({})
  .then((result)=>{
    stations = result;
    Promise.all(stations.map((element)=>{
      return limit(()=>DustdataRequest(encodeURI(element.name), element.name));
    }))
    .then((responses)=>{
      Promise.all(responses.map(function(response){
        return extractData(response[0], response[1]);
      }))
      .then((xmls)=>{
        xmls.map((xml)=>{
          parser(xml, async function(err, object){
            let doc = await pinedust.findOne({name:xml[1]});
            let dustData = object.response.body[0].items[0].item;
            let trimed = dustData.map((hourData)=>{
              for(let key in hourData){
                hourData[key] = hourData[key][0];
              }
              return hourData;
            });
            if(doc != undefined){
              doc.pinedust = trimed;
              await doc.save();
            }
            else{
              let newPindust = new pinedust({
                name : xml[1],
                pinedust : trimed
              })
              await newPindust.save();
            }
          })
          //미세먼지 데이터 초기화
          // let newPindust = new pinedust({
          //   name : xml[1],
          //   pinedust : json.response.body.items.item
          // })
          // newPindust.save();
          // countStation++;
        });
      });
    });
  })
};

module.exports = askdust;
