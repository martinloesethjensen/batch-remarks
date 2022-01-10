// Import the API, Keyring and some utility functions
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const fs = require("fs");

const options = require("yargs")
  .option("endpoint", {
    alias: "e",
    type: "string",
    description:
      "The wss endpoint. [Westend = wss://westend-rpc.polkadot.io] [Kusama = wss://kusama-rpc.polkadot.io]",
    required: true,
  })
  .option("secret-keys", {
    alias: "s",
    type: "string",
    description:
      "A file with secret keys or seed phrases. It is not saved anywhere.",
    required: true,
  })
  .option("remarks", {
    type: "string",
    description:
      "A file with remarks used for system.remark",
    required: true,
  })
  .option('hex-encode', {
    type: 'boolean',
    description: 'hex-encoded calls without submitting the extrinsic.',
    required: false,
    default: false,
  })
  .argv;

async function main() {
  const keys = fs
    .readFileSync(`${options["secret-keys"]}`, "UTF-8")
    .split(/\r?\n/)
    .filter((entry) => entry.trim() != "");
  const remarks = fs
    .readFileSync(`${options["remarks"]}`, "UTF-8")
    .split(/\r?\n/)
    .filter((entry) => entry.trim() != "");
  const shouldOutputAsHexEncodedData = options["hex-encode"];

  const provider = new WsProvider(options.endpoint);

  const api = await ApiPromise.create({ provider });

  console.log(
    `📡 Connected to node: ${(await api.rpc.system.chain()).toHuman()} [ss58: ${api.registry.chainSS58
    }]`
  );

  const keyring = new Keyring({
    type: "sr25519",
    ss58Format: api.registry.chainSS58,
  });

  let account = keyring.addFromUri(keys[0]);

  console.log("🤖 ACCOUNT_ADDRESS:", account.address);

  const txns = remarks.map((entry) => api.tx.system.remark(entry));

  const tx = api.tx.utility.batch(txns);

  if (shouldOutputAsHexEncodedData) {
    console.log(`🛠  Hex-encoded call: ${tx.method.toHex()}`);
    return;
  }

  try {
    await sendAndFinalize(tx, account);
  } catch (error) {
    console.error(error);
  }
}

async function sendAndFinalize(tx, account) {
  return new Promise(async resolve => {
    let success = false;
    let included = []
    let finalized = []
    let unsubscribe = await tx.signAndSend(account, ({ events = [], status, dispatchError }) => {
      if (status.isInBlock) {
        success = dispatchError ? false : true;
        console.log(`📀 Transaction ${tx.meta.name} included at blockHash ${status.asInBlock} [success = ${success}]`);
        included = [...events]
      } else if (status.isBroadcast) {
        console.log(`🚀 Transaction broadcasted.`);
      } else if (status.isFinalized) {
        status.is
        console.log(`💯 Transaction ${tx.meta.name}(..) Finalized at blockHash ${status.asFinalized}`);
        finalized = [...events]
        let hash = status.hash;
        unsubscribe();
        resolve({ success, hash, included, finalized })
      } else if (status.isReady) {
        // let's not be too noisy..
      } else {
        console.log(`🤷 Other status ${status}`)
      }
    })
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit());
