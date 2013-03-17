/**
 * Async Flow
 * flow control library
 */

// flow interface
var flow = {};

flow.create = function () {
  // call Flow Class
  return new Flow([].slice.call(arguments));
};

// Flow Class
// new Flow([Array<Flow>])
function Flow(flows) {
  var flow = this;
  
  flow.functions = [];
  flow.results = [];
  flow.ready = ! flows.length;
  flow.skipNum = 0;
  flow.args = [];
  
  // call next method chain
  // #next([arguments])
  flow.next = function () {
    if (flow.functions.length > 0)
      flow.functions.shift().apply(this, arguments);
    else {
      flow.args = [this].concat([].slice.call(arguments));
      flow.ready = true;
    }
  };
  
  // call num'th method chain
  // #skip(Number num [, arguments]);
  flow.skip = function (num) {
    if (num != null && typeof num !== "number")
      throw new TypeError("This is not a number");
    
    // default value
    num == null && (num = 1);
    
    flow.skipNum = num - flow.functions.splice(0, num);
    flow.next.apply(this, [].slice.call(arguments, 1));
  }
  
  var counter = flows.length,
      argList = [],
      args = [];
  
  // bind flow
  function bind(index) {
    if (! (flows[index] instanceof Flow))
      throw new TypeError("This is not an instance of Flow");
    
    // flows 全てに対して flow method を実行
    flows[index].flow(function (next) {
      var flowArgs = argList[index] = [].slice.call(arguments, 2);
      
      // flows の最後の flow が実行されたときに next method を呼ぶ
      if (--counter === 0) {
        for (var i = 0, l = argList.length; i < l; i++)
          args = args.concat(argList[i]);
        
        setTimeout(function () {
          flow.next.apply(null, args);
        }, 1);
      }
      
      next.apply(this, flowArgs);
    }, Flow.NO_RESULT);
  }
  
  for (var i = 0; i < counter; i++)
    bind(i);
}

Flow.NO_RESULT = {};

// #flow(Function f)
Flow.prototype.flow = function (f, flag) {
  var flow = this;
  
  function run() {
    var args = [].slice.call(arguments);
    args = [flow.next, flow.skip].concat(args);
    var result = f.apply(this, args);
    if (flag !== Flow.NO_RESULT)
      flow.results.push(result);
  }
  
  // first method chain OR previous method chain finished
  if (flow.ready) {
    if (flow.skipNum > 0)
      flow.skipNum--;
    else {
      flow.ready = false;
      run.apply(flow.args[0], flow.args.slice(1));
    }
  } else
    // register async function
    flow.functions.push(run);
  
  return this;
};

module.exports = flow;