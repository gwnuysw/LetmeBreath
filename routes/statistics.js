let express = require('express');
let router = express.Router();
let statistics = require('../schemas/stats');
let breathIn = require('../schemas/breathIn');
//나의 통계치 계산
router.get('/mystats/:userid', async function(req, res, next){
  let docs = await breathIn.find({userid: req.params.userid});
  let totaldust = 0;
  let totalFinedust = 0;
  docs.sort(function(a,b){
    let c = new Date(a.createdAt);
    let d = new Date(b.createdAt);
    return c-d;
  });
  let firstDate = docs[0].createdAt;
  let lastDate = docs[docs.length - 1].createdAt;
  docs.sort(function(a,b){
    return a.dust - b.dust;
  });

  let smallInDust = docs[0].dust;
  let bigInDust = docs[docs.length - 1].dust;

  docs.sort(function(a,b){
    return a.finedust - b.finedust;
  })

  let smallInFineDust = docs[0].finedust;
  let bigInFineDust = docs[docs.length - 1].finedust;
  for(data of docs){
    totaldust += data.dust;
    totalFinedust += data.finedust;
  }
  let exsistStats = await statistics.find({id: req.params.userid});
  if(exsistStats.length != 0){
    await statistics.update({id:req.params.userid},{$set:{
      totaldust : totaldust,
      totalFinedust : totalFinedust,
      DayAverageDust : totaldust/docs.length,
      DayAverageFinedust : totalFinedust/docs.length,
      bigInDust : bigInDust,
      smallInDust : smallInDust,
      bigInFineDust : bigInFineDust,
      smallInFineDust : smallInFineDust
    }});
    let exsistStats = await statistics.find({id: req.params.userid});
    res.send(exsistStats[0]);
  }else{
    let stats = {};
    stats.id = req.params.userid;
    stats.totaldust = totaldust;
    stats.totalFinedust = totalFinedust;
    stats.DayAverageDust = totaldust/docs.length;
    stats.DayAverageFinedust = totalFinedust/docs.length;
    stats.bigInDust = bigInDust;
    stats.smallInDust = smallInDust;
    stats.bigInFineDust = bigInFineDust;
    stats.smallInFineDust = smallInFineDust;
    let newstats = new statistics(stats);
    await newstats.save();
    res.send(stats);
  }
});
router.get('/others/:userid',async function(req,res, next){
  let otherPeaple = await statistics.find();
  console.log(otherPeaple);
  let dustAverage = 0;
  let finedustAverage = 0;
  for(data of otherPeaple){
    dustAverage += data.DayAverageDust;
    finedustAverage += data.DayAverageFinedust;
  }
  dustAverage = dustAverage/otherPeaple.length;
  finedustAverage = finedustAverage/otherPeaple.length;

  otherPeaple.sort(function(a,b){
    return a.bigInDust - b.bigInDust;
  });
  let topIndust = otherPeaple[otherPeaple.length-1].bigInDust;
  otherPeaple.sort(function(a,b){
    return a.bigInFineDust - b.bigInFineDust;
  });
  let topInfinedust = otherPeaple[otherPeaple.length-1].bigInFineDust;

  let statsWithOhters = {
    dustAverage : dustAverage,
    finedustAverage : finedustAverage,
    topIndust : topIndust,
    topInfinedust : topInfinedust
  }
  res.send(statsWithOhters);
});
module.exports = router;
