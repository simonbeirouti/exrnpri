/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/captain_sol.json`.
 */
export type CaptainSol = {
  "address": "5xGZmXnD9DcdzHqY5H7UEBrkGC57CLejiVQz6AS7EphZ",
  "metadata": {
    "name": "captainSol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addModule",
      "discriminator": [
        81,
        183,
        101,
        212,
        17,
        241,
        122,
        204
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "module",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  100,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "arg",
                "path": "moduleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "moduleId",
          "type": "u8"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "closeCampaign",
      "discriminator": [
        65,
        49,
        110,
        7,
        63,
        238,
        206,
        77
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeCampaign",
      "discriminator": [
        169,
        88,
        7,
        6,
        9,
        165,
        65,
        132
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "platformWallet",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u64"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "totalModules",
          "type": "u8"
        },
        {
          "name": "nftLimit",
          "type": "u32"
        }
      ]
    },
    {
      "name": "mintCompletionNft",
      "discriminator": [
        245,
        144,
        96,
        193,
        169,
        1,
        173,
        249
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "participantProgress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "participant"
              }
            ]
          }
        },
        {
          "name": "nftMint",
          "docs": [
            "NFT mint PDA - unique per participant per campaign"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  102,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "participant"
              }
            ]
          }
        },
        {
          "name": "nftTokenAccount",
          "docs": [
            "Participant's token account for the NFT (PDA-based for program control)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  102,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "participant"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerParticipant",
      "discriminator": [
        248,
        112,
        38,
        215,
        226,
        230,
        249,
        40
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign"
        },
        {
          "name": "participantProgress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "participant"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submitModuleCompletion",
      "discriminator": [
        65,
        204,
        57,
        12,
        65,
        122,
        44,
        39
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "module"
        },
        {
          "name": "participantProgress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "participant"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "module",
      "discriminator": [
        234,
        149,
        112,
        29,
        65,
        203,
        69,
        160
      ]
    },
    {
      "name": "participantProgress",
      "discriminator": [
        79,
        33,
        223,
        205,
        245,
        203,
        227,
        237
      ]
    }
  ],
  "events": [
    {
      "name": "campaignClosed",
      "discriminator": [
        158,
        143,
        128,
        251,
        84,
        131,
        2,
        90
      ]
    },
    {
      "name": "campaignCompleted",
      "discriminator": [
        114,
        100,
        117,
        191,
        22,
        109,
        23,
        132
      ]
    },
    {
      "name": "campaignCreated",
      "discriminator": [
        9,
        98,
        69,
        61,
        53,
        131,
        64,
        152
      ]
    },
    {
      "name": "moduleAdded",
      "discriminator": [
        231,
        18,
        84,
        41,
        172,
        193,
        105,
        177
      ]
    },
    {
      "name": "moduleCompleted",
      "discriminator": [
        4,
        233,
        128,
        29,
        141,
        246,
        88,
        60
      ]
    },
    {
      "name": "nftMinted",
      "discriminator": [
        229,
        55,
        248,
        184,
        138,
        23,
        199,
        249
      ]
    },
    {
      "name": "participantRegistered",
      "discriminator": [
        47,
        115,
        159,
        109,
        135,
        121,
        70,
        193
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTimeRange",
      "msg": "End time must be after start time"
    },
    {
      "code": 6001,
      "name": "campaignNotActive",
      "msg": "Campaign is not active or has expired"
    },
    {
      "code": 6002,
      "name": "unauthorizedCreator",
      "msg": "Only the campaign creator can perform this action"
    },
    {
      "code": 6003,
      "name": "invalidPlatformWallet",
      "msg": "Invalid platform wallet address provided"
    },
    {
      "code": 6004,
      "name": "moduleAlreadyCompleted",
      "msg": "This module has already been completed"
    },
    {
      "code": 6005,
      "name": "nftLimitReached",
      "msg": "NFT limit has been reached for this campaign"
    },
    {
      "code": 6006,
      "name": "nftAlreadyMinted",
      "msg": "Participant has already minted an NFT for this campaign"
    },
    {
      "code": 6007,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to create campaign (requires 10 SOL)"
    },
    {
      "code": 6008,
      "name": "invalidIpfsHash",
      "msg": "Invalid IPFS hash format"
    },
    {
      "code": 6009,
      "name": "campaignNotExpired",
      "msg": "Campaign has not expired yet"
    },
    {
      "code": 6010,
      "name": "participantNotRegistered",
      "msg": "Participant is not registered for this campaign"
    },
    {
      "code": 6011,
      "name": "invalidModule",
      "msg": "Module does not belong to this campaign"
    },
    {
      "code": 6012,
      "name": "incompleteModules",
      "msg": "Not all modules have been completed"
    },
    {
      "code": 6013,
      "name": "campaignExpired",
      "msg": "Campaign has expired and is no longer accepting actions"
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "Campaign creator's public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformWallet",
            "docs": [
              "Platform wallet that received the creation fee"
            ],
            "type": "pubkey"
          },
          {
            "name": "startTime",
            "docs": [
              "Campaign start timestamp (Unix)"
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "Campaign end timestamp (Unix)"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Current campaign status"
            ],
            "type": {
              "defined": {
                "name": "campaignStatus"
              }
            }
          },
          {
            "name": "ipfsHash",
            "docs": [
              "IPFS hash for campaign metadata (stored as string)"
            ],
            "type": "string"
          },
          {
            "name": "totalModules",
            "docs": [
              "Total number of modules in this campaign"
            ],
            "type": "u8"
          },
          {
            "name": "nftLimit",
            "docs": [
              "NFT limit (0 = unlimited)"
            ],
            "type": "u32"
          },
          {
            "name": "nftMintedCount",
            "docs": [
              "Number of NFTs minted so far"
            ],
            "type": "u32"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA derivation"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "campaignClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "nftMintedCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "campaignCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "campaignCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalModules",
            "type": "u8"
          },
          {
            "name": "nftLimit",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "campaignStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "expired"
          },
          {
            "name": "closed"
          }
        ]
      }
    },
    {
      "name": "module",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "moduleId",
            "docs": [
              "Module ID (0-indexed)"
            ],
            "type": "u8"
          },
          {
            "name": "ipfsHash",
            "docs": [
              "IPFS hash reference for module metadata"
            ],
            "type": "string"
          },
          {
            "name": "campaign",
            "docs": [
              "Campaign this module belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA derivation"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "moduleAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "module",
            "type": "pubkey"
          },
          {
            "name": "moduleId",
            "type": "u8"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "moduleCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "module",
            "type": "pubkey"
          },
          {
            "name": "moduleId",
            "type": "u8"
          },
          {
            "name": "completedCount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "nftMinted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "nftMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "participantProgress",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "participant",
            "docs": [
              "Participant's wallet public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "campaign",
            "docs": [
              "Campaign reference"
            ],
            "type": "pubkey"
          },
          {
            "name": "completedModules",
            "docs": [
              "Bitmap of completed modules (supports up to 256 modules)",
              "Each bit represents a module: 1 = completed, 0 = not completed"
            ],
            "type": "bytes"
          },
          {
            "name": "nftMinted",
            "docs": [
              "Whether NFT has been minted for this participant"
            ],
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "docs": [
              "Timestamp when participant registered"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA derivation"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "participantRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
