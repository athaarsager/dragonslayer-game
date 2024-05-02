-- database name: dragonslayer_game
CREATE TABLE class (
id serial PRIMARY KEY NOT NULL,
name varchar(250) NOT NULL,
description text NOT NULL,
denial_text text
);

CREATE TABLE stat (
id serial PRIMARY KEY NOT NULL,
hp integer NOT NULL,
defense integer NOT NULL,
attack integer NOT NULL,
class_id integer REFERENCES class(id) ON DELETE CASCADE NOT NULL
);

create table extra_effect (
id serial PRIMARY KEY NOT NULL,
target_character varchar(250) NOT NULL,
target_stat_id integer,
effect decimal,
other_outcome text
);

create table attack (
id serial PRIMARY KEY NOT NULL,
class_id integer REFERENCES class(id) ON DELETE CASCADE NOT NULL,
spell boolean NOT NULL,
name varchar(250) NOT NULL,
power integer NOT NULL,
description text NOT NULL,
attack_text text NOT NULL,
extra_effect_id integer REFERENCES class(id)
);