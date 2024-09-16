import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const ERC721Module = buildModule('ERC721Module', (m) => {
  const name = m.getParameter('name');
  const symbol = m.getParameter('symbol');
  const imageBaseURI = m.getParameter('imageBaseURI');

  const erc721 = m.contract('ShockiNFT', [name, symbol], {});

  m.call(erc721, 'setBaseURI', [imageBaseURI]);

  return { erc721 };
});

export default ERC721Module;
