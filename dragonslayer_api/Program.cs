using System.Net.Security;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.SignalR;
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
// Doing a left join with this one. Gets a bit complicated
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
// Theoretically all tables have been created correctly here. Need to make connection string secret now

public class Character_Class
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Denial_Text { get; set; } = null!;
    // Each class must have a stat block associated with it
    public Stat? Stat { get; set; } // References navigation to dependent
    // Each class has a collection (list) of attacks
    public ICollection<Attack> Attacks { get; } = new List<Attack>(); // collection navigation containing dependents
}

public class Stat
{
    public int Id { get; set; }
    public int Class_Id { get; set; }
    public int HP { get; set; }
    public int Mana { get; set; }
    public int Defense { get; set; }
    public int Attack { get; set; }
    // Indicates that each row in the stat table is required to have an associated Character_Class
    public Character_Class Character_Class { get; set; } = null!; // Required reference navigation
}

public class Attack
{
    public int Id { get; set; }
    public int Class_Id { get; set; }
    public string Name { get; set; } = null!;
    public int Mana_Cost { get; set; }
    public int Power { get; set; }
    public string Description { get; set; } = null!;
    public string Attack_Text { get; set; } = null!;
    // Required reference navigation to Character_Class table
    public Character_Class Character_Class { get; set; } = null!; // Attacks are required to have a class, so aren't nullable.
    // Attacks can optionally have an extra effect. The relationship in the Attack table is set up the same as if it were required
    // The "?" takes care of whether a specific attack actually has an Extra_Effect or not
    public Extra_Effect? Extra_Effect { get; set; } // Reference navigation to dependent
}

public class Extra_Effect
{
    public int Id { get; set; }
    public int Attack_Id { get; set; }
    public string Target_Character { get; set; } = null!;
    public string Target_Stat { get; set; }
    public int Effect_Multiplier { get; set; }
    public string Other_Outcome { get; set; }
    // An Extra_Effect MUST have an associated Attack
    public Attack Attack {get; set;} = null!; // Required reference navigation
}

