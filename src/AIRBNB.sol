// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract airbnb {
    address public owner;
    uint256 private counter;
    uint256 public PLATFORM_COMISSION;

    constructor() {
        counter = 0;
        owner = msg.sender;
        PLATFORM_COMISSION = 5;
    }

    struct rentalInfo {
        string name;
        string city;
        string lat;
        string long;
        string unoDescription;
        string dosDescription;
        string imgUrl;
        uint256 maxGuests;
        uint256 pricePerDay;
        booking[] datesBooked;
        uint256 id;
        address renter;
    }

    struct booking {
        string date;
        address booker;
    }

    struct rentalPaymentReceivers {
        address receiver;
        uint256 percentage;
    }

    event rentalCreated(
        string name,
        string city,
        string lat,
        string long,
        string unoDescription,
        string dosDescription,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        booking[] datesBooked,
        uint256 id,
        address renter
    );

    event newDatesBooked(
        booking[] datesBooked,
        uint256 id,
        address booker,
        string city,
        string imgUrl
    );

    rentalInfo[] public rentals;
    mapping(uint256 => rentalPaymentReceivers[]) public rentalReceivers;
    uint256[] public rentalIds;

    modifier validatePercentages(
        rentalPaymentReceivers[] memory paymentReceivers
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

    function addRentals(
        string memory name,
        string memory city,
        string memory lat,
        string memory long,
        string memory unoDescription,
        string memory dosDescription,
        string memory imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        booking[] memory datesBooked,
        rentalPaymentReceivers[] memory paymentReceivers
    ) public validatePercentages(paymentReceivers) {
        require(
            msg.sender == owner,
            "Only owner of smart contract can put up rentals"
        );
        rentalInfo storage newRental = rentals[counter];
        newRental.name = name;
        newRental.city = city;
        newRental.lat = lat;
        newRental.long = long;
        newRental.unoDescription = unoDescription;
        newRental.dosDescription = dosDescription;
        newRental.imgUrl = imgUrl;
        newRental.maxGuests = maxGuests;
        newRental.pricePerDay = pricePerDay;
        newRental.datesBooked = datesBooked;
        newRental.id = counter;
        newRental.renter = owner;
        rentalIds.push(counter);

        for (uint256 i = 0; i < paymentReceivers.length; i++) {
            rentalReceivers[counter].push(paymentReceivers[i]);
        }

        rentalReceivers[counter].push(
            rentalPaymentReceivers(address(this), PLATFORM_COMISSION)
        );

        emit rentalCreated(
            name,
            city,
            lat,
            long,
            unoDescription,
            dosDescription,
            imgUrl,
            maxGuests,
            pricePerDay,
            datesBooked,
            counter,
            owner
        );
        counter++;
    }

    function checkBookings(uint256 id, booking[] memory newBookings)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < newBookings.length; i++) {
            for (uint256 j = 0; j < rentals[id].datesBooked.length; j++) {
                if (
                    keccak256(abi.encodePacked(rentals[id].datesBooked[j].date)) ==
                    keccak256(abi.encodePacked(newBookings[i].date))
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    function addDatesBooked(uint256 id, booking[] memory newBookings)
        public
        payable
    {
        require(id < counter, "No such Rental");
        require(
            checkBookings(id, newBookings),
            "Already Booked For Requested Date"
        );
        require(
            msg.value ==
                (rentals[id].pricePerDay * 1 ether * newBookings.length),
            "Please submit the asking price in order to complete the purchase"
        );

        for (uint256 i = 0; i < newBookings.length; i++) {
            rentals[id].datesBooked.push(newBookings[i]);
        }

        rentalPaymentReceivers[] memory paymentReceivers = rentalReceivers[id];
        for (uint256 i = 0; i < paymentReceivers.length; i++) {
            uint256 amount = (msg.value * paymentReceivers[i].percentage) / 100;
            payable(paymentReceivers[i].receiver).transfer(amount);
        }

        emit newDatesBooked(
            newBookings,
            id,
            msg.sender,
            rentals[id].city,
            rentals[id].imgUrl
        );
    }

    function updatePlatformComission(uint256 comission) external {
        require(
            msg.sender == owner,
            "Only owner of smart contract can put up rentals"
        );

        PLATFORM_COMISSION = comission;
    }

    function getRentals() external view returns (rentalInfo[] memory) {
        return rentals;
    }

    function getRental(uint256 id)
        public
        view
        returns (
            string memory,
            uint256,
            booking[] memory
        )
    {
        require(id < counter, "No such Rental");

        rentalInfo storage s = rentals[id];
        return (s.name, s.pricePerDay, s.datesBooked);
    }
}
