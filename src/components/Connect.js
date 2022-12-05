import { Modal } from "web3uikit";
import { Button } from "./Button";
import React, { useCallback, useEffect, useState } from "react";
import { magic, magicProvider } from "../lib/magic";
import User from "./User";
import { shortenAddr } from "../utils";
import cx from "classnames";
import { useUser } from "../contexts/userContext";
import { SUPPORTED_WALLETS } from "../connectors/supportedWallet";
import { useWeb3React } from "@web3-react/core";

import Icons from "./Icons";
import { tryActivation } from "../utils/tryActivation";
import { connectors } from "../connectors/connectors";
import { useLocation } from "react-router";
import { useOutsideClick } from "../hooks/useOutsideClick";

const Connect = (isConnectBtnFilled = false) => {
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const { address, setAddress } = useUser();
  const [isOpenMagicOptions, setIsOpenMagicOptions] = useState(false);
  const { account, connector, activate, deactivate } = useWeb3React();
  const location = useLocation();
  const provider = localStorage.getItem("provider");
  const setProvider = (type) => {
    window.localStorage.setItem("provider", type);
  };

  const closeOptions = () => {
    setIsOpenMagicOptions(false);
  };

  const walletRef = useOutsideClick(closeOptions);

  const loginUser = async () => {
    try {
      magicProvider.listAccounts().then((accounts) => {
        setOpenConnectModal(false);
        setAddress(accounts[0]);
        window.localStorage.setItem("magicProvider", "on");
      });
    } catch (err) {
      throw new Error("Email login failed");
    }
  };

  useEffect(() => {
    account && setOpenConnectModal(false);
  }, [account]);

  const handleActivation = useCallback(
    async (selectedConnector, supportedWallet) => {
      try {
        if (selectedConnector === connector && account) return;
        await tryActivation(selectedConnector, supportedWallet, activate);
        setProvider(supportedWallet.name);
      } catch (e) {
        console.log(e);
      }
    },
    []
  );

  const logout = () => {
    setAddress(null);
    deactivate();
    window.localStorage.removeItem("provider");
    window.localStorage.removeItem("magicProvider");
    magic.connect.disconnect();
  };
  return (
    <div className="lrContainers">
      {account || address ? (
        <>
          <User account={address || account} />
          <button
            className={cx(
              "connectedButton",
              location.pathname.includes("rentals") && "connectedButtonBlack"
            )}
            onClick={() => {
              if (!provider) {
                setIsOpenMagicOptions((prev) => !prev);
              } else {
                logout();
              }
            }}
          >
            {/*<Avatar size={30} theme="image" account={account || address} />*/}
            {(address || account) && (
              <div className="addressWrapper" ref={walletRef}>
                {shortenAddr(address || account, 4, 6)}
                {isOpenMagicOptions && (
                  <div className={"magicOptions"}>
                    <div className="magicBtn" onClick={logout}>
                      Disconnect
                    </div>
                    <div
                      className="magicBtn"
                      onClick={async () => await magic.connect.showWallet()}
                    >
                      Show wallet
                    </div>
                  </div>
                )}
              </div>
            )}
          </button>
        </>
      ) : (
        <Button
          className={cx("connectBtn", isConnectBtnFilled && "connectBtnFilled")}
          onClick={() => setOpenConnectModal(true)}
        >
          Connect wallet
        </Button>
      )}
      <Modal
        onCloseButtonPressed={() => setOpenConnectModal(false)}
        hasFooter={false}
        title="Connect your wallet"
        isVisible={openConnectModal}
        width={470}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            flexWrap: "wrap",
            gap: "10px",
            maxWidth: 400,
            paddingBottom: 20,
          }}
        >
          {Object.keys(SUPPORTED_WALLETS).map((key) => {
            const option = SUPPORTED_WALLETS[key];
            return (
              <button
                className={"connectWalletButton"}
                onClick={async () => {
                  if (option.name === "MetaMask") {
                    await handleActivation(connectors.Injected, option);
                  } else {
                    await handleActivation(connectors.WalletConnect, option);
                  }
                }}
                key={key}
              >
                {" "}
                <Icons name={option.name} /> <span>{option.name}</span>
              </button>
            );
          })}
          <button className={"connectWalletButton"} onClick={loginUser}>
            <Icons name={"Magic"} />
            <span>Magic Link</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Connect;
