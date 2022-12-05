import React, { useCallback } from "react";
import { Icon, Modal, Card } from "web3uikit";
import { useState, useEffect } from "react";
import { useUser } from "../contexts/userContext";
import { magicProvider } from "../lib/magic";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../constants";
import BNB_ABI from "../abi.json";
import { useWeb3React } from "@web3-react/core";
import { configMainNet } from "../connectors/config";
import { useLocation } from "react-router";

function User() {
  const { address } = useUser();
  const location = useLocation();

  const [isVisible, setVisible] = useState(false);
  const { account, library } = useWeb3React();

  const [userRentals, setUserRentals] = useState();

  const fetchRentals = useCallback(async () => {
    const userAddress = address ? address : account;

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      BNB_ABI,
      new ethers.providers.JsonRpcProvider(configMainNet.rpc)
    );

    const rentals = await contract.getRentals();

    const rentalsInfo = [];

    for (let index = 0; index < rentals.length; index++) {
      const element = await contract.getRentalBookings(index);

      element.forEach(details => {
        if (details?.booker.toLowerCase() === userAddress?.toLowerCase()) {
          rentalsInfo.push({
            ...rentals[index],
            datesBooked: rentalsInfo[index]?.datesBooked
              ? rentalsInfo[index].datesBooked.push(details.date)
              : [details.date]
          })
        }
      })

    }
    setUserRentals(rentalsInfo);
  }, [address, library, account, magicProvider]);

  useEffect(() => {
    if (isVisible) fetchRentals();
  }, [isVisible, fetchRentals]);

  const addOneDay = (dates) => {
    const date = new Date(dates);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10)
  }

  return (
    <>
      <div style={{ cursor: "pointer" }} onClick={() => setVisible(true)}>
        <Icon
          fill={location.pathname.includes("rentals") ? "black" : "white"}
          size={35}
          svg="user"
        />
      </div>

      <Modal
        onCloseButtonPressed={() => setVisible(false)}
        hasFooter={false}
        title="Your Stays"
        isVisible={isVisible}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            flexWrap: "wrap",
            gap: "10px",
            paddingBottom: "24px",
          }}
        >
          {Array.isArray(userRentals) ? (
            !!userRentals.length ? (
              userRentals.map((e, i) => {
                return (
                  <div key={i} style={{ width: "200px" }}>
                    <Card
                      isDisabled
                      title={e.city}
                      description={`from ${e.datesBooked?.[0]} to ${e.datesBooked.length === 1
                        ? addOneDay(e.datesBooked?.[0])
                        : e.datesBooked?.at(-1)} `}
                    >
                      <div>
                        <img width="180px" src={e.imgUrl} alt="" />
                      </div>
                    </Card>
                  </div>
                );
              })
            ) : (
              "No user rents"
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default User;
