import {
  VersionedTransaction,
  Keypair,
  SystemProgram,
  Transaction,
  Connection,
  ComputeBudgetProgram,
  TransactionInstruction,
  TransactionMessage,
  AddressLookupTableProgram,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { openAsBlob } from "fs";
import base58 from "bs58";

import {
  delay_1,
  delay_2,
  DESCRIPTION,
  DISTRIBUTION_WALLETNUM,
  FILE,
  global_mint,
  JITO_FEE,
  JITO_KEY,
  JitoType,
  PRIVATE_KEY,
  PUMP_PROGRAM,
  RPC_ENDPOINT,
  RPC_WEBSOCKET_ENDPOINT,
  SWAP_AMOUNT,
  TELEGRAM,
  TOKEN_CREATE_ON,
  TOKEN_NAME,
  TOKEN_SHOW_NAME,
  TOKEN_SYMBOL,
  TWITTER,
  wallet_1,
  wallets,
  WEBSITE,
} from "./constants";
import { saveDataToFile, sleep } from "./utils";
import { createAndSendV0Tx, execute } from "./executor/legacy";
import { PumpFunSDK } from "./src/pumpfun";
import { executeJitoTx } from "./executor/jito";

const commitment = "confirmed";

const connection = new Connection(RPC_ENDPOINT, {
  wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
  commitment,
});
const mainKp = Keypair.fromSecretKey(base58.decode(PRIVATE_KEY));
await sleep(parseInt(delay_1))
let kps: JitoType[] = [];
const transactions: VersionedTransaction[] = [];

const mintKp = Keypair.generate();
//         |||||||||||||||||||
const mintAddress = mintKp.publicKey;
// const mintAddress = new PublicKey("2XkERkpvrhyUMKVXruMFCg8iHR3fpFqFs8XVgrimBthp")

let sdk = new PumpFunSDK(
  new AnchorProvider(connection, new NodeWallet(new Keypair()), { commitment })
);

const main = async () => {
  
};

// create token instructions
const createTokenTx = async () => {
  const tokenInfo = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    description: DESCRIPTION,
    showName: TOKEN_SHOW_NAME,
    createOn: TOKEN_CREATE_ON,
    twitter: TWITTER,
    telegram: TELEGRAM,
    website: WEBSITE,
    file: await openAsBlob(FILE),
  };
  let tokenMetadata = await sdk.createTokenMetadata(tokenInfo);

  let createIx = await sdk.getCreateInstructions(
    mainKp.publicKey,
    tokenInfo.name,
    tokenInfo.symbol,
    tokenMetadata.metadataUri,
    mintKp
  );

  const jitoFeeInstruction = await jitoFeeIx(mainKp);
  return [jitoFeeInstruction, createIx];
};

// jito fee instruction
const jitoFeeIx = async (mainKp: JitoType) => {
  const tipAccounts = [
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  ];
  const jitoFeeWallet = new PublicKey(
    tipAccounts[Math.floor(tipAccounts.length * Math.random())]
  );
  return SystemProgram.transfer({
    fromPubkey: mainKp.publicKey,
    toPubkey: jitoFeeWallet,
    lamports: Math.floor(JITO_FEE * 10 ** 9),
  });
};
// make sell instructions
const makeSellIx = async (kp: JitoType, buyAmount: number, index: number) => {
  let buyIx = await sdk.getSellInstructionsByTokenAmount(
    kp.publicKey,
    mintAddress,
    BigInt(buyAmount)
  );
  return buyIx;
};

const createLUT = async () => {
  let i = 0;
  while (true) {
    if (i > 5) {
      console.log("LUT creation failed, Exiting...");
      return;
    }
    try {
      const [lookupTableInst, lookupTableAddress] =
        AddressLookupTableProgram.createLookupTable({
          authority: mainKp.publicKey,
          payer: mainKp.publicKey,
          recentSlot: await connection.getSlot(),
        });

      // Step 2 - Log Lookup Table Address
      console.log("Lookup Table Address:", lookupTableAddress.toBase58());

      // Step 3 - Generate a create transaction and send it to the network
      const result = await createAndSendV0Tx(
        [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
          lookupTableInst,
        ],
        mainKp,
        connection
      );

      if (!result) throw new Error("Lut creation error");

      console.log("Please wait for about 15 seconds...");

      return lookupTableAddress;
    } catch (err) {
      console.log("Error in creating Lookuptable. Retrying.");
      i++;
    }
  }
};

async function addAddressesToTable(
  lutAddress: PublicKey,
  mint: PublicKey,
  walletKPs: JitoType[]
) {
  const walletPKs: PublicKey[] = walletKPs.map((wallet) => wallet.publicKey);

  try {
    let i = 0;
    while (true) {
      if (i > 5) {
        console.log("Extending LUT failed, Exiting...");
        return;
      }

      // Step 1 - Adding bundler wallets
      const addAddressesInstruction =
        AddressLookupTableProgram.extendLookupTable({
          payer: mainKp.publicKey,
          authority: mainKp.publicKey,
          lookupTable: lutAddress,
          addresses: walletPKs,
        });
      const result = await createAndSendV0Tx(
        [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
          addAddressesInstruction,
        ],
        mainKp,
        connection
      );
      if (result) {
        i = 0;
        break;
      } else {
        console.log("Trying again with step 1");
      }
    }
    await sleep(1000);

    // Step 2 - Adding wallets' token ata
    while (true) {
      if (i > 5) {
        console.log("Extending LUT failed, Exiting...");
        return;
      }

      const baseAtas: PublicKey[] = [];

      for (const wallet of walletKPs) {
        const baseAta = getAssociatedTokenAddressSync(mint, wallet.publicKey);
        baseAtas.push(baseAta);
      }
      const addAddressesInstruction1 =
        AddressLookupTableProgram.extendLookupTable({
          payer: mainKp.publicKey,
          authority: mainKp.publicKey,
          lookupTable: lutAddress,
          addresses: baseAtas,
        });
      const result = await createAndSendV0Tx(
        [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
          addAddressesInstruction1,
        ],
        mainKp,
        connection
      );

      if (result) {
        console.log("Successfully added base ata addresses.");
        i = 0;
        break;
      } else {
        console.log("Trying again with step 2");
      }
    }
    await sleep(3000);

    // Step 3 - Adding main wallet and static keys

    while (true) {
      if (i > 5) {
        console.log("Extending LUT failed, Exiting...");
        return;
      }
      const addAddressesInstruction3 =
        AddressLookupTableProgram.extendLookupTable({
          payer: mainKp.publicKey,
          authority: mainKp.publicKey,
          lookupTable: lutAddress,
          addresses: [
            mainKp.publicKey,
            global_mint,
            mint,
            PUMP_PROGRAM,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            SystemProgram.programId,
            SYSVAR_RENT_PUBKEY,
            NATIVE_MINT,
          ],
        });

      const result = await createAndSendV0Tx(
        [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
          addAddressesInstruction3,
        ],
        mainKp,
        connection
      );

      if (result) {
        console.log("Successfully added main wallet address.");
        i = 0;
        break;
      } else {
        console.log("Trying again with step 4");
      }
    }
    await sleep(2000);
  } catch (err) {
    console.log(
      "There is an error in adding addresses in LUT. Please retry it."
    );
    return;
  }
}

main();
