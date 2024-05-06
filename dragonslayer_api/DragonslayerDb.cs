using Microsoft.EntityFrameworkCore;
// class for setting up connection to database. May want to move into its own file
class DragonslayerDb : DbContext
{
    public DragonslayerDb(DbContextOptions options) : base(options) { }

    public DbSet<CharacterClass> CharacterClasses => Set<CharacterClass>();
    public DbSet<Stat> Stats => Set<Stat>();
    public DbSet<Attack> Attacks => Set<Attack>();
}