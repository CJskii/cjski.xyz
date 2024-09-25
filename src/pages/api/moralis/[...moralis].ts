import { MoralisNextApi } from "@moralisweb3/next";

const apiKey = process.env.MORALIS_API_KEY;
if (!apiKey) {
  throw new Error("MORALIS_API_KEY is not defined");
}

export default MoralisNextApi({ apiKey });
