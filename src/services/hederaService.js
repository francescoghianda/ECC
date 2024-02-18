import { AccountId, Client, PrivateKey, Hbar, 
  TransactionReceiptQuery, TransferTransaction, 
  FileCreateTransaction, FileAppendTransaction, 
  ContractCreateTransaction, ContractFunctionParameters, 
  ContractExecuteTransaction, TransactionRecordQuery } from "@hashgraph/sdk"

import smartAPE from '../smart-contract/SmartAPE.bin'


export const sendHbar = async (client, fromAddress, toAddress, amount, operatorPrivateKey) => {
  const transferHbarTransaction = new TransferTransaction()
    .addHbarTransfer(fromAddress, -amount)
    .addHbarTransfer(toAddress, amount)
    .freezeWith(client);

  const transferHbarTransactionSigned = await transferHbarTransaction.sign(operatorPrivateKey);
  const transferHbarTransactionResponse = await transferHbarTransactionSigned.execute(client);

  // Get the child receipt or child record to return the Hedera Account ID for the new account that was created
  const transactionReceipt = await new TransactionReceiptQuery()
    .setTransactionId(transferHbarTransactionResponse.transactionId)
    .setIncludeChildren(true)
    .execute(client);

   console.log(`Transaction Status: ${transactionReceipt.status}`);
}

export const loadFile = async (client, file, operatorPrivateKey, setProgress) => {

  const chunks = getChunks(file, 1024);

  let progress = 0;
  const p = 0.9/chunks.length;

  setProgress({
    value: 0,
    msg: `Loading smart contract (chunk ${0} of ${chunks.length}).`
  })

  const fileId = await createFile(chunks[0], client, operatorPrivateKey);

  progress += p;
  setProgress({
    value: progress,
    msg: `Loading smart contract (chunk ${1} of ${chunks.length}).`
  })
  console.log("File created. File ID: ", fileId);

  for (let i = 1; i < chunks.length; i++) {
      await appendChunk(chunks[i], fileId, client);

      progress += p;
      setProgress({
        value: progress,
        msg: `Loading smart contract (chunk ${i} of ${chunks.length}).`
      })
  }

  console.log("File created. End.")

  return fileId;
}


export const deploySmartAPE = (client, privateKey, apeData, setProgress) => {

    const parameters = new ContractFunctionParameters()
            .addString(apeData.id)
            .addUint256(apeData.expirationDate)
            .addUint256(apeData.latitude)
            .addUint256(apeData.longitude)
            .addString(apeData.address)
            .addUint32(apeData.yearOfConstruction)
            .addUint8(apeData.reason)
            .addString(apeData.otherReason)
            .addString(apeData.documentHash)
            .addString(apeData.hashAlgorithm);


    return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();  
      req.open('get', smartAPE , true);
      req.responseType = 'text';
      req.onload = function () { 
        loadFile(client, req.response, privateKey, setProgress)
          .then(fileId => {

            setProgress({
              value: 0.9,
              msg: `Deploying smart contract.`
            })
            
            deploySmartContract(client, fileId, parameters, 3_000_000)
              .then(async contractId => {

                if (apeData.previous && apeData.previous.length > 0) {

                  setProgress({
                    value: 0.95,
                    msg: `Setting previous document address.`
                  })

                  if (apeData.previous.startsWith("0.0.")) {
                    let dec = parseInt(apeData.previous.substring(4));
                    let hex = dec.toString(16);
                    apeData.previous = "0x" + getZeros(40-hex.length) + hex;
                  }

                  console.log(apeData.previous);

                  const parameters = new ContractFunctionParameters()
                        .addAddress(apeData.previous)
                      
                  const result = await callSmartContractFunction(client, contractId, "setPreviousDocument", parameters);
                }

                setProgress({
                  value: 1,
                  msg: `Done.`
                })

                resolve(contractId);
              });

          })
      };
      req.send();
    })


}

const getZeros = (num) => {
  let s = "";
  for(let i = 0; i < num; i++) {
    s += "0";
  }
  return s;
}

const deploySmartContract = async (client, bytecodeFileId, parameters, gas) => {
  
  const contractTx = new ContractCreateTransaction()
          .setBytecodeFileId(bytecodeFileId)
          .setMaxTransactionFee(Hbar.from(1000))
          .setConstructorParameters(parameters)
          .setGas(gas);
  
  const contractResponse = await contractTx.execute(client);
  const contractReceipt = await contractResponse.getReceipt(client);
  const contractId = contractReceipt.contractId;

  return contractId;
}

export const findSmartAPE = (client, contractId, setProgress) => {

  return new Promise(async (resolve, reject) => {

    const p = 1/12;
    let progress = 0;
    setProgress(0);

    const apeId = (await callSmartContractFunction(client, contractId, "getApeId")).getString();
    progress += p;
    setProgress(progress);
    const status = (await callSmartContractFunction(client, contractId, "getStatus")).getInt8();
    progress += p;
    setProgress(progress);
    const expirationDate = (await callSmartContractFunction(client, contractId, "getExpirationDate")).getInt256().toNumber();
    progress += p;
    setProgress(progress);
    const latitude = (await callSmartContractFunction(client, contractId, "getLatitude")).getInt256().toNumber();
    progress += p;
    setProgress(progress);
    const longitude = (await callSmartContractFunction(client, contractId, "getLongitude")).getInt256().toNumber();
    progress += p;
    setProgress(progress);
    const address = (await callSmartContractFunction(client, contractId, "getAddress")).getString();
    progress += p;
    setProgress(progress);
    const yearOfConstruction = (await callSmartContractFunction(client, contractId, "getYearOfConstruction")).getInt32();
    progress += p;
    setProgress(progress);
    const previuos = (await callSmartContractFunction(client, contractId, "getPreviousDocument")).getAddress();
    progress += p;
    setProgress(progress);
    const reason = (await callSmartContractFunction(client, contractId, "getReason")).getInt8();
    progress += p;
    setProgress(progress);
    const otherReason = (await callSmartContractFunction(client, contractId, "getOtherReason")).getString();
    progress += p;
    setProgress(progress);
    const hash = (await callSmartContractFunction(client, contractId, "getDocumentHash")).getString();
    progress += p;
    setProgress(progress);
    const hashAlgorithm = (await callSmartContractFunction(client, contractId, "getHashAlgorithm")).getString();

    setProgress(1);

    let reasonString = "";

    switch(reason) {
      case 0:
        reasonString = "New construction";
        break;
      case 1:
        reasonString = "Changed property";
        break;
      case 2:
        reasonString = "Leased";
        break;
      case 3:
        reasonString = "Renovation";
        break;
      case 4:
        reasonString = "Energy requalification";
        break;
      default:
        reasonString = otherReason
    }

    console.log(previuos)


    resolve({

      id: apeId,
      status: status,
      expirationDate: expirationDate,
      latitude: latitude,
      longitude: longitude,
      address: address,
      yearOfConstruction: yearOfConstruction,
      previuos: previuos,
      reason: reasonString,
      hash: hash,
      hashAlgorithm: hashAlgorithm

    })


  });

}

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}

const callSmartContractFunction = async (client, contractId, functionName, parameters) => {
  const transaction = new ContractExecuteTransaction()
     .setContractId(contractId)
     .setGas(3_000_000)
    
  if(parameters) {
    transaction.setFunction(functionName, parameters);
  }
  else {
    transaction.setFunction(functionName);
  }

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const transactionStatus = receipt.status;

  console.log("The transaction consensus status is " +transactionStatus);

  const query = await (new TransactionRecordQuery()
    .setTransactionId(txResponse.transactionId)
    .execute(client));

  //console.log((await query).contractFunctionResult.getString())

  return query.contractFunctionResult;
}

const getChunks = (content, chunkSize) => {
  const chunkNum = content.length / chunkSize;
  let chunks = [];

  for (let i = 0; i < chunkNum; i++){
      let remain = content.length - i*chunkSize;
      let size = remain > chunkSize ? chunkSize : remain;
      let chunk = content.slice(i*chunkSize, i*chunkSize+size)
      chunks.push(chunk)
  }

  return chunks;
}

const createFile = async (chunk0, client, privateKey) => {
  const createTransaction = new FileCreateTransaction()
      .setKeys([privateKey])
      .setMaxTransactionFee(new Hbar(2))
      .setContents(chunk0);

  const submitTx = await createTransaction.execute(client);
  const fileReceipt = await submitTx.getReceipt(client);
  return fileReceipt.fileId;
}

const appendChunk = async (chunk, fileId, client) => {
  const transaction = new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk);

  const modifyMaxTransactionFee = await transaction.setMaxTransactionFee(new Hbar(2));

  const txResponse = await modifyMaxTransactionFee.freezeWith(client).execute(client);
  const receipt = await txResponse.getReceipt(client);
}