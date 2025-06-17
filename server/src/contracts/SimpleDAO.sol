// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DaoifyDAO {
    struct Proposal {
        string description;
        uint256 votes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    string public daoName;
    string public daoDescription;
    address public owner;
    Proposal[] public proposals;
    
    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address voter);
    event ProposalExecuted(uint256 proposalId);

    constructor(string memory _name, string memory _description) {
        daoName = _name;
        daoDescription = _description;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function createProposal(string memory _description) public  {
        Proposal storage newProposal = proposals.push();
        newProposal.description = _description;
        newProposal.votes = 0;
        newProposal.executed = false;
        
        emit ProposalCreated(proposals.length - 1, _description);
    }

    function vote(uint256 _proposalId) public {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(!proposals[_proposalId].hasVoted[msg.sender], "Already voted");
        require(!proposals[_proposalId].executed, "Proposal already executed");

        proposals[_proposalId].hasVoted[msg.sender] = true;
        proposals[_proposalId].votes += 1;

        emit Voted(_proposalId, msg.sender);
    }

    function executeProposal(uint256 _proposalId) public  {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(proposals[_proposalId].votes > 0, "No votes for this proposal");

        proposals[_proposalId].executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 _proposalId) public view returns (
        string memory description,
        uint256 votes,
        bool executed
    ) {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.description, proposal.votes, proposal.executed);
    }
} 