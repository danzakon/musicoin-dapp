pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./IERC721.sol";
import "./Ownable.sol";

contract ERC721 is IERC721, Ownable {
    using SafeMath for uint;

    string public symbol;
    string public name;
    uint internal allSupply;

    mapping (address => uint[]) ownedTokens;
    mapping (uint => uint) indexOfToken;
    mapping (uint => address) ownership;
    mapping (address => uint) balances;
    mapping (address => mapping(address => uint)) allowed;

    function totalSupply() public view returns (uint) {
        return allSupply - balanceOf(address(0));
    }

    function balanceOf(address _owner) public view returns (uint) {
        return balances[_owner];
    }

    function ownerOf(uint _tokenId) public view returns (address) {
        require(_tokenId < allSupply);
        return ownership[_tokenId];
    }

    function indexOf(uint _tokenId) public view returns (uint) {
        return indexOfToken[_tokenId];
    }

    function tokensOfOwner(address _owner) external view returns (uint[]) {
        return ownedTokens[_owner];
    }

    function approve(address _to, uint _tokenId) public {
        require (ownership[_tokenId] == msg.sender);

        allowed[msg.sender][_to] = _tokenId;
        emit Approval(msg.sender, _to, _tokenId);
    }

    function transfer(address _to, uint _tokenId) public returns (bool) {
        require (ownership[_tokenId] == msg.sender);
        require (_to != address(0));

        moveToken(msg.sender, _to, _tokenId);

        emit Transfer(msg.sender, _to, _tokenId);

        return true;
    }

    function transferFrom(address _from, address _to, uint _tokenId) public returns (bool) {
        require (allowed[_from][_to] == _tokenId);
        require (ownership[_tokenId] == _from);
        require (_to != address(0));

        moveToken(_from, _to, _tokenId);

        emit Transfer(_from, _to, _tokenId);

        return true;
    }

    function moveToken(address _from, address _to, uint _tokenId) internal {
        unassignToken(_from, _tokenId);
        assignToken(_to, _tokenId);
    }

    function assignToken(address _to, uint _tokenId) internal {
        uint newIndex = ownedTokens[_to].push(_tokenId).sub(1);
        indexOfToken[_tokenId] = newIndex;
        ownership[_tokenId] = _to;
        balances[_to] = balances[_to].add(1);
    }

    function unassignToken(address _from, uint _tokenId) internal {
        uint tokenIndex = indexOfToken[_tokenId];
        uint lastTokenIndex = balances[_from].sub(1);
        uint lastTokenId = ownedTokens[_from][lastTokenIndex];

        ownedTokens[_from][tokenIndex] = lastTokenId;
        ownedTokens[_from][lastTokenIndex] = 0;
        ownedTokens[_from].length = ownedTokens[_from].length.sub(1);

        indexOfToken[lastTokenId] = tokenIndex;
        indexOfToken[_tokenId] = 0;
        balances[_from] = balances[_from].sub(1);
        ownership[_tokenId] = address(0);
    }

    // ------------------------------------------------------------------------
    // Don't accept ETH
    // ------------------------------------------------------------------------
    function () public payable {
        revert();
    }

    // ------------------------------------------------------------------------
    // Owner can transfer out any accidentally sent ERC721 tokens
    // ------------------------------------------------------------------------
    // function transferAnyERC721Token(address erc721Address, uint _tokenId) public onlyOwner returns (bool) {
    //     return IERC721(erc721Address).transfer(owner, _tokenId);
    // }
}