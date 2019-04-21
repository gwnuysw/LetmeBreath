let express = require('express');
let router = express.Router();
let http = require('http');
let station = require('../schemas/station');
let pinedust = require('../schemas/pinedust');
let promiseLimit = require('promise-limit');
let parser = require('xml2js').parseString;
let prettyjson = require('prettyjson');
/* GET station name from public data portal */
router.get('/:dmx?/:dmy?', async function(req, res, next) {
  let data = {
    dmx: req.params.dmx,
    dmy: req.params.dmy
  };
  console.log(req.params.dmx,' ', req.params.dmy);
  let docs = await station.find({});
  let shortDistance = docs.map((element)=>{
    let x, y;
    let distance;
    x = (element.dmx - data.dmx);
    y = (element.dmy - data.dmy);
    distance = (x * x) + (y * y);
    return {
      name: element.name,
      distance: distance
    };
  });
  shortDistance.sort((a,b)=>{
    if(a.distance < b.distance){
      return -1;
    }
    else if (a.distance > b.distance){
      return 1;
    }
    else{
      return 0;
    }
  });
  let target = await pinedust.findOne({name:shortDistance[0].name});
  let result={};
  let stringedJSON;
  let prettiedJSON;
  let properties;
  target.pinedust = target.pinedust[0];
  target.pinedust.name = target.name;
  // prettiedJSON = prettyjson.render(target.pinedust, {noColor:true});
  stringedJSON = JSON.stringify(target.pinedust);
  // properties = Object.keys(target.pinedust);
  // console.log(properties);
  res.render('showdust', { title: 'Express', pinedust: stringedJSON});
});
module.exports = router;
