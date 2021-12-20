const path = require("path");

const chai = require("chai");
const circom_tester = require("circom_tester");

const utils = require("./utils");

const assert = chai.assert;
const wasm_tester = circom_tester.wasm;

function flattenPubkey(x, y, n) {
  // flatten x and y into a single bit array. x and y represented as arrays of n-bit numbers

  // utils.numToBits for each num in x, y
  // flatten bit arrays and concat
}

describe("FlattenPubkey tests", function () {
  this.timeout(100000);

  it("flattens properly when pubkey is a perfect fit in registers", async function () {
    const circuit= await wasm_tester(path.join(__dirname, "circuits", "flatten_pubkey_64_4.circom"));
    await circuit.loadConstraints();

    const inX = [
      [100, 27, 32, 144]
    ];
    const inY = [
      [200, 31, 42, 1]
    ];
    const expectedOut = flattenPubkey(inX, inY, 64);

    const witness = await circuit.calculateWitness({ "chunkedPubkey": [inX, inY] }, true);

    console.log(witness.length);
    console.log(witness)
    // TODO: do test
    // output must take each input elt, num2bits, and concat *all* bits

  });

  it("flattens properly when there is 'extra space' in the last register", async function () {
    const circuit= await wasm_tester(path.join(__dirname, "circuits", "flatten_pubkey_86_3.circom"));
    await circuit.loadConstraints();
  });
});

// TODO: test pubkey_to_address
