import { JsonRpcProvider, Wallet } from 'ethers';
import { ethers } from 'hardhat';

// import { ERC20__factory } from 'typechain-types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

    // await erc721.setBaseURI(imageBaseURI);

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

    await erc20.approve(this.deployer.address, ethers.parseUnits(amount.toString(), 18));

    await erc20.transfer(to, ethers.parseUnits(amount.toString(), 18), {
      gasLimit: 100000,
    });

    return;
  }

  async getBalance(tokenAddress: string, userAddress: string): Promise<number> {
    const erc20 = await ethers.getContractAt('ShockiToken', tokenAddress, this.deployer);

    const balance = await erc20.balanceOf(userAddress);

    return Number(ethers.formatUnits(balance, 18));
  }

  async getRemainingTokens(tokenAddress: string): Promise<number> {
    const erc20 = await ethers.getContractAt('ShockiToken', tokenAddress, this.deployer);

    const balance = await erc20.balanceOf(this.deployer.address);

    return Number(ethers.formatUnits(balance, 18));
  }
}
