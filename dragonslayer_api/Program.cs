using System.Collections;
using System.Net.Security;
using dotenv.net;
using dragonslayer_api.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;

// need this plus a nuget install to even get the project to recognize that there is a .env file
DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";

var Configuration = builder.Configuration;
// connect to PostgreSQL database
// This checks the .env file for the connection string
var connectionString = Environment.GetEnvironmentVariable("SQLCONNSTR_dragonslayerDb");

// This passes the connection string to the dbContext file. 
// Cannot access the .env file from the dbContext file directly
builder.Services.AddDbContext<DragonslayerGameContext>(options =>
options.UseNpgsql(connectionString));

// Add CORS services. May need to allow for a different origin once website is hosted...
// This specifies where requests can be accepted from
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();
app.UseCors("AllowSpecificOrigins");

// api goes here

app.MapGet("/character_classes", async (DragonslayerGameContext db) => await db.CharacterClasses.ToListAsync());
// Only get the stats associated with the chosen class. Don't need to store the others on the front end
app.MapGet("/stats/{characterClassId}", async (DragonslayerGameContext db, int characterClassId) =>
{
    var stats = await db.Stats
    .Where(s => s.CharacterClassId == characterClassId)
    .ToListAsync();

    return stats;
});
// Doing a left join with this one. Gets a bit complicated
app.MapGet("/attacks/{characterClassId}", async (DragonslayerGameContext db, int characterClassId) => await db.Attacks
.Where(a => a.CharacterClassId == characterClassId)
.GroupJoin(
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
.OrderBy(a => a.Attack.Id) // order by id
.ToListAsync());

// Doing same query as above, but only grabbing the first four entries of the peasant's attacks for display
app.MapGet("/attacks/{characterClassId}/display", async (DragonslayerGameContext db, int characterClassId) => await db.Attacks
.Where(a => a.CharacterClassId == characterClassId && a.DisplayId <= 3)
.GroupJoin(
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
.OrderBy(a => a.Attack.Id) // order by id
.ToListAsync());

// Grab text for normal/bad ending
app.MapGet("/game_text/bad_end", async (DragonslayerGameContext db) => await db.GameText
.Where(t => t.Type == "Bad_End_Text")
.Select((t) => new
{
    id = t.Id,
    text = t.TextContent,
})
.OrderBy(t => t.id)
.ToListAsync());

app.Run($"http://localhost:{port}");