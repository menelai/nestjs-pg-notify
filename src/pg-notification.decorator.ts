import {Injectable} from '@nestjs/common';

import {PG_NOTIFICATION_METADATA} from '@/constants';

export const PgNotificationRegistry: Function[] = [];

export function PgNotification(channel: string): ClassDecorator {
  return (target: Function) => {
    Injectable()(target);
    Reflect.defineMetadata(PG_NOTIFICATION_METADATA, channel, target);

    PgNotificationRegistry.push(target);
  };
}
