import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { Button, Stack, Typography } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { GlobalAppContext } from "./contexts/GlobalAppContext";
import { deploySmartAPE, findSmartAPE, sendHbar } from './services/hederaService'
import { Form } from "react-router-dom";
import { formDataToJson, calcolateFileHash } from "./services/utils";

export default function Home() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);

  if (!process.env.REACT_APP_MY_ACCOUNT_ID || !process.env.REACT_APP_MY_PRIVATE_KEY) {
    throw new Error("Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be present");
  }

  const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  const [reason, setReason] = useState(0);
  const reasonRef = useRef(null);
  const formRef = useRef(null);
  const [contractId, setContractId] = useState("");

  return (
    <Stack 
      spacing={4}
      sx={{alignItems: 'center'}}
    >

      <form ref={formRef} className="deploy-form">
        <label htmlFor="id">APE ID</label>
        <input type="number" name="id" id="ape_id"></input>

        <label htmlFor="expirationDate">Expiration date</label>
        <input type="number" name="expirationDate" id="expiration_date"></input>

        <label htmlFor="latitude">Latitude</label>
        <input type="number" name="latitude" id="latitude"></input>

        <label htmlFor="longitude">Longitude</label>
        <input type="number" name="longitude" id="longitude"></input>

        <label htmlFor="address">Address</label>
        <input type="text" name="address" id="address"></input>

        <label htmlFor="yearOfConstruction">Year of Construction</label>
        <input type="number" name="yearOfConstruction" id="year_of_constr"></input>

        <label htmlFor="reason">Reason</label>
        <select ref={reasonRef} name="reason" id="reason" 
          onChange={() => setReason(reasonRef.current.value)}
        >
          <option value="0">New construction</option>
          <option value="1">Changed property</option>
          <option value="2">Leased</option>
          <option value="3">Renovation</option>
          <option value="4">Energy requalification</option>
          <option value="5">Other</option>
        </select>

        {reason == 5 && 
          <>
          <label htmlFor="otherReason">Other reason</label>
          <input type="text" name="otherReason" id="otherReason"></input>
          </>
        }

        <label htmlFor="doc">Documento (PDF)</label>
        <input type="file" name="doc" id="doc"></input>

      </form>

      <Button
      variant="contained"
      color="secondary"
      onClick={async () => {
        
        const data = formDataToJson(new FormData(formRef.current));

        const documentHash = await calcolateFileHash(data.doc);
        delete data.doc
        data.documentHash = documentHash;
        data.hashAlgorithm = "SHA-256";

        deploySmartAPE(client, myPrivateKey, data)
          .then(contractId => {
            setContractId(contractId.toString());
          })

      }}
      >
        Deploy SmartAPE
      </Button>

      {contractId.length != 0 && 
        <Typography color="white">
          The new contract ID is: {contractId}
        </Typography>
      }


      <Button
      variant="contained"
      color="secondary"
      onClick={() => {
        findSmartAPE(client, "0.0.3560116").then(smartApeData => {
          console.log(smartApeData.id);
        })
      }}
      >
        Fidn APE
      </Button>

    </Stack>
  )
}
