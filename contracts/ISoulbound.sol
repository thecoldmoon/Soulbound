// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISoulbound {
    
    /**
     * @dev See {ICreatorExtensionTokenURI-tokenURI}.
     */
    function tokenURI(address creator, uint256 tokenId) external view returns (string memory);

    /**
     * @dev mints a token with collection name into the address of sender
     */
    function mint(string memory collectionName, address sender, string calldata uri) external;

    /**
     * @dev gets all token ids created by this extension
     */
    function getTokenIds() external view returns (uint256[] memory tokenIds);

    /**
     * @dev gets all token owner addresses for a given collection
     */
    function getTokenOwnersForCollection(string memory collectionName) external view returns (address[] memory tokenOwners);

    /**
     * @dev gets the edition number for a collection
     */
    function editionCountByCollectionName(string memory collectionName) external view returns (uint256);

    /**
     * @dev See {IERC721CreatorCore-setBaseURI}.
     */
    function setBaseURI(string memory baseURI) external;

    /**
     * @dev gets two indexed arrays of collection name and token id to constitute a map
     */
    function getCollections() external view returns (string[] memory collectionNames, uint32[] memory editionNumbers);
}
