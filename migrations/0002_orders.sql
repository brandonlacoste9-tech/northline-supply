create table if not exists store_orders (
  id         text primary key,
  created_at timestamptz not null default now(),
  channel    text not null,
  sku        text not null,
  title      text not null,
  quantity   integer not null,
  amount     integer not null,
  currency   text not null,
  status     text not null,
  agent      text,
  spt        text
);

create index if not exists store_orders_created_at_idx on store_orders (created_at desc);
