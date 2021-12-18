// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// is Verifier, ERC721Mintable
contract ProofOfDfWinner is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(bytes => bool) public nullifiers;

    function mint(bytes calldata proof, bytes calldata nullifier) external {
        // verify proof
        // check that nullifier hasn't been used
        require(nullifiers[nullifier] != true);
        // mint NFT
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        nullifiers[nullifier] = true;
    }

    constructor() ERC721("Proof", "PROOF") {}
}
