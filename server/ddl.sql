-- auto-generated definition
create table games
(
    game_id     bigserial
        primary key,
    game_type   varchar(50) not null,
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



-- auto-generated definition
create table players
(
    player_id  bigserial
        primary key,
    username   varchar(100) not null
        unique,
    email      varchar(255)
        unique,
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

comment on table players is '玩家信息表';

comment on column players.player_id is '玩家ID（自增主键）';

alter table players
    owner to postgres;

create index idx_players_username
    on players (username);

create index idx_players_email
    on players (email);



-- auto-generated definition
create table game_participants
(
    participation_id bigserial
        primary key,
    game_id          bigint                             not null
        references games
            on delete cascade,
    player_id        bigint                             not null
        references players,
    initial_score    integer                  default 0 not null,
    final_score      integer,
    position         smallint,
    status           participant_status       default 'active'::participant_status,
    joined_at        timestamp with time zone default now(),
    left_at          timestamp with time zone,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    constraint unique_game_player
        unique (game_id, player_id, status)
);

alter table game_participants
    owner to postgres;



-- auto-generated definition
create table transfer_records
(
    transfer_id         uuid                     default gen_random_uuid() not null
        primary key,
    from_player_id      bigint                                             not null
        references players,
    to_player_id        bigint                                             not null
        references players,
    points              integer                                            not null
        constraint transfer_records_points_check
            check (points > 0),
    game_id             bigint
        references games,
    description         text,
    transfer_time       timestamp with time zone default now(),
    from_transaction_id uuid
        references score_transactions,
    to_transaction_id   uuid
        references score_transactions,
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

create index idx_transfer_records_from_player
    on transfer_records (from_player_id);

create index idx_transfer_records_to_player
    on transfer_records (to_player_id);

create index idx_transfer_records_game_id
    on transfer_records (game_id);

create index idx_transfer_records_transfer_time
    on transfer_records (transfer_time);

create index idx_transfer_records_status
    on transfer_records (status);

create index idx_transfer_records_game_time
    on transfer_records (game_id, transfer_time);



-- auto-generated definition
create table scores
(
    player_id     bigint                             not null
        primary key
        references players,
    current_total integer                  default 0 not null,
    games_played  integer                  default 0,
    games_won     integer                  default 0,
    last_updated  timestamp with time zone default now()
);

comment on table scores is '玩家当前积分表（允许负数）';

comment on column scores.current_total is '玩家当前积分（允许负数）';

alter table scores
    owner to postgres;


-- auto-generated definition
create table score_transactions
(
    transaction_id    uuid                     default gen_random_uuid() not null
        primary key,
    player_id         bigint                                             not null
        references players,
    game_id           bigint
        references games,
    points_change     integer                                            not null
        constraint score_transactions_points_change_check
            check (points_change <> 0),
    current_total     integer                                            not null,
    transaction_type  varchar(50)              default 'game'::character varying,
    related_player_id bigint
        references players,
    description       text,
    event_time        timestamp with time zone default now()
);

comment on table score_transactions is '积分交易记录表';

comment on column score_transactions.transaction_type is '交易类型：game-游戏积分，transfer_in-接收转移，transfer_out-转出转移，bonus-奖励积分，penalty-惩罚积分';

comment on column score_transactions.related_player_id is '关联的另一个玩家ID（用于积分转移）';

alter table score_transactions
    owner to postgres;

create index idx_score_transactions_player_id
    on score_transactions (player_id);

create index idx_score_transactions_game_id
    on score_transactions (game_id);

create index idx_score_transactions_event_time
    on score_transactions (event_time);

create index idx_score_transactions_type
    on score_transactions (transaction_type);

create index idx_score_transactions_related_player
    on score_transactions (related_player_id);

create index idx_score_transactions_player_time
    on score_transactions (player_id, event_time);




CREATE TYPE app_private.jwt_token AS (
  role TEXT,
  user_id TEXT,
  openid TEXT
);

-- 使用 PostgreSQL 函数处理用户登录
CREATE FUNCTION app_public.login_with_wechat(openid TEXT, nickname TEXT DEFAULT '')
RETURNS app_private.jwt_token AS $$
DECLARE
  user_id BIGINT;
BEGIN
  -- 查找或创建用户
  INSERT INTO public.players (username)
  VALUES (openid)
  ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
  RETURNING player_id INTO user_id;

  -- 返回 JWT（包含用户ID和角色）
  RETURN ('authenticated_user', user_id::TEXT, openid)::app_private.jwt_token;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 创建游戏房间函数（使用JWT token中的user_id）
CREATE OR REPLACE FUNCTION create_game_room() RETURNS BIGINT AS $$
DECLARE
    p_id BIGINT;
    current_user_id BIGINT;
BEGIN
    -- 从JWT token中获取用户ID
    current_user_id := (current_setting('request.jwt.claims', true)::json->>'user_id')::BIGINT;
    
    -- 检查是否成功获取到用户ID
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID not found in JWT token';
    END IF;

    -- 检查玩家是否存在
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = current_user_id) THEN
        RAISE EXCEPTION 'Player with ID % does not exist', current_user_id;
    END IF;

    -- 检查玩家是否已经参与游戏
    IF EXISTS (SELECT 1 FROM game_participants WHERE player_id = current_user_id AND status = 'active') THEN
        RAISE EXCEPTION 'Player % is already participating in a game', current_user_id;
    END IF;

    -- 创建游戏
    INSERT INTO games (game_type, status, max_players, min_players)
    VALUES ('自定义', 'waiting', 30, 2)
    RETURNING game_id INTO p_id;

    -- 加入游戏
    INSERT INTO game_participants (game_id, player_id, initial_score, position)
    VALUES (p_id, current_user_id, 0, 1);

    RETURN p_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

