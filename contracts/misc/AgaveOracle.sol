// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';
import {IERC20Detailed} from '../dependencies/openzeppelin/contracts/IERC20Detailed.sol';

import {IPriceOracleGetter} from '../interfaces/IPriceOracleGetter.sol';

import {ISupraSValueFeed} from './interfaces/ISupraSValueFeed.sol';

import {SafeMath} from '../dependencies/openzeppelin/contracts/SafeMath.sol';
import {SafeERC20} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';

/// @title AgaveOracle
/// @author Aave
/// @notice Proxy smart contract to get the price of an asset from a price source, with Chainlink Aggregator
///         smart contracts as primary option
/// - If the returned price by a Chainlink aggregator is <= 0, the call is forwarded to a fallbackOracle
/// - Owned by the Agave governance system, allowed to add sources for assets, replace them
///   and change the fallbackOracle
/// - Modified for Agave deployment by adding free-based asset prices.
contract AgaveOracle is IPriceOracleGetter, Ownable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  event WrappedNativeSet(address indexed wrappedNative);
  event AssetSourceUpdated(address indexed asset, uint64 indexed oracleIndex);
  event FallbackOracleUpdated(address indexed fallbackOracle);

  mapping(address => uint64) private oracleIndex;
  ISupraSValueFeed public oracle;

  IPriceOracleGetter private _fallbackOracle;
  address public immutable wrappedNative;
  uint8 private immutable _wrappedNativeDecimals;

  // @notice Constructor
  // @param assets The addresses of the assets
  // @param sources The address of the source of each asset
  // @param fallbackOracle The address of the fallback oracle to use if the data of an
  //        aggregator is not consistent
  constructor(
    address[] memory assets,
    uint64[] memory indexes,
    address _wrappedNative,
    address _emergencyOracle,
    address _oracleAddress
  ) public {
    _setFallbackOracle(_emergencyOracle);
    _setAssetsIndexes(assets, indexes);
    wrappedNative = _wrappedNative;
    _wrappedNativeDecimals = IERC20Detailed(_wrappedNative).decimals();
    oracle = ISupraSValueFeed(_oracleAddress);
    emit WrappedNativeSet(_wrappedNative);
  }

  // @notice External function called by the Aave governance to set or replace sources of assets
  // @param assets The addresses of the assets
  // @param sources The address of the source of each asset
  function setAssetsIndexes(
    address[] calldata assets,
    uint64[] calldata indexes
  ) external onlyOwner {
    _setAssetsIndexes(assets, indexes);
  }

  // @notice Sets the fallbackOracle
  // - Callable only by the Aave governance
  // @param fallbackOracle The address of the fallbackOracle
  function setFallbackOracle(address fallbackOracle) external onlyOwner {
    _setFallbackOracle(fallbackOracle);
  }

  // @notice Internal function to set the sources for each asset
  // @param assets The addresses of the assets
  // @param sources The address of the source of each asset
  function _setAssetsIndexes(address[] memory assets, uint64[] memory indexes) internal {
    require(assets.length == indexes.length, 'INCONSISTENT_PARAMS_LENGTH');

    for (uint256 i; i < assets.length; i++) {
      oracleIndex[assets[i]] = indexes[i];
      emit AssetSourceUpdated(assets[i], indexes[i]);
    }
  }

  // @notice Internal function to set the fallbackOracle
  // @param fallbackOracle The address of the fallbackOracle
  function _setFallbackOracle(address fallbackOracle) internal {
    _fallbackOracle = IPriceOracleGetter(fallbackOracle);
    emit FallbackOracleUpdated(fallbackOracle);
  }

  // @notice Gets an asset price by address
  // @param asset The asset address
  function getAssetPrice(address asset) public view override returns (uint256) {
    require(asset != address(0), 'Address 0');

    uint64 index = oracleIndex[asset];
    (bytes32 assetBytes, bool failed) = oracle.getSvalue(index);
    require(!failed, 'Invalid Oracle');
    uint256 price = unpackPrice(assetBytes);
    return price;
  }

  function unpackPrice(bytes32 data) internal pure returns (uint256) {
    uint256 price = bytesToUint256(abi.encodePacked((data << 136) >> 160));
    uint256 decimal = bytesToUint256(abi.encodePacked(data << 64 >> 248));
    if (decimal != 18) {
        price = price * (10 ** (18 - decimal));
    }
    return price;
  }

  function bytesToUint256(bytes memory _bs) internal pure returns (uint256 value) {
    require(_bs.length == 32, 'bytes length is not 32.');
    assembly {
      value := mload(add(_bs, 0x20))
    }
  }

  // @notice Gets a list of prices from a list of assets addresses
  // @param assets The list of assets addresses
  function getAssetsPrices(address[] calldata assets) external view returns (uint256[] memory) {
    uint256[] memory prices = new uint256[](assets.length);
    for (uint256 i = 0; i < assets.length; i++) {
      prices[i] = getAssetPrice(assets[i]);
    }
    return prices;
  }

  // @notice Gets the address of the source for an asset address
  // @param asset The address of the asset
  // @return address The address of the source
  function getIndexOfAsset(address asset) external view returns (uint64) {
    return oracleIndex[asset];
  }

  // @notice Gets the address of the fallback oracle
  // @return address The addres of the fallback oracle
  function getFallbackOracle() external view returns (address) {
    return address(_fallbackOracle);
  }
}
