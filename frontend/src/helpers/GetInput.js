import { ethers } from "ethers";

const MESSAGE = "ZK Identity: Dark Forest Winners";

// k elements, each n bits, little endian
function hexStrToArray(n, k, hexStr) {
    var result = new Array(k).fill(0);

    var hex = hexStr.substring(2);
    var bitArray = new Array(4 * hex.length);

    var resultIdx = 0;
    var element = 0;
    for (var i = 0; i < hex.length; i++) {
        var it = parseInt(hex[hex.length - 1 - i], 16);
        for (var j = 0; j < 4; j++) {
            var idx = i * 4 + j;
            var bit = +((it & (1 << j)) != 0);
            bitArray[idx] = bit;

            const idxn = idx % n
            if (idx != 0 && idxn == 0) {
                result[resultIdx] = element;
                resultIdx++;
                element = 0;
            }
            element += bit * 2 ** idxn;
            // TODO: this element would be too large, what type should we use here?
        }
    }

    if (element != 0) {
        result[resultIdx] = element;
    }

    return result
}

export async function getInput(signer) {
    const sAddr = await signer.getAddress();
    console.log(sAddr);

    const msgHash = ethers.utils.hashMessage(MESSAGE);
    const msgHashBytes = ethers.utils.arrayify(msgHash);

    const flatSig = await signer.signMessage(MESSAGE);
    const sig = ethers.utils.splitSignature(flatSig);
    console.log("sig.r: " + sig.r)
    console.log("sig.s: " + sig.s)

    const pubKey = ethers.utils.recoverPublicKey(msgHashBytes, flatSig);
    console.log("pubKey: " + pubKey)

    // just to double check, this addr should match the sAddr above
    const addr = ethers.utils.computeAddress(ethers.utils.arrayify(pubKey));
    console.log(addr);

    console.log(hexStrToArray(86, 3, sig.r))
    // const arr = bigint_to_array(1, 3, 512)
    // console.log(arr)

    // TODO:
    // chuckedPubKey: flatternPubKey(86, 3, pubKey)
    // nullifier = Poseidon(sig.r[0])

    // TODO: get merkleRoot, merklePathElements, and merklePathIndices

    return {
        r: hexStrToArray(86, 3, sig.r),
        s: hexStrToArray(86, 3, sig.s),
        msghash: hexStrToArray(86, 3, msgHash),
        chunkedPubkey: [
            [10, 10, 10],
            [10, 10, 10]
        ],
        nullifier: 10,
        merklePathElements: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        merklePathIndices: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        merkleRoot: 1234
    }
}

