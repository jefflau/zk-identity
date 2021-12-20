const path = require("path");

const chai = require("chai");
const circom_tester = require("circom_tester");

const utils = require("./utils");

const assert = chai.assert;
const wasm_tester = circom_tester.wasm;

describe("Keccak 32byte input and output test", function () {
  this.timeout(100000);

  let circuit;
  before(async () => {
    circuit= await wasm_tester(path.join(__dirname, "circuits", "keccak_256_256.circom"));
    await circuit.loadConstraints();
  });

  // NOTE: test case from vocdoni/keccak256-circom
  it("adheres to sanity test", async () => {
    const input = [116, 101, 115, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const expectedOut = [37, 17, 98, 135, 161, 178, 88, 97, 125, 150, 143,
      65, 228, 211, 170, 133, 153, 9, 88, 212, 4, 212, 175, 238, 249,
    210, 214, 116, 170, 85, 45, 21];

    const inBits = utils.bytesToBits(input);

    const witness = await circuit.calculateWitness({ "in": inBits }, true);

    const stateOut = witness.slice(1, 1+(32*8));
    const stateOutBytes = utils.bitsToBytes(stateOut);
    assert.deepEqual(stateOutBytes, expectedOut);
  });
});

describe("Keccak 64byte input, 32byte output (Eth pubkey->address) test", function () {
  this.timeout(100000);

  let circuit
  before(async () => {
    circuit= await wasm_tester(path.join(__dirname, "circuits", "keccak_512_256.circom"));
    await circuit.loadConstraints();
  });

  it("properly hashes an Eth pubkey to its keccak hash", async () => {
    // random hex examples I tested with eth libs
    const inHex = "11f2b30c9479ccaa639962e943ca7cfd3498705258ddb49dfe25bba00a555e48cb35a79f3d084ce26dbac0e6bb887463774817cb80e89b20c0990bc47f9075d5"
    const expectedOutHex = "f2c712fa067b0bb7f35a89ecc2524c08e0166f6a3b8d9925f8864c8ee18cb729"

    const inBits = utils.bytesToBits(utils.hexToBytes(inHex));

    const witness = await circuit.calculateWitness({ "in": inBits }, true);

    const outBits = witness.slice(1, 1+(32*8));
    const outHex = utils.bytesToHex(utils.bitsToBytes(outBits));
    assert.equal(outHex, expectedOutHex);
  });
});
