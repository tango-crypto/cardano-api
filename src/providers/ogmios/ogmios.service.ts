import { TxId, Utxo } from '@cardano-ogmios/schema';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createInteractionContext, createTxSubmissionClient, InteractionContext, getServerHealth, createConnectionObject, Connection, ConnectionConfig } from '@cardano-ogmios/client';
import { EvaluationResult, TxSubmissionClient } from '@cardano-ogmios/client/dist/TxSubmission';
import axios from 'axios';

@Injectable()
export class OgmiosService {
  connection: Connection;
  connectionConfig: ConnectionConfig;
  context: InteractionContext;
  submissionClient: TxSubmissionClient;
  constructor(
    private configService: ConfigService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {
    const host = this.configService.get<string>('OGMIOS_HOST') || 'localhost';
    const port = this.configService.get<number>('OGMIOS_PORT') || 1337;
    const tls = this.configService.get<string>('OGMIOS_TLS') == 'true';
    axios.defaults.baseURL = `http://${host}:${port}`;
    this.connectionConfig = { host, port, tls };
    this.connection = createConnectionObject(this.connectionConfig);
  }

  async connect(): Promise<void> {
    const isConnected = await this.isConnected();
    if (isConnected) {
      console.log('Already connected');
      return;
    }
    this.context = await createInteractionContext(
      err => {
        this.context = null;
        this.logger.error({ context: 'OgmiosServer', message: `Connection error: ${err}` });
      },
      (code: number, reason: string) => {
        this.context = null;
        this.logger.log({ context: 'OgmiosServer', message: `Connection closed. Code: ${code}, Reason: ${reason}` });
      },
      { connection: this.connectionConfig, interactionType: 'LongRunning' }
    );
    this.submissionClient = await createTxSubmissionClient(this.context);
  }


  async isConnected(): Promise<boolean> {
    return !!this.context && ((await getServerHealth({ connection: this.connection })) as any).connectionStatus == "connected";
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
