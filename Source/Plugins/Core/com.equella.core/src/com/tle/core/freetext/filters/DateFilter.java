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

package com.tle.core.freetext.filters;

import com.tle.common.util.Dates;
import com.tle.common.util.LocalDate;
import com.tle.common.util.UtcDate;
import java.io.IOException;
import java.util.Date;
import java.util.TimeZone;
import org.apache.lucene.index.AtomicReaderContext;
import org.apache.lucene.search.DocIdSet;
import org.apache.lucene.search.Filter;
import org.apache.lucene.util.Bits;

/**
 * Filters dates out. Most of the work is simply delegated to a ComparisonFilter.
 *
 * @author Nicholas Read
 */
public class DateFilter extends Filter {
  private static final long serialVersionUID = 1L;
  private final ComparisonFilter subfilter;

  public DateFilter(
      String field, Date startDate, Date endDate, Dates indexedDateFormat, TimeZone timeZone) {
    String start = dateToString(startDate, 0, indexedDateFormat, timeZone);
    String end = dateToString(endDate, Long.MAX_VALUE, indexedDateFormat, timeZone);
    subfilter = new ComparisonFilter(field, start, end);
  }

  /**
   * Takes a Date object and a defaultValue and returns a String that is comparable with the indexed
   * term.
   *
   * @param date the date to parse.
   * @param defaultValue the value to use if the date is null.
   * @return a String value of the date that can be compared to the Term.
   */
  private String dateToString(
      Date date, long defaultValue, Dates indexedDateFormat, TimeZone timeZone) {
    if (date == null) {
      date = new Date(defaultValue);
    }
    if (timeZone != null) {
      return new LocalDate(date, timeZone).format(indexedDateFormat);
    }
    return new UtcDate(date).format(indexedDateFormat);
  }

  @Override
  public DocIdSet getDocIdSet(AtomicReaderContext context, Bits acceptDocs) throws IOException {
    return subfilter.getDocIdSet(context, acceptDocs);
  }
}
