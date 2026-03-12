# NestJS PostgreSQL notification listener

## Installation

```
npm i @kovalenko/nestjs-pg-notify
```

## Usage

Import `PgNotifyModule`

```typescript
import {Module} from '@nestjs/common';
import {PgNotifyModule} from '@kovalenko/nestjs-pg-notify';

import {UserNotificationHandler} from '@/user/events/handlers/user-notification.handler';

@Module({
  imports: [
    PgNotifyModule.forRoot(
      {
        user: 'username',
        password: 'password',
        host: 'host',
        port: 5432,
        database: 'database',
      },
      {
        retryInterval: 1000,
        retryTimeout: Infinity,
      },
    ),
  ],
  providers: [
    UserNotificationHandler,
  ],
})
export class AppModule {}
```

Listen in `UserNotificationHandler`

```typescript
import {IsUUID} from 'class-validator';

export class UserNotificationDto {
  @IsUUID()
  id: string;
}
```

```typescript
import {QueryBus} from '@nestjs/cqrs';
import {IPgNotifyHandler, PgNotification, PgPayload} from '@kovalenko/nestjs-pg-notify';

import {UserNotificationDto} from '@/user/entities/user-notification.dto';

@PgNotification('user_is_updated')
export class UserNotificationHandler implements IPgNotifyHandler<UserNotificationDto> {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  async handle(
    @PgPayload(new ValidationPipe({whitelist: true, transform: true})) data: UserNotificationDto,
  ): Promise<any> {
    console.log(data);
  }
}
```

Class decorated with `PgNotification` is injectable.


In postgreSQL

```sql
select pg_notify('user_is_updated', '{"id": "69b17e87-40c8-832b-b8e5-a94d2a3c1f87"}')
```

[MIT](LICENSE)
