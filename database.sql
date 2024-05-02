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

--Insert Statements

INSERT INTO class (name, description, denial_text)
VALUES 
('Knight', 'A noble warrior who fights for Kingdom, Honor, and Glory.', 'Pffft, as if You could ever be a knight!'),
('Monk', 'A holy man who whose fists are as strong as his faith.', 'Yeah...no. You ain''t holy enough for this one!'),
('Thief', 'A dastardly rogue who overcomes his enemies with quickness and cunning.', 'You...cunning?! Don''t make me laugh!'),
('Peasant', 'A lowly, miserable farmer whose only true companion in life is his lucky chicken', NULL),
('Dragon', 'The Dragon itself.', NULL);

INSERT INTO stat (hp, defense, attack, class_id)
VALUES
(1000, 100, 100, 5),
(100, 20, 10, 4);