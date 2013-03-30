/**
 * Async-Flow Test
 * Support: Node.js and Browser
 */

if (typeof window === "undefined")
  var mocha = require("mocha"),
      expect = require("chai").expect,
      flow = require("../lib/async-flow");
else
  var expect = chai.expect,
      flow = Flow;

describe("async-flow", function () {
  it("parallel", function (done) {
    var results = [];
    
    var parallelA = flow.create();
    parallelA.flow(function (next) {
      setTimeout(function () {
        results.push(1);
        expect(parallelA.results[0]).to.equal(1);
        next("A");
      }, 50);
      return 1;
    });
    
    var parallelB = flow.create();
    parallelB.flow(function (next) {
      setTimeout(function () {
        results.push(2);
        expect(parallelB.results[0]).to.equal(2);
        next("B", "0");
      }, 150);
      return 2;
    });
    
    var parallelC = flow.create();
    parallelC.flow(function (next) {
      setTimeout(function () {
        results.push(3);
        expect(parallelC.results[0]).to.equal(3);
        next("1", "2", "C");
      }, 100);
      return 3;
    });
    
    var parallelFlow = flow.create(parallelA, parallelB, parallelC)
      .flow(function (next, skip, argA, argB1, argB2, argC1, argC2, argC3) {
        expect(results).to.eql([1, 3, 2]);
        expect(argA).to.equal("A");
        expect(argB1).to.equal("B");
        expect(argB2).to.equal("0");
        expect(argC1).to.equal("1");
        expect(argC2).to.equal("2");
        expect(argC3).to.equal("C");
        next("testA");
      });
    
    parallelA.flow(function (next, skip, arg1) {
      expect(arg1).to.equal("A");
      setTimeout(function () {
        next("testB");
      }, 100);
    });
    
    flow.create(parallelFlow, parallelA)
      .flow(function (next, skip, arg1, arg2) {
        expect(arg1).to.equal("testA");
        expect(arg2).to.equal("testB");
        next();
        done();
      });
  });
  
  it("parallel sync results", function (done) {
    var parallelA = flow.create().flow(function (next) {
      setTimeout(function () {
        next("a");
      }, 10);
      return 0;
    });
    
    var parallelB = flow.create().flow(function (next) {
      setTimeout(function () {
        next("b");
      }, 10);
      return 1;
    });
    
    var parallelC = flow.create(parallelA, parallelB).flow(function (next) {
      expect([].slice.call(arguments, 2)).to.eql(["a", "b"]);
      setTimeout(function () {
        next("c");
      }, 10);
      return 2;
    });
    
    parallelA.flow(function (next) {
      expect([].slice.call(arguments, 2)).to.eql(["a"]);
      next("A");
      return "zero";
    });
    
    parallelB.flow(function (next) {
      expect([].slice.call(arguments, 2)).to.eql(["b"]);
      next("B");
      return "one";
    });
    
    parallelC.flow(function (next) {
      expect([].slice.call(arguments, 2)).to.eql(["c"]);
      next("C");
      return "two";
    });
    
    flow.create(parallelA, parallelB, parallelC).flow(function (next) {
      expect([].slice.call(arguments, 2)).to.eql(["A", "B", "C"]);
      expect(parallelA.results).to.eql([0, "zero"]);
      expect(parallelB.results).to.eql([1, "one"]);
      expect(parallelC.results).to.eql([2, "two"]);
      next();
      done();
    });
    
  });
  
  it("sequential", function (done) {
    var results = [];
    
    var sequential = flow.create();
    sequential.flow(function (next) {
      setTimeout(function () {
        results.push(1);
        expect(sequential.results[0]).to.equal(1);
        next("hoge");
      }, 50);
      return 1;
    });
    sequential.flow(function (next, skip, arg1) {
      setTimeout(function () {
        results.push(2);
        expect(sequential.results[1]).to.equal(2);
        expect(arg1).to.equal("hoge");
        next(arg1, 200);
      }, 150);
      return 2;
    });
    sequential.flow(function (next, skip, arg1, arg2) {
      setTimeout(function () {
        results.push(3);
        expect(sequential.results[2]).to.equal(3);
        expect(arg1).to.equal("hoge");
        expect(arg2).to.equal(200);
        next(arg1, arg2, ["array"]);
      }, 100);
      return 3;
    });
    sequential.flow(function (next, skip, arg1, arg2, arg3) {
      expect(results).to.eql([1, 2, 3]);
      expect(arg1).to.equal("hoge");
      expect(arg2).to.equal(200);
      expect(arg3).to.eql(["array"]);
      next();
      done();
    });
  });
  
  it("sequential skip", function (done) {
    var sequential = flow.create();
    sequential.flow(function (next, skip) {
      setTimeout(function () {
        skip(2, "skip");
      }, 200);
    });
    sequential.flow(function (next) {
      setTimeout(function () {
        next();
      }, 100);
    });
    sequential.flow(function (next) {
      next();
    });
    sequential.flow(function (next, skip, arg1) {
      expect(arg1).to.equal("skip");
      next();
      done();
    });
  });
  
  it("sequential sync skip", function (done) {
    var sequential = flow.create();
    sequential.flow(function (next, skip) {
      skip(2, "skip");
    });
    sequential.flow(function (next) {
      next();
    });
    sequential.flow(function (next) {
      next();
    });
    sequential.flow(function (next, skip, arg1) {
      expect(arg1).to.equal("skip");
      next();
    });
    sequential.flow(function (next) {
      expect(arguments.length).to.equal(2);
      next("passing");
    });
    sequential.flow(function (next, skip, arg1) {
      expect(arg1).to.equal("passing");
      next();
      done();
    });
  });
  
  it("check context", function (done) {
    var sequential = flow.create();
    sequential.flow(function (next) {
      next.call({check: "ok"});
    });
    sequential.flow(function (next, skip) {
      expect(this.check).to.equal("ok");
      skip.call({check: "skip"}, 1);
    });
    sequential.flow(function (next) {
      next();
    });
    sequential.flow(function (next) {
      expect(this.check).to.equal("skip");
      next.call({check: "ok"});
    });
    var seq = flow.create();
    seq.flow(function (next) {
      setTimeout(next, 100);
    });
    flow.create(sequential, seq).flow(function (next) {
      next();
    });
    sequential.flow(function (next) {
      expect(this.check).to.equal("ok");
      next();
      done();
    });
  });
});