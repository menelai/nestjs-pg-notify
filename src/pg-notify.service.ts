import {Inject, Injectable, Logger, LoggerService, OnModuleInit} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {ClientConfig} from 'pg';
import createSubscriber, {Options, Subscriber} from 'pg-listen';

import {applyPipes} from '@/apply-pipes';
import {PG_NOTIFICATION_METADATA, PG_NOTIFY_OPTIONS, PG_PAYLOAD_METADATA} from '@/constants';
import {parseErrorMessage} from '@/parse-error-message';
import {PgNotificationRegistry} from '@/pg-notification.decorator';

@Injectable()
export class PgNotifyService implements OnModuleInit {
  private readonly subscriber: Subscriber;

  private readonly loggerService: LoggerService;

  constructor(
    @Inject(PG_NOTIFY_OPTIONS) {connectionConfig, options, logger}: {connectionConfig?: ClientConfig, options?: Options, logger?: LoggerService},
    private moduleRef: ModuleRef,
  ) {
    this.loggerService = logger || new Logger();
    this.subscriber = createSubscriber(connectionConfig, options);
  }

  async onModuleInit(): Promise<any> {
    await this.subscriber.connect();
    for (const target of PgNotificationRegistry) {
      const channel = Reflect.getMetadata(PG_NOTIFICATION_METADATA, target);
      if (!channel) {
        continue;
      }

      const handlerInstance = this.moduleRef.get(target, {strict: false});
      if (!handlerInstance?.handle) {
        continue;
      }

      await this.subscriber.listenTo(channel);

      this.subscriber.notifications.on(channel, async (payload) => {
        const paramPipes: Record<number, any> =
          Reflect.getMetadata(PG_PAYLOAD_METADATA, target.prototype, 'handle') || {};

        const args: any[] = [];

        const paramCount = handlerInstance.handle.length || 1;
        for (let i = 0; i < paramCount; i++) {
          if (paramPipes[i]) {
            args.push(await applyPipes(paramPipes[i], payload, this.moduleRef, i, target));
          } else {
            args.push(payload);
          }
        }

        await handlerInstance.handle(...args);
      });
    }
    this.subscriber.events.on('error', err => {
      const defaultMessage = 'Internal error';
      const message = parseErrorMessage(err) || defaultMessage;

      this.loggerService.error(message, err.stack, PgNotifyService.name);
    });

    this.subscriber.events.on('reconnect', attempt => {
      this.loggerService.error(`Connection refused. Retry attempt ${attempt}...`, undefined, PgNotifyService.name);
    });
  }
}
