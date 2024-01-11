import { UserEntity } from "../../decorators/user.decorator";
import { GqlResolverExceptionsFilter } from "../../filters/GqlResolverExceptions.filter";
import { GqlAuthGuard } from "../../guards/gql-auth.guard";
import { Account, User, Workspace } from "../../models";
import { AccountService } from "./account.service";
import { UpdateAccountInput } from "./dto/update-account.input";
import { UseGuards, UseFilters } from "@nestjs/common";
import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";

@Resolver(() => Account)
@UseFilters(GqlResolverExceptionsFilter)
@UseGuards(GqlAuthGuard)
export class AccountResolver {
  constructor(private accountService: AccountService) {}

  @Query(() => Account)
  async account(@UserEntity() user: User): Promise<Account> {
    return user.account;
  }

  @Mutation(() => Account)
  async updateAccount(
    @UserEntity() user: User,
    @Args("data") newAccountData: UpdateAccountInput
  ): Promise<Account> {
    return this.accountService.updateAccount({
      where: { id: user.account.id },
      data: newAccountData,
    });
  }

  @Query(() => [Workspace])
  async workspaces(@UserEntity() user: User): Promise<Workspace[]> {
    return this.accountService.getWorkspaces(user.account.id);
  }
}
