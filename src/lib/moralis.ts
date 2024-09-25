import Moralis from "moralis";

export const initializeMoralis = () => {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error("MORALIS_API_KEY is not defined");
  }

  if (!Moralis.Core.isStarted) {
    Moralis.start({ apiKey });
  }
};
