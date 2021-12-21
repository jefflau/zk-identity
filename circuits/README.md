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
npx zkey-manager compile -c ./zkeys.config.yml
npx zkey-manager downloadPtau -c ./zkeys.config.yml
npx zkey-manager genZkeys -c ./zkeys.config.yml
snarkjs zkey export solidityverifier zkeys/VerifyDfWinner_86-3-10_prod.0.zkey ../contracts/Verifier.sol
```

### For frontend
```
cp zkeys/VerifyDfWinner_86-3-10_prod.0.zkey ../frontend/public/
cp zkeys/VerifyDfWinner_86-3-10_prod_js/VerifyDfWinner_86-3-10_prod.wasm ../frontend/public/
```
