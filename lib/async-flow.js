/**
 * Async Flow
 * flow control library
 */

// flow interface
var flow = {};

flow.create = function () {
  return new Flow([].slice.call(arguments));
};

// Flow Class
function Flow(flows) {
  var functions = this.functions = [];
  this.results = [];
  this.ready = ! flows.length;
  
  var flow = this;
  
  // call next method chain
  this.next = function () {
    if (functions.length > 0)
      functions.shift().apply(this, arguments);
    else
      flow.ready = true;
  };
  
  // call num'th method chain
  this.skip = function (num) {
    if (num != null && typeof num !== "number")
      throw new TypeError("This is not a number");
    
    // default value
    num == null && (num = 1);
    
    var self = this,
        args = [].slice.call(arguments, 1);
    
    flow.functions.splice(0, num);
    flow.next.apply(self, args);
  }
  
  var counter = flows.length,
      argList = [],
      args = [];
  
  // bind flow
  function bind(index) {
    if (! (flows[index] instanceof Flow))
      throw new TypeError("This is not an instance of Flow");
    
    flows[index].flow(function (next, skip) {
      var flowArgs = argList[index] = [].slice.call(arguments, 2);
      
      if (--counter === 0) {
        for (var i = 0, l = argList.length; i < l; i++)
          args = args.concat(argList[i]);
        
        flow.next.apply(this, args);
      }
      
      next.apply(this, flowArgs);
    });
  }
  
  for (var i = 0; i < counter; i++)
    bind(i);
}

Flow.prototype.flow = function (f) {
  var flow = this;
  
  function run() {
    var args = [].slice.call(arguments);
    args = [flow.next, flow.skip].concat(args);
    flow.results.push(f.apply(this, args));
  }
  
  // first method chain OR previous method chain finished
  if (flow.ready) {
    flow.ready = false;
    run();
  } else
    // register async function
    flow.functions.push(run);
  
  return this;
};

module.exports = flow;