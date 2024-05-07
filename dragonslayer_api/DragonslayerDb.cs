using Microsoft.EntityFrameworkCore;
// class for setting up connection to database.
public class DragonslayerDb : DbContext
{
    public DragonslayerDb(DbContextOptions<DragonslayerDb> options) : base(options) { }

    public DbSet<Character_Class> Character_Class => Set<Character_Class>();
    public DbSet<Stat> Stat => Set<Stat>();
    public DbSet<Attack> Attack => Set<Attack>();
    public DbSet<Extra_Effect> Extra_Effect => Set<Extra_Effect>();

    // This is for configuring the table join between the Attack and Extra_Effect Table
    // probably not necessary since configuring everything in the classes now.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attack>()
            // a = Attack
            // e = Extra_Effect
            .HasOne(a => a.Extra_Effect)
            .WithOne(e => e.Attack)
            .HasForeignKey<Extra_Effect>(e => e.Attack_Id)
            .IsRequired();
            // need to do this again with Character Class and Stat one-to-one relationship
        modelBuilder.Entity<Character_Class>()
            .HasOne(c => c.Stat)
            .WithOne(s => s.Character_Class)
            .HasForeignKey<Stat>(s => s.Character_Class_Id)
            .IsRequired();
            // Then run migrations and test!
    }
}