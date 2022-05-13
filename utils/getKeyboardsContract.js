import { ethers } from "ethers";
import abi from "../utils/Keyboards.json"

const contractAddress = '0x1EE264A692bcE67057ACB8ad52379918ac0Aa741';
const contractABI = abi.abi;

export default function getKeyboardsContract(ethereum) {
  if(ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    return undefined;
  }
}
