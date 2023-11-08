import { DSGResourceData } from "@amplication/code-gen-types";
import {
  CodeGeneratorVersionStrategy,
  EnumAuthProviderType,
  EnumDataType,
  EnumEntityAction,
  EnumEntityPermissionType,
} from "@amplication/code-gen-types/models";
import { Test, TestingModule } from "@nestjs/testing";
import { CodeGeneratorSplitterService } from "./code-generator-splitter.service";
import { EnumDomainName } from "../types";
import { RedisService } from "../redis/redis.service";

const adminAndServerInputJson: DSGResourceData = {
  entities: [
    {
      id: "aed41776-99ca-4674-b26d-0458fd440875",
      name: "User",
      displayName: "User",
      pluralDisplayName: "Users",
      pluralName: "users",
      customAttributes:
        '@@index([name, email]) @@unique([name(sort: Desc), email]) @@map("users")',
      fields: [
        {
          id: "053e75d0-9f02-4182-8f61-46fbdbaa71bd",
          permanentId: "053e75d0-9f02-4182-8f61-46fbdbaa71b1",
          name: "id",
          displayName: "Id",
          dataType: EnumDataType.Id,
          properties: {
            idType: "CUID",
          },
          required: true,
          unique: false,
          searchable: true,
        },
        {
          id: "a4e0c058-5768-4481-9da9-e48c73ab224d",
          permanentId: "a4e0c058-5768-4481-9da9-e48c73ab2241",
          name: "name",
          displayName: "Name",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.SingleLineText,
          customAttributes: '@unique @map("name")',
        },
        {
          id: "e3fa6ddd-ad36-48ce-8042-9c0aa576e5a9",
          permanentId: "e3fa6ddd-ad36-48ce-8042-9c0aa576e5a1",
          name: "bio",
          displayName: "Bio",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.MultiLineText,
        },
        {
          id: "8c5c4130-94b0-4ce4-a4cb-4e42bf7a9b37",
          permanentId: "8c5c4130-94b0-4ce4-a4cb-4e42bf7a9b31",
          name: "email",
          displayName: "Email",
          required: true,
          unique: true,
          searchable: true,
          dataType: EnumDataType.Email,
        },
        {
          id: "71ba3f5e-7324-4ace-af95-d4bcea8f8368",
          permanentId: "71ba3f5e-7324-4ace-af95-d4bcea8f8361",
          name: "age",
          displayName: "Age",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.WholeNumber,
          properties: {
            minimumValue: 0,
            maximumValue: 120,
          },
        },
        {
          id: "b491038d-f588-45e3-b97f-9074f3ed8c83",
          permanentId: "b491038d-f588-45e3-b97f-9074f3ed8c81",
          name: "birthDate",
          displayName: "Birth Date",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.DateTime,
          properties: {
            dataOnly: false,
          },
        },
        {
          id: "9fa9604e-f9ab-45fb-b8bd-557ae10eda8c",
          permanentId: "9fa9604e-f9ab-45fb-b8bd-557ae10eda81",
          name: "score",
          displayName: "Score",
          required: true,
          unique: false,
          searchable: false,
          dataType: EnumDataType.DecimalNumber,
          properties: {
            minimumValue: 1,
            maximumValue: 999,
            precision: 2,
          },
        },
        {
          id: "a7b32c49-e73d-4b6f-9efb-fcb77e60b303",
          permanentId: "9bb55fcc-1c3a-4b99-8bcf-6ea85d052c3d",
          name: "manager",
          displayName: "Manager",
          required: false,
          unique: false,
          searchable: true,
          dataType: EnumDataType.Lookup,
          properties: {
            relatedEntityId: "aed41776-99ca-4674-b26d-0458fd440875",
            relatedFieldId: "7bb3d5c1-f5b9-4fa4-8087-87f0c549d5f2",
            allowMultipleSelection: false,
          },
        },
        {
          id: "3787591a-333b-45c5-9e9d-362d9697bb38",
          permanentId: "7bb3d5c1-f5b9-4fa4-8087-87f0c549d5f2",
          name: "employees",
          displayName: "Employees",
          required: false,
          unique: false,
          searchable: false,
          dataType: EnumDataType.Lookup,
          properties: {
            relatedEntityId: "aed41776-99ca-4674-b26d-0458fd440875",
            relatedFieldId: "9bb55fcc-1c3a-4b99-8bcf-6ea85d052c3d",
            allowMultipleSelection: true,
          },
        },
        {
          id: "9fa9604e-f9ab-45fb-b8bd-557ae1011111",
          permanentId: "ae21f2fb-9174-49de-9576-632d859a5dd1",
          name: "organizations",
          displayName: "Organizations",
          required: false,
          unique: false,
          searchable: true,
          dataType: EnumDataType.Lookup,
          properties: {
            relatedEntityId: "3426e3f7-c316-416e-b7a1-d2a1bce17a4",
            relatedFieldId: "3c5f6e76-a124-4f9a-a944-c75f55495859",
            allowMultipleSelection: true,
          },
        },
        {
          id: "1a34cc0e-91dd-4ef2-b8eb-df5a44154a21",
          permanentId: "1a34cc0e-91dd-4ef2-b8eb-df5a44154a22",
          name: "interests",
          displayName: "Interests",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.MultiSelectOptionSet,
          properties: {
            options: [
              {
                label: "Programming",
                value: "programming",
              },
              {
                label: "Design",
                value: "design",
              },
            ],
          },
        },
        {
          id: "daa757a6-4e15-4afc-a6e3-d4366d64367a",
          permanentId: "daa757a6-4e15-4afc-a6e3-d4366d643671",
          name: "priority",
          displayName: "Priority",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.OptionSet,
          properties: {
            options: [
              {
                label: "High",
                value: "high",
              },
              {
                label: "Medium",
                value: "medium",
              },
              {
                label: "Low",
                value: "low",
              },
            ],
          },
        },
        {
          id: "e88e745f-e4a0-414a-b43d-99d7728d1207",
          permanentId: "e88e745f-e4a0-414a-b43d-99d7728d1201",
          name: "isCurious",
          displayName: "Is Curious",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.Boolean,
        },
        {
          id: "e8b7aca3-e761-4d0c-9196-b983d63ae80d",
          permanentId: "e8b7aca3-e761-4d0c-9196-b983d63ae801",
          name: "location",
          displayName: "Location",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.GeographicLocation,
        },
        {
          id: "e8b7aca3-e761-4d0c-9196-b983d63ae755",
          permanentId: "e8b7aca3-e761-4d0c-9196-b983d63ae755",
          name: "extendedProperties",
          displayName: "Extended Properties",
          required: true,
          unique: false,
          searchable: true,
          dataType: EnumDataType.Json,
        },
        {
          id: "b227bd7a-2fe5-47f8-8f3e-29a2c26111b7",
          permanentId: "118e407b-30f7-48da-af9c-de1393548b4c",
          name: "profile",
          displayName: "Profile",
          dataType: EnumDataType.Lookup,
          properties: {
            relatedEntityId: "f36aa4e3-d275-41d0-843a-876ec66bc2f7",
            relatedFieldId: "42d31012-6164-472a-92d0-a8f5dc0486d4",
            allowMultipleSelection: false,
          },
          required: false,
          unique: false,
          searchable: true,
        },
      ],
      permissions: [
        {
          action: EnumEntityAction.Create,
          permissionFields: [],
          permissionRoles: [],
          type: EnumEntityPermissionType.AllRoles,
        },
        {
          action: EnumEntityAction.Delete,
          permissionFields: [],
          permissionRoles: [],
          type: EnumEntityPermissionType.AllRoles,
        },
        {
          action: EnumEntityAction.Search,
          permissionFields: [],
          permissionRoles: [],
          type: EnumEntityPermissionType.AllRoles,
        },
        {
          action: EnumEntityAction.Update,
          permissionFields: [],
          permissionRoles: [],
          type: EnumEntityPermissionType.AllRoles,
        },
        {
          action: EnumEntityAction.View,
          permissionFields: [],
          permissionRoles: [],
          type: EnumEntityPermissionType.AllRoles,
        },
      ],
    },
  ],
  roles: [
    {
      // id: "4da76cb1-46d0-4fd0-b81b-930c0ae5ec40",
      // createdAt: "2023-10-09T10:58:10.568Z",
      // updatedAt: "2023-10-09T10:58:10.568Z",
      displayName: "User",
      name: "user",
    },
    {
      // id: "4da76cb1-46d0-4fd0-b81b-930c0ae5ec41",
      // createdAt: "2023-10-09T10:58:10.568Z",
      // updatedAt: "2023-10-09T10:58:10.568Z",
      displayName: "Admin",
      name: "admin",
    },
    {
      // id: "4da76cb1-46d0-4fd0-b81b-930c0ae5ec42",
      // createdAt: "2023-10-09T10:58:10.568Z",
      // updatedAt: "2023-10-09T10:58:10.568Z",
      displayName: "Area Manager",
      name: "areaManager",
    },
  ],
  buildId: "cloo1bi5t0001p5888jj5wle9",
  resourceInfo: {
    name: "Sample Application",
    description: "Sample application for testing",
    version: "0.1.3",
    id: "ckl0ow1xj00763cjnch10k6mc",
    url: "https://app.amplication.com/ckl0ow1xj00763cjnch10k6mc",
    settings: {
      authProvider: EnumAuthProviderType.Http,
      authEntityName: "User",
      serverSettings: {
        generateGraphQL: true,
        generateRestApi: true,
        generateServer: true,
        serverPath: "",
      },
      adminUISettings: {
        generateAdminUI: true,
        adminUIPath: "",
      },
    },
    codeGeneratorVersionOptions: {
      codeGeneratorVersion: null,
      codeGeneratorStrategy: CodeGeneratorVersionStrategy.LatestMajor,
    },
  },
  resourceType: "Service",
  pluginInstallations: [
    {
      id: "clb3p3ov800cplc01a8f6uwje",
      npm: "@amplication/plugin-db-postgres",
      enabled: true,
      version: "latest",
      pluginId: "db-postgres",
      settings: {
        host: "localhost",
        port: 5432,
        user: "admin",
        password: "admin",
        dbName: "my-db",
        enableLogging: true,
      },
    },
  ],
};

const onlyServerInputJson: DSGResourceData = {
  ...adminAndServerInputJson,
  resourceInfo: {
    ...adminAndServerInputJson.resourceInfo,
    settings: {
      ...adminAndServerInputJson.resourceInfo.settings,
      adminUISettings: {
        ...adminAndServerInputJson.resourceInfo.settings.adminUISettings,
        generateAdminUI: false,
      },
    },
  },
};

const onlyAdminInputJson: DSGResourceData = {
  ...adminAndServerInputJson,
  resourceInfo: {
    ...adminAndServerInputJson.resourceInfo,
    settings: {
      ...adminAndServerInputJson.resourceInfo.settings,
      serverSettings: {
        ...adminAndServerInputJson.resourceInfo.settings.serverSettings,
        generateServer: false,
      },
    },
  },
};

const buildId = "cloo1bi5t0001p5888jj5wle9";

describe("CodeGeneratorSplitter", () => {
  let service: CodeGeneratorSplitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeGeneratorSplitterService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CodeGeneratorSplitterService>(
      CodeGeneratorSplitterService
    );
  });

  it("should create two requests to start two jobs, one for admin by passing onlyAdminInputJson and one for server by passing onlyServerInputJson", () => {
    const jobs = service.splitJobs(adminAndServerInputJson, buildId);
    expect(jobs.length).toBe(2);
    expect(jobs).toEqual([
      [EnumDomainName.Server, onlyServerInputJson],
      [EnumDomainName.AdminUI, onlyAdminInputJson],
    ]);

    expect(
      jobs[0][1].resourceInfo.settings.adminUISettings.generateAdminUI
    ).toBe(false);

    expect(jobs[1][1].resourceInfo.settings.serverSettings.generateServer).toBe(
      false
    );

    expect(service.setServerJobInProgress).toHaveBeenCalledWith(buildId);
    expect(service.setServerJobInProgress).toBeCalledTimes(1);
    expect(service.setAdminUIJobInProgress).toHaveBeenCalledWith(buildId);
    expect(service.setAdminUIJobInProgress).toBeCalledTimes(1);
  });

  it("should build onlyserviceserver, it will create one request to start a jobs with onlyServerInputJson", () => {
    const jobs = service.splitJobs(onlyServerInputJson, buildId);
    expect(jobs.length).toBe(1);
    expect(jobs).toEqual([[EnumDomainName.Server, onlyServerInputJson]]);
    expect(service.setServerJobInProgress).toHaveBeenCalledWith(buildId);
    expect(service.setServerJobInProgress).toBeCalledTimes(1);
  });

  it("should build only admin, it will create one request to start a jobs with onlyAdminInputJson", () => {
    const jobs = service.splitJobs(onlyAdminInputJson, buildId);
    expect(jobs.length).toBe(1);
    expect(jobs).toEqual([[EnumDomainName.AdminUI, onlyAdminInputJson]]);
    expect(service.setAdminUIJobInProgress).toHaveBeenCalledWith(buildId);
    expect(service.setAdminUIJobInProgress).toBeCalledTimes(1);
  });
});
