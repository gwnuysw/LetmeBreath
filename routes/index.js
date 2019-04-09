var express = require('express');
var router = express.Router();
var http = require('http');
var options = {
    hostname: 'openapi.airkorea.or.kr',
    path: '/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureLIst?serviceKey=ourKx7GX1hiVXuydX8SKTR4guDtUKIWAQ%2Fh02M4VM9dzsA7o3OfS1wa6VgdZFrLUrYLqTSFiQZJ821JHALxR%2FQ%3D%3D&numOfRows=10&pageNo=1&itemCode=PM10&dataGubun=HOUR&searchCondition=MONTH'
  };

function handleResponse(response) {
  var serverData = '';
  response.on('data', function (chunk) {
    serverData += chunk;
  });
  response.on('end', function () {
    console.log("received server data:");
    console.log(serverData);
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  http.request(options, function(response){
    handleResponse(response);
  }).end();
  res.render('index', { title: 'Express' });
});

module.exports = router;
