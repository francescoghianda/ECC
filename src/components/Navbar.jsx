import { AppBar, Button, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";

export default function NavBar() {
  /*const { metamaskAccountAddress, setMetamaskAccountAddress } = useContext(GlobalAppContext);

  const retrieveWalletAddress = async () => {
    const addresses = await connectToMetamask();
    if (addresses) {
      setMetamaskAccountAddress(addresses[0]);
      console.log(addresses[0]);
    }
  }*/

  return (
    <AppBar position="relative" color="primary">
      <Toolbar>
        <Link to="/">
          <Button variant="contained" color="secondary">
            Deploy SmartAPE
          </Button>
        </Link>
        <Link to="/FindSmartApe">
          <Button variant="contained" color="secondary">
            Find SmartAPE
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}

/*
<Button
          variant='contained'
          color='secondary'
          sx={{
            ml: 'auto'
          }}
          onClick={retrieveWalletAddress}
        >
          {metamaskAccountAddress === "" ?
            "Connect to MetaMask" :
            `Connected to: ${metamaskAccountAddress.substring(0, 8)}...`}
        </Button>


*/
