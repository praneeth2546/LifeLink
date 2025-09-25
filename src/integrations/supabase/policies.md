# Supabase RLS Notes

- Ensure Row Level Security (RLS) is enabled on tables: `profiles`, `issues`, `issue_upvotes`, `issue_comments`, `notifications`.
- Recommended policies (pseudocode):
  - profiles: users can select/update only their own row.
  - issues: insert allowed for authenticated; select rows public; update/delete only by owner or authority role.
  - issue_upvotes: insert/select authenticated; prevent duplicate with unique constraint.
  - notifications: select only where `user_id = auth.uid()`; insert by service role.
- Add RPC or edge functions for privileged actions if needed.
