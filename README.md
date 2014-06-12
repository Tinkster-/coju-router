## coju-router API

A router is not provided as part of the core of coju as it's simply a prettier way of listening to request events being fired and thus is not actually **necessary** to make any project functional.

The API provides access to the most common verbs in the HTTP _'language'_.

## Routes recieving data and parameterised URL's

When posting to a `coju-router` powered service coju will automatically create a data object and pass it to your callback, see the example below on a post handler.

```js
{
  let coju = require('coju');
  let router = require('coju-router')(coju);

  router.post('/myservice', function(request, response, postData) {
    console.log(postData);
    res.end('');
  });

  coju.listen(2014);
}
```

When you run `curl -d "first_name=Dave&last_name=Mackintosh" http://localhost:2014/myservice` you will see the below in your terminal;

```json
{
  "first_name": "Dave",
  "last_name": "Mackintosh"
}
```

No sanitisation of the data happens, that's left for you to do. You can also post JSON to a coju router and recieve it as the data inside your callback, it's worth nothing though that if you're using JSON as your input data format that you **must** set the header `'Content-Type': 'application/json'` on the request otherwise you'll see some funky things happen unexpectedly.

The other way of populating the data value is to use **parameterised URL's*** this is a common format across many front and back end frameworks, see the below example on how to set up a parameterised URL and the data object on request.

```js
{
  let coju = require('coju');
  let router = require('coju-router')(coju);

  router.get('/api/:service/:identifier', function(request, response, data) {
    console.log(data);
    res.end('');
  });

  coju.listen(2014);
}
```

Running `curl http://localhost:2014/api/users/123` you'll see this in your terminal;

```json
{
  "service": "users",
  "identifier": "123"
}
```

Two important things about the `POST` and parameterised URL data object, if you're posting to a parameterised URL and you have a parameter with the same name as one of your post keys the parameterised url will overwrite the post data, also if you post with the `Content-Type` of `application/json` and you don't send any JSON you'll not recieve any data to your callback.

####`coju.{VERB}(string route, Function callback)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *1: Stable*

There are various verbs that coju has that connect has. They are all **lowercase**, here's the list:

* get
* post
* head
* put
* delete
* options
* trace

Some of the above you'll never use or need, they are for full bodied rest api's, if you register a `coju.post()` listener and request that resource with another verb the response will simply not be fulfilled and time-out.

---

	{
    	let
    	  coju   = require('coju'),
	      router = require('coju-router')(coju),
    	  routes = require('routes');
    		
    	router.get('/', routes.index);
    	router.post('/login', routes.login);
    	
	    coju.listen(1811);
    }

####`coju.verbs(array verbs, string route, Function callback)`

**type** *Function*  
**access** *Public*  
**return** *Void*  
**stability** *1: Stable*

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
**stability** *1: Stable*

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
**stability** *4: Development*

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