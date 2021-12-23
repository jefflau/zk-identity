import { ethers } from "ethers";

const MESSAGE = "ZK Identity: Dark Forest Winners";

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

    const msgHash = ethers.utils.hashMessage(MESSAGE);
    const msgHashBytes = ethers.utils.arrayify(msgHash);

    const flatSig = await signer.signMessage(MESSAGE);
    const sig = ethers.utils.splitSignature(flatSig);

    const pubKey = ethers.utils.recoverPublicKey(msgHashBytes, flatSig);

    // just to double check, this addr should match the sAddr above
    const addr = ethers.utils.computeAddress(ethers.utils.arrayify(pubKey));
    console.log(addr);

    // TODO:
    // r: bitint_to_array(86, 3, sig.r)
    // s: bigint_to_array(86, 3, sig.s)
    // msgHash: bigint_to_array(86, 3, msgHash)
    // chuckedPubKey: flatternPubKey(86, 3, pubKey)
    // nullifier = Poseidon(sig.r[0])

    // TODO: get merkleRoot, merklePathElements, and merklePathIndices

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

