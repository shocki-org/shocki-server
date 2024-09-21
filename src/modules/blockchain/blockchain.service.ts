import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import hre, { ethers } from 'hardhat';

// import { ERC20__factory } from 'typechain-types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import ERC20Module from './ignition/modules/ERC20';
import ERC721Module from './ignition/modules/ERC721';

@Injectable()
export class BlockchainService {
  private provider: JsonRpcProvider;
  private deployer: Wallet;

  constructor(
    private readonly configService: ConfigService<{
      RPC_URL: string;
      DEPLOYER_PRIVATE_KEY: string;
    }>,
  ) {
    this.provider = new JsonRpcProvider(this.configService.get('RPC_URL')!);
    this.deployer = new Wallet(this.configService.get('DEPLOYER_PRIVATE_KEY')!, this.provider);
  }

  // We all need to make sure to set the all the NFT per different directories
  // For example, If we are going to create a new NFT, we need to set the name, symbol, and imageURI
  // The name and symbol are the same as the ERC20
  // The imageURI is the image that we are going to use for the NFT
  // eg. All the image name should be 1.png and the imageURI should be the path to the image
  // eg. imageURI: 'https://ipfs.io/ipfs/QmZzv1Q2' and 1.png
  private async _createERC721(name: string, symbol: string, imageBaseURI: string): Promise<string> {
    const ShockiNFT = await ethers.getContractFactory('ShockiNFT');
    const erc721 = await ShockiNFT.deploy(name, symbol);

    await erc721.setBaseURI(imageBaseURI);

    const address = await erc721.getAddress();

    return address;
  }

  private async _createERC20(name: string, symbol: string, nftAddress: string): Promise<string> {
    const ShockiToken = await ethers.getContractFactory('ShockiToken');
    const erc20 = await ShockiToken.deploy(name, symbol, nftAddress);

    const address = await erc20.getAddress();

    return address;
  }

  // SHO1, SHO2, SHO3, SHO4, SHO5, SHO6, SHO7, SHO8, SHO9, SHO10
  async create(name: string, symbol: string, imageBaseURI: string): Promise<string> {
    const nftAddress = await this._createERC721(name, symbol, imageBaseURI);

    const tokenAddress = await this._createERC20(name, symbol, nftAddress);

    return tokenAddress;
  }

  async transfer(to: string, amount: number, address: string): Promise<void> {
    const erc20 = await ethers.getContractAt('ShockiToken', address, this.deployer);

    const transfer = await erc20.transfer(to, ethers.parseUnits(amount.toString(), 18));

    await transfer.wait();

    return;
  }
}
