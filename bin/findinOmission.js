let pinedust = require('../schemas/pinedust');
let station = require('../schemas/station');
/*미세먼지 불러올때 누락된 측정소 찾기*/
function findingOmission(){
  let staionName;
  pinedust.find({})
  .then(result=>{
    stationName = result.map(element=>element.name);
    console.log(result.length,stationName);
    station.find({name:{$nin:stationName}})
    .then(result=>{
      console.log(result.length);
      result.map(element=>{
        console.log(element.name);
      })
    })
  })
}

module.exports = findingOmission;
