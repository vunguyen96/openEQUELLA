/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0, (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as OEQ from "@openequella/rest-api-client";
import "@testing-library/jest-dom";
import * as SET from "fp-ts/Set";
import { roles } from "../../../../../__mocks__/RoleModule.mock";
import { eqRoleById } from "../../../../../tsrc/modules/RoleModule";
import { languageStrings } from "../../../../../tsrc/util/langstrings";
import {
  clickDeleteIconForEntity,
  clickOkButton,
  testRemoveAllAsync,
} from "../../../components/securityentitydialog/SelectEntityDialogTestHelper";
import {
  commonCustomRolesMappingControlProps,
  doSearchAndSelectRole,
  openDialog,
  renderCustomRolesMappingControl,
  selectLtiRole,
} from "./CustomRolesMappingControlTestHelper";

const { ltiRoles } =
  languageStrings.settings.integration.lti13PlatformsSettings.createPage;

describe("CustomRolesMappingControl", () => {
  const systemAdminUri =
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator";

  const sharedRoleMapping = new Map().set(
    systemAdminUri,
    SET.singleton(roles[0] as OEQ.UserQuery.RoleDetails)
  );

  it("Should be able to select different LTI roles", async () => {
    const expectedResult = new Map().set(
      "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest",
      SET.singleton(roles[0] as OEQ.UserQuery.RoleDetails)
    );
    const selectedRoleName = roles[0].name;
    const onChange = jest.fn();
    const { container, getByRole } = renderCustomRolesMappingControl({
      ...commonCustomRolesMappingControlProps,
      onChange,
    });

    await openDialog(container);
    const dialog = getByRole("dialog");
    await selectLtiRole(dialog, ltiRoles.institution.Guest);
    await doSearchAndSelectRole(dialog, selectedRoleName, selectedRoleName);
    await clickOkButton(dialog);

    const result = onChange.mock.lastCall[0];
    expect(result).toEqual(expectedResult);
  });

  it("Should be able to remove the LTI row when user delete the last oEQ role", async () => {
    const onChange = jest.fn();
    const { container, getByRole } = renderCustomRolesMappingControl({
      ...commonCustomRolesMappingControlProps,
      onChange,
      value: sharedRoleMapping,
    });

    await openDialog(container);
    const dialog = getByRole("dialog");
    await clickDeleteIconForEntity(dialog, roles[0].name);
    await clickOkButton(dialog);

    const result = onChange.mock.lastCall[0];
    expect(result).toEqual(new Map());
  });

  it("Should be able to remove one oEQ role from an existing LTI row", async () => {
    const initialRoleMapping = new Map().set(
      systemAdminUri,
      SET.fromArray(eqRoleById)([roles[0], roles[1]])
    );
    const onChange = jest.fn();
    const { container, getByRole } = renderCustomRolesMappingControl({
      ...commonCustomRolesMappingControlProps,
      onChange,
      value: initialRoleMapping,
    });

    await openDialog(container);
    const dialog = getByRole("dialog");
    await clickDeleteIconForEntity(dialog, roles[1].name);
    await clickOkButton(dialog);

    const result = onChange.mock.lastCall[0];
    expect(result).toEqual(sharedRoleMapping);
  });

  it("Should be able to add a oEQ role", async () => {
    const selectedRoleName = roles[0].name;
    const onChange = jest.fn();
    const { container, getByRole } = renderCustomRolesMappingControl({
      ...commonCustomRolesMappingControlProps,
      onChange,
    });

    await openDialog(container);
    const dialog = getByRole("dialog");
    await doSearchAndSelectRole(dialog, selectedRoleName, selectedRoleName);
    await clickOkButton(dialog);

    const result = onChange.mock.lastCall[0];
    expect(result).toEqual(sharedRoleMapping);
  });

  it("Should be able to add a oEQ role to an existing LTI row", async () => {
    const expectedResult = new Map().set(
      systemAdminUri,
      SET.fromArray(eqRoleById)([roles[0], roles[1]])
    );
    const selectedRoleName = roles[1].name;
    const onChange = jest.fn();
    const { container, getByRole } = renderCustomRolesMappingControl({
      ...commonCustomRolesMappingControlProps,
      onChange,
      value: sharedRoleMapping,
    });

    await openDialog(container);
    const dialog = getByRole("dialog");
    await doSearchAndSelectRole(dialog, selectedRoleName, selectedRoleName);
    await clickOkButton(dialog);

    const result = onChange.mock.lastCall[0];
    expect(result).toEqual(expectedResult);
  });

  it("Should be able to remove all selections by clicking the remove all button", async () => {
    const result = await testRemoveAllAsync(async (onChange: jest.Mock) => {
      const renderResult = renderCustomRolesMappingControl({
        ...commonCustomRolesMappingControlProps,
        onChange,
        value: sharedRoleMapping,
      });
      await openDialog(renderResult.container);
      return renderResult;
    });

    expect(result).toEqual(new Map());
  });
});
