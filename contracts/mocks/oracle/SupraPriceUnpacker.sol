// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {ISupraSValueFeed} from '../../misc/interfaces/ISupraSValueFeed.sol';

contract SupraPriceUnpacker {
  function unpackPrice(address supra, uint64 index)
    external
    view
    returns (
      uint256,
      uint256,
      bool
    )
  {
    require(supra != address(0), 'Address 0');
    ISupraSValueFeed oracle = ISupraSValueFeed(supra);
    (bytes32 assetBytes, bool failed) = oracle.getSvalue(index);
    if (failed) {
      return (0, 0, failed);
    }
    uint256 price;
    uint256 decimals;
    (price, decimals) = _unpackPrice(assetBytes);
    return (price, decimals, true);
  }

  function _unpackPrice(bytes32 data) internal pure returns (uint256, uint256) {
    uint256 price = bytesToUint256(abi.encodePacked((data << 136) >> 160));
    uint256 decimals = bytesToUint256(abi.encodePacked((data << 64) >> 248));

    return (price, decimals);
  }

  function bytesToUint256(bytes memory _bs) internal pure returns (uint256 value) {
    require(_bs.length == 32, 'bytes length is not 32.');
    assembly {
      value := mload(add(_bs, 0x20))
    }
  }
}
