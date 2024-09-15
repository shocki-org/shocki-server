import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const ERC20Module = buildModule('ERC20Module', (m) => {
  const name = m.getParameter('name');
  const symbol = m.getParameter('symbol');
  const nftAddress = m.getParameter('nftAddress');

  const erc20 = m.contract('ShockiToken', [name, symbol, nftAddress], {});

  return { erc20 };
});

export default ERC20Module;
