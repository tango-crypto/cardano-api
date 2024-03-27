import { Utxo } from '@tangocrypto/tango-ledger';
import { JsonScript } from './json-script.model';

export interface NftPayment {
  accountId: string;
  collectionId: string;
  tokenId: string;
  saleId: string;
  network: string;
  utxos: Utxo[];
  blockHash: string;
  address: string;
  price: number;
  fee: number;
  payoutAddress: string;
  buyerAddress: string;
  quantity: number;
  script: JsonScript;
  signingKeys: string[];
  policyId: string;
  tokenName: string;
  metadata: any;
  keepInputTokens: boolean;
}
