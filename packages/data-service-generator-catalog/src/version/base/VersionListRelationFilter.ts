/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { VersionWhereInput } from "./VersionWhereInput";
import { InputType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";

@InputType()
class VersionListRelationFilter {
  @ApiProperty({
    required: false,
    type: () => VersionWhereInput,
  })
  @ValidateNested()
  @Type(() => VersionWhereInput)
  @IsOptional()
  @Field(() => VersionWhereInput, {
    nullable: true,
  })
  every?: VersionWhereInput;

  @ApiProperty({
    required: false,
    type: () => VersionWhereInput,
  })
  @ValidateNested()
  @Type(() => VersionWhereInput)
  @IsOptional()
  @Field(() => VersionWhereInput, {
    nullable: true,
  })
  some?: VersionWhereInput;

  @ApiProperty({
    required: false,
    type: () => VersionWhereInput,
  })
  @ValidateNested()
  @Type(() => VersionWhereInput)
  @IsOptional()
  @Field(() => VersionWhereInput, {
    nullable: true,
  })
  none?: VersionWhereInput;
}
export { VersionListRelationFilter as VersionListRelationFilter };
