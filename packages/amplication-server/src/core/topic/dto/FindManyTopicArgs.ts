import { TopicOrderByInput } from "./TopicOrderByInput";
import { TopicWhereInput } from "./TopicWhereInput";
import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class FindManyTopicArgs {
  @Field(() => TopicWhereInput, { nullable: true })
  where?: TopicWhereInput | null;

  @Field(() => TopicOrderByInput, { nullable: true })
  orderBy?: TopicOrderByInput | null;

  @Field(() => Int, { nullable: true })
  skip?: number | null;

  @Field(() => Int, { nullable: true })
  take?: number | null;
}
