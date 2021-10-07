import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} =
    await getNamedAccounts();

  await deploy('GhostMarketERC1155', {
    contract: 'GhostMarketERC1155',
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [
            'GhostMarket ERC1155',
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
func.tags = ['GhostMarketERC1155'];
