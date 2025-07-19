const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entity', () => {
  it('should throw error when rows is empty', () => {
    expect(() => new ThreadDetail([]))
      .toThrowError('THREAD_DETAIL.NOT_CONTAIN_ROWS');
  });

  it('should throw error when rows is not array', () => {
    expect(() => new ThreadDetail('invalid'))
      .toThrowError('THREAD_DETAIL.NOT_CONTAIN_ROWS');
  });

  it('should throw error when thread object lacks needed property', () => {
    const rows = [
      {
        // thread_id missing
        title: 'Title',
        body: 'Body',
        thread_date: '2025-06-17T00:00:00.000Z',
        thread_owner_username: 'user1',
      },
    ];

    expect(() => new ThreadDetail(rows))
      .toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when thread property has invalid data type', () => {
    const rows = [
      {
        thread_id: 123, // should be string
        title: 'Title',
        body: 'Body',
        thread_date: '2025-06-17T00:00:00.000Z',
        thread_owner_username: 'user1',
      },
    ];

    expect(() => new ThreadDetail(rows))
      .toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should correctly map thread, comments, replies, and likeCount', () => {
    const rows = [
      {
        thread_id: 'thread-1',
        title: 'Judul Thread',
        body: 'Isi thread',
        thread_date: '2025-06-17T00:00:00.000Z',
        thread_owner_username: 'user1',

        comment_id: 'comment-1',
        comment_content: 'Komentar pertama',
        comment_date: '2025-06-17T01:00:00.000Z',
        comment_owner_username: 'user2',
        comment_is_deleted: false,
        like_count: 2, // contoh like

        reply_id: 'reply-1',
        reply_content: 'Balasan pertama',
        reply_date: '2025-06-17T02:00:00.000Z',
        reply_comment_id: 'comment-1',
        reply_is_deleted: false,
        reply_owner_username: 'user3',
      },
      {
        thread_id: 'thread-1',
        title: 'Judul Thread',
        body: 'Isi thread',
        thread_date: '2025-06-17T00:00:00.000Z',
        thread_owner_username: 'user1',

        comment_id: 'comment-1',
        comment_content: 'Komentar pertama',
        comment_date: '2025-06-17T01:00:00.000Z',
        comment_owner_username: 'user2',
        comment_is_deleted: false,
        like_count: 2,

        reply_id: 'reply-2',
        reply_content: 'Balasan kedua',
        reply_date: '2025-06-17T03:00:00.000Z',
        reply_comment_id: 'comment-1',
        reply_is_deleted: true,
        reply_owner_username: 'user4',
      },
      {
        thread_id: 'thread-1',
        title: 'Judul Thread',
        body: 'Isi thread',
        thread_date: '2025-06-17T00:00:00.000Z',
        thread_owner_username: 'user1',

        comment_id: 'comment-2',
        comment_content: 'Komentar kedua',
        comment_date: '2025-06-17T04:00:00.000Z',
        comment_owner_username: 'user5',
        comment_is_deleted: true,
        like_count: null,

        reply_id: null,
        reply_content: null,
        reply_date: null,
        reply_comment_id: null,
        reply_is_deleted: null,
        reply_owner_username: null,
      },
    ];

    const expectedResult = {
      id: 'thread-1',
      title: 'Judul Thread',
      body: 'Isi thread',
      date: '2025-06-17T00:00:00.000Z',
      username: 'user1',
      comments: [
        {
          id: 'comment-1',
          username: 'user2',
          date: '2025-06-17T01:00:00.000Z',
          content: 'Komentar pertama',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              username: 'user3',
              date: '2025-06-17T02:00:00.000Z',
              commentId: 'comment-1',
              content: 'Balasan pertama',
            },
            {
              id: 'reply-2',
              username: 'user4',
              date: '2025-06-17T03:00:00.000Z',
              commentId: 'comment-1',
              content: '**balasan telah dihapus**',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'user5',
          date: '2025-06-17T04:00:00.000Z',
          content: '**komentar telah dihapus**',
          likeCount: 0, // ← default 0 karena null
          replies: [],
        },
      ],
    };

    const threadDetail = new ThreadDetail(rows);

    expect(threadDetail).toEqual(expectedResult);
  });
});
