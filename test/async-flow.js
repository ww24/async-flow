var mocha = require("mocha"),
    should = require("chai").should(),
    flow = require("../lib/async-flow");

describe("async-flow", function () {
  it("parallel", function (done) {
    var results = [];
    
    var parallelA = flow.create();
    parallelA.flow(function (next) {
      setTimeout(function () {
        results.push(1);
        parallelA.results[0].should.to.equal(1);
        next("A");
      }, 50);
      return 1;
    });
    
    var parallelB = flow.create();
    parallelB.flow(function (next) {
      setTimeout(function () {
        results.push(2);
        parallelB.results[0].should.to.equal(2);
        next("B", "0");
      }, 150);
      return 2;
    });
    
    var parallelC = flow.create();
    parallelC.flow(function (next) {
      setTimeout(function () {
        results.push(3);
        parallelC.results[0].should.to.equal(3);
        next("1", "2", "C");
      }, 100);
      return 3;
    });
    
    var parallelFlow = flow.create(parallelA, parallelB, parallelC)
      .flow(function (next, skip, argA, argB1, argB2, argC1, argC2, argC3) {
        results.should.to.eql([1, 3, 2]);
        argA.should.to.equal("A");
        argB1.should.to.equal("B");
        argB2.should.to.equal("0");
        argC1.should.to.equal("1");
        argC2.should.to.equal("2");
        argC3.should.to.equal("C");
        next("testA");
      });
    
    parallelA.flow(function (next, skip, arg1) {
      arg1.should.to.equal("A");
      setTimeout(function () {
        next("testB");
      }, 100);
    });
    
    flow.create(parallelFlow, parallelA)
      .flow(function (next, skip, arg1, arg2) {
        arg1.should.to.equal("testA");
        arg2.should.to.equal("testB");
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
      [].slice.call(arguments, 2).should.to.eql(["a", "b"]);
      setTimeout(function () {
        next("c");
      }, 10);
      return 2;
    });
    
    parallelA.flow(function (next) {
      [].slice.call(arguments, 2).should.to.eql(["a"]);
      next("A");
      return "zero";
    });
    
    parallelB.flow(function (next) {
      [].slice.call(arguments, 2).should.to.eql(["b"]);
      next("B");
      return "one";
    });
    
    parallelC.flow(function (next) {
      [].slice.call(arguments, 2).should.to.eql(["c"]);
      next("C");
      return "two";
    });
    
    flow.create(parallelA, parallelB, parallelC).flow(function (next) {
      [].slice.call(arguments, 2).should.to.eql(["A", "B", "C"]);
      parallelA.results.should.to.eql([0, "zero"]);
      parallelB.results.should.to.eql([1, "one"]);
      parallelC.results.should.to.eql([2, "two"]);
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
        sequential.results[0].should.to.equal(1);
        next("hoge");
      }, 50);
      return 1;
    });
    sequential.flow(function (next, skip, arg1) {
      setTimeout(function () {
        results.push(2);
        sequential.results[1].should.to.equal(2);
        arg1.should.to.equal("hoge");
        next(arg1, 200);
      }, 150);
      return 2;
    });
    sequential.flow(function (next, skip, arg1, arg2) {
      setTimeout(function () {
        results.push(3);
        sequential.results[2].should.to.equal(3);
        arg1.should.to.equal("hoge");
        arg2.should.to.equal(200);
        next(arg1, arg2, ["array"]);
      }, 100);
      return 3;
    });
    sequential.flow(function (next, skip, arg1, arg2, arg3) {
      results.should.to.eql([1, 2, 3]);
      arg1.should.to.equal("hoge");
      arg2.should.to.equal(200);
      arg3.should.to.eql(["array"]);
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
      arg1.should.to.equal("skip");
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
      arg1.should.to.equal("skip");
      next();
    });
    sequential.flow(function (next) {
      arguments.length.should.to.equal(2);
      next("passing");
    });
    sequential.flow(function (next, skip, arg1) {
      arg1.should.to.equal("passing");
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
      this.check.should.to.equal("ok");
      skip.call({check: "skip"}, 1);
    });
    sequential.flow(function (next) {
      next();
    });
    sequential.flow(function (next) {
      this.check.should.to.equal("skip");
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
      this.check.should.to.equal("ok");
      next();
      done();
    });
  });
});