// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts";

contract DAOify is Ownable {
    using Counters for Counters.Counter;

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 requestedAmount;
        uint256 votesYes;
        uint256 votesNo;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        address proposer;
        mapping(address => bool) hasVoted;
    }

    struct Member {
        address addr;
        uint256 votingPower;
        bool isActive;
        uint256 joinDate;
    }

    // DAO Configuration
    string public name;
    string public description;
    uint256 public quorum;
    uint256 public votingPeriod;
    uint256 public minVotingPower;
    IERC20 public governanceToken;

    // State variables
    Counters.Counter private _proposalIds;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Member) public members;
    address[] public memberAddresses;
    uint256 public totalVotingPower;

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event MemberAdded(address indexed member, uint256 votingPower);
    event MemberRemoved(address indexed member);

    constructor(
        string memory _name,
        string memory _description,
        uint256 _quorum,
        uint256 _votingPeriod,
        uint256 _minVotingPower,
        address _governanceToken
    ) Ownable(msg.sender) {
        name = _name;
        description = _description;
        quorum = _quorum;
        votingPeriod = _votingPeriod;
        minVotingPower = _minVotingPower;
        governanceToken = IERC20(_governanceToken);

        // Add creator as first member
        members[msg.sender] = Member({
            addr: msg.sender,
            votingPower: 100,
            isActive: true,
            joinDate: block.timestamp
        });
        memberAddresses.push(msg.sender);
        totalVotingPower = 100;
    }

    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _requestedAmount
    ) external returns (uint256) {
        require(members[msg.sender].isActive, "Not a member");
        require(members[msg.sender].votingPower >= minVotingPower, "Insufficient voting power");

        _proposalIds.increment();
        uint256 proposalId = _proposalIds.current();

        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.requestedAmount = _requestedAmount;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod;
        newProposal.proposer = msg.sender;

        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _support) external {
        require(members[msg.sender].isActive, "Not a member");
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;
        if (_support) {
            proposal.votesYes += members[msg.sender].votingPower;
        } else {
            proposal.votesNo += members[msg.sender].votingPower;
        }

        emit Voted(_proposalId, msg.sender, _support);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");

        uint256 totalVotes = proposal.votesYes + proposal.votesNo;
        require(totalVotes >= (totalVotingPower * quorum) / 100, "Quorum not met");

        if (proposal.votesYes > proposal.votesNo) {
            proposal.executed = true;
            emit ProposalExecuted(_proposalId);
        }
    }

    function addMember(address _member, uint256 _votingPower) external onlyOwner {
        require(!members[_member].isActive, "Already a member");
        require(_votingPower > 0, "Invalid voting power");

        members[_member] = Member({
            addr: _member,
            votingPower: _votingPower,
            isActive: true,
            joinDate: block.timestamp
        });
        memberAddresses.push(_member);
        totalVotingPower += _votingPower;

        emit MemberAdded(_member, _votingPower);
    }

    function removeMember(address _member) external onlyOwner {
        require(members[_member].isActive, "Not a member");

        members[_member].isActive = false;
        totalVotingPower -= members[_member].votingPower;

        emit MemberRemoved(_member);
    }

    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 requestedAmount,
        uint256 votesYes,
        uint256 votesNo,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        address proposer
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.requestedAmount,
            proposal.votesYes,
            proposal.votesNo,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.proposer
        );
    }

    function getMemberCount() external view returns (uint256) {
        return memberAddresses.length;
    }
} 