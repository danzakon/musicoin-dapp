pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// ERC Token Standard #721 Interface
// https://github.com/ethereum/EIPs/issues/721
// ----------------------------------------------------------------------------
contract IERC721 {
    function totalSupply() public view returns (uint);
    function balanceOf(address _owner) public view returns (uint);
    function ownerOf(uint _tokenId) public view returns (address);
    function tokensOfOwner(address _owner) external view returns (uint[]);

    function approve(address _to, uint _tokenId) public;
    function transfer(address _to, uint _tokenId) public returns (bool);
    function transferFrom(address from, address to, uint tokens) public returns (bool);

    event Transfer(address indexed _from, address indexed _to, uint _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint _tokenId);
}
