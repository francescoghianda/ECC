# Estate Certificates Concordium

The aim of this project is to provide an innovative system for managing building energy certificates, using blockchain technology. At the heart of this solution is the `SmartAPE` smart contract, created on the Ethereum blockchain using the Solidity programming language. The `SmartAPE` contract is designed to store and maintain certificate data on the blockchain.

- The contract defines these basic data structures:
    - Coordinates: the geographic coordinates of a structure, including latitude and longitude.
    - Building Data: all the information about the building, such as location, address, year of construction
    - Other important data: reason, expiration date, previous contract (ID or address), hash algorithm, hash and status.

- Main features:
    - APE Certificate Registration: Allows the registration of the APE certificate associated with a specific building. The user must insert the information and all the important data required from the APE certificate. Then, data such as the expiration date, document hash, geographic location, and the reason are elaborated and stored into a smart contract, and the program returns the created ‘APE ID’. which is the ID of the contract registered on the blockchain. This ID is also searchable on the Hedera tool ‘HashScan Testnet’.
    - Link to previous certificates: Allows the current certificate to be linked to previous APE certificates of the same build, establishing a historical chain of certificates.
    - APE Certificate Discovery: Allows the discovery of a specific ‘Smart APE’ through its APE ID. The user should submit the id of the registered smart contract, and the program returns all the information about the associated APE certificate.

## Prerequisites

Make sure you have Node.js and npm installed on your machine. You can download them from https://nodejs.org/.

## Installation

After cloning the repository, follow these steps to install dependencies and run the application locally:

1. Create a `.env` file in the root of the project.

2. Into the `.env` file, copy the following text and insert your Hedera credentials:
   
    `REACT_APP_MY_ACCOUNT_ID=<Your_Hedera_Account_ID>`  
    `REACT_APP_MY_PRIVATE_KEY=<Your_Hedera_Private_Key>`

4.  Open your terminal in the project's root directory and run the command:
    `npm install`.
    This will install all the necessary dependencies.

6. Once the installation of dependencies is complete, start the application with the command:
   `npm run start`

The application will start and be accessible from your browser at `http://localhost:3000`. 
At this page, you can deploy a document which will be stored on the blockchain and it will return an ID.
At `http://localhost:3000/findSmartApe`, you can find a deployed smart contract linked to a specific (APE) document.

## Contact

For any questions or feedback, feel free to contact us at francy9661@gmail.com or silviaaferraris@gmail.com








