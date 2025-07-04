-- auto-generated definition
create type game_status as enum ('waiting', 'playing', 'finished', 'cancelled');

alter type game_status owner to postgres;

-- auto-generated definition
create type participant_status as enum ('active', 'inactive', 'left', 'disconnected', 'kicked');

alter type participant_status owner to postgres;

-- auto-generated definition
create type jwt_token as
(
    role    text,
    user_id text,
    openid  text
);

alter type jwt_token owner to postgres;



-- auto-generated definition
create table players
(
    player_id  text         not null
        primary key,
    username   varchar(100) not null,
    email      varchar(255),
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

comment on table players is '玩家信息表';

comment on column players.player_id is '玩家ID（自增主键）';

alter table players
    owner to postgres;

grant delete, insert, select, update on players to authenticated_user;


-- auto-generated definition
create table games
(
    game_id     text                     default nextval('games_game_id_seq'::regclass) not null
        primary key,
    game_type   varchar(50)                                                             not null,
    status      game_status              default 'waiting'::game_status,
    start_time  timestamp with time zone default now(),
    end_time    timestamp with time zone,
    max_players smallint                 default 4,
    min_players smallint                 default 2,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now(),
    constraint valid_game_time
        check ((end_time IS NULL) OR (end_time >= start_time)),
    constraint valid_player_count
        check ((max_players >= min_players) AND (min_players >= 2))
);

comment on table games is '游戏对局表（房间）';

comment on column games.status is '游戏状态：waiting-等待中，playing-进行中，finished-已结束，cancelled-已取消';

alter table games
    owner to postgres;

create index idx_games_start_time
    on games (start_time);

create index idx_games_end_time
    on games (end_time);

create index idx_games_status
    on games (status);

grant delete, insert, select, update on games to authenticated_user;

-- auto-generated definition
create table game_participants
(
    participation_id text                     default nextval('game_participants_participation_id_seq'::regclass) not null
        primary key,
    game_id          text                                                                                         not null,
    player_id        text                                                                                         not null,
    initial_score    integer                  default 0                                                           not null,
    final_score      integer,
    position         smallint,
    status           participant_status       default 'active'::participant_status,
    joined_at        timestamp with time zone default now(),
    left_at          timestamp with time zone,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    constraint unique_game_player
        unique (game_id, player_id)
);

alter table game_participants
    owner to postgres;

grant delete, insert, select, update on game_participants to authenticated_user;


-- auto-generated definition
create table transfer_records
(
    transfer_id         uuid                     default gen_random_uuid() not null
        primary key,
    from_player_id      text                                               not null,
    to_player_id        text                                               not null,
    points              integer                                            not null
        constraint transfer_records_points_check
            check (points > 0),
    game_id             text,
    description         text,
    transfer_time       timestamp with time zone default now(),
    from_transaction_id uuid,
    to_transaction_id   uuid,
    status              varchar(20)              default 'completed'::character varying
        constraint transfer_records_status_check
            check ((status)::text = ANY
                   ((ARRAY ['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[])),
    created_at          timestamp with time zone default now()
);

comment on table transfer_records is '积分转移记录表（用于游戏房间广播）';

comment on column transfer_records.game_id is '游戏ID（房间ID），用于向特定游戏房间广播转移信息';

comment on column transfer_records.status is '转移状态：pending-待处理，completed-已完成，failed-失败，cancelled-已取消';

alter table transfer_records
    owner to postgres;

create index idx_transfer_records_transfer_time
    on transfer_records (transfer_time);

create index idx_transfer_records_status
    on transfer_records (status);

create index idx_transfer_records_from_player
    on transfer_records (from_player_id);

create index idx_transfer_records_to_player
    on transfer_records (to_player_id);

create index idx_transfer_records_game_id
    on transfer_records (game_id);

create index idx_transfer_records_game_time
    on transfer_records (game_id, transfer_time);

grant delete, insert, select, update on transfer_records to authenticated_user;

