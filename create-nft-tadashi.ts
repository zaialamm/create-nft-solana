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
    percentAmount,
    publicKey 
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

const collectionAddress = publicKey(
    "H9TEd7aoXCELcUE7uLYp98mb22i9ApjNvxtif9SqXZ1W"
);

console.log(`creating NFT...`)

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: mint,
    name: "Tadashi Hamada NFT",
    symbol: "TADASHI",
    uri: "https://raw.githubusercontent.com/zaialamm/create-nft-solana/refs/heads/main/nft-tadashi-hamada.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false
    },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log (`Created NFT! Address is ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"
)}`)