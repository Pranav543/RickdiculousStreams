import { providers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const INFURA_ID = "460f40a260564ac4a4f4b3fffb032dad";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID, // required
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions, // required
  });
}

export async function connectWallet(dispatch) {
  const provider = await web3Modal.connect();

  // We plug the initial `provider` into ethers.js and get back
  // a Web3Provider. This will add on methods from ethers.js and
  // event listeners such as `.on()` will be different.
  const web3Provider = new providers.Web3Provider(provider);

  const sf = await Framework.create({
    chainId: 80001,
    provider: web3Provider,
  });

  const sfSigner = sf.createSigner({ web3Provider: web3Provider });

  const signer = web3Provider.getSigner();
  const address = await signer.getAddress();

  const network = await web3Provider.getNetwork();

  dispatch({
    type: "SET_WEB3_PROVIDER",
    provider,
    web3Provider,
    address,
    chainId: network.chainId,
    signer,
    sf,
    sfSigner,
  });
}

export async function disconnectWallet(provider, dispatch) {
  await web3Modal.clearCachedProvider();
  if (provider.disconnect && typeof provider.disconnect === "function") {
    await provider.disconnect();
  }
  dispatch({
    type: "RESET_WEB3_PROVIDER",
  });
}
