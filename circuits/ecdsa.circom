// Stubbed out from https://hackmd.io/fZQcweN4SrSwPrKP2floRQ
template ECDSAVerify(n, k) {
    signal input r[k];
    signal input s[k];
    signal input msghash[k];
    signal input pubkey[2][k];

    signal output result;

    result <== 1;
}
