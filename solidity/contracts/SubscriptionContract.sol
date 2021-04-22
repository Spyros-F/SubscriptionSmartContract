pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./token/IBEP20.sol";

contract SubscriptionContract is Context, Ownable {
  uint256 public sizeOfSubscription;
  address public vaultAddress;
  ERC20 public token;
  mapping (address => User) public userInfo;

  struct User {
    uint256 balance;
    address userAddr;
    Subscription subInfo;
  }

  struct Subscription {
    // is true if user is subscribed else is false
    bool status;
    uint256 dateOfSubscription;
  }

  constructor(uint256 _sizeOfSubscription, address _vaultAddress, ERC20 _token) {
    sizeOfSubscription = _sizeOfSubscription;
    vaultAddress = _vaultAddress;
    token = _token;
  }

  /**
   * @notice Returns the balance of a user in the contract
   * @param user The address of a user
   */
  function balanceOf(address user) public view returns (uint256) {
    return userInfo[user].balance;
  }

  /**
   * @notice The owner of the contract sets the value of the subscription
   * @param _sizeOfSubscription value of the subscription
   */
  function setSizeOfSubscription(uint256 _sizeOfSubscription) public onlyOwner {
    sizeOfSubscription = _sizeOfSubscription;
  }

  /**
   * @notice Subscribes the user that made the call
   */
  function subscribe() public {
    userInfo[msg.sender] = User({
      subInfo: Subscription({
        status: true,
        dateOfSubscription: block.timestamp
      }),
      userAddr: msg.sender,
      balance: balanceOf(msg.sender) - sizeOfSubscription
    });

    require(token.transfer(vaultAddress, sizeOfSubscription), "Transfer to vault address failed");
  }

  /**
   * @notice Checks if subscription has expire
   * @param user the address of a user
   */
  function hasSubscriptionExpired(address user) public view returns (bool) {
    return userInfo[user].subInfo.dateOfSubscription + 30 days < block.timestamp;
  }

  /**
   * @notice If subscription has expire and user has money updates his subscription, otherwise makes
   * his subscription status false
   * @param user the address of a user
   */
  function updateSubscription(address user) public {
    if (hasSubscriptionExpired(user)) {
      if(userInfo[user].subInfo.status && balanceOf(user) > sizeOfSubscription) {
        userInfo[user].balance -= sizeOfSubscription;
        userInfo[user].subInfo.dateOfSubscription = block.timestamp;
      } else {
        userInfo[user].subInfo.status = false;
      }
    }
  }

  /**
   * @notice Cancels users subscription 
   */
  function cancelSubscription() public {
    User storage user = userInfo[msg.sender];

    if(user.subInfo.status == true) {
      user.subInfo.status = false;
    }
  }

  event Deposit(address user, uint256 amount);

  /**
   * @notice Updates if subscription has expired, calls subscribe if user is not subscribe and transfer the tokens
   * from user to the contract 
   * @param amount the value that user deposits
   */
  function deposit(uint256 amount) external {
    require(token.transferFrom(msg.sender, address(this), amount), "User cannot achieve the transfer");

    User storage user = userInfo[msg.sender];
    user.balance = user.balance + amount;
    updateSubscription(msg.sender);

    if(!user.subInfo.status) {
      subscribe();
    }

    emit Deposit(msg.sender, amount);
  }
}