import { AutoMap } from "@automapper/classes";

export class Rule {
    @AutoMap()
    field: string;

    @AutoMap()
    operator: string;

    @AutoMap()
    value: string;

    @AutoMap()
    operator_type: operatorType;
}

export const ruleFieldTypes: { [key: string]: operatorType } = {
    'policy_id': 'string',
    'asset_name': 'string',
    'fingerprint': 'string',
    'value': 'number',
    'quantity': 'number',
    'tx_count': 'number',
    'out_sum': 'number',
    'fees': 'number',
    'block_no': 'number',
    'pool.ticker': 'string',
    'pool.pool_id': 'string',
    'size': 'number',
    'fee': 'number',
    'no': 'number',
    'nft_minted': 'number',
    'ft_minted': 'number'
}

export const operatorMapping: {[key: string]: string[] } = {
    'string': ['=', '!='],
    'number': ['=', '!=', '>', '<', '>=', '<='],
    'boolean': ['=', '!=']
}

export type operatorType = 'string' | 'number' | 'boolean';

export const valueToValue = function(field: string, value: string): string | number | boolean {
    const valueType = ruleFieldTypes[field];
    switch (valueType) {
        case 'number':
            return Number(value);
        case 'boolean':
            return stringToBoolean(value);
        default:
            return value;
    }
}

const stringToBoolean = function (value: string): boolean | undefined {
    const lowerCaseValue = value.toLowerCase().trim();
    if (lowerCaseValue === "true" || lowerCaseValue == '1') {
        return true;
    } else {
        return false;
    }
}