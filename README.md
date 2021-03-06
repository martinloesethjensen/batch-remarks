# batch-remarks

Script to batch `system.remark` with values from a file.

```txt
Options:
      --help         Show help                                         [boolean]
      --version      Show version number                               [boolean]
  -e, --endpoint     The wss endpoint. [Westend = wss://westend-rpc.polkadot.io]
                     [Kusama = wss://kusama-rpc.polkadot.io] [string] [required]
  -s, --secret-keys  A file with secret keys or seed phrases. It is not saved
                     anywhere. If `--hex-encode` is true then this command is
                     not required.                                      [string]
      --remarks      A file with remarks used for system.remark
                                                             [string] [required]
      --hex-encode   hex-encoded calls without submitting the extrinsic.
                                                      [boolean] [default: false]
```

## Tipping

KSM Address:

```txt
HtSKUKWRPCxCtzsnNfdbN1NN5uVq4yMizb2FqeHSC3YoRTi
```
