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
  
  var counter = flows.length;
  
  for (var i = 0; i < counter; i++)
    flows[i].flow(function (next, skip) {
      if (--counter === 0)
        flow.next();
      next();
    });
}

Flow.prototype.flow = function (f) {
  var functions = this.functions,
      results = this.results,
      next = this.next,
      flow = this;
  
  function skip(num) {
    functions.splice(0, num);
    next(this, [].slice.call(arguments, 1));
  }
  
  function exec() {
    results.push(f(next, skip));
  }
  
  // メソッドチェーンの最初だけは即時実行
  if (flow.ready) {
    flow.ready = false;
    exec();
  } else
    // register async function
    functions.push(exec);
  
  return this;
};

module.exports = flow;