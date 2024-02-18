//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

struct Coordinates {
    uint256 lat;
    uint256 long;
}

uint constant COORDINATES_FACTOR = 100000000;


struct BuildingData {
    Coordinates location;
    string _address;
    uint yearOfConstruction;
}

enum Status {
    VALID, EXPIRED
}

enum Reason {
    NEW_CONSTRUCTION,
    CHANGED_PROPERTY,
    LEASED,
    RENOVATION,
    ENERGY_REQUALIFICATION,
    OTHER
}


function equalsCoordinates(Coordinates memory coord1, Coordinates memory coord2) pure returns (bool) {
    return (coord1.lat == coord2.lat) && (coord1.long == coord2.long);
}

contract SmartAPE {

    // Certificate identification code (Codice Identificativo)
    string private id;

    // Certificate expiration data
    uint256 private expirationDate;

    // The hash of the PDF file of the APE document
    string private documentHash;
    string private hashAlgorithm;

    // Contains all the data about the building, including its coordinates
    BuildingData public buildingData;

    Reason private reason;
    string private otherReason;

    address private owner;

    // Link to the previous document of the same building
    SmartAPE private prev;

    uint private deployTime;

    constructor(string memory _id, uint256 _expirationDate,
        uint256 latitude,
        uint256 longitude,
        string memory _address,
        uint32 yearOfConstruction,
        uint8 _reason,
        string memory _otherReason,
        string memory _documentHash, string memory _hashAlgorithm) validCoordinates(Coordinates(latitude, longitude)) {

        id = _id;
        expirationDate = _expirationDate;
        buildingData = BuildingData(Coordinates(latitude, longitude), _address, yearOfConstruction);
        reason = Reason(_reason);
        otherReason = _otherReason;
        documentHash = _documentHash;
        hashAlgorithm = _hashAlgorithm;

        owner = msg.sender;
        deployTime = block.timestamp * 1000;

    }


    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0));
        _;
    }

    modifier validPreviousAPE(address addr) {
        require(addr != address(0));
        SmartAPE prevApe = SmartAPE(addr);

        BuildingData memory data = prevApe.getBuildingData();
        uint prevDeployedTime = prevApe.getDeployTime();

        require(equalsCoordinates(data.location, buildingData.location), "Invalid location");
        require(prevApe.getDeployTime() < deployTime, "Invalid deployed time");

        _;
    }

    modifier validCoordinates(Coordinates memory coords) {
        require(coords.lat/COORDINATES_FACTOR <= 90 && coords.long/COORDINATES_FACTOR <= 180);
        _;
    }

    function transferConcract(address newOwner) public onlyOwner validAddress(newOwner) {
        owner = newOwner;
    }

    function setPreviousDocument(address previousDocumentAddress) public onlyOwner validPreviousAPE(previousDocumentAddress) {
        prev = SmartAPE(previousDocumentAddress);
    }


    function getApeId() public view returns (string memory) {
        return id;
    }

    function getStatus(uint currentTime) public view returns (Status) {
        if(currentTime < expirationDate) return Status.VALID;
        return Status.EXPIRED;
    }

    function getStatus() public view returns (Status) {
        return getStatus(block.timestamp * 1000);
    }

    function getExpirationDate() public view returns (uint) {
        return expirationDate;
    }

    function getBuildingData() external view returns (BuildingData memory) {
        return buildingData;
    }

    function getLatitude() external view returns (uint256) {
        return buildingData.location.lat;
    }

    function getLongitude() external view returns (uint256) {
        return buildingData.location.long;
    }

    function getAddress() external view returns (string memory) {
        return buildingData._address;
    }

    function getYearOfConstruction() external view returns (uint) {
        return buildingData.yearOfConstruction;
    }

    function getPreviousDocument() public view returns (SmartAPE) {
        return prev;
    }

    function getReason() public view returns(Reason) {
        return reason;
    }

    function getOtherReason() public view returns(string memory) {
        return otherReason;
    }

    function getDocumentHash() public view returns(string memory) {
        return documentHash;
    }

    function getHashAlgorithm() public view returns(string memory) {
        return hashAlgorithm;
    }

    function getDeployTime() external view /*onlyOwner*/ returns (uint) {
        return deployTime;
    }


}
