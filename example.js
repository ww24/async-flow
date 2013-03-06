var flow = require("./lib/async-flow");

// sequential
var sequential = flow.create();

sequential.flow(function (done, skip) {
  console.log("\nsequential\n====================");
  done();
});
sequential.flow(function (done, skip) {
  setTimeout(function () {
    console.log("sequential: %d", 1);
    done();
  }, 50);
});
sequential.flow(function (done, skip) {
  setTimeout(function () {
    console.log("sequential: %d", 2);
    done();
  }, 150);
});
sequential.flow(function (done, skip) {
  setTimeout(function () {
    console.log("sequential: %d", 3);
    done();
  }, 100);
});
sequential.flow(function (done, skip) {
  console.log("sequential: complete");
  done();
});

// parallel
sequential.flow(function (done, skip) {
  console.log("\nparallel\n====================");
  done();
});

var parallelA = flow.create(sequential);
parallelA.flow(function (done, skip) {
  setTimeout(function () {
    console.log("parallel: %d", 1);
    done();
  }, 50);
});

var parallelB = flow.create(sequential);
parallelB.flow(function (done, skip) {
  setTimeout(function () {
    console.log("parallel: %d", 2);
    done();
  }, 150);
});

var parallelC = flow.create(sequential);
parallelC.flow(function (done, skip) {
  setTimeout(function () {
    console.log("parallel: %d", 3);
    done();
  }, 100);
});

flow.create(parallelA, parallelB, parallelC)
  .flow(function (done, skip) {
    console.log("parallel: complete");
    done();
  });