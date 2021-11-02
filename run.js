// Import the API, Keyring and some utility functions
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const fs = require("fs");

const options = require("yargs")
  .option("endpoint", {
    alias: "e",
    type: "string",
    description:
      "The wss endpoint. (defaults to westend) [Westend = wss://westend-rpc.polkadot.io] [Kusama = wss://kusama-rpc.polkadot.io]",
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

  const provider = new WsProvider(options.endpoint);

  const api = await ApiPromise.create({ provider });

  console.log(
    `Connected to node: ${(await api.rpc.system.chain()).toHuman()} [ss58: ${api.registry.chainSS58
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

  const hash = await tx.signAndSend(account);
  console.log(`Sent txn with hash: ${hash}`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
