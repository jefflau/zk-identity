import { buildPoseidon } from 'circomlibjs';

const poseidon = await buildPoseidon();

const NULL_NODE = -1;

async function buildTree(winnerHexStrs) {
  winners = winnerHexStrs.map(s => Number(s));
  winners.sort((a, b) => a - b);

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

      let parent = poseidon([n1, n2]);
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


// load all winners (let's just do all for now)
// write output
