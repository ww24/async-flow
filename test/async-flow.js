var mocha = require("mocha"),
    should = require("chai").should(),
    flow = require("../lib/async-flow");

describe("async-flow", function () {
  it("parallel", function (done) {
    var results = [];
    
    var parallelA = flow.create();
    parallelA.flow(function (next, skip) {
      setTimeout(function () {
        results.push(1);
        parallelA.results[0].should.to.equal(1);
        next();
      }, 50);
      return 1;
    });
    
    var parallelB = flow.create();
    parallelB.flow(function (next, skip) {
      setTimeout(function () {
        results.push(2);
        parallelB.results[0].should.to.equal(2);
        next();
      }, 150);
      return 2;
    });
    
    var parallelC = flow.create();
    parallelC.flow(function (next, skip) {
      setTimeout(function () {
        results.push(3);
        parallelC.results[0].should.to.equal(3);
        next();
      }, 100);
      return 3;
    });
    
    flow.create(parallelA, parallelB, parallelC)
      .flow(function (next, skip) {
        results.should.to.eql([1, 3, 2]);
        next();
        done();
      });
  });
  
  it("sequential", function (done) {
    var results = [];
    
    var sequential = flow.create();
    sequential.flow(function (next, skip) {
      setTimeout(function () {
        results.push(1);
        sequential.results[0].should.to.equal(1);
        next();
      }, 50);
      return 1;
    });
    sequential.flow(function (next, skip) {
      setTimeout(function () {
        results.push(2);
        sequential.results[1].should.to.equal(2);
        next();
      }, 150);
      return 2;
    });
    sequential.flow(function (next, skip) {
      setTimeout(function () {
        results.push(3);
        sequential.results[2].should.to.equal(3);
        next();
      }, 100);
      return 3;
    });
    sequential.flow(function (next, skip) {
      results.should.to.eql([1, 2, 3]);
      next();
      done();
    });
  });
});