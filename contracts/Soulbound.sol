// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@manifoldxyz/creator-core-solidity/contracts/ERC721Creator.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ERC721/IERC721CreatorExtensionApproveTransfer.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/ICreatorCore.sol";
import "hardhat/console.sol";
import "contracts/ISoulbound.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract SoulBound is ISoulbound, AdminControl, ReentrancyGuard, ICreatorExtensionTokenURI, IERC721CreatorExtensionApproveTransfer{
    using EnumerableSet for EnumerableSet.AddressSet;
    uint256[] private _tokenIds;
    string[] private _collections;
    mapping(uint256 => string) private _tokenIDToURI;
    mapping(string => uint32) private _collectionToEdition;
    mapping(string => EnumerableSet.AddressSet) private _collectionOwners;
    address private _creator;
    string private _baseURI;
    

    constructor(address creator) {
        _creator = creator;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AdminControl, IERC165) returns (bool) {
        return interfaceId == type(ISoulbound).interfaceId || interfaceId == type(ICreatorExtensionTokenURI).interfaceId || interfaceId == type(IERC721CreatorExtensionApproveTransfer).interfaceId || AdminControl.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721CreatorExtensionApproveTransfer-approveTransfer}.
     */
    function approveTransfer(address from, address to, uint256 tokenId) public override returns (bool){
        require(msg.sender == _creator, "This token is soulbound");
        require(from == address(0), "This token is soulbound");
        
        return true;
    }

    /**
     * @dev See {IERC721CreatorExtensionApproveTransfer-setApproveTransfer}.
     */
    function setApproveTransfer(address creator, bool enabled) public override adminRequired {
        ICreatorCore(_creator).setApproveTransferExtension(true);
    }

    /**
     * @dev See {ISoulbound-mint}.
     */
    function mint(string memory collectionName, address sender, string calldata uri) public override nonReentrant {
        require((keccak256(abi.encodePacked(collectionName)) != keccak256(abi.encodePacked(""))), "Invalid Collection Name");
        uint256 tokenId = ERC721CreatorCore(_creator).mintExtension(sender, uri);
        
        _tokenIds.push(tokenId);
        _collectionOwners[collectionName].add(sender);
        _tokenIDToURI[tokenId] = uri;
        
        if (_collectionToEdition[collectionName] == 0){
        _collections.push(collectionName);
        }
        _collectionToEdition[collectionName] += 1;
    }

    /**
     * @dev See {ISoulbound-getCollections}.
     */
    function getCollections() external view override returns (string[] memory collectionNames, uint32[] memory editionNumbers) {
        collectionNames = new string[](_collections.length);
        editionNumbers = new uint32[](_collections.length);
        for (uint i = 0; i < _collections.length; i++) {
            collectionNames[i] = _collections[i];
            editionNumbers[i] = _collectionToEdition[_collections[i]];
        }

        return (collectionNames, editionNumbers);
    }

    /**
     * @dev See {ISoulbound-getTokenIds}.
     */
    function getTokenIds() public view override adminRequired returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](_tokenIds.length);
        for (uint i = 0; i < _tokenIds.length; i++) {
            tokenIds[i] = _tokenIds[i];
        }
        return _tokenIds;
    }

    /**
     * @dev See {ISoulbound-getTokenOwnersForCollection}.
     */
    function getTokenOwnersForCollection(string memory collectionName) public view override adminRequired returns (address[] memory tokenOwners) {
        tokenOwners = new address[](_collectionOwners[collectionName].length());
        for (uint i = 0; i < _collectionOwners[collectionName].length(); i++) {
            tokenOwners[i] = _collectionOwners[collectionName].at(i);
        }
        return tokenOwners;
    }

    /**
     * @dev See {ISoulbound-editionCountByCollectionName}.
     */
    function editionCountByCollectionName(string memory collectionName) external view override returns (uint256) {
        return _collectionToEdition[collectionName];
    }

    /**
     * @dev See {IERC721CreatorCore-setBaseURI}.
     */
    function setBaseURI(string memory baseURI) public override adminRequired {
        ERC721CreatorCore(_creator).setBaseTokenURIExtension(baseURI);
        _baseURI = baseURI;
    }

    /**
     * @dev See {ICreatorExtensionTokenURI-tokenURI}.
     */
    function tokenURI(address creator, uint256 tokenId) external view override(ICreatorExtensionTokenURI, ISoulbound) returns (string memory) {
        require(creator == _creator, "Invalid token");
        return string(abi.encodePacked(_baseURI, _tokenIDToURI[tokenId]));
    }
}