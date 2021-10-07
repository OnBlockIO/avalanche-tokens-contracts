import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} =
    await getNamedAccounts();

  await deploy('GhostMarketERC721', {
    contract: 'GhostMarketERC721',
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [
            'GhostMarket ERC721',
            'GHOST',
            'https://api.ghostmarket.io/metadata/avalanche/',
          ],
        },
      },
    },
    log: true,
  });
};
export default func;
func.tags = ['GhostMarketERC721'];
