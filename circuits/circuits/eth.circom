pragma circom 2.0.1;

include "./vocdoni/keccak256-circom/keccak.circom";

include "../node_modules/circomlib/circuits/bitify.circom";

/*
 * Possibly generalizable, but for now just flatten a single pubkey from k n-bit chunks to a * single bit array
 * representing the entire pubkey
 *
 */
template FlattenPubkey(n, k) {
  signal input chunkedPubkey[2][k];

  signal output pubkeyBits[512];

  // must be able to hold entire pubkey in input
  assert(n*k >= 256);

  // convert pubkey to a single bit array
  // - concat x and y coords
  // - convert each register's number to corresponding bit array
  // - concatenate all bit arrays in order
  component chunks2Bits[2 * k];
  for (var coord = 0; coord < 2; coord++) {
    for (var reg = 0; reg < k; reg++) {
      var compIdx = (coord * k) + reg;
      chunks2Bits[compIdx] = Num2Bits(n);
      chunks2Bits[compIdx].in <== chunkedPubkey[coord][reg];

      for (var bit = 0; bit < n; bit++) {
        var bitIdx = (coord * k * n) + (reg * n) + bit;
        if (bitIdx < 512) {
          pubkeyBits[bitIdx] <== chunks2Bits[compIdx].out[bit];
        }
      }
    }
  }
}

/*
 * Helper for verifying an eth address refers to the correct public key point
 *
 * NOTE: uses https://github.com/vocdoni/keccak256-circom, a highly experimental keccak256 implementation
 */
template PubkeyToAddress() {
    signal input pubkeyBits[512];

    signal output address;

    component keccak = Keccak(512, 256);
    for (var i = 0; i < 512; i++) {
      keccak.in[i] <== pubkeyBits[i];
    }

    // convert the last 160 bits (20 bytes) into the number corresponding to address
    component bits2Num = Bits2Num(160);
    for (var i = 96; i < 256; i++) {
      bits2Num.in[i-96] <== pubkeyBits[i];
    }

    address <== bits2Num.out;
}
