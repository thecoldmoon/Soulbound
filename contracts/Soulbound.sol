// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@manifoldxyz/creator-core-solidity/contracts/ERC721Creator.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ERC721/IERC721CreatorExtensionApproveTransfer.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/ICreatorCore.sol";
import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract SoulBound is AdminControl, ICreatorExtensionTokenURI, IERC721CreatorExtensionApproveTransfer{
    address[] private _tokenOwners;
    uint256[] private _tokenIds;
    address private _creator;
    uint16 private _minted;
    string private _baseURI;
    

    constructor(address creator) {
        _creator = creator;
        _minted = 0;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AdminControl, IERC165) returns (bool) {
        return interfaceId == type(ICreatorExtensionTokenURI).interfaceId || interfaceId == type(IERC721CreatorExtensionApproveTransfer).interfaceId || AdminControl.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    function approveTransfer(address from, address to, uint256 tokenId) public override returns (bool){
        require(msg.sender == _creator, "This token is soulbound");
        require(from == 0x0000000000000000000000000000000000000000, "This token is soulbound");
        
        return true;
    }

    function setApproveTransfer(address creator, bool enabled) public override adminRequired {
        ICreatorCore(_creator).setApproveTransferExtension(true);
    }

    function mint(address sender) external adminRequired {
        _tokenIds.push(IERC721CreatorCore(_creator).mintExtension(sender));
        _tokenOwners.push(sender);
        _minted += 1;
    }

    function getTokenIds() external view adminRequired returns (uint256[] memory) {
        return _tokenIds;
    }

    function getTokenOwners() external view adminRequired returns (address[] memory) {
        return _tokenOwners;
    }

    function setBaseURI(string memory baseURI) public adminRequired {
        _baseURI = baseURI;
    }

    function tokenURI(address creator, uint256 tokenId) external view override returns (string memory) {
        require(creator == _creator, "Invalid token");
        return string(abi.encodePacked(_baseURI, Strings.toString(tokenId)));
    }
}