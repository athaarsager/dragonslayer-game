-- database name: dragonslayer_game
CREATE TABLE Character_Class (
Id serial PRIMARY KEY NOT NULL,
Name varchar(250) NOT NULL,
Description text NOT NULL,
Denial_Text text
);

CREATE TABLE Stat (
Id serial PRIMARY KEY NOT NULL,
Character_Class_Id integer REFERENCES Character_Class(Id) ON DELETE CASCADE NOT NULL,
Hp integer NOT NULL,
Mana integer NOT NULL,
Defense integer NOT NULL,
Attack integer NOT NULL
);

create table Attack (
Id serial PRIMARY KEY NOT NULL,
Character_Class_Id integer REFERENCES Character_Class(Id) ON DELETE CASCADE NOT NULL,
Display_Id integer,
Name varchar(250) NOT NULL,
Mana_Cost integer NOT NULL,
Power integer NOT NULL,
Description text NOT NULL,
Attack_Text text NOT NULL,
UNIQUE (Character_Class_Id, Display_Id) -- makes Display_Id unique to the Character_Class
);

create table Extra_Effect (
Id serial PRIMARY KEY NOT NULL,
Attack_Id integer REFERENCES Attack(Id) NOT NULL,
Target_Character varchar(250) NOT NULL,
Target_Stat varchar(250),
Effect_Multiplier decimal,
Turns_Lost integer,
Attack_To_Be_Replaced_By integer,
Special_Text text
);

--Insert Statements

-- class inserts
INSERT INTO Character_Class (Name, Description, Denial_text)
VALUES 
('Knight', 'A noble warrior who fights for Kingdom, Honor, and Glory.', 'Pffft, as if You could ever be a knight!'),
('Monk', 'A holy man who whose fists are as strong as his faith.', 'Yeah...no. You ain''t holy enough for this one!'),
('Thief', 'A dastardly rogue who overcomes his enemies with quickness and cunning.', 'You...cunning?! Don''t make me laugh!'),
('Peasant', 'A lowly, miserable farmer whose only true companion in life is his lucky chicken', NULL),
('Dragon', 'The Dragon itself.', NULL),
('Paladin', 'A holy warrior who harnesses the spiritual magic of his deity.', NULL);

-- stat inserts for dragon and peasant
INSERT INTO Stat (Character_Class_Id, Hp, Mana, Attack, Defense)
VALUES
(5, 1000, 1000, 100, 100),
(4, 100, 0, 10, 20);

--Dragon's attacks
INSERT INTO attack (Character_Class_Id, Display_Id, Name, Mana_Cost, Power, Description, Attack_Text)
VALUES
(5, NULL, 'Chomp', 0, 40, 'The dragon''s bite attack.', 'The dragon takes a chomp out of you!'),
(5, NULL, 'Claw', 0, 20, 'The dragon''s claw attack.', 'The dragon swipes its claws at you!'),
(5, NULL, 'Tail Sweep', 0, 30, 'The dragon''s tail attack.', 'The dragon sweeps its tail at your legs!'),
(5, NULL, 'Charge-Up', 0, 0, 'The dragon stops to charge for its fire breath attack.', 'The dragon is preparing for a big attack!'),
(5, NULL, 'Fire Breath', 100, 100, 'The dragon''s breath attack.', 'The dragon breathes white-hot flames at you!'),
(5, NULL, 'Eat Chicken', 0, 0, 'The dragon can eat your chicken.', 'The dragon chomps down on your chicken and swallows it whole!'),
(5, NULL, 'Logic and Reason', 0, 0, 'The dragon speaks to persuade the player.', 'The dragon attempts to persuade you with logic and reason!');

--Peasant's attacks
INSERT INTO attack (Character_Class_Id, Display_Id, Name, Mana_Cost, Power, Description, Attack_Text)
VALUES
(4, 0, 'Sword Attack', 0, 120, 'A basic sword attack with your grandpa''s (t)rusty blade. Maybe it will give the dragon tetanus.', 'You swing your sword at the dragon!'),
(4, 1, 'Charge Sword', 0, 0, 'Grip your blade with two hands. Twice the grip means twice the power on your next swing, right?', 'You focus your mind and grip your sword with both hands.'),
(4, 2, 'Throw Pitchfork', 0, 150, 'Your throwing arm is pretty good. You could do some damage with this. If it doesn''t kill the dragon though, you''l have to run fetch it before you can throw it again...', 'You take aim at the dragon''s eye and throw your pitchfork!'),
(4, 3, 'Throw Chicken', 0, 0, 'Your lucky chicken has been by your side as long as you can remember. Perhaps it will unleash vengeance upon your behalf?', 'You throw your lucky chicken at the dragon! ...Nothing happens.'),
(4, 4, 'Fetch Pitchfork', 0, 0, 'Risk going near the dragon to fetch your thrown pitchfork.', 'You run to fetch your pitchfork!'),
(4, 5, 'Fetch Chicken', 0, 0, 'Your chicken has failed you. You can''t help but love it anyway. You should fetch it back before it gets hurt.', 'You run and fetch your lucky chicken!'),
(4, 6, 'Do Nothing', 0, 0, 'Your beloved friend is dead. Take a moment to mourn.', 'You do nothing as grief over your dead chicken consumes you!'),
(4, 7, 'Eat Chicken Nuggets', 0, 0, 'There''s still one thing your beloved friend can do for you...', 'You eat the lucky chicken nuggets!'),
(4, 8, 'Call of Cock-a-Doodle-Doo', 100, 600, 'The power and love of your chicken friend fills you from within! A new power is at your disposal!', 'Summoning the power of your dead friend from within, you unleash a powerful blast of...ROOSTER energy?!'),
(4, 9, 'Listen', 0, 0, 'Don''t be an idiot! The dragon is trying to trick you!', 'Ignoring the fact that this is obviously a TERRIBLE idea, you listen carefully to what the dragon has to say.');

--Extra Effect Inserts for Dragon attacks
INSERT INTO extra_effect (Attack_Id, Target_Character, Target_Stat, Effect_Multiplier, Turns_Lost, Attack_To_Be_Replaced_By, Special_Text)
VALUES (3, 'player', 'defense', 0.5, NULL, NULL, NULL);  

--Extra Effect Inserts for Peasant attacks
--Attack_To_Be_Replaced_By references the Display_Id of the attack it is supposed to be replaced by
INSERT INTO extra_effect (Attack_Id, Target_Character, Target_Stat, Effect_Multiplier, Turns_Lost, Attack_To_Be_Replaced_By, Special_Text)
VALUES
(9, 'player', 'attack', 2, NULL, NULL, NULL),
(10, 'dragon', 'defense', 0.5, 2, 4, 'The dragon is distracted by the pain in its blinded eye!'),
(11, 'dragon', NULL, NULL, 1, 5, 'The dragon is distracted by the prospect of a delicious snack...'),
(12, 'player', NULL, NULL, NULL, 2, NULL),
(13, 'player', NULL, NULL, NULL, 3, NULL);

--Insert Statemest for Bad Ending Text
INSERT INTO game_text (text_content, type)
VALUES
('Bad_End_Text', '......'),
('Bad_End_Text', 'You are indeed strong, mortal. You have exhausted my energies.'),
('Bad_End_Text', 'I hope your victory this day is worth the cost.'),
('Bad_End_Text', 'Now let me alone, that I may die in peace.'),
('Bad_End_Text', 'And with that, the dragon closes its eyes and breathes its last.'),
('Bad_End_Text', 'Congratulations'),
('Bad_End_Text', 'You have bested the evil dragon terrorizing this land!'),
('Bad_End_Text', 'Help yourself to all the gold and riches you could ever desire! And don''t forget to tell everyone so that you can become famous too!'),
('Bad_End_Text', '...What''s that?'),
('Bad_End_Text', 'Your chicken?'),
('Bad_End_Text', 'Who cares about a dumb chicken? You''re rich!'),
('Bad_End_Text', '...You''re crying? You''re seriously crying?'),
('Bad_End_Text', 'Look, if you REALLY care about chickens that much, you can buy as many as you want with all the GOLD you just won!'),
('Bad_End_Text', '(Wow, I can''t believe that such a lame hero actually slew Alduran...oh well, all the better for me!)'),
('Bad_End_Text', 'Thanks for killing the final guardian for me, kid!'),
('Bad_End_Text', 'Enjoy you''re ''hero'' status...for the short time it will last!'),
('Bad_End_Text', 'HAHAHAHAHAHAHAHAHAHAHAHA! I''M FREEEEEEEE!!!!!'),
('Bad_End_Text', 'The End...?');