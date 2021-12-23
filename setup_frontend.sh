#!/bin/bash

cd circuits

npx zkey-manager compile -c ./zkeys.config.yml
#npx zkey-manager downloadPtau -c ./zkeys.config.yml
npx zkey-manager genZkeys -c ./zkeys.config.yml

cp zkeys/VerifyDfWinner_86-3-10_prod.0.zkey ../frontend/public/
cp zkeys/VerifyDfWinner_86-3-10_prod_js/VerifyDfWinner_86-3-10_prod.wasm ../frontend/public/
