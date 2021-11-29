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
  debounce,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { Autocomplete } from "@material-ui/lab";
import * as OEQ from "@openequella/rest-api-client";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { not } from "fp-ts/Predicate";
import * as RA from "fp-ts/ReadonlyArray";
import * as RSET from "fp-ts/ReadonlySet";
import * as S from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as React from "react";
import { useMemo, useState } from "react";
import { languageStrings } from "../../util/langstrings";
import { OrdAsIs } from "../../util/Ord";
import { TooltipIconButton } from "../TooltipIconButton";
import { WizardControlBasicProps } from "./WizardHelper";
import { WizardLabel } from "./WizardLabel";

export interface WizardSimpleTermSelectorProps extends WizardControlBasicProps {
  /**
   * `true` to allow selecting multiple taxonomy terms.
   */
  isAllowMultiple: boolean;
  /**
   * The currently selected taxonomy terms.
   */
  values: ReadonlySet<string>;
  /**
   * Handler for selecting taxonomy terms.
   */
  onSelect: (_: ReadonlySet<string>) => void;
  /**
   * ID of the taxonomy where terms are searched from.
   */
  selectedTaxonomy: string;
  /**
   * Restriction option for term selection.
   */
  selectionRestriction: OEQ.Taxonomy.SelectionRestriction;
  /**
   * Format used to search for a term.
   */
  termStorageFormat: OEQ.Taxonomy.TermStorageFormat;
  /**
   * Function to provide a list of terms.
   *
   * @param query Query to filter the list of terms.
   * @param restriction Restriction applied to how to search terms.
   * @param maxTermNum Maximum number of terms in one search.
   * @param isSearchFullTerm `true` to search terms by full path.
   * @param taxonomyUuid UUID of the taxonomy collection.
   */
  termProvider: (
    query: string,
    restriction: OEQ.Taxonomy.SelectionRestriction,
    maxTermNum: number,
    isSearchFullTerm: boolean,
    taxonomy: string
  ) => Promise<OEQ.Common.PagedResult<OEQ.Taxonomy.Term>>;
}

const { loadingText, placeholder } = languageStrings.termSelector;

export const WizardSimpleTermSelector = ({
  values,
  isAllowMultiple,
  selectedTaxonomy,
  termStorageFormat,
  selectionRestriction,
  termProvider,
  mandatory,
  id,
  description,
  label,
  onSelect,
}: WizardSimpleTermSelectorProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [value, setValue] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const searchTerms = useMemo(
    () =>
      debounce(async (query: string) => {
        const task: TE.TaskEither<string, string[]> = pipe(
          TE.tryCatch(
            () =>
              termProvider(
                query,
                selectionRestriction,
                20,
                termStorageFormat === "FULL_PATH",
                selectedTaxonomy
              ),
            (e) => `Failed to search terms for query ${e}`
          ),
          TE.map(
            flow(
              ({ results }) => results,
              A.map(({ term }) => term)
            )
          )
        );

        // Now begin.
        setLoading(true);
        pipe(
          await task(),
          E.fold((e) => {
            throw new Error(e);
          }, setOptions)
        );
        setLoading(false);
      }, 500),
    [selectionRestriction, termStorageFormat, selectedTaxonomy, termProvider]
  );

  const removeSelectedTerm = (term: string) =>
    pipe(values, RSET.remove(S.Eq)(term), onSelect);

  const insertSingleTerm = (term: string) =>
    pipe(
      values,
      isAllowMultiple ? RSET.insert(S.Eq)(term) : () => RSET.singleton(term),
      onSelect
    );

  const terms = pipe(
    values,
    RSET.toReadonlyArray<string>(OrdAsIs),
    RA.map((t) => (
      <ListItem key={t}>
        <ListItemText>{t}</ListItemText>
        <ListItemSecondaryAction>
          <TooltipIconButton
            title={`${languageStrings.common.action.delete} ${t}`}
            onClick={() => removeSelectedTerm(t)}
          >
            <DeleteIcon />
          </TooltipIconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))
  );

  return (
    <>
      <WizardLabel
        mandatory={mandatory}
        label={label}
        description={description}
        labelFor={id}
      />
      <Grid container direction="column">
        <Grid item>
          <Autocomplete
            freeSolo
            loading={loading}
            loadingText={loadingText}
            options={options}
            onChange={(e, value: string | null) => {
              pipe(value, O.fromNullable, O.map(insertSingleTerm));

              // Clear the value as we don't want to show the value if the TextField.
              setValue("");
            }}
            // Both `value` and `inputValue` must be controlled by state so that we can reset the value in the onChange event.
            value={value}
            inputValue={value}
            onInputChange={(event, value) => {
              setValue(value);
              pipe(
                value.trim(),
                O.fromPredicate(not(S.isEmpty)),
                O.map(searchTerms)
              );
            }}
            onOpen={() => setOptions([])}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label={placeholder} />
            )}
          />
        </Grid>
        <Grid item>
          <List id={`${id}-term-list`}>{terms}</List>
        </Grid>
      </Grid>
    </>
  );
};
