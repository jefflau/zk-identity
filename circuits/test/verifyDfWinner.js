const path = require('path')

const chai = require('chai')
const circom_tester = require('circom_tester')
const { BigNumber: bn } = require('ethers')

const utils = require('./utils')
const fs = require('fs')

const assert = chai.assert
const wasm_tester = circom_tester.wasm

function bigint_to_array(n, k, x) {
  let mod = 1n
  for (var idx = 0; idx < n; idx++) {
    mod = mod * 2n
  }

  let ret = []
  var x_temp = x
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % mod)
    x_temp = x_temp / mod
  }
  return ret
}

function split(pubkey_bigint) {
  const x_bigint = pubkey_bigint / 2n ** 256n
  const y_bigint = pubkey_bigint % 2n ** 256n
  return [x_bigint, y_bigint]
}

describe.only('Verify df winner', function () {
  this.timeout(100000)
  it('verifies df winner', async function () {
    const circuit = await wasm_tester(
      path.join(__dirname, 'circuits', 'verify_df_winner_86_3_10.circom')
    )
    // https://piyopiyo.medium.com/how-to-get-senders-ethereum-address-and-public-key-from-signed-transaction-44abe17a1791 using this for now to add dummy public key and signed message

    const publicKey = BigInt(
      '0xfff49b58b83104ff16875452852466a46c7169ba4e368d11830c9170624e0a9509080a05a38c18841718ea4fc13483ac467d3e2d728d41ff16b73b9c943734f8'
    )

    const signedMsg = BigInt(
      '0xf86b808504a817c800825208942890228d4478e2c3b0ebf5a38479e3396c1d6074872386f26fc100008029a0520e5053c1b573d747f823a0b23d52e5a619298f46cd781d677d0e5e78fbc750a075be461137c2c2a5594beff76ecb11a215384c574a7e5b620dba5cc63b0a0f13'
    )

    const [x, y] = split(publicKey)
    const chunkedX = bigint_to_array(86, 3, x)
    const chunkedY = bigint_to_array(86, 3, y)

    console.log(chunkedX, chunkedY)

    const input = {
      r: [10, 10, 10],
      s: [10, 10, 10],
      msghash: [10, 10, 10],
      chunkedPubkey: [chunkedX, chunkedY],
      nullifier: 10,
      merklePathElements: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      merklePathIndices: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      merkleRoot: 1234,
    }

    // await circuit.loadConstraints()
    // const witness = await circuit.calculateWitness(input)
    // await circuit.checkConstraints(witness)
    // // check if it's an address
    // // const addressFromCircuit = ethers.BigNumber.from(witness[1]).toHexString()
    // // assert.deepEqual(
    // //   ethers.utils.getAddress(addressFromCircuit),
    // //   '0x5408e6A36E9911a8C0097bb1BD23bA4e39cCFF55'
    // // )
    // //console.log('address', ethers.BigNumber.from(witness[1]).toHexString())
    // let data = JSON.stringify(witness)
    // fs.writeFile('verifydfwinnerWitness.json', data, (err) => {
    //   if (err) throw err
    //   console.log('Data written to file')
    // })
  })
})
