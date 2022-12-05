import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Rentals from "./pages/Rentals";
import "./App.css";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "./connectors/connectors";
import { useUser } from "./contexts/userContext";
import { magicProvider } from "./lib/magic";

const App = () => {
  const { activate } = useWeb3React();
  const { setAddress } = useUser();

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    const magicLinkProvider = window.localStorage.getItem("magicProvider");
    if (magicLinkProvider === "on") {
      magicProvider.listAccounts().then((accounts) => {
        setAddress(accounts[0]);
      });
    } else {
      activate(connectors[provider]);
    }
  }, [activate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rentals" element={<Rentals />} />
    </Routes>
  );
};

export default App;
