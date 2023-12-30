import { Snackbar, TextField } from "@amplication/ui/design-system";
import classNames from "classnames";
import { Form, Formik } from "formik";
import { camelCase } from "camel-case";
import { useCallback, useContext, useState } from "react";
import { Button, EnumButtonStyle } from "../Components/Button";
import { AppContext } from "../context/appContext";
import * as models from "../models";
import { formatError } from "../util/error";
import "./NewModuleDtoProperty.scss";
import useModuleDtoProperty from "./hooks/useModuleDtoProperty";

type Props = {
  moduleDto: models.ModuleDto;
  onPropertyAdd?: (property: models.ModuleDto) => void;
};

const INITIAL_VALUES = {
  name: "",
  isArray: false,
  isOptional: false,
  propertyType: models.EnumModuleDtoPropertyType.String,
};

const CLASS_NAME = "new-dto-property";

const NewModuleDtoProperty = ({ moduleDto, onPropertyAdd }: Props) => {
  const { currentResource } = useContext(AppContext);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const {
    createModuleDtoProperty,
    createModuleDtoPropertyData: data,
    createModuleDtoPropertyError: error,
    createModuleDtoPropertyLoading: loading,
  } = useModuleDtoProperty();

  const [autoFocus, setAutoFocus] = useState<boolean>(false);

  const handleSubmit = useCallback(
    (data, actions) => {
      setAutoFocus(false);
      const name = camelCase(data.name.trim());

      createModuleDtoProperty({
        variables: {
          data: {
            ...data,
            displayName: name,
            name,
            resource: { connect: { id: currentResource?.id } },
            parentBlock: { connect: { id: moduleDto.id } },
          },
        },
      })
        .catch(console.error)
        .then(() => {
          actions.resetForm(INITIAL_VALUES);
          setAutoFocus(true);

          if (onPropertyAdd) {
            onPropertyAdd(moduleDto);
          }
        });
    },
    [createModuleDtoProperty, moduleDto, onPropertyAdd]
  );

  const errorMessage = formatError(error);

  return (
    <div className={CLASS_NAME}>
      <Formik
        initialValues={INITIAL_VALUES}
        validateOnBlur={false}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className={`${CLASS_NAME}__add-field`}>
            <TextField
              required
              name="name"
              label="New Property Name"
              disabled={loading}
              placeholder="Add property"
              autoComplete="off"
              autoFocus={autoFocus}
              hideLabel
            />
            <Button
              buttonStyle={EnumButtonStyle.Text}
              icon="plus"
              className={classNames(`${CLASS_NAME}__add-field__button`, {
                [`${CLASS_NAME}__add-field__button--show`]:
                  formik.values.name.length > 0,
              })}
            />
          </Form>
        )}
      </Formik>
      <Snackbar open={Boolean(error)} message={errorMessage} />
    </div>
  );
};

export default NewModuleDtoProperty;