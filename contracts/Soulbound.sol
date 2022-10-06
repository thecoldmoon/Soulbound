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
    mapping(uint256 => string) private _tokenIDToURI;
    address private _creator;
    uint256 private _editionCount;
    string private _baseURI;
    string private _extensionName;
    string private _collectionName;
    

    constructor(address creator, string memory collectionName) {
        _creator = creator;
        _editionCount = 0;
        _extensionName = "SoulBound";
        _collectionName = collectionName;
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

    function mint(address sender, string calldata uri) external adminRequired {
        uint256 tokenId = ERC721CreatorCore(_creator).mintExtension(sender, uri);
        _tokenIds.push(tokenId);
        _tokenOwners.push(sender);
        _tokenIDToURI[tokenId] = uri;
        _editionCount += 1;
    }

    function getTokenIds() external view adminRequired returns (uint256[] memory) {
        return _tokenIds;
    }

    function getTokenOwners() public view adminRequired returns (address[] memory) {
        return _tokenOwners;
    }

    function editionCount() public view virtual returns (uint256) {
        return _editionCount;
    }

    function extensionName() public view virtual returns (string memory) {
        return _extensionName;
    }

    function setBaseURI(string memory baseURI) public adminRequired {
        _baseURI = baseURI;
    }

    function tokenURI(address creator, uint256 tokenId) external view override returns (string memory) {
        require(creator == _creator, "Invalid token");
        return string(abi.encodePacked(_baseURI, _tokenIDToURI[tokenId]));
    }
}