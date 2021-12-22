circuits for the zk-identity 0xparc project

### testing

uses mocha + chai to test circuit witnesses

install dependencies

```
npm i
```
run tests

```
npm test
```

### To generate Verifier.sol
```
snarkjs zkey export solidityverifier zkeys/VerifyDfWinner_86-3-10_prod.0.zkey ../contracts/Verifier.sol
```
