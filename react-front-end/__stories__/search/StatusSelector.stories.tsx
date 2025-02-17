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
import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import * as React from "react";
import { liveStatuses, nonLiveStatuses } from "../../tsrc/modules/SearchModule";
import StatusSelector, {
  StatusSelectorProps,
} from "../../tsrc/search/components/StatusSelector";

export default {
  title: "Search/StatusSelector",
  component: StatusSelector,
} as Meta<StatusSelectorProps>;

const onChange = action("onChange");

export const BasicSelectorLiveOnly: StoryFn<StatusSelectorProps> = (args) => (
  <StatusSelector {...args} />
);
BasicSelectorLiveOnly.args = {
  value: liveStatuses,
  onChange,
};

export const BasicSelectorAllStatuses: StoryFn<StatusSelectorProps> = (
  args
) => <StatusSelector {...args} />;
BasicSelectorAllStatuses.args = {
  ...BasicSelectorLiveOnly.args,
  value: liveStatuses.concat(nonLiveStatuses),
};

export const AdvancedSelectorCustomOptions: StoryFn<StatusSelectorProps> = (
  args
) => <StatusSelector {...args} />;
AdvancedSelectorCustomOptions.args = {
  ...BasicSelectorLiveOnly.args,
  value: ["REVIEW"],
  advancedMode: {
    options: ["MODERATING", "REVIEW", "REJECTED"],
  },
};
