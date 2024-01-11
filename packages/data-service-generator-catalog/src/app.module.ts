import { ACLModule } from "./auth/acl.module";
import { AuthModule } from "./auth/auth.module";
import { SERVICE_NAME } from "./constants";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SecretsManagerModule } from "./providers/secrets/secretsManager.module";
import { ServeStaticOptionsService } from "./serveStaticOptions.service";
import { UserModule } from "./user/user.module";
import { VersionModule } from "./version/version.module";
import { AmplicationLoggerModule } from "@amplication/util/nestjs/logging";
import { TracingModule } from "@amplication/util/nestjs/tracing";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module, Scope } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ServeStaticModule } from "@nestjs/serve-static";
import { MorganInterceptor, MorganModule } from "nest-morgan";
import { join } from "path";

@Module({
  controllers: [],
  imports: [
    ACLModule,
    AuthModule,
    UserModule,
    VersionModule,
    HealthModule,
    PrismaModule,
    SecretsManagerModule,
    MorganModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => {
        return {
          autoSchemaFile:
            configService.get("GRAPHQL_SCHEMA_DEST") ||
            join(process.cwd(), "src", "schema.graphql"),
          sortSchema: true,
          debug: configService.get("GRAPHQL_DEBUG") === "1",
          playground: configService.get("PLAYGROUND_ENABLE") === "1",
          introspection: configService.get("PLAYGROUND_ENABLE") === "1",
          context: ({ req }: { req: Request }) => ({
            req,
          }),
        };
      },
      inject: [ConfigService],
    }),
    AmplicationLoggerModule.forRoot({
      component: SERVICE_NAME,
    }),
    TracingModule.forRoot({
      serviceName: SERVICE_NAME,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: MorganInterceptor("combined"),
    },
  ],
})
export class AppModule {}
