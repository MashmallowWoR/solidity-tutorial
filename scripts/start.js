async function main() {
  const [owner, somebodyElse] = await hre.ethers.getSigners();
  const keyboardsContractFactory = await hre.ethers.getContractFactory("Keyboards");   //get Keyboards.sol from contracts/ directory
  const keyboardsContract = await keyboardsContractFactory.deploy();  // create a deploy transaction for contract
  await keyboardsContract.deployed();  // wait for deploy to complete

  // console.log("Contract deployed to:", keyboardsContract.address);

  let keyboards = await keyboardsContract.getKeyboards();
  //const keyboards = await keyboardsContract.createdKeyboards(0);
  console.log("We got the keyboards!", keyboards);

  const keyboardTxn1 = await keyboardsContract.create(0, true, "sepia");
  await keyboardTxn1.wait();

  const keyboardTxn2 = await keyboardsContract.connect(somebodyElse).create(1, false, "greyscale");
  //const keyboardTxn2 = await keyboardsContract.create(1, false, "grayscale");
  await keyboardTxn2.wait();

  const balanceBefore = await hre.ethers.provider.getBalance(somebodyElse.address);
  console.log("somebodyElse balance before!", hre.ethers.utils.formatEther(balanceBefore));

  const tipTxn = await keyboardsContract.tip(1, {value: hre.ethers.utils.parseEther("1000")}); // tip the 2nd keyboard
  const tipTxnReceipt = await tipTxn.wait();
  console.log(tipTxnReceipt.events);

  const balanceAfter = await hre.ethers.provider.getBalance(somebodyElse.address)
  console.log("somebodyElse balance after!", hre.ethers.utils.formatEther(balanceAfter));

  const keyboardTxn = await keyboardsContract.create(2, true, "sepia");
  const keyboardTxnReceipt = await keyboardTxn.wait();
  console.log(keyboardTxnReceipt.events);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });