// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Soulbound.sol";

/////////////////////
//                 //
//                 //
//   Soulbound.    //
//                 //
//                 //
/////////////////////


contract SOULBOUND is SoulBound {
    constructor(address creator) SoulBound(creator) {}
}