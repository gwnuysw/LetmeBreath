let express = require('express');
let router = express.Router();
let statistics = require('../schemas/stats');
let breathIn = require('../schemas/breathIn');
//나의 통계치 계산
router.get('/mystats', async function(req, res, next){
  if(req.user){

    let docs = await breathIn.find({userid: req.user[0].id});
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

    let bigInDust = docs[0].dust;
    let smallInDust = docs[docs.length - 1].dust;

    docs.sort(function(a,b){
      return a.finedust - b.finedust;
    })

    let bigInFineDust = docs[0].finedust;
    let smallInFineDust = docs[docs.length - 1].finedust;

    for(data of docs){
      totaldust += data.dust;
      totalFinedust += data.finedust;
    }
    let exsistStats = await statistics.find({id: req.user[0].id});
    if(exsistStats){
      await statistics.update({userid:req.user[0].id},{$set:{
        totaldust : totaldust,
        totalFinedust : totalFinedust,
        DayAverageDust : totaldust/docs.length,
        DayAverageFinedust : totalFinedust/docs.length,
        bigInDust : bigInDust,
        smallInDust : smallInDust,
        bigInFineDust : bigInFineDust,
        smallInFineDust : smallInDust
      }});
      let exsistStats = await statistics.find({id: req.user[0].id});
      res.send(exsistStats[0]);
    }else{
      let stats = {};
      stats.id = req.user[0].id;
      stats.totaldust = totaldust;
      stats.totalFinedust = totalFinedust;
      stats.DayAverageDust = totaldust/docs.length;
      stats.DayAverageFinedust = totalFinedust/docs.length;
      stats.bigInDust = bigInDust;
      stats.smallInDust = smallInDust;
      stats.bigInFineDust = bigInFineDust;
      stats.smallInFineDust = smallInDust;
      let newstats = new statistics(stats);
      await newstats.save();
      res.send(stats);
    }
  }else{
    res.status('404').send("User Not Log in");
  }
});
router.get('/others',async function(req,res, next){

});
module.exports = router;
