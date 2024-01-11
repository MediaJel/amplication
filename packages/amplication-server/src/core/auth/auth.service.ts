import { FindOneArgs } from "../../dto";
import { AmplicationError } from "../../errors/AmplicationError";
import { Account, Resource, User, UserRole, Workspace } from "../../models";
import { AuthPreviewAccount } from "../../models/AuthPreviewAccount";
import { Prisma, PrismaService } from "../../prisma";
import { AccountService } from "../account/account.service";
import { PasswordService } from "../account/password.service";
import { USER_ENTITY_NAME } from "../entity/constants";
import { ProjectService } from "../project/project.service";
import { EnumResourceType } from "../resource/dto/EnumResourceType";
import { ResourceService } from "../resource/resource.service";
import { EnumAuthProviderType } from "../serviceSettings/dto/EnumAuthenticationProviderType";
import { UserService } from "../user/user.service";
import { CompleteInvitationArgs } from "../workspace/dto";
import { WorkspaceService } from "../workspace/workspace.service";
import {
  SignupInput,
  ApiToken,
  CreateApiTokenArgs,
  JwtDto,
  EnumTokenType,
} from "./dto";
import { PreviewAccountType } from "./dto/EnumPreviewAccountType";
import { SignupPreviewAccountInput } from "./dto/SignupPreviewAccountInput";
import { AuthProfile } from "./types";
import { AmplicationLogger } from "@amplication/util/nestjs/logging";
import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as crypto from "crypto";
import cuid from "cuid";
import { subDays } from "date-fns";
import { Profile as GitHubProfile } from "passport-github2";

export type AuthUser = User & {
  account: Account;
  workspace: Workspace;
  userRoles: UserRole[];
};

export type BootstrapPreviewUser = {
  user: AuthUser;
  workspaceId: string;
  projectId: string;
  resourceId: string;
};

export type CreatePreviewServiceArgs = {
  projectId: string;
  name: string;
  description: string;
  adminUIPath: string;
  serverPath: string;
  generateAdminUI: boolean;
  generateGraphQL: boolean;
  generateRestApi: boolean;
};

const TOKEN_PREVIEW_LENGTH = 8;
const TOKEN_EXPIRY_DAYS = 30;
export const IDENTITY_PROVIDER_GITHUB = "GitHub";
export const IDENTITY_PROVIDER_SSO = "SSO";
export const IDENTITY_PROVIDER_MANUAL = "Manual";
export const IDENTITY_PROVIDER_PREVIEW_ACCOUNT = "PreviewAccount";

const AUTH_USER_INCLUDE = {
  account: true,
  userRoles: true,
  workspace: true,
};

const WORKSPACE_INCLUDE = {
  users: {
    include: AUTH_USER_INCLUDE,
  },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prismaService: PrismaService,
    private readonly accountService: AccountService,
    private readonly logger: AmplicationLogger,
    private readonly userService: UserService,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService
  ) {}

  async createGitHubUser(
    payload: GitHubProfile,
    email: string
  ): Promise<AuthUser> {
    const account = await this.accountService.createAccount(
      {
        data: {
          email,
          firstName: email,
          lastName: "",
          password: "",
          githubId: payload.id,
        },
      },
      IDENTITY_PROVIDER_GITHUB
    );

    const user = await this.bootstrapUser(account, payload.id);

    return user;
  }

  async updateGitHubUser(
    user: AuthUser,
    profile: GitHubProfile
  ): Promise<AuthUser> {
    const account = await this.accountService.updateAccount({
      where: { id: user.account.id },
      data: {
        githubId: profile.id,
      },
    });
    return {
      ...user,
      account,
    };
  }

  async createUser(profile: AuthProfile): Promise<AuthUser> {
    const account = await this.accountService.createAccount(
      {
        data: {
          email: profile.email,
          firstName: profile.given_name || profile.nickname || profile.email,
          lastName: profile.family_name || "",
          password: "",
          githubId: profile.sub,
        },
      },
      IDENTITY_PROVIDER_SSO
    );

    const user = await this.bootstrapUser(account, profile.sub);

    return user;
  }

  async updateUser(user: AuthUser, profile: AuthProfile): Promise<AuthUser> {
    const account = await this.accountService.updateAccount({
      where: { id: user.account.id },
      data: {
        githubId: profile.sub,
      },
    });
    return {
      ...user,
      account,
    };
  }

  async signup(payload: SignupInput): Promise<string> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password
    );

    const account = await this.accountService.createAccount(
      {
        data: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          password: hashedPassword,
        },
      },
      IDENTITY_PROVIDER_MANUAL
    );

    const user = await this.bootstrapUser(account, payload.workspaceName);

    return this.prepareToken(user);
  }

  async signupPreviewAccount(
    payload: SignupPreviewAccountInput
  ): Promise<AuthPreviewAccount> {
    const { signupData, identityProvider } = this.generateDataForPreviewAccount(
      payload.previewAccountEmail,
      payload.previewAccountType
    );

    const account = await this.accountService.createAccount(
      {
        data: signupData,
      },
      identityProvider
    );

    const { user, workspaceId, projectId, resourceId } =
      await this.bootstrapPreviewUser(account);

    const token = await this.prepareTokenForPreviewAccount(user);

    return {
      token,
      workspaceId,
      projectId,
      resourceId,
    };
  }

  private generateDataForPreviewAccount(
    previewAccountEmail: string,
    previewAccountType: PreviewAccountType
  ) {
    return {
      signupData: {
        email: this.generateRandomEmail(),
        firstName: "Amplication Preview Account",
        lastName: previewAccountType,
        password: this.generateRandomString(),
        previewAccountType,
        previewAccountEmail,
      },
      identityProvider: `${IDENTITY_PROVIDER_PREVIEW_ACCOUNT}_${previewAccountType}`,
    };
  }

  private generateRandomString(): string {
    return crypto.randomBytes(10).toString("hex");
  }

  private generateRandomEmail(): string {
    return `fake-${this.generateRandomString()}@amplication.com`;
  }

  private async bootstrapUser(
    account: Account,
    workspaceName: string
  ): Promise<AuthUser> {
    const workspace = await this.createWorkspace(workspaceName, account);
    const [user] = workspace.users;
    await this.accountService.setCurrentUser(account.id, user.id);

    return user;
  }

  private async bootstrapPreviewUser(
    account: Account
  ): Promise<BootstrapPreviewUser> {
    const { user, workspace, project, resource } =
      await this.createPreviewWorkspaceWithProjectAndResource(account);

    await this.accountService.setCurrentUser(account.id, user.id);

    return {
      user,
      workspaceId: workspace.id,
      projectId: project.id,
      resourceId: resource.id,
    };
  }

  async login(email: string, password: string): Promise<string> {
    const account = await this.prismaService.account.findUnique({
      where: {
        email,
      },
      include: {
        currentUser: {
          include: { workspace: true, userRoles: true, account: true },
        },
      },
    });

    if (!account) {
      throw new AmplicationError(`No account found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      account.password
    );

    if (!passwordValid) {
      throw new AmplicationError("Invalid password");
    }

    return this.prepareToken(account.currentUser);
  }

  async setCurrentWorkspace(
    accountId: string,
    workspaceId: string
  ): Promise<string> {
    const users = (await this.userService.findUsers({
      where: {
        workspace: {
          id: workspaceId,
        },
        account: {
          id: accountId,
        },
      },
      include: {
        userRoles: true,
        account: true,
        workspace: true,
      },
      take: 1,
    })) as AuthUser[];

    if (!users.length) {
      throw new AmplicationError(
        `This account does not have an active user records in the selected workspace or workspace not found ${workspaceId}`
      );
    }

    const [user] = users;

    await this.accountService.setCurrentUser(accountId, user.id);

    return this.prepareToken(user);
  }

  async createApiToken(args: CreateApiTokenArgs): Promise<ApiToken> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: args.data.user.connect.id,
        deletedAt: null,
      },
      include: { workspace: true, userRoles: true, account: true },
    });

    if (!user) {
      throw new AmplicationError(
        `No user found with ID: ${args.data.user.connect.id}`
      );
    }

    const tokenId = cuid();
    const token = await this.prepareApiToken(user, tokenId);
    const previewChars = token.slice(-TOKEN_PREVIEW_LENGTH);
    const hashedToken = await this.passwordService.hashPassword(token);

    const apiToken = await this.prismaService.apiToken.create({
      data: {
        ...args.data,
        id: tokenId,
        lastAccessAt: new Date(),
        previewChars,
        token: hashedToken,
      },
    });

    apiToken.token = token;

    return apiToken;
  }
  /**
   * Validates that the provided token of the provided user exist and not expired.
   * In case it is valid, it updates the "LastAccessAt" with current date and time
   */
  async validateApiToken(args: {
    userId: string;
    tokenId: string;
    token: string;
  }): Promise<boolean> {
    const lastAccessThreshold = subDays(new Date(), TOKEN_EXPIRY_DAYS);

    const apiToken = await this.prismaService.apiToken.updateMany({
      where: {
        userId: args.userId,
        id: args.tokenId,
        lastAccessAt: {
          gt: lastAccessThreshold,
        },
        user: {
          deletedAt: null,
        },
      },
      data: {
        lastAccessAt: new Date(),
      },
    });

    if (apiToken.count === 1) {
      return true;
    }
    return false;
  }

  async deleteApiToken(args: FindOneArgs): Promise<ApiToken> {
    return this.prismaService.apiToken.delete({
      where: {
        id: args.where.id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        previewChars: true,
        lastAccessAt: true,
        userId: true,
      },
    });
  }

  async getUserApiTokens(args: FindOneArgs): Promise<ApiToken[]> {
    const apiTokens = await this.prismaService.apiToken.findMany({
      where: {
        userId: args.where.id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        previewChars: true,
        lastAccessAt: true,
        userId: true,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
    });

    return apiTokens;
  }

  async changePassword(
    account: Account,
    oldPassword: string,
    newPassword: string
  ): Promise<Account> {
    const passwordValid = await this.passwordService.validatePassword(
      oldPassword,
      account.password
    );

    if (!passwordValid) {
      throw new AmplicationError("Invalid password");
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    return this.accountService.setPassword(account.id, hashedPassword);
  }

  /**
   * Creates a token from given user
   * @param user to create token for
   * @returns new JWT token
   */
  async prepareToken(user: AuthUser): Promise<string> {
    const roles = user.userRoles.map((role) => role.role);

    const payload: JwtDto = {
      accountId: user.account.id,
      userId: user.id,
      roles,
      workspaceId: user.workspace.id,
      type: EnumTokenType.User,
    };
    return this.jwtService.sign(payload);
  }

  async prepareTokenForPreviewAccount(user: AuthUser): Promise<string> {
    const roles = user.userRoles.map((role) => role.role);

    const payload: JwtDto = {
      accountId: user.account.id,
      userId: user.id,
      roles,
      workspaceId: user.workspace.id,
      type: EnumTokenType.User,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Creates an API token from given user
   * @param user to create token for
   * @returns new JWT token
   */
  async prepareApiToken(user: AuthUser, tokenId: string): Promise<string> {
    const roles = user.userRoles.map((role) => role.role);

    const payload: JwtDto = {
      accountId: user.account.id,
      userId: user.id,
      roles,
      workspaceId: user.workspace.id,
      type: EnumTokenType.ApiToken,
      tokenId: tokenId,
    };

    return this.jwtService.sign(payload);
  }

  async getAuthUser(where: Prisma.UserWhereInput): Promise<AuthUser | null> {
    const matchingUsers = await this.userService.findUsers({
      where,
      include: {
        account: true,
        userRoles: true,
        workspace: true,
      },
      take: 1,
    });
    if (matchingUsers.length === 0) {
      return null;
    }
    const [user] = matchingUsers;
    return user as AuthUser;
  }

  private async createWorkspace(
    name: string,
    account: Account
  ): Promise<Workspace & { users: AuthUser[] }> {
    const workspace = await this.workspaceService.createWorkspace(account.id, {
      data: {
        name,
      },
      include: WORKSPACE_INCLUDE,
    });

    return workspace as unknown as Workspace & { users: AuthUser[] };
  }

  private async createPreviewWorkspaceWithProjectAndResource(account: Account) {
    const workspaceName = `Amplication-${this.generateRandomString()}`;
    const projectName = account.previewAccountType;

    const workspace = (await this.workspaceService.createPreviewWorkspace(
      {
        data: {
          name: workspaceName,
        },
        include: WORKSPACE_INCLUDE,
      },
      account.id
    )) as unknown as Workspace & { users: AuthUser[] };
    const [user] = workspace.users as AuthUser[];

    const project = await this.projectService.createProject(
      {
        data: {
          name: projectName,
          workspace: {
            connect: {
              id: workspace.id,
            },
          },
        },
      },
      user.id
    );

    let resource: Resource;
    switch (account.previewAccountType) {
      case PreviewAccountType.BreakingTheMonolith:
        resource = await this.createBreakingTheMonolithPreviewService(
          project.id,
          user
        );
        break;
      case PreviewAccountType.None:
        throw new AmplicationError(
          `${PreviewAccountType.None} is not a preview account, but a regular account`
        );
      default:
        throw new AmplicationError(
          `Unsupported preview account type: ${account.previewAccountType}`
        );
    }

    return {
      user,
      workspace,
      project,
      resource,
    };
  }

  private async createBreakingTheMonolithPreviewService(
    projectId: string,
    user: User
  ): Promise<Resource> {
    const serviceName = "Monolith";
    const createPreviewServiceArgs = this.createPreviewServiceArgs({
      projectId: projectId,
      name: serviceName,
      description: "Monolith Service",
      adminUIPath: `./apps/${serviceName}-admin`,
      serverPath: `./apps/${serviceName}`,
      generateAdminUI: true,
      generateGraphQL: true,
      generateRestApi: true,
    });

    const resource = await this.resourceService.createPreviewService({
      args: createPreviewServiceArgs,
      user,
      nonDefaultPluginsToInstall: [],
      requireAuthenticationEntity: false,
    });

    return resource;
  }

  private createPreviewServiceArgs({
    name,
    description,
    adminUIPath,
    serverPath,
    generateAdminUI,
    generateGraphQL,
    generateRestApi,
    projectId,
  }: CreatePreviewServiceArgs) {
    return {
      data: {
        name,
        description,
        resourceType: EnumResourceType.Service,
        project: {
          connect: {
            id: projectId,
          },
        },
        serviceSettings: {
          authProvider: EnumAuthProviderType.Jwt,
          authEntityName: USER_ENTITY_NAME,
          adminUISettings: {
            adminUIPath,
            generateAdminUI,
          },
          serverSettings: {
            generateGraphQL,
            generateRestApi,
            serverPath,
          },
        },
      },
    };
  }

  async completeInvitation(
    currentUser: User,
    args: CompleteInvitationArgs
  ): Promise<string> {
    const workspace = await this.workspaceService.completeInvitation(
      currentUser,
      args
    );

    return this.setCurrentWorkspace(currentUser.account.id, workspace.id);
  }
}
