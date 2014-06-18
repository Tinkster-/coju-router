/*
The MIT License (MIT)

Copyright (c) 2014 Dave Mackintosh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
"use strict";

{

  function coju_router(coju) {
    this.routes = {
      "get"     : {},
      "post"    : {},
      "put"     : {},
      "head"    : {},
      "options" : {},
      "delete"  : {},
      "trace"   : {},
      "all"     : {}
    };
    this.data = undefined;
    this.cururl = null;

    coju.on('request', function coju_router_listener(req, res) {
      // Reset all data per request
      this.data = undefined;

      // We test this later
      this.cururl = req.url.split('?')[0];

      // If any data was sent, capture it
      req.on('data', function(data) {
        if (!this.data) {
          this.data = '';
        }
        this.data += data;
      }.bind(this));

      // Once the request is finished call our routes.
      req.on('end', function() {
        this.splitAndObjectifyPostData(req.headers);
        this.runHttpMethodQueue(req.method.toLowerCase(), req, res, this.data);
      }.bind(this));

    }.bind(this));
  }

  /**
   * Run all the callbacks waiting in the queue
   * @param  {String} queue      The queue to execute
   * @param  {HttpRequest} req   The Node HttpRequest
   * @param  {HttpResponse} res  The Node HttpResponse
   * @param  {?Object} data      Any data from POST or parameterised url
   * @return {void}
   */
  coju_router.prototype.runHttpMethodQueue = function(queue, req, res, data) {
    // Check we have a queue and exit early if we don't
    if (!this.routes.hasOwnProperty(queue)) {
      return null;
    }

    for (let r in this.routes[queue]) {
      // Check for url parameters
      let parameterised = r.replace(/:(\w+)([\?\*])?/g, '(.*)');
      let params        = r.match(/:(\w+)([\?\*])?/g);
      let matches       = req.url.match(parameterised);
      let route         = new RegExp('^' + parameterised.replace(/\.?(\*)/g, '(.*)') + '$');

      // If there are parameter matchesbut data
      // hasn't been initialised, init data.
      if (matches && !data) {
        data = {};
      }

      // Loop over the parameters and add to data
      if (matches && params) {
        params.forEach(function(param, index) {
          data[param.substr(1, param.length)] = matches[index + 1];
        }.bind(this));
      }

      // Does the current route match?
      if (route.test(this.cururl)) {
        this.routes[queue][r].forEach(function(middleware) {
          middleware(req, res, data);
        });
      }
    }
  };

  /**
   * If there was any post data, split it and turn it into
   * an object, if it was JSON just parse it and return it.
   * @param  {Object} headers The headers of the request
   * @return {void}
   */
  coju_router.prototype.splitAndObjectifyPostData = function(headers) {
    if (!this.data) {
      return null;
    }

    // If we posted data then deal with that and quit
    if (headers['content-type'].search('application/json') > -1) {
      try {
        return JSON.parse(this.data);
      } catch(e) {
        console.error('Could not parse the JSON request due to malformed data.', this.data);
        return null;
      }
    }

    // If it wasn't json continue with splitting
    let d = this.data;
    this.data = {};
    
    // Get key value pairs
    d.split('&').forEach(function(kpa) {
      // Split to keys and values
      let obj = kpa.split('=');

      // Add back to the data
      this.data[obj[0]] = obj[1];
    }.bind(this));
  };

  /**
   * Register a new route
   * @param  {String}   type     The http method
   * @param  {String|Regex}   route    The pattern to match
   * @param  {Function} callback The middleware
   * @return {[type]}            [description]
   */
  coju_router.prototype.route = function (type, route, callback) {
    // Check if we support this method
    if (!this.routes.hasOwnProperty(type)) {
      throw new TypeError('There is currently no support for "' + type + '". List a bug on github..');
    }

    // Check if there is any middleware for this route already
    if (!this.routes[type].hasOwnProperty(route)) {
      this.routes[type][route] = [];
    }

    // Push the middleware to the queue
    this.routes[type][route].push(callback);
    return this;
  };

  /**
   * Register middleware for a GET request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.get = function (route, callback) {
    this.route('get', route, callback);
  };

  /**
   * Register middleware for a POST request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.post = function (route, callback) {
    this.route('post', route, callback);
  };

  /**
   * Register middleware for a PUT request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.put = function (route, callback) {
    this.route('put', route, callback);
  };

  /**
   * Register middleware for a HEAD request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.head = function (route, callback) {
    this.route('head', route, callback);
  };

  /**
   * Register middleware for a OPTIONS request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.options = function (route, callback) {
    this.route('options', route, callback);
  };

  /**
   * Register middleware for a TRACE request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.trace = function (route, callback) {
    this.route('trace', route, callback);
  };

  /**
   * Register middleware for a DELETE request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.delete = function (route, callback) {
    this.route('delete', route, callback);
  };

  /**
   * Register middleware for all types of request
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.all = function (route, callback) {
    for (let v in this.routes) {
      this.route(v, route, callback);
    }
  };

  /**
   * Register middleware for a series of request methods
   * @param  {Array} verbs An array of the http methods to queue
   * @param  {String}   route    The route pattern
   * @param  {Function} callback The middleware
   * @return {void}
   */
  coju_router.prototype.verbs = function (verbs, route, callback) {
    verbs.forEach(function(verb) {
      this.route(verb, route, callback);
    }.bind(this));
  };

  module.exports = function(coju) {
    return new coju_router(coju);
  };
}