import { Buffer } from 'buffer';
import { readFile } from 'fs/promises';

import { buildPoseidon } from 'circomlibjs';

const poseidon = await buildPoseidon();

const NULL_NODE = -1;

// TODO: fixx off-by-1 errors due to NULL_NODE
async function buildTree(winners) {
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

      // TODO: what to do about NULL_NODE?
      for (const leaf of child1Leaves) {
        leafToPathElements[leaf].push(child2);
        leafToPathIndices[leaf].push(0);
      }

      // TODO: what to do about NULL_NODE?
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

  const allWinners = r1Winners.concat(r2Winners, r3Winners, r4Winners);

  return allWinners.map(w => w['winner']);
}


let winners = await getWinners();
let tree = await buildTree(winners);
console.log(tree);

//console.log(tree['leafToPathElements'])
