// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ShockiNFT is ERC721 {
  constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    _mint(msg.sender, 1);
  }
}