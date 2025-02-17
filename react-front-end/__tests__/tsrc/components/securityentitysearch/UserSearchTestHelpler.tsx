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
import { render, RenderResult, waitFor } from "@testing-library/react";
import * as React from "react";
import * as UserModuleMock from "../../../../__mocks__/UserModule.mock";
import UserSearch, {
  UserSearchProps,
} from "../../../../tsrc/components/securityentitysearch/UserSearch";
import { languageStrings } from "../../../../tsrc/util/langstrings";
import {
  defaultBaseSearchProps,
  doSearch,
  findEntityFromMockData,
} from "./BaseSearchTestHelper";

const { queryFieldLabel } = languageStrings.userSearchComponent;

/**
 * Helper to render UserSearch and wait for component under test
 */
export const renderUserSearch = async (
  props: UserSearchProps = defaultBaseSearchProps
): Promise<RenderResult> => {
  const renderResult = render(<UserSearch {...props} />);

  // Wait for it to be rendered
  await waitFor(() => renderResult.getByText(queryFieldLabel));

  return renderResult;
};

/**
 * Helper function to do the steps of entering a submitting a search in the <UserSearch/>
 * component.
 *
 * @param dialog The User Search Dialog
 * @param queryValue the value to put in the query field before pressing enter
 */
export const searchUser = (dialog: HTMLElement, queryValue: string) =>
  doSearch(dialog, queryFieldLabel, queryValue);

/**
 * Helper function to assist in finding the specific User from mock data.
 */
export const findUserFromMockData = (
  username: string
): OEQ.UserQuery.UserDetails =>
  findEntityFromMockData(
    UserModuleMock.users,
    (u: OEQ.UserQuery.UserDetails) => u.username === username,
    username
  );
