let express = require('express');
let router = express.Router();
let http = require('http');
let station = require('../schemas/station');
let pinedust = require('../schemas/pinedust');
let promiseLimit = require('promise-limit');
let parser = require('xml2js').parseString;
let prettyjson = require('prettyjson');
let breathIn = require('../schemas/breathIn');
/* GET station name from public data portal */
router.get('/:dmx?/:dmy?', async function(req, res, next) {
  let data = {
    dmx: req.params.dmx,
    dmy: req.params.dmy
  };
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
  let stringedJSON;
  let prettiedJSON;
  let properties;
  target.pinedust = target.pinedust[0];
  target.pinedust.name = target.name;
  // prettiedJSON = prettyjson.render(target.pinedust, {noColor:true});
  stringedJSON = JSON.stringify(target.pinedust);
  // properties = Object.keys(target.pinedust);
  // console.log(properties);
  res.send(stringedJSON);
});
router.get('/:dmx?/:dmy?/:time?', async function(req, res, next) {
  let data = {
    dmx: req.params.dmx,
    dmy: req.params.dmy
  };
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
  result = target.pinedust.find((element)=>{
    return element.dataTime.includes(req.params.time+":00");
  })
  result.name = target.name;
  // prettiedJSON = prettyjson.render(target.pinedust, {noColor:true});
  stringedJSON = JSON.stringify(result);
  // properties = Object.keys(target.pinedust);
  // console.log(properties);
  res.send(stringedJSON);
});
router.get('/:date?/:dust?/:finedust?/:dmx?/:dmy?', async function(req, res, next){
  let data = {
    dmx: req.params.dmx,
    dmy: req.params.dmy
  };
  console.log(Number(req.params.date));
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
  if (req.user) {
    console.log(req.user);
    let newBreath = new breathIn({
      userid: req.user[0].id,
      createdAt: new Date(Number(req.params.date)),
      dust: req.params.dust,
      finedust: req.params.finedust,
      dmx: req.params.dmx,
      dmy: req.params.dmy,
      location: shortDistance[0].name
    })
    await newBreath.save();
    console.log(newBreath);
    res.send('ok');
      // logged in
  } else {
    res.status('404').send("User Not Log in")
      // not logged in
  }
});
module.exports = router;
