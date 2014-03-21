{
  let coju = require('coju');
  let router = require('coju-router')(coju);

  router.get('/hi', function(req, res) {
    console.log('Im a get request for "/hi"');
  });

  coju.listen(1811);
}