import { SUPPORTED_WALLETS } from "../connectors/supportedWallet";
import { changeNetworkAtMetamask } from "./changeNetworkAtMetamask";

export const tryActivation = async (connector, walletConnector, activate) => {
  try {
    let conn = connector;

    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return SUPPORTED_WALLETS[key].name;
      }
      return true;
    });

    conn &&
      activate(conn, undefined, true)
        .then(() => {
          if (walletConnector.name === "WalletConnect") {
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }
        })
        .catch(async (error) => {
          await changeNetworkAtMetamask(connector);

          if (walletConnector.name === "WalletConnect") {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
  } catch (error) {
    console.error(error);
  }
};
