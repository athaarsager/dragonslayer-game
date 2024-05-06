using System.Net.Security;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
// connect to PostgreSQL database
// This checks for the connection string...I think...
var connectionString = builder.Configuration.GetConnectionString("dragonslayer_game");
builder.Services.AddNpgsql<DragonslayerDb>(connectionString);
var app = builder.Build();

// api goes here

app.MapGet("/character_classes", async (DragonslayerDb db) => await db.CharacterClasses.ToListAsync());
app.MapGet("/stats", async (DragonslayerDb db) => await db.Stats.ToListAsync());
app.MapGet("/attacks", async (DragonslayerDb db) => await db.Attacks.ToListAsync());

app.Run();


// define classes (models) here

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

