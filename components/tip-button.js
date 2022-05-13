import { useState } from "react";
import SecondaryButton from "./secondary-button";
import { ethers } from "ethers";
import abi from "../utils/Keyboards.json"
import getKeyboardsContract from "../utils/getKeyboardsContract"



export default function TipButton({ keyboardsContract, index }) {
  // const contractAddress = '0x1EE264A692bcE67057ACB8ad52379918ac0Aa741';
  // const contractABI = abi.abi;
  //const keyboardsContract = getKeyboardsContract(ethereum);
  const [mining, setMining] = useState(false)
 

  const submitTip = async (e) => {
    if (!keyboardsContract) {
      console.error('keyboardsContract object is required to submit a tip');
      return;
    }

    setMining(true);
    try {
      // const provider = new ethers.providers.Web3Provider(ethereum);
      // const signer = provider.getSigner();
      // const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);

      const tipTxn = await keyboardsContract.tip(index, { value: ethers.utils.parseEther("0.01") })
      console.log('Tip transaction started...', tipTxn.hash)

      await tipTxn.wait();
      console.log('Sent tip!', tipTxn.hash);
    } finally {
      setMining(false);
    }
  }

  return <SecondaryButton onClick={submitTip} disabled={mining}>
    {mining ? 'Tipping...' : 'Tip 0.01 eth!'}
  </SecondaryButton>
}
