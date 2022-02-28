// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/openzeppelin/contracts/utils/Context.sol";
import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/openzeppelin/contracts/utils/math/SafeMath.sol";
import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/openzeppelin/contracts/token/ERC20/IERC20.sol";
import "https://github.com/bbaguette-world/bbaguette-v1/blob/main/src/contracts/NFT/ERC721/IBBGTv1.sol";

contract BloKnightzSale is Context {
    using SafeMath for uint256;

    IBBGTv1 public BBGTNFTContract;

    uint16 MAX_SUPPLY = 7776;
    uint256 PRICE_PER_ETH = 0.19 ether;
    uint256 public constant maxPurchase = 20;
    
    bool public isSale = false;
    //기여자 추가해서 에어드랍?느낌으로 이더주기
    address public C1;
    address public C2;
    
    modifier mintRole(uint256 numberOfTokens) {
        require(isSale, "The sale has not started. Meow~");
        require(
            BBGTNFTContract.totalSupply() < MAX_SUPPLY,
            "Sale has already ended. Meow~"
        );
        require(numberOfTokens <= maxPurchase, "Can only mint 20 NFT at a time");
        require(
            BBGTNFTContract.totalSupply().add(numberOfTokens) <= MAX_SUPPLY,
            "Purchase would exceed max supply of NFT"
        );
        _;
    }

    modifier mintRoleByETH(uint256 numberOfTokens) {
        require(
            PRICE_PER_ETH.mul(numberOfTokens) <= msg.value,
            "ETH value sent is not correct"
        );
        _;
    }
    //mintcontract = PlaentParksale address
    // C1: Developer // Add more Developer C2,,,
    modifier onlyCreator() {
        require(
            C1 == _msgSender(),
            "onlyCreator: caller is the creator"
        );
        _;
    }

    modifier onlyC1() {
        require(C1 == _msgSender(), "only C1: caller is not C1");
        _;
    }

    constructor(
        address nft,
        address _C1
        
    ) {
        BBGTNFTContract = IBBGTv1(nft);
        C1 = _C1;
        
    }

    function mintByETH(uint256 numberOfTokens)
        public
        payable
        mintRole(numberOfTokens)
        mintRoleByETH(numberOfTokens)
    {
        for (uint256 i = 0; i < numberOfTokens; i++) {
            if (BBGTNFTContract.totalSupply() < MAX_SUPPLY) {
                BBGTNFTContract.mint(_msgSender());
            }
        }
    }

    function preMint(uint256 numberOfTokens, address receiver)
        public
        onlyCreator
    {
        require(!isSale, "The sale has started. Can't call preMint");
        for (uint256 i = 0; i < numberOfTokens; i++) {
            if (BBGTNFTContract.totalSupply() < MAX_SUPPLY) {
                BBGTNFTContract.mint(receiver);
            }
        }
    }

    function withdraw() public payable onlyCreator {
        uint256 contractETHBalance = address(this).balance;
        uint256 percentageETH = contractETHBalance / 100;
        require(payable(C1).send(percentageETH * 100));
    }

    function setC1(address changeAddress) public onlyC1 {
        C1 = changeAddress;
    }

    

    function setSale() public onlyCreator {
        isSale = !isSale;
    }
}