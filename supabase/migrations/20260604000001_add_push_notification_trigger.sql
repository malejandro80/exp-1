-- Enable pg_net extension for async HTTP requests
create extension if not exists pg_net with schema extensions;

-- Function to call the send-promotion Edge Function when a promotion is inserted
create or replace function public.notify_promotion_inserted()
returns trigger
language plpgsql
security definer
as $$
declare
  edge_url text;
  payload jsonb;
  service_key text;
begin
  -- Build the Edge Function URL
  edge_url := current_setting('supabase_url', true) || '/functions/v1/send-promotion';

  -- Get service role key from vault or environment
  service_key := current_setting('supabase_service_role_key', true);

  -- If settings aren't available (local dev), exit silently
  if edge_url is null or service_key is null then
    return new;
  end if;

  -- Build the webhook-style payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'promotions',
    'schema', 'public',
    'record', row_to_json(new)::jsonb,
    'old_record', null
  );

  -- Call the Edge Function asynchronously
  perform net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := payload::text
  );

  return new;
end;
$$;

-- Drop existing trigger if re-running
drop trigger if exists on_promotion_inserted on public.promotions;

-- Attach trigger to promotions table
create trigger on_promotion_inserted
  after insert on public.promotions
  for each row
  execute function public.notify_promotion_inserted();
