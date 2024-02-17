import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useContext } from 'react';
import { GlobalAppContext } from '../contexts/GlobalAppContext';
import { connectToMetamask } from '../services/metamaskService';


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
    <AppBar
      position="relative" color='primary'>
      <Toolbar>
        <Button
        variant='contained'
        color='secondary'
        >
          Deploy SmartAPE
        </Button>

        <Button
        variant='contained'
        color='secondary'
        >
          Find SmartAPE
        </Button>
      </Toolbar>
    </AppBar>
  )
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