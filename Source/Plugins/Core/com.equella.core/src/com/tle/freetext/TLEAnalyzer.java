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

package com.tle.freetext;

import java.io.Reader;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.core.LowerCaseFilter;
import org.apache.lucene.analysis.core.StopFilter;
import org.apache.lucene.analysis.en.PorterStemFilter;
import org.apache.lucene.analysis.standard.StandardFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.util.CharArraySet;

/** @author aholland */
public class TLEAnalyzer extends Analyzer {
  private final CharArraySet stopSet;
  private final boolean useStemming;

  public TLEAnalyzer(CharArraySet stopWords, boolean useStemming) {
    this.stopSet = stopWords;
    this.useStemming = useStemming;
  }

  @Override
  public TokenStreamComponents createComponents(String fieldName, Reader reader) {
    StandardTokenizer tokenizer = new StandardTokenizer(reader);
    TokenStream result = new StandardFilter(tokenizer);
    result = new LowerCaseFilter(result);
    if (stopSet != null) {
      result = new StopFilter(result, stopSet);
    }
    if (useStemming) {
      result = new PorterStemFilter(result);
    }

    return new TokenStreamComponents(tokenizer, result);
  }
}
