pragma solidity ^0.4.24;

import "token/ERC721.sol";

contract Song is ERC721Token {

    mapping (uint => uint) tokenToSong;

    constructor() public {
        symbol = "SONG";
        name = "Song";
        allSupply = 0;
    }

    function getSong(uint _tokenId) public view returns (uint) {
        return tokenToSong[_tokenId];
    }

}