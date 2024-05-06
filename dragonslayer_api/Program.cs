using System.Net.Security;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
// connect to PostgreSQL database
// This checks for the connection string...I think...
var Configuration = builder.Configuration;
builder.Services.AddDbContext<DragonslayerDb>(options =>
    options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();

// api goes here

app.MapGet("/character_classes", async (DragonslayerDb db) => await db.Character_Class.ToListAsync());
app.MapGet("/stats", async (DragonslayerDb db) => await db.Stat.ToListAsync());
app.MapGet("/attacks", async (DragonslayerDb db) => await db.Attack.GroupJoin(
    db.Extra_Effect, // join with Extra_Effect table
    Attack => Attack.Id, // join on Attack.Id
    Extra_Effect => Extra_Effect.Attack_Id, // join on Extra_Effect.Attack_Id
    (attack, extraEffects) => new
    {
        Attack = attack,
        Extra_Effect = extraEffects.DefaultIfEmpty()
    }
)
.SelectMany(
    attackWithExtraEffects => attackWithExtraEffects.Extra_Effect,
    (attackWithExtraEffects, extraEffect) => new 
    {
        Attack = attackWithExtraEffects.Attack,
        Extra_Effect = extraEffect
    }
)
.ToListAsync());

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
}

public class Extra_Effect
{
    public int Id { get; set; }
    public int Attack_Id { get; set; }
    public string Target_Character { get; set; }
    public string Target_Stat { get; set; }
    public int Effect_Multiplier { get; set; }
    public string Other_Outcome { get; set; }
    public Attack Attack {get; set;}
}

