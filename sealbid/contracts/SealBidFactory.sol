// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SealBidAuction.sol";

contract SealBidFactory {
    // ─── Storage ─────────────────────────────────────────────────────────────────
    address public immutable usdc;
    address[] private auctions;
    mapping(address => address[]) private auctionsByCreator;

    // ─── Events ───────────────────────────────────────────────────────────────────
    event AuctionCreated(
        address indexed auctionAddress,
        address indexed creator,
        string title,
        uint256 timestamp
    );

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = _usdc;
    }

    // ─── Create Auction ───────────────────────────────────────────────────────────
    function createAuction(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageUrl,
        uint256 _reservePrice,
        bool _reserveVisible,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) external returns (address) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 80, "Title too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(_commitDuration >= 1 hours, "Commit duration too short");
        require(_commitDuration <= 7 days, "Commit duration too long");
        require(_revealDuration >= 30 minutes, "Reveal duration too short");
        require(_revealDuration <= 3 days, "Reveal duration too long");

        SealBidAuction auction = new SealBidAuction(
            usdc,
            msg.sender,
            _title,
            _description,
            _category,
            _imageUrl,
            _reservePrice,
            _reserveVisible,
            _commitDuration,
            _revealDuration
        );

        address auctionAddr = address(auction);
        auctions.push(auctionAddr);
        auctionsByCreator[msg.sender].push(auctionAddr);

        emit AuctionCreated(auctionAddr, msg.sender, _title, block.timestamp);

        return auctionAddr;
    }

    // ─── Views ────────────────────────────────────────────────────────────────────
    function getAuctions() external view returns (address[] memory) {
        return auctions;
    }

    function getAuctionsByCreator(address _creator) external view returns (address[] memory) {
        return auctionsByCreator[_creator];
    }

    function auctionCount() external view returns (uint256) {
        return auctions.length;
    }
}
