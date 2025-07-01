# Core Features

### A. User System

- Signup/login (Email + Password + email confirmation, JWT for sessions).
- User profiles (username, bio, karma points and other attriutes).
- Role-based permissions (User for now).
- User update their profiles -- TODO

### B. Posts

- CRUD for posts.
- Upvote/downvote posts (affects ranking).
- Sorting (New, Top, Controversial). -- TODO

### C. Comments & Replies

- CRUD for comments and replies.
- Nested replies (unlimited depth).
- Upvote/downvote comments/replies.

### D. Notifications
- Event-Driven Notifications System
- Notify users when:
    - their post gets a comment.
    - their comment gets a reply.
    - other users mention them (@username). -- TODO
    - there are system updates.  -- TODO
    - other users up/downvote on their content (comment, reply, post).

### E. Search

- Full-text search for posts.

### F. Analytics (Stretch)

- Most active users, trending posts. -- TODO