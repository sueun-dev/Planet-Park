// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/extensions/IERC721Enumerable.sol)

pragma solidity ^0.8.0;

import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/openzeppelin/contracts/token/ERC721/ERC721.sol";
import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

interface IBloKnightzv1 is IERC721, IERC721Enumerable {
    function mint(address to) external;
}
