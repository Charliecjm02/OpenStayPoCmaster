import React, { useEffect } from "react";
import "./Home.css";
import { createSearchParams, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { Icon, Select, DatePicker, Input, useNotification } from "web3uikit";
import { useState } from "react";

import Connect from "../components/Connect";
import { Button } from "../components/Button";
import bgImages from "../images/bgs";

const Home = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [checkOut, setCheckOut] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .substring(0, 10)
  );
  const [destination, setDestination] = useState("New York");
  const [guests, setGuests] = useState(2);
  const [bgCount, setBgCount] = useState(0);
  const dispatch = useNotification();

  const showInvalidDateError = () => {
    dispatch({
      type: "error",
      message:
        +new Date() > +new Date(checkIn) || +new Date() > +new Date(checkOut)
          ? "You can not book in the past"
          : "Set checkout date later than checkin",
      title: "Invalid booking date",
      position: "topL",
    });
  };

  const setChangeBgInterval = () => {
    let count = 0;
    setInterval(() => {
      if (count === 4) {
        count = 0;
      } else {
        count += 1;
      }
      setBgCount(count);
    }, 15 * 1000);
  };

  useEffect(() => {
    setChangeBgInterval();
    return () => {
      clearInterval(setChangeBgInterval);
    };
  }, []);

  const search = () => {
    if (
      +new Date(checkOut) <= +new Date(checkIn) ||
      +new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ) >
        +new Date(
          new Date(checkIn).getFullYear(),
          new Date(checkIn).getMonth(),
          new Date(checkIn).getDate()
        ) ||
      +new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ) >
        +new Date(
          new Date(checkOut).getFullYear(),
          new Date(checkOut).getMonth(),
          new Date(checkOut).getDate()
        )
    ) {
      showInvalidDateError();
    } else {
      navigate({
        pathname: "rentals",
        search: createSearchParams({
          destination: destination,
          checkIn: +new Date(checkIn),
          checkOut: +new Date(checkOut),
          guests: guests,
        }).toString(),
      });
    }
  };

  return (
    <>
      <div
        className="container"
        style={{ backgroundImage: `url(${bgImages[bgCount]})` }}
      />
      <div className="bgImages" style={{ display: "none" }}>
        {bgImages.map((item, i) => (
          <img key={i} src={item} className="bgItem" alt="img" />
        ))}
      </div>
      <div className="contentWrapper">
        <div className="content">
          <div className="topBanner">
            <div>
              <img className="logo" src={logo} alt="logo"></img>
            </div>
            <div className="tabs">
              <div className="selected">Places To Stay</div>
              <div>Experiences</div>
              <div>Online Experiences</div>
            </div>
            <Connect />
          </div>
          <div className="randomLocation">
            <div className="title">Luxury Delivered</div>
            <div className="text">
              Let OpenStay help you discover the top luxury stays across the
              globe. With a promise of quality, you can relax knowing you booked
              with OpenStay.
            </div>
            <Button type="filled" onClick={search}>
              Explore a location
            </Button>
          </div>
          <div className="tabContent">
            <div className="searchFields">
              <div className="inputs">
                <span className="label">Location</span>
                <div className="selectWrapper">
                  <Select
                    defaultOptionIndex={0}
                    onChange={(data) => setDestination(data.label)}
                    options={[
                      {
                        id: "ny",
                        label: "New York",
                      },
                      {
                        id: "lon",
                        label: "London",
                      },
                      {
                        id: "bne",
                        label: "Brisbane",
                      },
                      {
                        id: "gc",
                        label: "Gold Coast",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="inputs">
                <span className="label">Check In</span>
                <DatePicker
                  value={checkIn}
                  id="CheckIn"
                  onChange={(event) => setCheckIn(event.date)}
                />
              </div>
              <div className="inputs">
                <span className="label">Check Out</span>
                <DatePicker
                  value={checkOut}
                  id="CheckOut"
                  onChange={(event) => setCheckOut(event.date)}
                />
              </div>
              <div className="inputs">
                <span className="label">Guests</span>
                <Input
                  value={2}
                  name="AddGuests"
                  type="number"
                  onChange={(event) => setGuests(Number(event.target.value))}
                />
              </div>

              <div onClick={search} className="searchButton">
                <Icon fill="#ffffff" size={24} svg="search" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
