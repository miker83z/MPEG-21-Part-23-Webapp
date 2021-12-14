// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <=0.8.6;
pragma experimental ABIEncoderV2;
import "Ethereum_Media_Token.sol";

contract Cel {
    // struct clause {
    //  string id;					//contractId
    //

    //string[] stringArgs;//med : no longer exists!!!
    //	0 = textVersion
    //	1 = metadata
    //	2 = contractsRelated
    //	3 = #number of deontic clauses
    //	4 = party1
    //	5 = party2 ...

    //	string[] partyArgs;
    //	[] = party
    //
    //===========================================
    //	string[][n] = deonticStructuredClause  (mltstringArgs)
    //	[0][] = Subject
    //	[1][] = Object
    //  [2][] = Type
    //	[3][] = Issuer
    //	[4][] = constraintexists
    //  [5][] = ID of Clause
    //
    //============================
    //	string[][][n] = Act (actArgs)
    //	[i][0][0] = relr
    //	[i][1][] = Payment (addPayment fcn)
    //	[i][1][0] = incomePercentage
    //	[i][1][1] = amount
    //	[i][1][2] = currency
    //	[i][1][3] = Beneficiary
    //	[i][1][4] = IncomeSource
    //	[i][2][0] = Provide
    //
    //
    //
    //
    //===========================================
    //   string[][][n] = Constraints (n = number of deonticStructuredClause)
    //	[i][0][0] = accessPolicy
    //	[i][0][1] = deliveryModality
    //	[i][0][2] = runs
    //	[i][0][3] = language
    //	[i][0][4] = FactCompositionType
    //	[i][0][5] = location
    //	[i][0][6] = beforeDate
    //	[i][0][7] = afterDate
    //	[i][0][8] = exclusive
    //	[i][0][] =
    //	[i][0][] =
    //	[i][0][] =
    //	[i][1][0] = FC language
    //	[i][1][1] =	FC location
    //	[i][1][2] = FC beforeDate
    //	[i][1][3] = FC afterDate
    //	[i][1][] =
    //	[i][1][] =
    //
    //
    //
    // subject, act, object, constraint, issuer
    string[6][7] private mltstringArgs;
    string[6][5][7] private actArgs;
    string[10][2][9] private constrArgs;
    mapping(address => string) internal parties;
    address payable[] internal partiesAddresses;
    MediaToken public tokenContract; // = metaIdentifier (cel)
    address public tokenAddress;
    uint256 public tokenPrice; //in Wei ()
    uint256 public tokensSold;
    mapping(address => uint256) private payments;
    event Sell(address _buyer, uint256 _amount);
    event PayParty(address _party, uint256 _amount);
    uint256 private numOfClauses;
    string[] private partyArgs;

    function addtokenContract(address arg) public {
        tokenContract = MediaToken(arg);
    }

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            // c = b[i] was not needed
            if (uint256(uint8(b[i])) >= 48 && uint256(uint8(b[i])) <= 57) {
                result = result * 10 + (uint256(uint8(b[i])) - 48); // bytes and int are not compatible with the operator -.
            }
        }
        return result; // this was missing
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "error miltiply");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value == multiply(1, tokenPrice),
            "require1:buyTokens You have to Pay exactly token Price (call tokenPrice)"
        );
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "require2: buyTokens All tokens are sold out"
        );
        require(
            tokenContract.transfer(msg.sender, _numberOfTokens),
            "require3:buyTokens unable to send token"
        );

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function buyLicense() public payable {
        require(
            msg.value == tokenPrice,
            "require1:buyLicense You have to Pay exactly token Price (call tokenPrice)"
        );
        require(
            tokenContract.balanceOf(address(this)) >= 1,
            "require2:buyLicense All tokens are sold out"
        );
        require(
            tokenContract.transfer(msg.sender, 1),
            "require3:buyLicense unable to send token"
        );

        tokensSold += 1;

        emit Sell(msg.sender, 1);
        payParties();
        // contract clauses
    }

    function payParties() internal {
        string memory addr;
        string memory money;
        bytes memory a;
        bytes memory b;

        for (uint256 i = 0; i < numOfClauses; i++) {
            addr = getPaymentAddress(i);
            money = getIncomePercentage(i);
            a = bytes(addr);
            b = bytes(money);
            if (a.length != 0 && b.length != 0) {
                address payable soundRecording = payable(parseAddr(addr));
                uint256 soundRecordingMoney = uint256(
                    (stringToUint(money) * tokenPrice) / 100
                );

                soundRecording.transfer(soundRecordingMoney);
                emit PayParty(soundRecording, soundRecordingMoney);
            }
        }
    }

    function getTokenBalance() public view returns (uint256 tokenBalance) {
        tokenBalance = tokenContract.balanceOf(address(this));
        return tokenBalance;
    }

    function addParty(string memory _value) public {
        partyArgs.push(_value);
    }

    //addthis
    function getParties() public view returns (string[] memory) {
        return partyArgs;
    }

    function parseAddr(string memory _a)
        internal
        pure
        returns (address _parsedAddress)
    {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint256 i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }

    //===================================================================
    function addParty(address payable _key, string memory _value) public {
        parties[_key] = _value;
        partiesAddresses.push(_key);
    }

    function getPartyByAddress(address _key)
        public
        view
        returns (string memory)
    {
        return parties[_key];
    }

    function addOPType(string memory arg, uint256 i) public returns (bool) {
        mltstringArgs[i][2] = arg;
    }

    function getOPType(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][2];
    }

    function addOPSubject(string memory arg, uint256 i) public returns (bool) {
        mltstringArgs[i][0] = arg;
    }

    function getOPSubject(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][0];
    }

    function addOPObject(string memory arg, uint256 i) public returns (bool) {
        mltstringArgs[i][1] = arg;
    }

    function getOPObject(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][1];
    }

    function addOPIssuer(string memory arg, uint256 i) public returns (bool) {
        mltstringArgs[i][3] = arg;
    }

    function getOPIssuer(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][3];
    }

    function addCE(uint256 i) public returns (bool) {
        mltstringArgs[i][4] = "yes";
    }

    function getCE(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][4];
    }

    function addCId(string memory arg, uint256 i) public returns (bool) {
        mltstringArgs[i][5] = arg;
    }

    function getCId(uint256 i) public view returns (string memory) {
        return mltstringArgs[i][5];
    }

    function addrelr(string memory arg, uint256 i) public returns (bool) {
        actArgs[i][0][0] = arg;
    }

    function getrelr(uint256 i) public view returns (string memory) {
        return actArgs[i][0][0];
    }

    function addNumOfClauses(uint256 arg) public returns (bool) {
        numOfClauses = arg;
    }

    function getNumOfClauses() public view returns (uint256) {
        return numOfClauses;
    }

    function addPayment(string[6] memory arg, uint256 i) public returns (bool) {
        actArgs[i][1][0] = arg[0];
        actArgs[i][1][1] = arg[1];
        actArgs[i][1][2] = arg[2];
        actArgs[i][1][3] = arg[3];
        actArgs[i][1][4] = arg[4];
        actArgs[i][1][5] = arg[5];
        tokenPrice = stringToUint(arg[1]);
    }

    function getIncomePercentage(uint256 i)
        public
        view
        returns (string memory)
    {
        return actArgs[i][1][0];
    }

    function getAmount(uint256 i) public view returns (string memory) {
        return actArgs[i][1][1];
    }

    function getCurrency(uint256 i) public view returns (string memory) {
        return actArgs[i][1][2];
    }

    function getBeneficiary(uint256 i) public view returns (string memory) {
        return actArgs[i][1][3];
    }

    function getIncomeSource(uint256 i) public view returns (string memory) {
        return actArgs[i][1][4];
    }

    function getPaymentAddress(uint256 i) public view returns (string memory) {
        return actArgs[i][1][5];
    }

    function addProvide(string memory arg, uint256 i) public returns (bool) {
        actArgs[i][2][0] = arg;
    }

    function getProvide(uint256 i) public view returns (string memory) {
        return actArgs[i][2][0];
    }

    function addAccessPolicy(string memory arg, uint256 i)
        public
        returns (bool)
    {
        constrArgs[i][0][0] = arg;
    }

    function getAccessPolicy(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][0];
    }

    function adddeliveryModality(string memory arg, uint256 i)
        public
        returns (bool)
    {
        constrArgs[i][0][1] = arg;
    }

    function getdeliveryModality(uint256 i)
        public
        view
        returns (string memory)
    {
        return constrArgs[i][0][1];
    }

    function addruns(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][2] = arg;
    }

    function getruns(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][2];
    }

    function addlanguage(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][3] = arg;
    }

    function getlanguage(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][3];
    }

    function addlocation(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][5] = arg;
    }

    function getlocation(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][5];
    }

    function addtime1(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][6] = arg;
    }

    function gettime1(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][6];
    }

    function addtime2(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][7] = arg;
    }

    function gettime2(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][7];
    }

    function addexclusive(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][0][8] = arg;
    }

    function getexclusive(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][8];
    }

    function addComposition(string memory arg, uint256 i)
        public
        returns (bool)
    {
        constrArgs[i][0][4] = arg;
    }

    function getComposition(uint256 i) public view returns (string memory) {
        return constrArgs[i][0][4];
    }

    function addFClanguage(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][1][0] = arg;
    }

    function getFClanguage(uint256 i) public view returns (string memory) {
        return constrArgs[i][1][0];
    }

    function addFClocation(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][1][1] = arg;
    }

    function getFClocation(uint256 i) public view returns (string memory) {
        return constrArgs[i][1][1];
    }

    function addFCtime1(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][1][2] = arg;
    }

    function getFCtime1(uint256 i) public view returns (string memory) {
        return constrArgs[i][1][2];
    }

    function addFCtime2(string memory arg, uint256 i) public returns (bool) {
        constrArgs[i][1][3] = arg;
    }

    function getFCtime2(uint256 i) public view returns (string memory) {
        return constrArgs[i][1][3];
    }
}
