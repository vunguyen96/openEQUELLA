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
import Axios from "axios";
import { Literal, Static, Union } from "runtypes";
import { API_BASE_URL } from "../AppConfig";
import type { ChangeRoute } from "../legacycontent/LegacyContent";
import type { ScrapbookType } from "./ScrapbookModule";

const legacyMyResourcesUrl = `${API_BASE_URL}/content/submit/access/myresources.do`;

export const ScrapbookLiteral = Literal("scrapbook");
export const ModQueueLiteral = Literal("modqueue");

export const LegacyMyResourcesRuntypes = Union(
  Literal("published"),
  Literal("draft"),
  ScrapbookLiteral,
  ModQueueLiteral,
  Literal("archived"),
  Literal("all"),
  Literal("defaultValue")
);

export type LegacyMyResourcesTypes = Static<typeof LegacyMyResourcesRuntypes>;
/**
 * Send a Legacy content request to trigger server side event 'contributeFromNewUI', which will
 * return a route for accessing the Legacy Scrapbook creating page. To support the requirement
 * of persisting SearchPageOptions in the communication between New UI and Legacy UI, the event
 * also requires the UUID representing a SearchPageOptions to be supplied.
 *
 * @param scrapbookType Type of the Scrapbook to be created.
 * @param searchPageOptionsID UUID generated on front-end to represent a SearchPageOptions.
 */
export const getLegacyScrapbookCreatingPageRoute = async (
  scrapbookType: ScrapbookType,
  searchPageOptionsID: String
): Promise<string> =>
  Axios.post<ChangeRoute>(legacyMyResourcesUrl, {
    event__: [
      `${scrapbookType === "file" ? "cmca" : "cmca2"}.contributeFromNewUI`,
    ],
    eventp__0: [searchPageOptionsID],
  }).then(({ data: { route } }) => `/${route}`);

/**
 * Similar to {@link getLegacyScrapbookCreatingPageRoute}, return a route for accessing
 * the Legacy Scrapbook editing page.
 *
 * @param itemKey Unique key of the Scrapbook including the UUID and version.
 * @param searchOptionID UUID generated on front-end to represent a SearchPageOptions.
 */
export const getLegacyScrapbookEditingPageRoute = async (
  itemKey: string,
  searchOptionID: String
): Promise<string> =>
  Axios.post<ChangeRoute>(legacyMyResourcesUrl, {
    event__: ["mcile.editFromNewUI"],
    eventp__0: [itemKey],
    eventp__1: [searchOptionID],
  }).then(({ data: { route } }) => `/${route}`);
