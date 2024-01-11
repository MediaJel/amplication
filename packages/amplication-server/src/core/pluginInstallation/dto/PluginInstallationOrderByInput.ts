import { BlockOrderByInput } from "../../block/dto/BlockOrderByInput";
import { InputType } from "@nestjs/graphql";

@InputType({
  isAbstract: true,
})
export class PluginInstallationOrderByInput extends BlockOrderByInput {}
