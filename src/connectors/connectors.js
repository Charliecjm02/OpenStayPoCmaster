import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { configMainNet } from "./config";

const injected = new InjectedConnector({
  supportedChainIds: [configMainNet.chainId],
});

const walletConnect = new WalletConnectConnector({
  rpc: {
    [configMainNet.chainId]: configMainNet.rpc,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  supportedChainIds: [configMainNet.chainId],
});

export const connectors = {
  Injected: injected,
  MetaMask: injected,
  WalletConnect: walletConnect,
};
