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

import com.tle.common.searching.Field;
import com.tle.core.freetext.index.LuceneDocumentHelper;
import java.io.IOException;
import java.util.List;
import org.apache.lucene.index.AtomicReader;
import org.apache.lucene.index.AtomicReaderContext;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.DocIdSet;
import org.apache.lucene.search.Filter;
import org.apache.lucene.util.Bits;
import org.apache.lucene.util.OpenBitSet;

public class MustFilter extends Filter {

  private static final long serialVersionUID = 1L;
  protected List<List<Field>> terms;

  public MustFilter(List<List<Field>> terms) {
    this.terms = terms;
  }

  @Override
  public DocIdSet getDocIdSet(AtomicReaderContext context, Bits acceptDocs) throws IOException {
    AtomicReader reader = context.reader();
    int max = reader.maxDoc();
    OpenBitSet allDocs = null;
    // Each Must clause has its own document set, but the final result must be the intersection of
    // all the sets.
    for (List<Field> values : terms) {
      if (!values.isEmpty()) {
        OpenBitSet good = new OpenBitSet(max);
        for (Field nv : values) {
          LuceneDocumentHelper.forEachDoc(
              reader, new Term(nv.getField(), nv.getValue()), good::set);
        }
        if (allDocs != null) {
          allDocs.and(good);
        } else {
          allDocs = good;
        }
      }
    }
    if (allDocs == null) {
      allDocs = new OpenBitSet(max);
      allDocs.set(0, max);
    }
    return allDocs;
  }
}
