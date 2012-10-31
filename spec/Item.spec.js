/*
 * Copyright 2012 buddycloud
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var Item = require('models/Item');

  describe('Item', function() {
    var item;

    beforeEach(function() {
      comment = new Item;
      item = new Item({
        author: 'alice@example.com',
        published: '2012-01-01',
        updated: '2012-01-02',
        replyTo: 'foo',
        content: 'A post from Alice',
      });
    });

    it('should have a getter for each post attribute', function() {
      expect(item.author).toBe('alice@example.com');
      expect(item.published).toBe('2012-01-01');
      expect(item.updated).toBe('2012-01-02');
      expect(item.replyTo).toBe('foo');
      expect(item.content).toBe('A post from Alice');
    });

    it('should use "published" as value for "updated" if unspecified', function() {
      item.set({updated: null});
      expect(item.updated).toBe(item.published);
    });

    it('should remove possible "acct:" prefix from author', function() {
      item.set({author: 'acct:bob@example.com'});
      expect(item.author).toBe('bob@example.com');
    });

    it('should have initially empty "comments" array', function() {
      expect(item.comments).toEqual([]);
    });

    describe('isPost()', function() {
      it('should return true if the item is a post', function() {
        item.set({replyTo: null});
        expect(item.isPost()).toBe(true);
      });

      it('should return false if the item is a comment', function() {
        item.set({replyTo: 'foo'});
        expect(item.isPost()).toBe(false);
      });
    });

    describe('isComment()', function() {
      it('should return true if the item is a comment', function() {
        item.set({replyTo: 'foo'});
        expect(item.isComment()).toBe(true);
      });

      it('should return false if the item is a post', function() {
        item.set({replyTo: null});
        expect(item.isComment()).toBe(false);
      });
    });

    describe('comments', function() {
      it('should be an empty array if not explicitly specified', function() {
        expect(item.comments).toEqual([]);
      });

      it('should be specifiable in constructor', function() {
        var comments = [{id: 'foo'}, {id: 'bar'}];
        var post = new Item({comments: comments});
        expect(post.comments[0] instanceof Item).toBeTruthy();
        expect(post.comments[1] instanceof Item).toBeTruthy();
        expect(post.comments[0].id).toBe('foo');
        expect(post.comments[1].id).toBe('bar');
      });

      it('should not be made part of the attributes hash', function() {
        var comments = [{}, {}];
        var post = new Item({comments: comments});
        expect(post.attributes.comments).toBeUndefined();
      });
    });

    describe('authorAvatarUrl()', function() {
      it('should return the avatar matching the item\'s author', function() {
        var url = 'https://example.com/alice@example.com/media/avatar';
        expect(item.authorAvatarUrl()).toBe(url);
      });
    });
  });

});
