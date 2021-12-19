pragma circom 2.0.1;

include "./merkle.circom";
include "./ecdsa.circom";
include "./eth.circom";

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

/*
 * Prove: I know (sig, msg, pubkey, nullifier, nullifierHash, merkle_branch, merkle_root) s.t.:
 * - sig == ecdsa_verify(r, s, msghash, pubkey)
 * - merkle_verify(pubkey, merkleRoot, merklePathElements, merklePathIndices)
 * - nullifier = poseidon(sig)
 *
 * We may choose to make all of these constants in the future:
 * levels = levels in the merkle branch
 * n = num bits for bigint number registers
 * k = num registers for bigint numbers
 */
template VerifyDfWinner(n, k, levels) {
  signal input r[k];
  signal input s[k];
  signal input msghash[k];

  // NOTE: chunked into k n-bit registers for easy use by ECDSAVerify
  signal input chunkedPubkey[2][k];

  signal input nullifier;

  signal input merklePathElements[levels];
  signal input merklePathIndices[levels];
  signal input merkleRoot; // of eth addresses

  signal pubkeyBits[512];
  signal address; // for now, num, but could be bit array too
  signal rNum;

  // sig verify
  component sigVerify = ECDSAVerify(n, k);
  for (var i = 0; i < k; i++) {
    sigVerify.r[i] <== r[i];
    sigVerify.s[i] <== s[i];
    sigVerify.msghash[i] <== msghash[i];

    sigVerify.pubkey[0][i] <== chunkedPubkey[0][i];
    sigVerify.pubkey[1][i] <== chunkedPubkey[1][i];
  }
  sigVerify.result === 1;

  // verify address = keccak(pubkey)
  component flattenPubkey = FlattenPubkey(n, k);
  for (var i = 0; i < k; i++) {
    flattenPubkey.chunkedPubkey[0][i] <== chunkedPubkey[0][i];
    flattenPubkey.chunkedPubkey[1][i] <== chunkedPubkey[1][i];
  }
  for (var i = 0; i < 512; i++) {
    pubkeyBits[i] <== flattenPubkey.pubkeyBits[i];
  }
  component pubkeyToAddress = PubkeyToAddress();
  for (var i = 0; i < 512; i++) {
    pubkeyToAddress.pubkeyBits[i] <== pubkeyBits[i];
  }
  address <== pubkeyToAddress.address;

  // merkle verify
  component treeChecker = MerkleTreeChecker(levels);
  treeChecker.leaf <== address;
  treeChecker.root <== merkleRoot;
  for (var i = 0; i < levels; i++) {
    treeChecker.pathElements[i] <== merklePathElements[i];
    treeChecker.pathIndices[i] <== merklePathIndices[i];
  }

  // nullifier check
  component rToNum = Bits2Num(k);
  for (var i = 0; i < k; i++) {
    rToNum.in[i] <== r[i];
  }
  rNum <== rToNum.out;

  component nullifierCheck = Poseidon(1);
  nullifierCheck.inputs[0] <== rNum;
  nullifierCheck.out === nullifier;
}

component main = VerifyDfWinner(86, 3, 10); // NOTE: levels TBD based on actual data
