using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// api goes here

app.MapGet("/", () => "Hello World!");

app.Run();

// define classes here
public class GameData
{
    public List<CharacterClass> CharacterClasses { get; set; }
    public List<Stat> Stats {get; set; }
    public List<Attack> Attacks {get; set; }
    
    public class CharacterClass
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Denial_Text { get; set; }
    }

    public class Stat
    {
        public int Id { get; set; }
        public int Class_Id { get; set; }
        public int HP { get; set; }
        public int Mana { get; set; }
        public int Defense { get; set; }
        public int Attack { get; set; }
    }

    public class Attack
    {
        public int Id { get; set; }
        public int Class_Id { get; set; }
        public string Name { get; set; }
        public int Mana_Cost { get; set; }
        public int Power { get; set; }
        public string Description { get; set; }
        public string Attack_Text { get; set; }
        // Referencing columns in the attack_effects table
        public string Effect_Target_Character { get; set; }
        public string Effect_Target_Stat { get; set; }
        public int Effect_Multiplier { get; set; }
        public string Other_Outcome { get; set; }

    }
}
