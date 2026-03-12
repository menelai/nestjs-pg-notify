import {PipeTransform, Type} from '@nestjs/common';

import {PG_PAYLOAD_METADATA} from '@/constants';

export function PgPayload(...pipes: (PipeTransform | Type<PipeTransform>)[]): ParameterDecorator {
  return (target, propertyKey: string | symbol, parameterIndex: number) => {

    const existing: Record<number, any> =
      Reflect.getOwnMetadata(PG_PAYLOAD_METADATA, target, propertyKey) || {};
    existing[parameterIndex] = pipes;
    Reflect.defineMetadata(PG_PAYLOAD_METADATA, existing, target, propertyKey);
  };
}
