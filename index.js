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
      this.cururl = req.url;

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

  coju_router.prototype.runHttpMethodQueue = function(queue, req, res, data) {
    if (!this.routes.hasOwnProperty(queue)) {
      return null;
    }

    for (let r in this.routes[queue]) {
      let re = new RegExp('^' + r.replace('*', '.*') + '$');

      if (re.test(this.cururl)) {
        this.routes[queue][r].forEach(function(ro) {
          ro(req, res, data);
        });
      }
    }
  };

  coju_router.prototype.splitAndObjectifyPostData = function(headers) {
    if (!this.data) {
      return null;
    }

    if (headers['content-type'].search('application/json') > -1) {
      try {
        return JSON.parse(this.data);
      } catch(e) {
        console.error('Could not parse the JSON request due to malformed data.');
        return null;
      }
    }

    let d = this.data;
    this.data = {};
    
    d.split('&').forEach(function(kpa) {
      let obj = kpa.split('=');

      this.data[obj[0]] = obj[1];
    }.bind(this));
  };

  coju_router.prototype.route = function (type, route, callback) {
    if (!this.routes.hasOwnProperty(type)) {
      throw new TypeError('There is currently no support for "' + type + '". List a bug on github..');
    }

    if (!this.routes[type].hasOwnProperty(route)) {
      this.routes[type][route] = [];
    }

    this.routes[type][route].push(callback);
    return this;
  };

  coju_router.prototype.get = function (route, callback) {
    this.route('get', route, callback);
  };

  coju_router.prototype.post = function (route, callback) {
    this.route('post', route, callback);
  };

  coju_router.prototype.put = function (route, callback) {
    this.route('put', route, callback);
  };

  coju_router.prototype.head = function (route, callback) {
    this.route('head', route, callback);
  };

  coju_router.prototype.options = function (route, callback) {
    this.route('options', route, callback);
  };

  coju_router.prototype.trace = function (route, callback) {
    this.route('trace', route, callback);
  };

  coju_router.prototype.delete = function (route, callback) {
    this.route('delete', route, callback);
  };

  coju_router.prototype.all = function (route, callback) {
    for (let v in this.routes) {
      this.route(v, route, callback);
    }
  };

  coju_router.prototype.verbs = function (verbs, route, callback) {
    verbs.forEach(function(verb) {
      this.route(verb, route, callback);
    }.bind(this));
  };

  module.exports = function(coju) {
    return new coju_router(coju);
  };
}