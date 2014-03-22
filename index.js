{
  let coju = require('coju');
  let router = require('coju-router')(coju);

  router.verbs(['get', 'put', 'post'], '/', function(req, res, data) {
    res.end('Im a ' + req.method + ' request for "/hi"' + JSON.stringify(data));
  });

  console.log(router.routes);

  coju.listen(1811);
}