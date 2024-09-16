// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShockiToken is ERC20 {
  uint32 public constant NFT_MAX_SUPPLY = 1000;
  address public NFT_ADDRESS;

  constructor(string memory name, string memory symbol, address nftAddress) ERC20(name, symbol) {
    _mint(msg.sender, NFT_MAX_SUPPLY);
    NFT_ADDRESS = nftAddress;
  }
}
