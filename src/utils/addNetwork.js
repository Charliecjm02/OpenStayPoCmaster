import { configMainNet } from "../connectors/config";

export const addNetwork = async (connector, config) => {
  const defaultConfig = config ? config : configMainNet;
  try {
    const web3Provider = await connector.getProvider();
    await web3Provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${Number(defaultConfig.chainId).toString(16)}`,
          chainName: defaultConfig.name,
          rpcUrls: [defaultConfig.rpc],
          blockExplorerUrls: [defaultConfig.explorer],
          nativeCurrency: {
            name: defaultConfig.tokenName,
            symbol: defaultConfig.tokenName,
            decimals: defaultConfig.decimals,
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
};
