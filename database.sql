-- database name: dragonslayer_game
CREATE TABLE class (
id serial PRIMARY KEY NOT NULL,
name varchar(250) NOT NULL,
description text NOT NULL,
denial_text text
);

CREATE TABLE stat (
id serial PRIMARY KEY NOT NULL,
class_id integer REFERENCES class(id) ON DELETE CASCADE NOT NULL,
hp integer NOT NULL,
mana integer NOT NULL,
defense integer NOT NULL,
attack integer NOT NULL
);

create table attack (
id serial PRIMARY KEY NOT NULL,
class_id integer REFERENCES class(id) ON DELETE CASCADE NOT NULL,
name varchar(250) NOT NULL,
mana_cost integer NOT NULL,
power integer NOT NULL,
description text NOT NULL,
attack_text text NOT NULL
);

create table extra_effect (
id serial PRIMARY KEY NOT NULL,
attack_id integer REFERENCES attack(id) NOT NULL,
target_character varchar(250) NOT NULL,
target_stat varchar(250),
effect decimal,
other_outcome text
);

--Insert Statements

-- class inserts
INSERT INTO class (name, description, denial_text)
VALUES 
('Knight', 'A noble warrior who fights for Kingdom, Honor, and Glory.', 'Pffft, as if You could ever be a knight!'),
('Monk', 'A holy man who whose fists are as strong as his faith.', 'Yeah...no. You ain''t holy enough for this one!'),
('Thief', 'A dastardly rogue who overcomes his enemies with quickness and cunning.', 'You...cunning?! Don''t make me laugh!'),
('Peasant', 'A lowly, miserable farmer whose only true companion in life is his lucky chicken', NULL),
('Dragon', 'The Dragon itself.', NULL),
('Paladin', 'A holy warrior who harnesses the spiritual magic of his deity.', NULL);

-- stat inserts for dragon and peasant
INSERT INTO stat (class_id, hp, mana, attack, defense)
VALUES
(5, 1000, 1000, 100, 100),
(4, 100, 0, 10, 20);

--Dragon's attacks
INSERT INTO attack (class_id, name, mana_cost, power, description, attack_text)
VALUES
(5, 'Chomp', 0, 70, 'The dragon''s bite attack.', 'The dragon takes a chomp out of you!'),
(5, 'Claw', 0, 30, 'The dragon''s claw attack.', 'The dragon swipes its claws at you!'),
(5, 'Tail Sweep', 0, 40, 'The dragon''s tail attack.', 'The dragon sweeps its tail at your legs!'),
(5, 'Charge-Up', 0, 0, 'The dragon stops to charge for its fire breath attack.', 'The dragon is preparing for a big attack!'),
(5, 'Fire Breath', 100, 100, 'The dragon''s breath attack.', 'The dragon breathes white-hot flames at you!'),
(5, 'Logic and Reason', 0, 0, 'The dragon speaks to persuade the player.', 'The dragon attempts to persuade you with logic and reason!');

--Peasant's attacks
INSERT INTO attack (class_id, name, mana_cost, power, description, attack_text)
VALUES
(4, 'Sword Attack', 0, 120, 'A basic sword attack with your grandpa''s (t)rusty blade. Maybe it will give the dragon tetanus.', 'You swing your sword at the dragon!'),
(4, 'Charge Sword', 0, 0, 'Grip your blade with two hands. Twice the grip means twice the power on your next swing, right?', 'You focus your mind and grip your sword with both hands.'),
(4, 'Throw Pitchfork', 0, 150, 'Your throwing arm is pretty good. You could do some damage with this. If it doesn''t kill the dragon though, you''l have to run fetch it before you can throw it again...', 'You take aim at the dragon''s eye and throw your pitchfork!'),
(4, 'Throw Chicken', 0, 0, 'Your lucky chicken has been by your side as long as you can remember. Perhaps it will unleash vengeance upon your behalf?', 'You throw your lucky chicken at the dragon! ...Nothing happens.'),
(4, 'Fetch Pitchfork', 0, 0, 'Risk going near the dragon to fetch your thrown pitchfork.', 'You run to fetch your pitchfork!'),
(4, 'Fetch Chicken', 0, 0, 'Your chicken has failed you. You can''t help but love it anyway. You should fetch it back before it gets hurt.', 'You run and fetch your lucky chicken!'),
(4, 'Do Nothing', 0, 0, 'Your beloved friend is dead. Take a moment to mourn.', 'You do nothing as grief over your dead chicken consumes you!'),
(4, 'Eat Chicken Nuggets', 0, 0, 'There''s still one thing your beloved friend can do for you...', 'You eat the lucky chicken nuggets!'),
(4, 'Call of Cock-a-Doodle-Doo', 100, 600, 'The power and love of your chicken friend fills you from within! A new power is at your disposal!', 'Summoning the power of your dead friend from within, you unleash a powerful blast of...ROOSTER energy?!'),
(4, 'Listen', 0, 0, 'Don''t be an idiot! The dragon is trying to trick you!', 'Ignoring the fact that this is obviously a TERRIBLE idea, you listen carefully to what the dragon has to say.');

--Extra Effect Inserts for Dragon attacks
INSERT INTO extra_effect (attack_id, target_character, target_stat, effect, other_outcome)
VALUES (3, 'player', 'defense', 0.5, NULL);  

--Extra Effect Inserts for Peasant attacks
INSERT INTO extra_effect (attack_id, target_character, target_stat, effect, other_outcome)
VALUES
(8, 'player', 'attack', 2, NULL),
(9, 'dragon', 'defense', 0.5, 'dragon loses two turns.'),
(11, 'player', 'defense', 0.5, NULL),
(10, 'dragon', NULL, NULL, 'dragon loses one turn.'),
(12, 'player', 'defense', 0.5, NULL),
(14, 'player', 'hp', 100, NULL);