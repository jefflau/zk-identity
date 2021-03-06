import { Buffer } from 'buffer';
import { readFile } from 'fs/promises';
import { writeFileSync } from 'fs';

import { buildPoseidon } from 'circomlibjs';

const poseidon = await buildPoseidon();

// NOTE: picked this as the null field element because it's known to not be in the tree
const NULL_NODE = 1;

const TESTER_ADDRS = [
  '0xA94a0de566a12CbC3785FAa2646F26bfC45EaE43',
  '0xc0B9BeC21e7B1CDcEf3a3Ffa4175B7434761C417'
]

// NOTE: prod designates that we don't include TESTER_ADDRS as winners
async function buildTree(winners, prod = false) {
  if (!prod) {
    winners = winners.concat(TESTER_ADDRS);
  }

  winners.sort();

  // the equivalent of pathElements and pathIndices in merkle.circom
  let leafToPathElements = Object.fromEntries( winners.map(w => [w, []] ) );
  let leafToPathIndices = Object.fromEntries( winners.map(w => [w, []] ) );

  let nodeToLeaves = Object.fromEntries( winners.map(w => [w,[w]] ) );
  let curLevel = winners;
  while (curLevel.length > 1) {
    let newLevel = [];

    for (let i = 0; i < curLevel.length; i+=2) {
      let child1 = curLevel[i];
      let child2 = (i == curLevel.length - 1) ? NULL_NODE : curLevel[i+1];

      let child1Leaves = nodeToLeaves[child1];
      let child2Leaves = child2 == NULL_NODE ? [] : nodeToLeaves[child2];

      for (const leaf of child1Leaves) {
        leafToPathElements[leaf].push(child2);
        leafToPathIndices[leaf].push(0);
      }

      for (const leaf of child2Leaves) {
        leafToPathElements[leaf].push(child1);
        leafToPathIndices[leaf].push(1);
      }

      let parentBytes = poseidon([Number(child1), Number(child2)]);
      let parent = '0x' + Buffer.from(parentBytes).toString('hex');

      nodeToLeaves[parent] = child1Leaves.concat(child2Leaves);

      newLevel.push(parent);
    }

    curLevel = newLevel;
  }

  return {
    root: curLevel[0],
    leafToPathElements,
    leafToPathIndices
  }
}

async function getWinners() {
  const r1Winners = JSON.parse(await readFile(new URL('./data/r1-winners.json', import.meta.url)))
  const r2Winners = JSON.parse(await readFile(new URL('./data/r2-winners.json', import.meta.url)))
  const r3Winners = JSON.parse(await readFile(new URL('./data/r3-winners.json', import.meta.url)))
  const r4Winners = JSON.parse(await readFile(new URL('./data/r4-winners.json', import.meta.url)))

  const allWinnerObjs = r1Winners.concat(r2Winners, r3Winners, r4Winners);
  const allWinners = allWinnerObjs.map(w => w['winner']);

  return [...new Set(allWinners)];
}


// NOTE: uncomment to re-generate tree
let winners = await getWinners();
let tree = await buildTree(winners);
writeFileSync('output/tree.json', JSON.stringify(tree, null, 2));
