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

var Configuration = builder.Configuration;
// connect to PostgreSQL database
// This checks the .env file for the connection string
string connectionString = Environment.GetEnvironmentVariable("SQLCONNSTR_dragonslayerDb");

// This passes the connection string to the dbContext file. 
// Cannot access the .env file from the dbContext file directly
builder.Services.AddDbContext<DragonslayerGameContext>(options =>
options.UseNpgsql(connectionString));
var app = builder.Build();

// api goes here

app.MapGet("/character_classes", async (DragonslayerGameContext db) => await db.CharacterClasses.ToListAsync());
app.MapGet("/stats", async (DragonslayerGameContext db) => await db.Stats.ToListAsync());
// Doing a left join with this one. Gets a bit complicated
app.MapGet("/attacks", async (DragonslayerGameContext db) => await db.Attacks.GroupJoin(
    db.ExtraEffects, // join with ExtraEffect table
    Attack => Attack.Id, // join on Attack.Id
    ExtraEffect => ExtraEffect.AttackId, // join on ExtraEffect.AttackId
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