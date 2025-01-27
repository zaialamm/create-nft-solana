import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
} from '@metaplex-foundation/mpl-token-metadata';

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import {    
    keypairIdentity, 
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

const nftAddress = publicKey(
    "6gkiNZyQDSxW8YBzpD6RMu3dsfzEZsAwaR9Z2Gk4QkLg"
);

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity
});

transaction.sendAndConfirm(umi);

console.log(
    `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! 
    See on Solana Explorer: ${getExplorerLink(
        "address", 
        nftAddress,
        "devnet"
    )}`
);