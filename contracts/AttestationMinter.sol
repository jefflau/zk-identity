// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "./Verifier.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AttestationMinter is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => bool) public nullifiers;

    function mint(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input,
        uint256 _nullifier) external {
        require(
            nullifiers[_nullifier] == false,
            "AttestationMinter: nullifier has been used"
        );

        // verify proof
        require(
            Verifier.verifyProof(_a, _b, _c, _input),
            "AttestationMinter: invalid proof"
        );

        nullifiers[_nullifier] = true;

        // mint NFT
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
    }

    constructor() ERC721("Proof", "PROOF") {}
}
