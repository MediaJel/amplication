import { WorkspaceOrderByInput } from "./WorkspaceOrderByInput";
import { WorkspaceWhereInput } from "./WorkspaceWhereInput";
import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class FindManyWorkspaceArgs {
  @Field(() => WorkspaceWhereInput, { nullable: true })
  where?: WorkspaceWhereInput | null;

  @Field(() => WorkspaceOrderByInput, { nullable: true })
  orderBy?: WorkspaceOrderByInput | null;

  @Field(() => Int, { nullable: true })
  skip?: number | null;

  @Field(() => Int, { nullable: true })
  take?: number | null;
}
