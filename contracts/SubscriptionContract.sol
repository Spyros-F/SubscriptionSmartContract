pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./token/IBEP20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SubscriptionContract is Context, Ownable {

  uint256 private sizeOfSubscription;
  uint256 private totalSupply;
  address private vaultAddress;
  bool private isUserSubscribed;
  ERC20  token;
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

  constructor(uint256 _sizeOfSubscription, address _vaultAddress, ERC20 _token) {
    sizeOfSubscription = _sizeOfSubscription;
    vaultAddress = _vaultAddress;
    token = _token;
  }

  function balanceOf(address user) public view virtual returns (uint256) {
    return userInfo[user].balance;
  }

  function getSizeOfSubscription() public view virtual  returns (uint256) {
    return sizeOfSubscription;
  }

  function getToken() public view virtual  returns (ERC20) {
    return token;
  }

  function getVaultAddress() public view virtual  returns (address) {
    return vaultAddress;
  }

  function setSizeOfSubscription(uint256 _sizeOfSubscription) public onlyOwner{
    sizeOfSubscription = _sizeOfSubscription;
  }

  function getIsUserSubscribed() public view returns (bool) {
    return isUserSubscribed;
  }

  function subscribe() public {
    User storage user = userInfo[msg.sender];
    Subscription memory subInfo = Subscription(false, block.timestamp);
    user.subInfo = subInfo;
    user.subInfo.status = true;
    user.subInfo.expiry = block.timestamp + 30 days;
    totalSupply -= sizeOfSubscription;
    user.balance -= sizeOfSubscription;
    require(token.transfer(vaultAddress, sizeOfSubscription), "Transfer to vault address failed");
  }

  function checkSubscription(address user) public {        
    if (userInfo[user].subInfo.status == true) {
      isUserSubscribed = true;
    } else {
      isUserSubscribed = false;
    }
  }

  function cancelSubscription() public {
    User storage user = userInfo[msg.sender];

    if(user.subInfo.status == true) {
      token.transferFrom(vaultAddress, msg.sender, sizeOfSubscription);
      user.balance += sizeOfSubscription;
      totalSupply += sizeOfSubscription;
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
    emit Deposit(msg.sender, amount);
  }
}