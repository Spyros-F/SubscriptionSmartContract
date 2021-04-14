pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./token/IBEP20.sol";

contract SubscriptionContract is Context, Ownable {
  using SafeERC20 for IBEP20;

  uint256 private sizeOfSubscription;
  uint256 private totalSupply;
  address private vaultAddress;
  IBEP20 token;
  mapping (address => User) userInfo;

  struct User {
    uint256 balance;
    address userAddr;
    Subscription subInfo;
  }

  struct Subscription {
    bool status;
    uint256 expiry;
  }

  constructor(uint256 _sizeOfSubscription, address _vaultAddress, IBEP20 _token) {
    sizeOfSubscription = _sizeOfSubscription;
    vaultAddress = _vaultAddress;
    token = _token;
  }

  function balanceOf(address user) public view virtual  returns (uint256) {
    return user.balance;
  }

  function getSizeOfSubscription() public view virtual  returns (uint256) {
    return sizeOfSubscription;
  }

  function setSizeOfSubscription(uint256 _sizeOfSubscription) public onlyOwner{
    sizeOfSubscription = _sizeOfSubscription;
  }

  function subscribe() public {
    User storage user = userInfo[msg.sender];

    user.subInfo.status = true;    
    user.subInfo.expiry = block.timestamp + 30 days;
    totalSupply -= sizeOfSubscription;
    user.balance -= sizeOfSubscription;
    token.safeTransfer(vaultAddress, sizeOfSubscription);
  }

  function checkSubscription(User storage user) internal returns(bool status){        
    if(user.subInfo.status != true) {  
      // if the user is not subscribed          
      return false;        
    }        
    if (block.timestamp >= user.subInfo.expiry) {   
      // if the subscription has expired  
      // update status to false        
      user.subInfo.status = false;            
      return false;        
    } else {            
      return true;        
    }    
  }

  function cancelSubscription() public {
    User storage user = userInfo[msg.sender];

    if(user.subInfo.status == true) {
      token.safeTransferFrom(address(this), msg.sender, sizeOfSubscription);
      user.balance -= sizeOfSubscription;
      totalSupply -= sizeOfSubscription;
      user.subInfo.status = false;
    }
  }

  event Deposit(address user, uint256 amount);


  function deposit(uint256 amount) external {
    User storage user = userInfo[msg.sender];
    
    require(token.transferFrom(msg.sender, address(this), amount), "User cannot achieve the transfer");
    user.balance = user.balance + amount;
    totalSupply += amount;
    if(!user.subInfo.status) {
      subscribe();
    }
  }
}