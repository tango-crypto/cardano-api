import { TxId, Utxo } from '@cardano-ogmios/schema';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OgmiosService {
  constructor(
    private configService: ConfigService
  ) {
    const host = this.configService.get<string>('OGMIOS_HOST') || 'localhost';
    const port = this.configService.get<number>('OGMIOS_PORT') || 1337;
    axios.defaults.baseURL = `http://${host}:${port}`;

  }

  async submitTx(cbor: string): Promise<TxId> {
    const { data } = await axios.post('', {
      jsonrpc: "2.0",
      method: "submitTransaction",
      params: { "transaction": { cbor } }
    });
    return data.result.transaction.id;
  }

  async evaluateTx(cbor: string, additionalUtxoSet?: Utxo): Promise<any> {
    const payload = {
      jsonrpc: "2.0",
      method: "evaluateTransaction",
      params: {
        "transaction": {
          cbor
        }
      }
    }
    if (additionalUtxoSet) {
      payload.params["additionalUtxo"] = additionalUtxoSet;
    }
    const { data } = await axios.post('', payload);
    return data.result;
  }
}
