import { EnumBlockType } from "../../../enums/EnumBlockType";
import { Field, InputType } from "@nestjs/graphql";

@InputType({
  isAbstract: true,
})
export class EnumBlockTypeFilter {
  @Field(() => EnumBlockType, {
    nullable: true,
  })
  equals?: (typeof EnumBlockType)[keyof typeof EnumBlockType] | null;

  @Field(() => EnumBlockType, {
    nullable: true,
  })
  not?: (typeof EnumBlockType)[keyof typeof EnumBlockType] | null;

  @Field(() => [EnumBlockType], {
    nullable: true,
  })
  in?: (typeof EnumBlockType)[keyof typeof EnumBlockType][] | null;

  @Field(() => [EnumBlockType], {
    nullable: true,
  })
  notIn?: (typeof EnumBlockType)[keyof typeof EnumBlockType][] | null;
}
