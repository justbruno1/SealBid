// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

contract SealBidAuction {
    // ─── State Enums ────────────────────────────────────────────────────────────
    enum AuctionState { COMMIT, REVEAL, SETTLED, CANCELLED }

    // ─── Structs ─────────────────────────────────────────────────────────────────
    struct AuctionInfo {
        address creator;
        string title;
        string description;
        string category;
        string imageUrl;
        uint256 reservePrice;
        bool reserveVisible;
        uint256 commitDeadline;
        uint256 revealDeadline;
        AuctionState state;
        address winner;
        uint256 winningBid;
        uint256 commitCount;
        uint256 revealCount;
        uint256 createdAt;
    }

    struct Commitment {
        bytes32 commitHash;
        uint256 deposit;
        bool revealed;
        bool refunded;
        uint256 revealedAmount;
        uint256 timestamp;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    AuctionInfo public info;

    mapping(address => Commitment) private commitments;
    address[] private bidders;

    address private highestBidder;
    uint256 private highestBid;

    // ─── Events ───────────────────────────────────────────────────────────────────
    event BidCommitted(address indexed bidder, uint256 deposit, uint256 timestamp);
    event BidRevealed(address indexed bidder, uint256 amount, bool isHighest);
    event AuctionSettled(address indexed winner, uint256 winningBid, bool reserveMet);
    event AuctionCancelled(address indexed creator);
    event RefundClaimed(address indexed bidder, uint256 amount);

    // ─── Modifiers ────────────────────────────────────────────────────────────────
    modifier onlyCreator() {
        require(msg.sender == info.creator, "Not the creator");
        _;
    }

    modifier inState(AuctionState _state) {
        _updateState();
        require(info.state == _state, "Invalid auction state");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(
        address _usdc,
        address _creator,
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageUrl,
        uint256 _reservePrice,
        bool _reserveVisible,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) {
        usdc = IERC20(_usdc);
        info.creator = _creator;
        info.title = _title;
        info.description = _description;
        info.category = _category;
        info.imageUrl = _imageUrl;
        info.reservePrice = _reservePrice;
        info.reserveVisible = _reserveVisible;
        info.commitDeadline = block.timestamp + _commitDuration;
        info.revealDeadline = block.timestamp + _commitDuration + _revealDuration;
        info.state = AuctionState.COMMIT;
        info.createdAt = block.timestamp;
    }

    // ─── Internal State Transition ────────────────────────────────────────────────
    function _updateState() internal {
        if (info.state == AuctionState.COMMIT && block.timestamp > info.commitDeadline) {
            info.state = AuctionState.REVEAL;
        }
    }

    // ─── COMMIT PHASE ─────────────────────────────────────────────────────────────
    function commit(bytes32 _commitHash, uint256 _depositAmount) external {
        _updateState();
        require(info.state == AuctionState.COMMIT, "Not in commit phase");
        require(block.timestamp <= info.commitDeadline, "Commit phase ended");
        require(_depositAmount > 0, "Deposit must be greater than 0");

        bool isNewBidder = commitments[msg.sender].timestamp == 0;

        // If updating, return previous deposit first
        if (!isNewBidder && !commitments[msg.sender].revealed) {
            uint256 prevDeposit = commitments[msg.sender].deposit;
            if (prevDeposit > 0) {
                commitments[msg.sender].deposit = 0;
                require(usdc.transfer(msg.sender, prevDeposit), "Refund of previous deposit failed");
            }
        } else if (!isNewBidder && commitments[msg.sender].revealed) {
            revert("Already revealed, cannot update commitment");
        }

        require(usdc.transferFrom(msg.sender, address(this), _depositAmount), "USDC transfer failed");

        commitments[msg.sender].commitHash = _commitHash;
        commitments[msg.sender].deposit = _depositAmount;
        commitments[msg.sender].timestamp = block.timestamp;
        commitments[msg.sender].revealed = false;
        commitments[msg.sender].refunded = false;
        commitments[msg.sender].revealedAmount = 0;

        if (isNewBidder) {
            bidders.push(msg.sender);
            info.commitCount++;
        }

        emit BidCommitted(msg.sender, _depositAmount, block.timestamp);
    }

    // ─── REVEAL PHASE ─────────────────────────────────────────────────────────────
    function reveal(uint256 _bidAmount, bytes32 _salt) external {
        _updateState();
        require(info.state == AuctionState.REVEAL, "Not in reveal phase");
        require(block.timestamp <= info.revealDeadline, "Reveal phase ended");

        Commitment storage c = commitments[msg.sender];
        require(c.timestamp != 0, "No commitment found");
        require(!c.revealed, "Already revealed");

        // Recompute hash — must match contract's scheme including this address
        bytes32 expectedHash = keccak256(
            abi.encodePacked(_bidAmount, _salt, msg.sender, address(this))
        );
        require(expectedHash == c.commitHash, "Hash mismatch: invalid bid receipt");

        // Deposit must be >= bid amount for the reveal to be valid
        require(c.deposit >= _bidAmount, "Deposit is less than revealed bid amount");

        c.revealed = true;
        c.revealedAmount = _bidAmount;
        info.revealCount++;

        // Tie-breaking: only update if strictly greater (earlier timestamp wins ties)
        bool isHighest = false;
        if (_bidAmount > highestBid) {
            highestBid = _bidAmount;
            highestBidder = msg.sender;
            isHighest = true;
        }

        emit BidRevealed(msg.sender, _bidAmount, isHighest);
    }

    // ─── SETTLEMENT ───────────────────────────────────────────────────────────────
    function settle() external {
        _updateState();
        require(
            info.state == AuctionState.REVEAL || info.state == AuctionState.COMMIT,
            "Cannot settle in this state"
        );
        require(block.timestamp > info.revealDeadline, "Reveal phase not ended");

        if (highestBidder != address(0) && highestBid >= info.reservePrice) {
            info.winner = highestBidder;
            info.winningBid = highestBid;
            info.state = AuctionState.SETTLED;

            // Transfer winning bid to creator
            require(usdc.transfer(info.creator, highestBid), "Transfer to creator failed");

            emit AuctionSettled(highestBidder, highestBid, true);
        } else {
            info.state = AuctionState.CANCELLED;
            emit AuctionSettled(address(0), 0, false);
        }
    }

    // ─── REFUNDS ─────────────────────────────────────────────────────────────────
    function claimRefund() external {
        require(
            info.state == AuctionState.SETTLED || info.state == AuctionState.CANCELLED,
            "Auction not yet settled"
        );

        Commitment storage c = commitments[msg.sender];
        require(c.deposit > 0, "No deposit to refund");
        require(!c.refunded, "Already refunded");

        uint256 refundAmount;

        if (info.state == AuctionState.CANCELLED) {
            // Full refund for everyone
            refundAmount = c.deposit;
        } else if (msg.sender == info.winner) {
            // Winner gets back excess deposit (deposit - winningBid)
            refundAmount = c.deposit > info.winningBid ? c.deposit - info.winningBid : 0;
        } else {
            // Losers get full deposit back
            refundAmount = c.deposit;
        }

        if (refundAmount == 0) {
            c.refunded = true;
            return;
        }

        c.refunded = true;
        require(usdc.transfer(msg.sender, refundAmount), "Refund transfer failed");

        emit RefundClaimed(msg.sender, refundAmount);
    }

    // ─── CANCEL ───────────────────────────────────────────────────────────────────
    function cancelAuction() external onlyCreator {
        _updateState();
        require(info.state == AuctionState.COMMIT, "Can only cancel during commit phase");
        require(info.commitCount == 0, "Cannot cancel: bids already received");

        info.state = AuctionState.CANCELLED;
        emit AuctionCancelled(msg.sender);
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────────
    function getAuctionInfo() external view returns (AuctionInfo memory) {
        AuctionInfo memory _info = info;
        // Reflect time-based state transitions in view
        if (_info.state == AuctionState.COMMIT && block.timestamp > info.commitDeadline) {
            _info.state = AuctionState.REVEAL;
        }
        return _info;
    }

    function getCommitment(address _bidder) external view returns (Commitment memory) {
        return commitments[_bidder];
    }

    function getAllRevealedBids()
        external
        view
        returns (address[] memory _bidders, uint256[] memory amounts)
    {
        uint256 count = bidders.length;
        _bidders = new address[](count);
        amounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            _bidders[i] = bidders[i];
            amounts[i] = commitments[bidders[i]].revealedAmount;
        }
    }

    function hasCommitted(address _bidder) external view returns (bool) {
        return commitments[_bidder].timestamp != 0;
    }

    function hasRevealed(address _bidder) external view returns (bool) {
        return commitments[_bidder].revealed;
    }

    function getCurrentHighestBid() external view returns (uint256) {
        if (info.state == AuctionState.COMMIT) return 0;
        return highestBid;
    }

    function getTimeRemaining()
        external
        view
        returns (uint256 commitTimeLeft, uint256 revealTimeLeft)
    {
        commitTimeLeft = block.timestamp < info.commitDeadline
            ? info.commitDeadline - block.timestamp
            : 0;
        revealTimeLeft = block.timestamp < info.revealDeadline
            ? info.revealDeadline - block.timestamp
            : 0;
    }

    function getBidders() external view returns (address[] memory) {
        return bidders;
    }
}
