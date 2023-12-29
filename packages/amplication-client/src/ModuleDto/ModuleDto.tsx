import {
  EnumFlexItemMargin,
  EnumTextStyle,
  FlexItem,
  Snackbar,
  TabContentTitle,
  Text,
} from "@amplication/ui/design-system";
import { useCallback, useContext, useEffect } from "react";
import { match, useHistory } from "react-router-dom";
import { AppContext } from "../context/appContext";
import { AppRouteProps } from "../routes/routesUtil";
import { formatError } from "../util/error";
import { DeleteModuleDto } from "./DeleteModuleDto";
import ModuleDtoForm from "./ModuleDtoForm";
import useModuleDto from "./hooks/useModuleDto";
import * as models from "../models";

type Props = AppRouteProps & {
  match: match<{
    workspace: string;
    project: string;
    resource: string;
    module: string;
    moduleDto: string;
  }>;
};

const ModuleDto = ({ match }: Props) => {
  const { moduleDto: moduleDtoId } = match?.params ?? {};

  const {
    currentWorkspace,
    currentProject,
    currentResource,
    addEntity,
    resetPendingChangesIndicator,
    setResetPendingChangesIndicator,
  } = useContext(AppContext);
  const history = useHistory();

  const {
    getModuleDto,
    getModuleDtoData: data,
    getModuleDtoError: error,
    getModuleDtoLoading: loading,
    getModuleDtoRefetch: refetch,
    updateModuleDto,
    updateModuleDtoError,
  } = useModuleDto();

  useEffect(() => {
    if (!moduleDtoId) return;
    getModuleDto({
      variables: {
        moduleDtoId,
      },
    }).catch(console.error);
  }, [moduleDtoId, getModuleDto]);

  useEffect(() => {
    if (!resetPendingChangesIndicator) return;

    setResetPendingChangesIndicator(false);
    refetch();
  }, [resetPendingChangesIndicator, setResetPendingChangesIndicator]);

  const handleSubmit = useCallback(
    (data) => {
      updateModuleDto({
        onCompleted: () => {
          addEntity(moduleDtoId);
        },
        variables: {
          where: {
            id: moduleDtoId,
          },
          data: {
            ...data,
          },
        },
      }).catch(console.error);
    },
    [updateModuleDto, moduleDtoId]
  );

  const hasError = Boolean(error) || Boolean(updateModuleDtoError);

  const errorMessage = formatError(error) || formatError(updateModuleDtoError);

  const isCustomDto = false;

  return (
    <>
      <FlexItem>
        <TabContentTitle
          title={data?.ModuleDto?.displayName}
          subTitle={data?.ModuleDto?.description}
        />
        <FlexItem.FlexEnd>
          {data?.ModuleDto && isCustomDto && (
            <DeleteModuleDto moduleDto={data?.ModuleDto} />
          )}
        </FlexItem.FlexEnd>
      </FlexItem>
      {data?.ModuleDto && !isCustomDto && (
        <FlexItem margin={EnumFlexItemMargin.Bottom}>
          <Text textStyle={EnumTextStyle.Description}>
            This is a default dto that was created automatically with the
            entity. It cannot be deleted, and its name cannot be changed.
          </Text>
        </FlexItem>
      )}

      {!loading && (
        <ModuleDtoForm
          isCustomDto={isCustomDto}
          onSubmit={handleSubmit}
          defaultValues={data?.ModuleDto}
        />
      )}
      <Snackbar open={hasError} message={errorMessage} />
    </>
  );
};

export default ModuleDto;