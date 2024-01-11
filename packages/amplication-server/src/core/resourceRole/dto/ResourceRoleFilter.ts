import { ResourceRoleWhereInput } from "./ResourceRoleWhereInput";
import { Field, InputType } from "@nestjs/graphql";

@InputType({
  isAbstract: true,
})
export class ResourceRoleFilter {
  @Field(() => ResourceRoleWhereInput, {
    nullable: true,
  })
  every?: ResourceRoleWhereInput | null;

  @Field(() => ResourceRoleWhereInput, {
    nullable: true,
  })
  some?: ResourceRoleWhereInput | null;

  @Field(() => ResourceRoleWhereInput, {
    nullable: true,
  })
  none?: ResourceRoleWhereInput | null;
}
