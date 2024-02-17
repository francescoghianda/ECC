import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { GlobalAppContext } from "./contexts/GlobalAppContext";
import { findSmartAPE } from "./services/hederaService";
import { calcolateFileHash } from "./services/utils";

export default function FindSmartApe() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);

  if (
    !process.env.REACT_APP_MY_ACCOUNT_ID ||
    !process.env.REACT_APP_MY_PRIVATE_KEY
  ) {
    throw new Error(
      "Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be present"
    );
  }

  const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(
    process.env.REACT_APP_MY_PRIVATE_KEY
  );

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  const [formData, setFormData] = useState({
    id: "",
  });
  const [contractId, setContractId] = useState("");

  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    const error = isNaN(value) ? "Insert a valid number" : "";
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const id = parseInt(formData.id);
    if (isNaN(id)) {
      alert("Please fill the field correctly.");
      return;
    }

    const data = {
      ...formData,
      id,
    };

    findSmartAPE(client, data.id).then((smartApeData) => {
      console.log(smartApeData.id);
    });
  };

  const handleReset = () => {
    setFormData({
      id: "",
    });
    setErrors({});
  };

  const formContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "30px",
    padding: "50px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    width: "800px",
    marginBottom: "30px",
    marginTop: "30px",
  };

  const labelTypographyStyle = {
    marginTop: "10px",
    marginBottom: "10px",
    fontWeight: "bold",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <form
        className="deploy-form"
        onSubmit={handleSubmit}
        style={formContainerStyle}
      >
        <div>
          <Typography style={labelTypographyStyle}>APE ID</Typography>
          <TextField
            id="ape_id"
            name="id"
            variant="outlined"
            type="number"
            value={formData.id}
            onChange={handleInputChange}
            placeholder="Enter APE ID"
            required
            fullWidth
            error={!!errors.id}
            helperText={errors.id}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleReset}
            style={{
              height: "56px",
              marginRight: "50px",
              padding: "15px 30px",
              fontSize: "16px",
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            style={{ height: "56px", padding: "15px 30px", fontSize: "16px" }}
          >
            Find SmartAPE
          </Button>
        </div>
        {contractId.length !== 0 && (
        <Typography color="white">
          The new contract ID is: {contractId}
        </Typography>
      )}
      </form>
    </div>
  );
}
