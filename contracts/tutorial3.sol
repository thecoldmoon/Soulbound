// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title: Tutorial3
/// @author: manifold.xyz

import "@manifoldxyz/creator-core-solidity/contracts/ERC721Creator.sol";

/////////////////////
//                 //
//                 //
//    tutorial3    //
//                 //
//                 //
/////////////////////


contract TUTORIAL3 is ERC721Creator {
    constructor() ERC721Creator("Tutorial3", "TUTORIAL3") {}
}