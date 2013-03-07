# Async Flow [![Build Status](https://secure.travis-ci.org/ww24/async-flow.png?branch=master)](http://travis-ci.org/ww24/async-flow)

> Async Flow provides control flow for asynchronous methods.

> Async Flow は非同期メソッドの制御フローを提供します。

## Example
`npm install async-flow`

```js
var flow = require("async-flow");

// initialize timer function
function timer(time) {
  return function (next, skip) {
    setTimeout(next, time);
  };
}

// 非同期フロー 1
var flow1 = flow.create()
  .flow(timer(10))
  .flow(timer(30))
  .flow(timer(20));

// 非同期フロー 2
var flow2 = flow.create()
  .flow(timer(20))
  .flow(timer(10));

// 1, 2 から作られた 非同期フロー 3
var flow3 = flow.create(flow1, flow2)
  .flow(timer(30))
  .flow(function () {
    console.log("callback");
  });

// 3 から作られた 非同期フロー 4
var flow4 = flow.create(flow3)
  .flow(timer(40));

// 3 から作られた 非同期フロー 5
var flow5 = flow.create(flow3)
  .flow(timer(20));

// 4, 5 から作られた 非同期フロー
flow.create(flow4, flow5)
  .flow(function () {
    console.log("callback");
  });
```
