import builder from './witness_calculator'
import { groth16 } from 'snarkjs';
import path from "path";

const zkeyPath = "./VerifyDfWinner_86-3-10_prod.0.zkey"
const wasmPath = "./VerifyDfWinner_86-3-10_prod.wasm"

export async function CalculateProof(input) { 
  // fullProve like below does not work
  // other people also raised the issue in snarkjs repo
  // const { proof } = await groth16.fullProve(zkeyPath, wasmPath, null)
  let resp = await fetch(wasmPath)
  const wasmBuff = await resp.arrayBuffer()
  const wc = await builder(wasmBuff)
  const wtnsBuff = await wc.calculateWTNSBin(input, 0)

  const { proof } = await groth16.prove(zkeyPath, wtnsBuff, null)
  return proof
}
