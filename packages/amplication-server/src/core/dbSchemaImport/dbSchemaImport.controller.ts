import { DBSchemaImportService } from "./dbSchemaImport.service";
import {
  DBSchemaImportRequest,
  KAFKA_TOPICS,
} from "@amplication/schema-registry";
import { AmplicationLogger } from "@amplication/util/nestjs/logging";
import { Controller, Inject } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { plainToInstance } from "class-transformer";

@Controller("db-schema-import")
export class DBSchemaImportController {
  constructor(
    private readonly dbSchemaImportService: DBSchemaImportService,
    @Inject(AmplicationLogger)
    private readonly logger: AmplicationLogger
  ) {}

  @EventPattern(KAFKA_TOPICS.DB_SCHEMA_IMPORT_TOPIC)
  async onDBSchemaImportRequest(
    @Payload() message: DBSchemaImportRequest.KafkaEvent
  ): Promise<void> {
    try {
      const args = plainToInstance(DBSchemaImportRequest.Value, message);
      void this.dbSchemaImportService.createEntitiesFromPrismaSchema(args);
    } catch (error) {
      this.logger.error(error.message, error);
    }
  }
}
