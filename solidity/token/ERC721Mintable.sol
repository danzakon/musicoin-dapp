pragma solidity ^0.4.24;

import "./ERC721.sol";

/**
 * @title ERC721Mintable
 * @dev ERC721 minting logic
 */
contract ERC721Mintable is ERC721{
    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param tokenId The token id to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 tokenId) public payable returns (bool) {
        require(msg.value > 250000000000000000);
        _mint(to, tokenId);
        return true;
    }
}