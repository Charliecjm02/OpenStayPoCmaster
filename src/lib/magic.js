import { Magic } from 'magic-sdk';
import { MAGIC_PUBLISHABLE_KEY } from '../constants';
import { ConnectExtension } from '@magic-ext/connect';
import { ethers } from 'ethers';

const customNodeOptions = {
  rpcUrl: 'https://polygon-rpc.com/', // or "https://goerli.optimism.io/
  chainId: 137, // or 420 for goerli optimism testnet
}

export const magic = new Magic(MAGIC_PUBLISHABLE_KEY, {
  extensions: [new ConnectExtension()],
  network: customNodeOptions
});

export const magicProvider = new ethers.providers.Web3Provider(magic.rpcProvider);
