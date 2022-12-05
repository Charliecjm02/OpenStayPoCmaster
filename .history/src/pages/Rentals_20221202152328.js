import React, { useCallback } from "react";
import "./Rentals.css";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../images/png-2.png";
import userIcon from "../images/user.svg";
import cn from "classnames";

import { Icon, useNotification } from "web3uikit";
import RentalsMap from "../components/RentalsMap";
import { useState, useEffect } from "react";
import Connect from "../components/Connect";
import { ethers } from "ethers";
import { useUser } from "../contexts/userContext";
import { magicProvider } from "../lib/magic";
import { CONTRACT_ADDRESS } from "../constants";
import BNB_ABI from "../abi.json";
import { useWeb3React } from "@web3-react/core";
import { configMainNet } from "../connectors/config";

const Rentals = () => {
  const [searchFilters, setSearchFilters] = useState();
  const [fetching, setFetching] = useState(false);
  const [searchParams] = useSearchParams();
  const [highLight, setHighLight] = useState(null);
  const { address } = useUser();
  const { account, library } = useWeb3React();
  const [rentalsList, setRentalsList] = useState();
  const [coOrdinates, setCoOrdinates] = useState([]);
  const dispatch = useNotification();

  const userAddress = address ? address : account;

  useEffect(() => {
    // read the params on component load and when any changes occur
    const currentParams = Object.fromEntries([...searchParams]);
    setSearchFilters(currentParams);
  }, [searchParams]);

  const handleSetHighlight = useCallback(
    (i) => {
      if (highLight === i) {
        setHighLight(null);
      } else {
        setHighLight(i);
      }
    },
    [highLight]
  );

  const handleSuccess = () => {
    dispatch({
      type: "success",
      message: `Nice! You are going to ${searchFilters?.destination}!!`,
      title: "Booking Succesful",
      position: "topL",
    });
  };

  const handleError = (msg) => {
    dispatch({
      type: "error",
      message: msg || `You have insufficient funds to book this rental`,
      title: "Booking Failed",
      position: "topL",
    });
  };
  const handleInfo = (msg) => {
    dispatch({
      type: "info",
      message: `Please wait while we are processing your payment`,
      title: "Wait for transactions",
      position: "topL",
    });
  };

  const handleNoAccount = () => {
    dispatch({
      type: "error",
      message: `You must be a verified guest to book a rental`,
      title: "Not Connected",
      position: "topL",
    });
  };

  const fetchRentalsList = useCallback(async () => {
    try {
      setFetching(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BNB_ABI,
        new ethers.providers.JsonRpcProvider(configMainNet.rpc)
      );

      const rentals = await contract.getRentals();
      const withId = rentals.map((e, i) => ({ ...e, id: i }))
      const result = withId.filter((item) => {
        return (
          item.city.toLowerCase() ===
          searchFilters?.destination.toLowerCase() &&
          item.isShow &&
          Number(item["maxGuests"]) >= searchFilters?.guests
        );
      });

      let cords = [];
      result.forEach((e) => {
        cords.push({ lat: e.lat, lng: e.long });
      });

      setCoOrdinates(cords);
      setRentalsList(result);
    } finally {
      setFetching(false);
    }
  }, [address, library, searchFilters, magicProvider]);

  useEffect(() => {
    if (searchFilters) fetchRentalsList();
  }, [searchFilters]);

  const bookRental = async function (start, end, id, dayPrice) {
    for (
      var arr = [], dt = new Date(start);
      dt <= end;
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt).toISOString().slice(0, 10)); // yyyy-mm-dd
    }

    if (arr.length < 2) return handleError(" Invalid dates !");

    try {
      const providers = address ? magicProvider : library;

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BNB_ABI,
        providers?.getSigner()
      );

      const isBookable = await contract.checkBookings(id, arr);

      if (!isBookable) {
        handleError(
          "Booking unsuccessful. The property is already booked for these days."
        );
      } else {
        arr.pop();
        const rentalPrice = await contract.getRentPrice(id, arr.length);

        const tx = await contract.bookRental(id, arr, {
          from: userAddress,
          value: rentalPrice,
          // gasLimit: 2100000,
          // gasPrice: 8000000000,
        });
        handleInfo()
        await tx.wait();
        handleSuccess();
      }

    } catch (error) {
      handleError(
        error.message.includes("user rejected transaction")
          ? null
          : error.message.split("[")[0]
      );
    }
  };
  return (
    <section className="rentals">
      <div className="rentalsContainer">
        <div className="topBanner">
          <div>
            <Link to="/">
              <img className="logo" src={logo} alt="logo"></img>
            </Link>
          </div>
          <div className="searchReminder">
            <div className="filter">{searchFilters?.destination}</div>
            <div className="filter">
              {`
           ${new Date(+searchFilters?.checkIn)?.toLocaleString("default", {
                month: "short",
              })} 
           ${new Date(+searchFilters?.checkIn)?.toLocaleString("default", {
                day: "2-digit",
              })} 
           - 
           ${new Date(+searchFilters?.checkOut)?.toLocaleString("default", {
                month: "short",
              })} 
           ${new Date(+searchFilters?.checkOut)?.toLocaleString("default", {
                day: "2-digit",
              })}
          `}
            </div>
            <div className="filter">{searchFilters?.guests} Guest</div>
          </div>
          <Connect isConnectBtnFilled />
        </div>

        <div className="rentalsContent">
          <div className="rentalsContentL" onClick={() => setHighLight(null)}>
            <h2>Luxury stays available for your destination:</h2>
            {!!rentalsList?.length ? (
              <ul className="rentalsList">
                {rentalsList?.map((e, i) => {
                  const maxGuests = +e.maxGuests.toString();
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rentalItem",
                        highLight === i && "rentalItemActive"
                      )}
                    >
                      <img className="rentalImg" src={e.imgUrl} alt="" />
                      <div className="rentalInfo">
                        <div>
                          <div className="guests">
                            {new Array(maxGuests > 3 ? 1 : maxGuests)
                              .fill(1)
                              .map((_, i) => (
                                <img key={i} src={userIcon} alt="guest" />
                              ))}{" "}
                            {maxGuests > 3 && <span>x{maxGuests}</span>}
                          </div>
                          <div className="rentalTitleAndPrice">
                            <span className="rentTitle">{e.name}</span>
                            <div className="rentPrice">
                              <Icon fill="black" size={10} svg="matic" />{" "}
                              <span>
                                {ethers.utils.formatEther(
                                  e.pricePerDay.toString()
                                )}{" "}
                                / Night
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bottomWrapper">
                          <div className="desc">
                            <div className="rentalDesc">{e.unoDescription}</div>
                            <div className="rentalDesc">{e.dosDescription}</div>
                          </div>
                          <button
                            className="stayBtn"
                            onClick={() => {
                              if (address || account) {
                                bookRental(
                                  +searchFilters?.checkIn,
                                  +searchFilters?.checkOut,
                                  e.id,
                                  ethers.utils.formatEther(
                                    e.pricePerDay.toString()
                                  )
                                );
                              } else {
                                handleNoAccount();
                              }
                            }}
                          >
                            Reserve
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <h3 className="noStays">
                {fetching
                  ? "Loading..."
                  : "No stays by selected dates or location"}
              </h3>
            )}
          </div>
          <div className="rentalsContentR">
            <RentalsMap
              locations={coOrdinates}
              setHighLight={handleSetHighlight}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rentals;
