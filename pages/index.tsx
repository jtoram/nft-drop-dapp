import {
  useClaimedNFTSupply,
  useContractMetadata,
  useUnclaimedNFTSupply,
  useActiveClaimCondition,
  Web3Button,
  useContract,
  useAddress,
  useDisconnect,
} from "@thirdweb-dev/react";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = "0x2CDe4c9178D22BbBCec18302c0D7075735f397C6";

const Home: NextPage = () => {
  
  const { contract: nftDrop } = useContract(myNftDropContractAddress);

  // The amount the user claims
  const [quantity, setQuantity] = useState(1); // default to 1

  // Load contract metadata
  const { data: contractMetadata } = useContractMetadata(nftDrop);

  // Load claimed supply and unclaimed supply
  const { data: unclaimedSupply } = useUnclaimedNFTSupply(nftDrop);
  const { data: claimedSupply } = useClaimedNFTSupply(nftDrop);

  // Load the active claim condition
  const { data: activeClaimCondition } = useActiveClaimCondition(nftDrop);

  // Check if there's NFTs left on the active claim phase
  const isNotReady =
    activeClaimCondition &&
    parseInt(activeClaimCondition?.availableSupply) === 0;

  // Check if there's any NFTs left
  const isSoldOut = unclaimedSupply?.toNumber() === 0;

  // Check price
  const price = parseUnits(
    activeClaimCondition?.currencyMetadata.displayValue || "0",
    activeClaimCondition?.currencyMetadata.decimals
  );

  // Multiply depending on quantity
  const priceToMint = price.mul(quantity);

  // Address of the connected wallet
  const address = useAddress();

  // Disconnect the currently connected wallet
  const disconnect = useDisconnect();

  // Loading state while we fetch the metadata
  if (!nftDrop || !contractMetadata) {
    return <div className={styles.container}>LOADING...</div>;
  }

  return (
    <div className={styles.container}>

      <div>
        {/* Title of your NFT Collection */}
        <h1>{contractMetadata?.name}</h1>
        {/* Description of your NFT Collection */}
        <p className={styles.description}>{contractMetadata?.description}</p>
      </div>

      <div>

        <div>
          {/* Image Preview of NFTs */}
          <img
            className={styles.image}
            src="qr.png"
            alt={`${contractMetadata?.name} preview image`}
          />

          {/* Amount claimed so far */}
          <div>
            <div>
              <p>TOTAL MINTED</p>
            </div>
            <div>
              {claimedSupply && unclaimedSupply ? (
                <p>
                  {/* Claimed supply so far */}
                  <b>{claimedSupply?.toNumber()}</b>
                  {" / "}
                  {
                    // Add unclaimed and claimed supply to get the total supply
                    claimedSupply?.toNumber() + unclaimedSupply?.toNumber()
                  }
                </p>
              ) : (
                // Show loading state if we're still loading the supply
                <p>LOADING...</p>
              )}
            </div>
          </div>

          {/* Show claim button or connect wallet button */}
          {
            // Sold out or show the claim button
            isSoldOut ? (
              <div>
                <h2>SOLD OUT!!!</h2>
              </div>
            ) : isNotReady ? (
              <div>
                <h2>NOT READY FOR MINTING YET!!!</h2>
              </div>
            ) : (
              <>
                <div className={styles.quantityContainer}>
                  <button
                    className={`${styles.quantityControlButton}`}
                    onClick={() => setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>

                  <h4>{quantity}</h4>

                  <button
                    className={`${styles.quantityControlButton}`}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      quantity >=
                      parseInt(
                        activeClaimCondition?.quantityLimitPerTransaction || "0"
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div className={styles.mintContainer}>
                  <Web3Button
                    contractAddress={myNftDropContractAddress}
                    action={async (contract) =>
                      await contract.erc721.claim(quantity)
                    }
                    // If the function is successful, we can do something here.
                    onSuccess={(result) =>
                      alert(
                        `Successfully minted ${result.length} NFT${
                          result.length > 1 ? "s" : ""
                        }!`
                      )
                    }
                    // If the function fails, we can do something here.
                    onError={(error) => alert(error?.message)}
                    accentColor="#f213a4"
                    colorMode="dark"
                  >
                    {`Mint${quantity > 1 ? ` ${quantity}` : ""}${
                      activeClaimCondition?.price.eq(0)
                        ? " (Free)"
                        : activeClaimCondition?.currencyMetadata.displayValue
                        ? ` (${formatUnits(
                            priceToMint,
                            activeClaimCondition.currencyMetadata.decimals
                          )} ${activeClaimCondition?.currencyMetadata.symbol})`
                        : ""
                    }`}
                  </Web3Button>
                </div>
                <div>
                    {address ? (
                      <p>
                        CONNECTED ADDRESS:{" "}...{address.substring(36)}{" "}
                        <button className={styles.button} onClick={disconnect}>
                          [DISCONNECT]
                        </button>
                      </p>
                    ) : (
                      <p>
                        NO CONNECTED ADDRESS
                      </p>
                    )}
                </div>
              </>
            )
          }
        </div>
      </div>
      <div>
        <p className={styles.footer}>
          MINT CONTRACT:{" "}
          <a className={styles.footer} href="https://polygonscan.com/address/0x2CDe4c9178D22BbBCec18302c0D7075735f397C6" rel="noopener noreferrer" target="_blank">
            {myNftDropContractAddress}
          </a>
        </p>
        <a className={styles.footer} href="https://muddy-glade-6586.on.fleek.co/" rel="noopener noreferrer" target="_blank">
          MAIN SITE
        </a>
      </div>
    </div>
  );
};

export default Home;
