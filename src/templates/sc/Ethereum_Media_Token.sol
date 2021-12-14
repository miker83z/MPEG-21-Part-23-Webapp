// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.8.6;

contract MediaToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;

    string public textVersion;
    string public metadata;
    mapping(address => string) internal contractsRelated;
    address[] internal contractsRelatedAddresses;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(
        uint256 _totalSupply,
        string memory _name,
        string memory _symbol,
        string memory _textVersion,
        string memory _metadata
    ) {
        name = _name;
        symbol = _symbol;
        textVersion = _textVersion;
        metadata = _metadata;
        balanceOf[msg.sender] = _totalSupply;
        totalSupply = _totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    //==========================================================
    function getId() public view returns (string memory) {
        return name;
    }

    function getTextVersion() public view returns (string memory) {
        return textVersion;
    }

    function getMetadata() public view returns (string memory) {
        return metadata;
    }

    //==========================================================

    function addRelatedContract(address _key, string memory _value) public {
        contractsRelated[_key] = _value;
        contractsRelatedAddresses.push(_key);
    }

    function getRelatedContractByKey(address _key)
        public
        view
        returns (string memory)
    {
        return contractsRelated[_key];
    }

    function sizeContractsRelated() public view returns (uint256) {
        return uint256(contractsRelatedAddresses.length);
    }

    function getKeysContractsRelated() public view returns (address[] memory) {
        return contractsRelatedAddresses;
    }
    //==========================================================
}
