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
  
  this.next = function () {
    if (functions.length > 0)
      functions.shift().apply(this, arguments);
    else
      flow.ready = true;
  };
  
  var counter = flows.length,
      argList = [],
      args = [];
  
  function bind(index) {
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
  var functions = this.functions,
      results = this.results,
      next = this.next,
      flow = this;
  
  function skip(num) {
    functions.splice(0, num);
    next.apply(this, [].slice.call(arguments, 1));
  }
  
  function run() {
    var args = [].slice.call(arguments);
    args = [next, skip].concat(args);
    results.push(f.apply(this, args));
  }
  
  // メソッドチェーンの最初だけは即時実行
  if (flow.ready) {
    flow.ready = false;
    run();
  } else
    // register async function
    functions.push(run);
  
  return this;
};

module.exports = flow;