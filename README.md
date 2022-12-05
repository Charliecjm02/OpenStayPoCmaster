OpenStay smart contract description (front-end ONLY functions necessary):

DATA STRUCTURES:

Rental:
string name;
string city;
string lat;
string long;
string firstDescription;
string secondaryDescription;
string imgUrl;
uint256 maxGuests;
uint256 pricePerDay;
address renter;

Booking:
string date;
address booker;

RentalPaymentReceiver:
address receiver;
uint256 percentage;

VIEW FUNCTIONS:
getRental(uint256 rentalId) ->  Returns specified rental by id -> Rental object (Check DATA STRUCTURES)
getRentals() -> Returns array of all rentals on OpenStay -> Rental objects array (Check DATA STRUCTURES)
getRentalBookings() -> eturns list of rental bookings (date, booker) -> Booking objects array (Check DATA STRUCTURES)

WRITE FUNCTIONS:
bookRental(uint256 rentalId, string[] memory bookings) -> Allows to make a new booking for existing rental if possible
As a result you should see new booking in getRentalBookings()

NOTE: If there any data missed in responses please try to combine calls of getRental and getRentalBookings to build necessary UI object



