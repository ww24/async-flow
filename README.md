# Async Flow [![Build Status](https://secure.travis-ci.org/ww24/async-flow.png?branch=master)](http://travis-ci.org/ww24/async-flow)

> Async Flow provides control flow for asynchronous methods.

> Async Flow は非同期メソッドの制御フローを提供します。

Example
----------------------------------------
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

API Documentation
----------------------------------------
#### flow = require("async-flow")
> create method だけを持つ Object  
> 

#### flow.create([Flow1, Flow2, ...])
> 新しい Flow を生成するための method  
> Flow Class の instance が返される。  
> 引数に Flow Class の instance を可変長個渡すと、全ての Flow が完了すると流れ出す新しい Flow を生成する。

### Flow Class

#### #flow(Function callback) -> Flow
> 制御フローを流すための method  
> 引数に 1 つの関数を渡す。  
> callback(next, skip[, arg1, arg2, ...])  
> callback では、非同期/同期 に関わらず、必ず next 又は skip method を 1 度呼び出す必要がある。

##### next([arg1, arg2, ...]) -> void
> 次の関数を呼び出す。  
> 値を返さないこと以外は元の関数と全く同じ挙動をするため Function#call や Function#apply を使って context を指定して呼び出すことも可能。  
> 返り値は Flow#results で取得することができる。  
> 2 度以上呼び出した場合の挙動は保証されない。

##### skip(Number index[, arg1, arg2, ...]) -> void
> 指定した index 後の関数を呼び出す。  
> index に 0 を指定すると next と全く同じ挙動をする。  
> index に 1 を指定すると 1 つ飛ばして次の関数を呼び出すことになる。  
> 2 度以上呼び出した場合の挙動は保証されない。

##### arg1, arg2, ...
> 前の関数で next 又は skip に与えた引数が同じ順番で渡される。  
> `flow.create` した直後では、 create の引数に指定された Flow の最後の関数で指定された引数が連結された状態で渡される。

#### Array results
> callback を呼び出した時の返り値が呼び出した順に格納される property  
> `flow.create` した場合、元の Flow の `results` は引き継がない。
