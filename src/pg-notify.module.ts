import {DynamicModule, LoggerService, Module} from '@nestjs/common';
import {ClientConfig} from 'pg';
import {Options} from 'pg-listen';

import {PG_NOTIFY_OPTIONS} from '@/constants';
import {PgNotifyService} from '@/pg-notify.service';

@Module({})
export class PgNotifyModule {
  static forRoot(connectionConfig?: ClientConfig, options?: Options, logger?: LoggerService): DynamicModule {
    return {
      module: PgNotifyModule,
      providers: [
        {
          provide: PG_NOTIFY_OPTIONS,
          useValue: {connectionConfig, options, logger},
        },
        PgNotifyService,
      ],
      exports: [
        PgNotifyService,
      ],
    };
  }
}
