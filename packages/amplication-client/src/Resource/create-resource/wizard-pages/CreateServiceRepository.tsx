import { Icon, TextField } from "@amplication/design-system";
import React, { useCallback } from "react";

import "./CreateServiceRepository.scss";

import { CreateServiceWizardLayout as Layout } from "../CreateServiceWizardLayout";
import { WizardStepProps } from "./interfaces";
import { LabelDescriptionSelector } from "./LabelDescriptionSelector";

const className = "create-service-repository";

const CreateServiceRepository: React.FC<WizardStepProps> = ({ formik }) => {
  const handleDatabaseSelect = useCallback((database: string) => {
    formik.handleChange({ target: { name: "structureType", value: database } });
  }, []);

  return (
    <Layout.Split>
      <Layout.LeftSide>
        <Layout.Description
          header="Are you using a monorepo or polyrepo?"
          text={`If you are using a monorepo, you can select the folder where you want to save the code of the service. “apps”, “packages”, “ee/packages” all are valid. 
          
          Otherwise, Amplication will push the code to the root of the repo in separate folders for the server and the admin-ui.
          `}
        />
      </Layout.LeftSide>
      <Layout.RightSide>
        <Layout.SelectorWrapper>
          <div className={`${className}__repo_wrapper`}>
            <div className={`${className}__repository_box`}>
              <div className={`${className}__repository_options`}>
                <LabelDescriptionSelector
                  name="monorepo"
                  image=""
                  label="Monorepo"
                  description="Generate the service into a folder next to other services in the repository"
                  onClick={handleDatabaseSelect}
                  currentValue={formik.values.structureType}
                />
                <LabelDescriptionSelector
                  name="polyrepo"
                  image=""
                  label="Polyrepo"
                  description="Generate the services into the root of the repository"
                  onClick={handleDatabaseSelect}
                  currentValue={formik.values.structureType}
                />
              </div>
              {formik.values.structureType === "monorepo" && (
                <TextField
                  className={`${className}__repository_base_dir`}
                  name="baseDirectory"
                  label="Base directory"
                />
              )}
            </div>
            <hr className={`${className}__repo_hr`}></hr>
            <div className={`${className}__monorepo`}>
              <div className={`${className}__monorepo_title`}>
                Your project will look like this:
              </div>
              {formik.values.structureType === "monorepo" ? (
                <div className={`${className}__monorepo_example`}>
                  <div className={`${className}__monorepo_example_app`}>
                    <Icon icon={"folder"}></Icon>
                    apps
                  </div>
                  <div className={`${className}__monorepo_example_tree`}>
                    <hr className={`${className}__monorepo_hr`}></hr>
                    <div
                      className={`${className}__monorepo_example_tree_folders`}
                    >
                      <div className={`${className}__monorepo_box_folder`}>
                        <Icon icon={"folder"}></Icon>
                        example-service
                      </div>
                      <div className={`${className}__monorepo_box_folder`}>
                        <Icon icon={"folder"}></Icon>
                        example-service-admin
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${className}__monorepo_example`}>
                  <div
                    className={`${className}__monorepo_example_tree_folders`}
                  >
                    <div className={`${className}__monorepo_box_folder`}>
                      <Icon icon={"folder"}></Icon>
                      example-service
                    </div>
                    <div className={`${className}__monorepo_box_folder`}>
                      <Icon icon={"folder"}></Icon>
                      example-service-admin
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout.SelectorWrapper>
      </Layout.RightSide>
    </Layout.Split>
  );
};

export default CreateServiceRepository;
