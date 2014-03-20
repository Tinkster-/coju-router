## coju-router API

A router is not provided as part of the core of coju as it's simply a prettier way of listening to request events being fired and thus is not actually **necessary** to make any project functional.

The API provides access to the most common verbs in the HTTP _'language'_.

####`coju.{VERB}(string route, Function callback)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *6: Development*

There are various verbs that coju has that connect has. They are all **lowercase**, here's the list:

* get
* post
* head
* put
* delete
* options
* trace

Some of the above you'll never use or need, they are for full bodied rest api's, if you register a `coju.post()` listener and request that resource with another verb the response will be a `501 Not Implemented` header or a `505 Not Supported` header.

---

	{
    	let
    	  coju   = require('coju'),
	      router = require('coju-router')(coju),
    	  routes = require('routes');
    		
    	coju.get('/', routes.index);
    	coju.post('/login', routes.login);
    	
	    coju.listen(1811);
    }

####`coju.verbs(array verbs, string route, Function callback)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *6: Development*

If you want to set up a route to respond to varying http verbs with one common middleware you can use the `coju.verbs()` function and list all the verbs you want to subscribe to as an array instead of using the various `coju.{verb}` functions separately.

> **I don't recommend the usage of this function as you can use the `coju.on('request', myMiddleware);` function and avoid the extra work.**

---

	{
      let
        coju   = require('coju'),
	    router = require('coju-router'),
    	routes = require('./routes');
    		
      router.verbs(['post', 'put', 'get', 'delete'], '/', routes.myRestApiHandler);
    	
	  coju.listen(1811);
    }

####`coju.all(string route, Function callback)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *6: Development*

Want something to respond to all registered types of http verb? Use this function.

> **I don't recommend the usage of this function as you can use the `coju.on('request', myMiddleware);` function and avoid the extra work.**

---

	{
      let
    	coju   = require('coju'),
	    router = require('coju-router'),
    	routes = require('./routes');
    		
      router.all('/', routes.myRestApiHandler);
    	
	  coju.listen(1811);
    }

####`coju.load(Object routes)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *6: Development*

Register a large object of routes for varying verbs, all verbs available in the router are available as options in your object.

This also allows for routing via an external provider as well as loading files from disk containing your router config.

---
**index.js**

	{
      let
    	coju   = require('coju'),
	    router = require('coju-router'),
    	routes = require('./routes');
    		
      router.load(routes);
    	
	  coju.listen(1811);
    }
    
**./routes/index.js**

	{
      module.exports = {
        "post" : [
          {
            "route"      : "/login",
            "middleware" : [
              function (req, res) {
                // Something..
              },
              function (req, res) {
                // Something..
              }
            ]
          }
        ],
    
        "get" : [
          {
            "route"      : "/logout",
            "middleware" : require('./middleware/user').logout
          }
        ]
      }
    }


    
####`coju.authorisation(Function adapter)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *6: Development*

Have a protected resource? Stick it behind a basic or digest type authentication mechanism, this function takes one argument and that is the adapter you wish to use to provide the protection.

API TBD

### Writing Middleware

Unlike with Express/Connect middleware is not registered via a `use` call, if we're writing a module we imply it's usage by subscribing to our varying events (yes, if you configure coju to not fire these events all of your middleware will stop working) see this example, a simple IP blocker.

#####index.js

	{
		let
		  coju = require('coju'),
		  ipban = require('./middleware/ip-ban');
			
		// On all requests, check for banned IP addresses.
		ipban(coju);
		
		// Create server
		coju.listen(1811);
	}
	
#####middleware/ipban.js

	{
		
		function getRemoteIPAddress(req) {
		  return (req.headers['x-forwarded-for'] || '').split(',')[0] 
            || req.connection.remoteAddress; 
		}
		
		function ipban(req, res) {
		  let banned = ['8.8.8.8', '127.0.0.1'];
		  if (banned.indexOf(getRemoteIPAddress(req))) {
		    res.writeHead(403, {'Content-Type': 'text/plain'});
			res.end("Nope. No access, banned IP.");
		  }
		}
		
		module.exports = function(coju) {
		  coju('request', ipban);
		};
	}