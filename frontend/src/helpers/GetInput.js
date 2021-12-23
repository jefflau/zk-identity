import { ethers } from "ethers";

const MESSAGE = "ZK identity: Dark forest winners";

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

export async function getInput(signer) {
    const sAddr = await signer.getAddress();
    console.log(sAddr);

    const msgHash = ethers.utils.id(MESSAGE);
    const msgHashBytes = ethers.utils.arrayify(msgHash)
    const flatSig = await signer.signMessage(msgHashBytes);

    const sig = ethers.utils.splitSignature(flatSig);
    const pubKey = ethers.utils.recoverPublicKey(msgHashBytes, flatSig);
    const addr = ethers.utils.computeAddress(ethers.utils.arrayify(pubKey));
    console.log(addr);

    return {}
    // return {
    //     r: bigint_to_array(86, 3, sig.r),
    //     s: bigint_to_array(86, 3, sig.s),
    //     msghash: bigint_to_array(86, 3, msgHash),
    //     chunkedPubkey: [
    //         [10, 10, 10],
    //         [10, 10, 10]
    //     ],
    //     nullifier: 10,
    //     merklePathElements: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    //     merklePathIndices: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    //     merkleRoot: 1234
    // }
}

