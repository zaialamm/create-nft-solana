import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import {    
    generateSigner, 
    keypairIdentity, 
    percentAmount 
} from '@metaplex-foundation/umi';

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
    connection, 
    user.publicKey, 
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user account", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser)); 

console.log ("set up Umi instance for User");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "Hiro Hamada NFT Collection",
    symbol: "HIRO",
    uri: "https://raw.githubusercontent.com/zaialamm/create-nft-solana/refs/heads/main/col-nft-hiro-hamada.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
    umi, 
    collectionMint.publicKey
);

console.log(
    `Created collection! Address is ${getExplorerLink(
    "address",
     createdCollectionNft.mint.publicKey, 
     "devnet"
    )}`
);