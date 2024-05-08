using System.Collections;
using System.Net.Security;
using dotenv.net;
using dragonslayer_api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

// need this plus a nuget install to even get the project to recognize that there is a .env file
DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);
// connect to PostgreSQL database
// This checks for the connection string
var Configuration = builder.Configuration;

string connectionString = Environment.GetEnvironmentVariable("SQLCONNSTR_dragonslayerDb");

builder.Services.AddDbContext<DragonslayerGameContext>(options =>
options.UseNpgsql(connectionString));
var app = builder.Build();

// api goes here

app.MapGet("/character_classes", async (DragonslayerGameContext db) => await db.CharacterClasses.ToListAsync());
app.MapGet("/stats", async (DragonslayerGameContext db) => await db.Stats.ToListAsync());
// Doing a left join with this one. Gets a bit complicated
app.MapGet("/attacks", async (DragonslayerGameContext db) => await db.Attacks.GroupJoin(
    db.ExtraEffects, // join with Extra_Effect table
    Attack => Attack.Id, // join on Attack.Id
    ExtraEffect => ExtraEffect.AttackId, // join on Extra_Effect.Attack_Id
    (attack, extraEffects) => new
    {
        Attack = attack,
        ExtraEffect = extraEffects.DefaultIfEmpty()
    }
)
.SelectMany(
    attackWithExtraEffects => attackWithExtraEffects.ExtraEffect,
    (attackWithExtraEffects, extraEffect) => new
    {
        Attack = attackWithExtraEffects.Attack,
        Extra_Effect = extraEffect
    }
)
.ToListAsync());

app.Run();


// define classes (models) here
// Theoretically all tables have been created correctly here. Need to make connection string secret now

// public class Character_Class
// {
//     public int Id { get; set; }
//     public string Name { get; set; } = null!;
//     public string Description { get; set; } = null!;
//     public string Denial_Text { get; set; } = null!;
//     // Each class must have a stat block associated with it
//     public Stat? Stat { get; set; } // References navigation to dependent
//     // Each class has a collection (list) of attacks
//     public ICollection<Attack> Attacks { get; } = new List<Attack>(); // collection navigation containing dependents
// }

// public class Stat
// {
//     public int Id { get; set; }
//     public int Character_Class_Id { get; set; }
//     public int HP { get; set; }
//     public int Mana { get; set; }
//     public int Defense { get; set; }
//     public int Attack { get; set; }
//     // Indicates that each row in the stat table is required to have an associated Character_Class
//     public Character_Class Character_Class { get; set; } = null!; // Required reference navigation
// }

// public class Attack
// {
//     public int Id { get; set; }
//     public int Character_Class_Id { get; set; }
//     public string Name { get; set; } = null!;
//     public int Mana_Cost { get; set; }
//     public int Power { get; set; }
//     public string Description { get; set; } = null!;
//     public string Attack_Text { get; set; } = null!;
//     // Required reference navigation to Character_Class table
//     public Character_Class Character_Class { get; set; } = null!; // Attacks are required to have a class, so aren't nullable.
//     // Attacks can optionally have an extra effect. The relationship in the Attack table is set up the same as if it were required
//     // The "?" takes care of whether a specific attack actually has an Extra_Effect or not
//     public Extra_Effect? Extra_Effect { get; set; } // Reference navigation to dependent
// }

// public class Extra_Effect
// {
//     public int Id { get; set; }
//     public int Attack_Id { get; set; }
//     public string Target_Character { get; set; } = null!;
//     public string Target_Stat { get; set; }
//     public int Effect_Multiplier { get; set; }
//     public string Other_Outcome { get; set; }
//     // An Extra_Effect MUST have an associated Attack
//     // have to configure this relationship explicitly in the dbContext as well
//     public Attack Attack { get; set; } = null!; // Required reference navigation
// }

