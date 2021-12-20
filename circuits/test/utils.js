// NOTE: below two functions taken from vocdoni/keccak256-circom
// Move into their own utils file when I start doing tests on other circuits
function bytesToBits(b) {
  const bits = [];
  for (let i = 0; i < b.length; i++) {
    for (let j = 0; j < 8; j++) {
      if ((Number(b[i])&(1<<j)) > 0) {
        // bits.push(Fr.e(1));
        bits.push(1);
      } else {
        // bits.push(Fr.e(0));
        bits.push(0);
      }
    }
  }
  return bits
}

function bitsToBytes(a) {
  const b = [];

  for (let i=0; i<a.length; i++) {
    const p = Math.floor(i/8);
    if (b[p]==undefined) {
      b[p] = 0;
    }
    if (a[i]==1) {
      b[p] |= 1<<(i%8);
    }
  }
  return b;
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

function numToBits(num, numBits) {
  // TODO: n-bit precision for a single num
}

module.exports = {
  bytesToBits,
  bitsToBytes,
  hexToBytes,
  bytesToHex,
  numToBits
};
