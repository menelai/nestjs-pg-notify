import {ArgumentMetadata, PipeTransform, Type} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';

export async function applyPipes(
  pipes: (PipeTransform | Type<PipeTransform>)[],
  payload: any,
  moduleRef: ModuleRef,
  paramIndex: number,
  handlerType: any,
): Promise<any> {
  let result = payload;

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: Reflect
      .getMetadata('design:paramtypes', handlerType.prototype, 'handle')
      ?.[paramIndex],
    data: undefined,
  };

  for (const pipe of pipes) {
    const pipeInstance = typeof pipe === 'function'
      ? moduleRef.get(pipe, {strict: false}) || new pipe()
      :pipe;

    result = await pipeInstance.transform(result, metadata);
  }

  return result;
}
