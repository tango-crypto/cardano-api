import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UtxoDto } from 'src/transactions/dto/evaluateTx.dto';
import { EvaluateTxResponseDto } from 'src/transactions/dto/evaluateTxResponse.dto';
@Injectable()
export class OgmiosService {

    async submitTx(host: string, cbor: string): Promise<any> {
        const { data } = await axios.post(`${host}/transactions/submitTx`, { tx: cbor });
        return data
    }

    async evaluateTx(host: string, cbor: string, utxos?: UtxoDto[]): Promise<EvaluateTxResponseDto> {
        const { data } = await axios.post(`${host}/transactions/evaluateTx`, { tx: cbor, utxos });
        return data
    }

}