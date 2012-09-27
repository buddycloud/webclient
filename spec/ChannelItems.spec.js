/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var ChannelItems = require('models/ChannelItems');
  var Item = require('models/Item');

  describe('ChannelItems', function() {
    var items;
    var itemsData = [{
      'id': '6',
      'author': 'alice@example.com',
      'updated': '2012-01-06',
      'content': 'Top-level post #3'
    }, {
      'id': '5',
      'author': 'ron@example.com',
      'updated': '2012-01-05',
      'replyTo': '1',
      'content': 'Comment on top-level post #1'
    }, {
      'id': '4',
      'author': 'bob@example.com',
      'updated': '2012-01-04',
      'replyTo': '3',
      'content': 'Comment on top-level post #2'
    }, {
      'id': '3',
      'author': 'alice@example.com',
      'updated': '2012-01-03',
      'content': 'Top-level post #2'
    }, {
      'id': '2',
      'author': 'bob@example.com',
      'updated': '2012-01-02',
      'replyTo': '1',
      'content': 'Comment on top-level post #1'
    }, {
      'id': '1',
      'author': 'alice@example.com',
      'updated': '2012-01-01',
      'content': 'Top-level post #1'
    }];

    beforeEach(function() {
      items = new ChannelItems('alice@example.com');
      items.reset(items.parse(itemsData));
    });

    it('should initialize correctly', function() {
      expect(items.channel).toBe('alice@example.com');
    });

    it('should have URL /<channel>/content/posts', function() {
      var url = 'https://example.com/alice@example.com/content/posts';
      expect(items.url()).toBe(url);
    });

    describe('fetch()', function() {
      it('should include "Accept: application/json" header', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.headers['Accept']).toBe('application/json');
        });
        items.fetch();
        expect($.ajax).toHaveBeenCalled();
      });

      it('should not throw away user-defined headers', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.headers['X-Foo']).toBe('bar');
        });
        items.fetch({headers: {'X-Foo': 'bar'}});
        expect($.ajax).toHaveBeenCalled();
      });
    });

    describe('posts()', function() {
      var posts;

      beforeEach(function() {
        posts = items.posts();
      });

      it('should only return the items that are posts', function() {
        expect(posts.length).toBe(3);
        expect(posts[0].isPost()).toBeTruthy();
        expect(posts[1].isPost()).toBeTruthy();
        expect(posts[2].isPost()).toBeTruthy();
      });

      it('should return posts sorted from newest to oldest', function() {
        expect(posts[0].id > posts[1].id).toBeTruthy();
        expect(posts[1].id > posts[2].id).toBeTruthy();
      });
    });

    describe('parse()', function() {
      it('should put comments with their posts', function() {
        var posts = items.posts();
        expect(posts[0].comments).toEqual([]);
        expect(posts[1].comments[0].replyTo).toBe(posts[1].id);
        expect(posts[2].comments[0].replyTo).toBe(posts[2].id);
        expect(posts[2].comments[1].replyTo).toBe(posts[2].id);
      });

      it('should sort comments from oldest to newest', function() {
        var posts = items.posts();
        var comments2 = posts[2].comments;
        expect(comments2[0].id < comments2[1].id).toBeTruthy();
      });
    });

    describe('"addPost" event', function() {
      it('should trigger if a post is added', function() {
        var post = new Item({id: 'foo'});
        spyOn(items, 'trigger').andCallThrough();
        items.add(post);
        expect(items.trigger).toHaveBeenCalledWith('addPost', post);
      });

      it('should not trigger if a comment is added', function() {
        var comment = new Item({id: 'bar', replyTo: 'foo'});
        spyOn(items, 'trigger').andCallThrough();
        items.add(comment);
        expect(items.trigger).not.toHaveBeenCalledWith('addPost', comment);
      });
    });

    describe('"addComment" event', function() {
      it('should trigger on a post item if a comment is added', function() {
        var post = items.get('1');
        var comment = new Item({replyTo: '1'});
        spyOn(post, 'trigger').andCallThrough();
        items.add(comment);
        expect(post.trigger).toHaveBeenCalledWith('addComment', comment, post);
      });
    });

    it('should automatically add new comments to their posts', function() {
      var post = items.get('1');
      var comment = new Item({replyTo: '1'});
      items.add(comment);
      expect(post.comments.indexOf(comment) != -1).toBeTruthy();
    });
  });

});
