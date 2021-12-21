import { groth16 } from 'snarkjs';
import path from "path";

const zkeyPath = path.join(__dirname, "../../build/VerifyDfWinner_86-3-10_prod.0.zkey");
const wasmPath = path.join(__dirname, "../../build/bVerifyDfWinner_86-3-10_prod.wasm");

export async function CalculateProof() {
    const witness = {
      // public
      // private
    };
    const { proof } = await groth16.fullProve(witness, wasmPath, zkeyPath);
    console.log(proof);
}
