import { addNetwork } from "./addNetwork";
import { configMainNet } from "../connectors/config";

export const changeNetworkAtMetamask = async (connector) => {
  try {
    const web3Provider = await connector.getProvider();
    await web3Provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: `0x${Number(configMainNet.chainId).toString(16)}`,
        },
      ],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await addNetwork(connector);
      } catch (e) {
        console.log(e);
      }
    }
  }
};
