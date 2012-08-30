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

define([
    'app/models/ChannelNode'
], function(ChannelNode) {

    describe('ChannelNode', function() {
        var node;

        beforeEach(function() {
            node = new ChannelNode('alice@example.com', 'posts');
            node.reset([{
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
            }]);
        });

        it('should initialize correctly', function() {
            expect(node.channel).toBe('alice@example.com');
            expect(node.name).toBe('posts');
        });

        it('should have URL /<channel>/content/<node>', function() {
            var url = 'https://example.com/alice@example.com/content/posts';
            expect(node.url()).toBe(url);
        });

        describe('fetch()', function() {
            it('should include "Accept: application/json" header', function() {
                spyOn($, 'ajax').andCallFake(function(options) {
                    expect(options.headers['Accept']).toBe('application/json');
                });
                node.fetch();
                expect($.ajax).toHaveBeenCalled();
            });
        });

        describe('threads()', function() {
            var threads;

            beforeEach(function() {
                threads = node.threads();
            });

            it('should return an array for each post thread', function() {
                expect(threads.length).toBe(3);
                expect(threads[0] instanceof Array).toBeTruthy();
                expect(threads[1] instanceof Array).toBeTruthy();
                expect(threads[2] instanceof Array).toBeTruthy();
            });

            it('should return no double posts', function() {
                var sum = 0;
                sum += threads[0].length;
                sum += threads[1].length;
                sum += threads[2].length;
                expect(sum).toBe(6);
            });

            it('should put the top-level post first in each array', function() {
                expect(threads[0][0].get('replyTo')).toBeUndefined();
                expect(threads[1][0].get('replyTo')).toBeUndefined();
                expect(threads[2][0].get('replyTo')).toBeUndefined();
            });

            it('should sort threads from newest to oldest', function() {
                var date1 = threads[0][0].get('updated');
                var date2 = threads[1][0].get('updated');
                var date3 = threads[2][0].get('updated');
                expect(date1).toBeGreaterThan(date2);
                expect(date2).toBeGreaterThan(date3);
            });

            it('should sort each thread from oldest to newest', function() {
                var date21 = threads[1][0].get('updated');
                var date22 = threads[1][1].get('updated');
                var date31 = threads[2][0].get('updated');
                var date32 = threads[2][1].get('updated');
                var date33 = threads[2][2].get('updated');
                expect(date21).toBeLessThan(date22);
                expect(date31).toBeLessThan(date32);
                expect(date32).toBeLessThan(date33);
            });

            it('should group comments with their top-level posts', function() {
                var toplevel1 = threads[1][0].get('id');
                var toplevel2 = threads[2][0].get('id');
                expect(threads[1][1].get('replyTo')).toBe(toplevel1);
                expect(threads[2][1].get('replyTo')).toBe(toplevel2);
                expect(threads[2][2].get('replyTo')).toBe(toplevel2);
            });
        });
    });

});