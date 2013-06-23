/*
 * Copyright 2012 buddycloud
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
  var $ = require('jquery');
  var api = require('util/api');

  function buildFormData(file) {
    var formData = new FormData();
    formData.append('data', file);
    formData.append('content-type', file.type);
    if (file.name) {
      formData.append('filename', file.name);
    }

    return formData;
  }

  function sendUploadFileRequest(formData, method, url, authHeader) {
    var options = {
      type: method,
      url: url,
      crossDomain: true,
      data: formData,
      xhrFields: {withCredentials: true},
      contentType: false,
      processData: false,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', authHeader);
      }
    };

    return $.ajax(options);
  }

  function uploadMedia(file, channel, authHeader) {
    var formData = buildFormData(file);
    var url = api.mediaUrl(channel);
    return sendUploadFileRequest(formData, 'POST', url, authHeader);
  }

  function uploadAvatar(file, channel, authHeader) {
    var formData = buildFormData(file);
    var url = api.avatarUrl(channel);
    return sendUploadFileRequest(formData, 'PUT', url, authHeader);
  }

  return {
    uploadMedia: uploadMedia,
    uploadAvatar: uploadAvatar,
    sendUploadFileRequest: sendUploadFileRequest,
    buildFormData: buildFormData
  };
});
