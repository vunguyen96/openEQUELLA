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

import {
  createGenerateClassName,
  StylesProvider,
  Theme,
  ThemeProvider,
} from "@material-ui/core";
import * as OEQ from "@openequella/rest-api-client";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { getRouterBaseName } from "../AppConfig";
import MessageInfo from "../components/MessageInfo";
import { getOeqTheme } from "../modules/ThemeModule";
import { getCurrentUserDetails } from "../modules/UserModule";
import { startHeartbeat } from "../util/heartbeat";
import { simpleMatch } from "../util/match";
import type { EntryPage } from "./index";

const SettingsPage = React.lazy(() => import("../settings/SettingsPage"));
const SearchPage = React.lazy(() => import("../search/SearchPage"));
const AdvancedSearchPage = React.lazy(
  () => import("../search/AdvancedSearchPage")
);
const IndexPage = React.lazy(() => import("./IndexPage"));

interface NewPageProps {
  /**
   * A New UI page such as SearchPage.tsx.
   */
  children: ReactNode;
  /**
   * The prefix added in MUI styles.
   */
  classPrefix: string;
  /**
   * The MUI theme configured in the setting page.
   */
  theme?: Theme;
  /**
   * A string representing the base URL required by React Router.
   */
  basename?: string;
  /**
   * Whether to refresh the page when navigating to different route.
   */
  forceRefresh?: boolean;
}

/**
 * A wrapper component which is typically used in the environment where Old UI and New UI pages
 * are mixed.
 */
const NewPage = ({
  children,
  classPrefix,
  forceRefresh = false,
  theme = getOeqTheme(),
  basename = getRouterBaseName(),
}: NewPageProps) => {
  const generateClassName = createGenerateClassName({
    productionPrefix: classPrefix,
  });

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <BrowserRouter basename={basename} forceRefresh={forceRefresh}>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </StylesProvider>
  );
};

interface AppProps {
  entryPage: EntryPage;
}

const nop = () => {};

export interface AppContextProps {
  /**
   * Function to handle a variety of unknown errors thrown from any component of the APP.
   */
  appErrorHandler: (error: Error | string) => void;
  /**
   * Details of the current user.
   */
  currentUser: OEQ.LegacyContent.CurrentUserDetails | undefined;
  /**
   * Function to refresh the current user.
   */
  refreshUser: () => void;
}

/**
 * This is the very top level Context and it provides
 * 1. An error handler for the whole APP.
 * 2. Details of the current user.
 * 3. Function to refresh the current user.
 */
export const AppContext = React.createContext<AppContextProps>({
  appErrorHandler: nop,
  currentUser: undefined,
  refreshUser: nop,
});

/**
 * HOC function to inject what AppContext provides to a component. Typically used with a class component.
 * For functional components, use `useContext` to access the Context.
 *
 * @param Page A class component
 */
export const withAppContext =
  <T,>(
    Page: React.ComponentType<T & AppContextProps>
  ): ((props: T) => JSX.Element) =>
  (props: T) =>
    (
      <AppContext.Consumer>
        {(appContextProps) => <Page {...props} {...appContextProps} />}
      </AppContext.Consumer>
    );

const App = ({ entryPage }: AppProps): JSX.Element => {
  console.debug("START: <App>");

  const [currentUser, setCurrentUser] =
    React.useState<OEQ.LegacyContent.CurrentUserDetails>();

  const refreshUser = useCallback(() => {
    getCurrentUserDetails().then(setCurrentUser);
  }, []);

  const [error, setError] = useState<Error | string | undefined>();
  const appErrorHandler = useCallback(
    (error: Error | string) => setError(error),
    []
  );

  useEffect(() => refreshUser(), [refreshUser]);

  const appContent = () =>
    pipe(
      entryPage,
      simpleMatch<JSX.Element>({
        mainDiv: () => {
          startHeartbeat();
          return (
            <ThemeProvider theme={getOeqTheme()}>
              <IndexPage />
            </ThemeProvider>
          );
        },
        searchPage: () => (
          <NewPage classPrefix="oeq-nsp">
            <SearchPage updateTemplate={nop} />
          </NewPage>
        ),
        advancedSearchPage: () => (
          <NewPage classPrefix="oeq-nasp">
            <AdvancedSearchPage updateTemplate={nop} />
          </NewPage>
        ),
        settingsPage: () => (
          // When SettingsPage is used in old UI, each route change should trigger a refresh
          // for the whole page because there are no React component matching routes.
          <NewPage classPrefix="oeq-nst" forceRefresh>
            <SettingsPage updateTemplate={nop} isReloadNeeded={false} />
          </NewPage>
        ),
        _: (s: string | number) => {
          throw new TypeError(`Unknown entry page target: ${s}`);
        },
      })
    );

  return (
    <AppContext.Provider value={{ appErrorHandler, currentUser, refreshUser }}>
      {error && (
        <MessageInfo
          open
          onClose={() => setError(undefined)}
          variant="error"
          title={typeof error === "string" ? error : error.message}
        />
      )}
      {appContent()}
    </AppContext.Provider>
  );
};

export default App;
