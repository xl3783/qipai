create type game_status as enum ('waiting', 'playing', 'finished', 'cancelled');

alter type game_status owner to postgres;

create type participant_status as enum ('active', 'inactive', 'left', 'disconnected', 'kicked');

alter type participant_status owner to postgres;

create type jwt_token as
(
    role    text,
    user_id text,
    openid  text
);

alter type jwt_token owner to postgres;

