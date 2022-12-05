// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IOpenStay {
    // DATA

    /**
     * Stores Rental information
     */
    struct Rental {
        string name;
        string city;
        string lat;
        string long;
        string firstDescription;
        string secondaryDescription;
        string imgUrl;
        uint256 maxGuests;
        uint256 pricePerDay;
        bool isShow;
        address renter;
    }

    /**
     * Stores Rental booking information
     */
    struct Booking {
        string date;
        address booker;
    }

    /**
     * Stores Rental payment receivers information
     */
    struct RentalPaymentReceiver {
        address receiver;
        uint256 percentage;
    }

    // EVENTS

    event RentalCreated(
        string name,
        string city,
        string lat,
        string long,
        string firstDescription,
        string secondaryDescription,
        string imageUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        address renter
    );

    event RentalBooked(uint256 rentalId, string date, address booker);
}

contract OpenStay is Ownable, ReentrancyGuard, IOpenStay {
    // default OpenStay booking rental comission
    uint256 public PLATFORM_COMISSION;
    address private _platformOwner;
    uint256 private _rentalsCounter;

    constructor() {
        _rentalsCounter = 0;
        PLATFORM_COMISSION = 5;
        _platformOwner = msg.sender;
    }

    mapping(uint256 => bool) private _rentalIds;
    // stores all OpenStay rentals
    mapping(uint256 => Rental) private _rentals;
    // stores all OpenStay rentals payment receivers configuration
    mapping(uint256 => RentalPaymentReceiver[]) private _rentalPaymentReceivers;
    // stores all bookings for specific rental
    mapping(uint256 => Booking[]) private _rentalBookings;

    /**
     * Validates whether payment receivers percentages passed on rental creation are valid (should be 100% in total)
     */
    modifier validatePercentages(
        RentalPaymentReceiver[] memory paymentReceivers
    ) {
        uint256 sum = 0;

        for (uint256 i = 0; i < paymentReceivers.length; i++) {
            require(
                paymentReceivers[i].receiver != address(0),
                "OpenStay: zero address tokens not allowed."
            );

            sum += paymentReceivers[i].percentage;
        }

        require(
            (sum + PLATFORM_COMISSION) == 100,
            "OpenStay: sum of percentages should equal 100."
        );
        _;
    }

    /**
     * Allows to add new rental on OpenStay platform
     * Allowed only for OWNER
     * Should have valid payment receiver percentages passed
     */
    function addRental(
        string memory name,
        string memory city,
        string memory lat,
        string memory long,
        string memory firstDescription,
        string memory secondaryDescription,
        string memory imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        RentalPaymentReceiver[] memory paymentReceivers
    ) external onlyOwner validatePercentages(paymentReceivers) {
        // create new rental on OpenStay
        _rentals[_rentalsCounter] = Rental(
            name,
            city,
            lat,
            long,
            firstDescription,
            secondaryDescription,
            imgUrl,
            maxGuests,
            pricePerDay,
            true,
            msg.sender
        );

        // setup payment receivers to be splitted on booking
        for (uint256 i = 0; i < paymentReceivers.length; i++) {
            _rentalPaymentReceivers[_rentalsCounter].push(paymentReceivers[i]);
        }
        // adds default platform comission as payment receiver on booking
        _rentalPaymentReceivers[_rentalsCounter].push(
            RentalPaymentReceiver(_platformOwner, PLATFORM_COMISSION)
        );
        _rentalIds[_rentalsCounter] = true;

        _rentalsCounter++;

        // emits event that new rental is created on OpenStay
        emit RentalCreated(
            name,
            city,
            lat,
            long,
            firstDescription,
            secondaryDescription,
            imgUrl,
            maxGuests,
            pricePerDay,
            msg.sender
        );
    }

    /**
     * Allows to hide the property
     */
    function hideRental(uint256 rentalId) external onlyOwner {
        _rentals[rentalId].isShow = false;
    }

    /**
     * Allows to make a new booking for existing rental if possible
     */
    function bookRental(uint256 rentalId, string[] memory bookings)
        external
        payable
        nonReentrant
    {
        require(_rentalIds[rentalId], "OpenStay: invalid rentalId specified.");
        require(
            checkBookings(rentalId, bookings),
            "OpenStay: specified booking not possible to book."
        );
        require(
            msg.value == (_rentals[rentalId].pricePerDay * bookings.length),
            "OpenStay: please submit the asking price in order to complete the purchase"
        );

        // split payment among rental payment receivers due to percentages set by property lister
        for (uint256 i = 0; i < _rentalPaymentReceivers[rentalId].length; i++) {
            // calculate amount to be sent to payment receiver
            uint256 amount = (msg.value *
                _rentalPaymentReceivers[rentalId][i].percentage) / 100;
            // send payment to payment receiver
            payable(_rentalPaymentReceivers[rentalId][i].receiver).transfer(
                amount
            );
        }

        // perform bookings if all checks and payment succeed
        for (uint256 i = 0; i < bookings.length; i++) {
            _rentalBookings[rentalId].push(Booking(bookings[i], msg.sender));

            emit RentalBooked(rentalId, bookings[i], msg.sender);
        }
    }

    /**
     * Allows to update platform comission percentage
     * Only can be called by OWNER
     */
    function updatePlatformComission(uint256 comission) external onlyOwner {
        PLATFORM_COMISSION = comission;
    }

    /**
     * Returns array of all rentals on OpenStay
     */
    function getRentals() external view returns (Rental[] memory) {
        Rental[] memory rentals = new Rental[](_rentalsCounter);
        for (uint256 i = 0; i < _rentalsCounter; i++) {
            if (_rentals[i].isShow) {
                rentals[i] = _rentals[i];
            }
        }

        return rentals;
    }

    /**
     * Returns specified rental by id
     */
    function getRental(uint256 rentalId) external view returns (Rental memory) {
        return _rentals[rentalId];
    }

    /**
     * Returns list of rental bookings (date, booker)
     */
    function getRentalBookings(uint256 rentalId)
        external
        view
        returns (Booking[] memory)
    {
        return _rentalBookings[rentalId];
    }

    /**
     * Returns rental price
     */
    function getRentPrice(uint256 rentalId, uint256 amountOfDays) external view returns(uint256) {
        return _rentals[rentalId].pricePerDay * amountOfDays;
    }

    /**
     * Checks whether specified bookings are valid to book for specified rental
     */
    function checkBookings(uint256 rentalId, string[] memory bookings)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < bookings.length; i++) {
            for (uint256 j = 0; j < _rentalBookings[rentalId].length; j++) {
                if (
                    keccak256(
                        abi.encodePacked(_rentalBookings[rentalId][j].date)
                    ) == keccak256(abi.encodePacked(bookings[i]))
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}
