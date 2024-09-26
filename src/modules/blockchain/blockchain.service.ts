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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async _createERC721(name: string, symbol: string, imageBaseURI: string): Promise<string> {
    const ShockiNFT = await ethers.getContractFactory('ShockiNFT');
    console.log('ERC721 COUNT', await this.getTransactionCount());

    const erc721 = await ShockiNFT.deploy(name, symbol, {
      nonce: await this.getTransactionCount(),
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('1', 'gwei'),
    });

    // await erc721.setBaseURI(imageBaseURI);

    await erc721.waitForDeployment();

    const address = await erc721.getAddress();

    return address;
  }

  private async _createERC20(name: string, symbol: string, nftAddress: string): Promise<string> {
    const ShockiToken = await ethers.getContractFactory('ShockiToken');
    console.log('ERC20 COUNT', await this.getTransactionCount());

    const erc20 = await ShockiToken.deploy(name, symbol, nftAddress, {
      nonce: await this.getTransactionCount(),
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('1', 'gwei'),
    });

    await erc20.waitForDeployment();

    const address = await erc20.getAddress();

    return address;
  }

  async sendToEth(address: string, amount: number): Promise<void> {
    await this.deployer.sendTransaction({
      to: address,
      value: ethers.parseEther(amount.toString()),
      nonce: await this.getTransactionCount(),
    });

    return;
  }

  async getTransactionCount(): Promise<number> {
    return await this.provider.getTransactionCount(this.deployer.address);
  }

  async create(name: string, symbol: string, imageBaseURI: string): Promise<string> {
    const nftAddress = await this._createERC721(name, symbol, imageBaseURI);

    const tokenAddress = await this._createERC20(name, symbol, nftAddress);

    return tokenAddress;
  }

  async transfer(to: string, amount: number, address: string): Promise<void> {
    const erc20 = await ethers.getContractAt('ShockiToken', address, this.deployer);

    const tx = await erc20.approve(
      this.deployer.address,
      ethers.parseUnits(amount.toString(), 18),
      {
        nonce: await this.getTransactionCount(),
      },
    );

    await tx.wait();

    const transfer = await erc20.transfer(to, ethers.parseUnits(amount.toString(), 18), {
      nonce: await this.getTransactionCount(),
    });

    await transfer.wait();

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
