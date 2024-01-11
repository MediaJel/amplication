import { User, Workspace } from "../../../models";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({
  isAbstract: true,
})
export class Invitation {
  @Field(() => String, {
    nullable: false,
  })
  id!: string;

  @Field(() => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @Field(() => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @Field(() => String, {
    nullable: false,
  })
  email!: string;

  @Field(() => Workspace, {
    nullable: true,
  })
  workspace?: Workspace;

  @Field(() => User, {
    nullable: true,
  })
  invitedByUser?: User;
}
