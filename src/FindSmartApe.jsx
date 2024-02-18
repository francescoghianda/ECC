import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import {
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  Backdrop,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useContext, useState } from "react";
import { GlobalAppContext } from "./contexts/GlobalAppContext";
import { findSmartAPE } from "./services/hederaService";

export default function FindSmartApe() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [progress, setProgress] = useState(0);
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
  const [smartApe, setSmartApe] = useState({
    id: "",
    expirationDate: "",
    latitude: 0,
    longitude: 0,
    address: "",
    yearOfConstruction: 0,
    reason: "",
    status: 0,
    previuos: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    //const error = isNaN(value) ? "Insert a valid number" : "";
    /*setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));*/
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    findSmartAPE(client, formData.id, setProgress).then((smartApeData) => {
      setLoading(false);
      setFound(true);
      console.log(smartApeData.id);
      setSmartApe({
        id: smartApeData.id,
        status: smartApeData.status === 0 ? "valid" : "expired",
        expirationDate: new Date(
          smartApeData.expirationDate
        ).toLocaleDateString("en-US"),
        latitude: smartApeData.latitude / 100000000,
        longitude: smartApeData.longitude / 100000000,
        address: smartApeData.address,
        yearOfConstruction: smartApeData.yearOfConstruction,
        reason: smartApeData.reason,
        hash: smartApeData.hash,
        hashAlgorithm: smartApeData.hashAlgorithm,
        previuos: smartApeData.previuos,
      });
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
            type="text"
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
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <Stack alignItems="center">
              <CircularProgress color="inherit" />
              <Typography style={{ fontSize: "2rem" }}>
                {parseInt(progress * 100)}%
              </Typography>
            </Stack>
          </Backdrop>
        </div>

        {!loading && found && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto auto",
              columnGap: "1rem",
              rowGap: "2rem",
            }}
          >
            <Typography fontWeight="bold">APE ID</Typography>
            <Typography>{smartApe.id}</Typography>
            <Typography fontWeight="bold">Year of construction</Typography>
            <Typography>{smartApe.yearOfConstruction}</Typography>
            <Typography fontWeight="bold">Address</Typography>
            <Typography>{smartApe.address}</Typography>
            <Typography fontWeight="bold">Latitude</Typography>
            <Typography>{smartApe.latitude}</Typography>
            <Typography fontWeight="bold">Expiration Date</Typography>
            <Typography>{smartApe.expirationDate}</Typography>
            <Typography fontWeight="bold">Longitude</Typography>
            <Typography>{smartApe.longitude}</Typography>
            <Typography fontWeight="bold">Reason</Typography>
            <Typography>{smartApe.reason}</Typography>
            <Typography fontWeight="bold">Hash Algorithm</Typography>
            <Typography>{smartApe.hashAlgorithm}</Typography>
            <Typography fontWeight="bold">Status</Typography>
            <Typography>{smartApe.status}</Typography>
            <Typography></Typography>
            <Typography></Typography>
            <Typography fontWeight="bold">Previous</Typography>
            <Typography style={{ gridColumn: "2/span 3", fontSize: "0.8rem" }}>
              {smartApe.previuos} {parseInt(smartApe.previuos) != 0 ? `(0.0.${parseInt(smartApe.previuos, 16)})` : ""}
            </Typography>
            <Typography fontWeight="bold">Hash</Typography>
            <Typography style={{ gridColumn: "2/span 3", fontSize: "0.8rem" }}>
              {smartApe.hash}
            </Typography>
          </div>
        )}
      </form>
    </div>
  );
}
