/*
 * Copyright 2013 buddycloud
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  function toUTC(date) {
  	var utcDate = new Date(date.getUTCFullYear(), 
  		date.getUTCMonth(), date.getUTCDate(),  
  		date.getUTCHours(), date.getUTCMinutes(), 
  		date.getUTCSeconds());

  	return utcDate;
  }

  function toMillis(isoDate) {
  	var utcDate = toUTC(new Date(isoDate));
  	return utcDate.getTime();
  }

  function earliestTime() {
  	return new Date(1970, 0, 1).toISOString();
  }

  return {
    toUTC: toUTC,
    toMillis: toMillis,
    earliestTime: earliestTime
  };
});
