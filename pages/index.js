import { useState, useEffect } from "react";
import { toast } from "react-hot-toast"
import PrimaryButton from "../components/primary-button";
// import abi from "../utils/Keyboards.json"
import addressesEqual from "../utils/addressesEqual";
import getKeyboardsContract from "../utils/getKeyboardsContract"
import { ethers } from "ethers";
import { UserCircleIcon } from "@heroicons/react/solid";
import Keyboard from "../components/keyboard";
import TipButton from "../components/tip-button";
import { useMetaMaskAccount } from "../components/meta-mask-account-provider";

export default function Home() {
  // const [ethereum, setEthereum] = useState(undefined);
  // const [connectedAccount, setConnectedAccount] = useState(undefined);
  const { ethereum, connectedAccount, connectAccount } = useMetaMaskAccount();
  const [keyboards, setKeyboards] = useState([])
  const [keyboardsLoading, setKeyboardsLoading] = useState(false);
  const keyboardsContract = getKeyboardsContract(ethereum);
 
  // const contractAddress = '0xdC76e934fbbBa112e5Cac67a3308d94456eb9284';  //string input
  // const contractAddress = '0x2a4BF15Cb5139b6814E6dc4100DF6D5a5609245E';  //array input 
  // const contractAddress = '0x9082683d260d939cFD1435785f85A7936B508df6';  // add tip 
  // const contractAddress = '0x1EE264A692bcE67057ACB8ad52379918ac0Aa741';  // tip with notifcations on cration and tipping
  // const contractABI = abi.abi;  //Application Binary Interface (ABI) is an interface to contract
  

  // // handle which account to connect
  // const handleAccounts = (accounts) => {
  //   if (accounts.length > 0) {
  //     const account = accounts[0];  //get the first account on Metamask
  //     console.log('We have an authorized account: ', account);
  //     setConnectedAccount(account);
  //   } else {   //debug logging
  //     console.log("No authorized accounts yet")
  //   }
  // };
  
  // // detect MetaMask installed or not
  // const getConnectedAccount = async () => {
  //   if (window.ethereum) {
  //     setEthereum(window.ethereum);
  //   }
  
  //   if (ethereum) {
  //     //request to MetaMask
  //     const accounts = await ethereum.request({ method: 'eth_accounts' });
  //     handleAccounts(accounts);
  //   }
  // };
  // useEffect(() => getConnectedAccount(), []);
  
  // // open MetaMask and ask user for permission to connect to the app
  // const connectAccount = async () => {
  //   if (!ethereum) {
  //     alert('MetaMask is required to connect an account');
  //     return;
  //   }
  //   const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  //   handleAccounts(accounts);
  // };

  // connect to contract
  const getKeyboards = async () => {
    if (keyboardsContract && connectedAccount) {
      setKeyboardsLoading(true);
      try{
        // //need provider and signer to make a call on behalf of the connected account in MetaMask
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();  //signer call contracts
        // // make call to contract once we have all information: contractAddress, contractABI, signer
        // const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);
        // // call getKeyboards function in the contract
        
        const keyboards = await keyboardsContract.getKeyboards();
        console.log('Retrieved keyboards...', keyboards)
        setKeyboards(keyboards)
      } finally {
        setKeyboardsLoading(false);
      }
    }
  }
  useEffect(() => getKeyboards(), [connectedAccount])


  const addContractEventHandlers = () => {
    if (keyboardsContract && connectedAccount) {
      keyboardsContract.on('KeyboardCreated', async (keyboard) => {
        if (connectedAccount && !addressesEqual(keyboard.owner, connectedAccount)) {
          toast('Somebody created a new keyboard!', { id: JSON.stringify(keyboard) });
        }
        await getKeyboards();
      })
      keyboardsContract.on('TipSent', (recipient, amount) => {
        if (addressesEqual(recipient, connectedAccount)) {
          // use ` not ' , to quote toast msg
          toast(`You received a tip of ${ethers.utils.formatEther(amount)} eth!`, { id: recipient + amount });
        }
      })
    }
  }
  useEffect(addContractEventHandlers, [!!keyboardsContract, connectedAccount]);


  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }

  if (!connectedAccount) {
    return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
  }

  // if there is any image to show
  if (keyboards.length > 0){
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
          {keyboards.map(
            ([kind, isPBT, filter, owner], i) => (
              <div key={i} className="relative">
                <Keyboard kind={kind} isPBT={isPBT} filter={filter} />
                <span className="absolute top-1 right-6">
                  {addressesEqual(owner, connectedAccount) ?
                    <UserCircleIcon className="h-5 w-5 text-indigo-100" /> :
                    <TipButton keyboardsContract={keyboardsContract} index={i} />
                  }
                </span>
              </div>
            )
          )}
        </div>
      </div>
    )
  }
  // if still loading
  if (keyboardsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
        <p>Loading Keyboards...</p>
      </div>
    )
  }

  // if no keyboard yet
  return (
    <div className="flex flex-col gap-4">
    <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
    <p>No keyboards yet!</p>
  </div>
  )
}