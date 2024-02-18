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
import {
  deploySmartAPE,
  findSmartAPE,
  sendHbar,
} from "./services/hederaService";
import { formDataToJson, calcolateFileHash } from "./services/utils";

export default function Home() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);
  const [loading, setLoading] = useState(false);
  const [contractId, setContractId] = useState("");
  const [errors, setErrors] = useState({});

  const [progress, setProgress] = useState({ value: 0, msg: "" });

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
    expirationDate: "",
    latitude: "",
    longitude: "",
    address: "",
    yearOfConstruction: "",
    reason: "0",
    otherReason: "",
    doc: null,
    previous: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (
      name === "id" ||
      name === "latitude" ||
      name === "longitude" ||
      name === "yearOfConstruction"
    ) {
      const error = isNaN(value) ? "Insert a valid number" : "";
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    const id = parseInt(formData.id);

    const inputDate = new Date(formData.expirationDate);
    const currentDate = new Date();

    const expirationDate = new Date(formData.expirationDate).getTime();
    const latitude = parseFloat(formData.latitude.replace(".", ""));
    const longitude = parseFloat(formData.longitude.replace(".", ""));
    const yearOfConstruction = parseInt(formData.yearOfConstruction);
    const reason = parseInt(formData.reason);
    const otherReason = formData.otherReason;
    const previous = formData.previous;

    if (
      isNaN(id) ||
      isNaN(inputDate.getTime()) ||
      inputDate <= currentDate ||
      isNaN(expirationDate) ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      isNaN(yearOfConstruction) ||
      isNaN(reason) ||
      (reason === 5 && !otherReason)
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const data = {
      ...formData,
      id,
      expirationDate,
      latitude,
      longitude,
      yearOfConstruction,
      reason,
      previous,
    };

    const documentHash = await calcolateFileHash(data.doc);
    delete data.doc;
    data.documentHash = documentHash;
    data.hashAlgorithm = "SHA-256";

    deploySmartAPE(client, myPrivateKey, data, setProgress).then(
      (contractId) => {
        setLoading(false);
        setContractId(contractId.toString());
      }
    );
  };

  const handleReset = () => {
    setFormData({
      id: "",
      expirationDate: "",
      latitude: "",
      longitude: "",
      address: "",
      yearOfConstruction: "",
      reason: "0",
      otherReason: "",
      doc: null,
      previous: "",
    });
    setContractId("");
    setErrors({});
  };

  const formContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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

          <Typography style={labelTypographyStyle}>Expiration date</Typography>
          <TextField
            id="expiration_date"
            name="expirationDate"
            variant="outlined"
            type="date"
            value={formData.expirationDate}
            onChange={handleInputChange}
            placeholder="Enter expiration date"
            required
            fullWidth
            error={!!errors.expirationDate}
            helperText={errors.expirationDate}
          />

          <Typography style={labelTypographyStyle}>Latitude</Typography>
          <TextField
            id="latitude"
            name="latitude"
            variant="outlined"
            type="text"
            pattern="[0-9]+(\.[0-9]+)?"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="Enter latitude"
            required
            fullWidth
            error={!!errors.latitude}
            helperText={errors.latitude}
          />

          <Typography style={labelTypographyStyle}>Longitude</Typography>
          <TextField
            id="longitude"
            name="longitude"
            variant="outlined"
            type="text"
            pattern="[0-9]+(\.[0-9]+)?"
            value={formData.longitude}
            onChange={handleInputChange}
            placeholder="Enter longitude"
            required
            fullWidth
            error={!!errors.longitude}
            helperText={errors.longitude}
          />

          <Typography style={labelTypographyStyle}>
            Previous APE
          </Typography>
          <TextField
            id="previous"
            name="previous"
            variant="outlined"
            type="text"
            value={formData.previous}
            onChange={handleInputChange}
            placeholder="Previous SmartAPE address"
            fullWidth
          />
        </div>

        <div>
          <Typography style={labelTypographyStyle}>Address</Typography>
          <TextField
            id="address"
            name="address"
            variant="outlined"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            required
            fullWidth
          />

          <Typography style={labelTypographyStyle}>
            Year of Construction
          </Typography>
          <TextField
            id="year_of_constr"
            name="yearOfConstruction"
            variant="outlined"
            type="number"
            value={formData.yearOfConstruction}
            onChange={handleInputChange}
            placeholder="Enter year of construction"
            required
            fullWidth
            error={!!errors.yearOfConstruction}
            helperText={errors.yearOfConstruction}
          />

          <Typography style={labelTypographyStyle}>Reason</Typography>
          <Select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleSelectChange}
            required
            variant="outlined"
            fullWidth
          >
            <MenuItem value={0}>New construction</MenuItem>
            <MenuItem value={1}>Changed property</MenuItem>
            <MenuItem value={2}>Leased</MenuItem>
            <MenuItem value={3}>Renovation</MenuItem>
            <MenuItem value={4}>Energy requalification</MenuItem>
            <MenuItem value={5}>Other</MenuItem>
          </Select>

          {formData.reason === 5 && (
            <div>
              <Typography style={labelTypographyStyle}>Other reason</Typography>
              <TextField
                id="otherReason"
                name="otherReason"
                variant="outlined"
                type="text"
                value={formData.otherReason}
                onChange={handleInputChange}
                placeholder="Enter other reason"
                required
                fullWidth
              />
            </div>
          )}

          <Typography style={labelTypographyStyle}>
            Upload Document (PDF)
          </Typography>
          <TextField
            accept="application/pdf"
            name="doc"
            style={{ display: "none" }}
            id="doc"
            type="file"
            onChange={(event) =>
              setFormData({ ...formData, doc: event.target.files[0] })
            }
            variant="outlined"
            required
            fullWidth
            error={!!errors.docUploadError}
            helperText={errors.docUploadError}
          />

          <label htmlFor="doc" style={{ width: "100%", height: "56px" }}>
            <Button
              variant="outlined"
              component="span"
              fullWidth
              style={{ height: "56px" }}
            >
              {formData.doc ? formData.doc.name : "Select Document"}
            </Button>
          </label>

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
            Deploy SmartAPE
          </Button>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <Stack alignItems="center">
              <CircularProgress color="inherit" />
              <Typography style={{ fontSize: "2rem" }}>
                {parseInt(progress.value * 100)}%
              </Typography>
              <Typography>{progress.msg}</Typography>
            </Stack>
          </Backdrop>
        </div>
        {contractId.length !== 0 && !loading && (
          <Typography color="black">
            The new contract ID is: {contractId}
          </Typography>
        )}
      </form>
    </div>
  );
}
