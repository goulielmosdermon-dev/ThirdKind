-- The page's own form asks for a first and last name, a job title and a note
-- in the sender's words. The table predates it, so those four arrive folded
-- into `name` and `about` until these columns exist.
--
-- Run once in the Supabase SQL editor. It is safe to run twice.
--
-- The code writes the new shape and falls back to the old one when a column
-- is missing, so nothing is lost either side of running this.

alter table public.inquiries add column if not exists first_name text;
alter table public.inquiries add column if not exists last_name  text;
alter table public.inquiries add column if not exists job_title  text;
alter table public.inquiries add column if not exists message    text;
