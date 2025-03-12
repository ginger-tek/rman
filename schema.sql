create table
  if not exists projects (
    id text primary key,
    title text not null,
    `description` text,
    `status` text default 'Planning',
    link text,
    startDate text,
    endDate text,
    created text default current_timestamp,
    updated text default current_timestamp
  );

create table
  if not exists resources (
    id text primary key,
    `name` text not null,
    email text not null unique,
    `roleBit` integer default 2,
    resourceApproverId text,
    avatar blob,
    created text default current_timestamp,
    updated text default current_timestamp
  );

create table
  if not exists project_resources (
    id text primary key,
    projectId text not null,
    resourceId text not null,
    projectRole text not null,
    `status` text default 'Pending',
    rejectReason text,
    weeklyHours int default 1,
    startDate text,
    endDate text,
    created text default current_timestamp,
    updated text default current_timestamp
  );