using Microsoft.EntityFrameworkCore;

// class for setting up connection to database.
public class DragonslayerDb : DbContext
{
    public DragonslayerDb(DbContextOptions<DragonslayerDb> options) : base(options) { }

    public DbSet<Character_Class> Character_Class => Set<Character_Class>();
    public DbSet<Stat> Stat => Set<Stat>();
    public DbSet<Attack> Attack => Set<Attack>();
    public DbSet<Extra_Effect> Extra_Effect => Set<Extra_Effect>();

    // The below is for explicitly configuring the table relationships
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attack>()
            // a = Attack
            // e = Extra_Effect
            .HasOne(a => a.Extra_Effect)
            .WithOne(e => e.Attack)
            .HasForeignKey<Extra_Effect>(e => e.Attack_Id)
            .IsRequired();

        modelBuilder.Entity<Character_Class>()
            .HasOne(c => c.Stat)
            .WithOne(s => s.Character_Class)
            .HasForeignKey<Stat>(s => s.Character_Class_Id)
            .IsRequired();

        modelBuilder.Entity<Character_Class>()
            .HasMany(c => c.Attacks)
            .WithOne(a => a.Character_Class)
            .HasForeignKey(a => a.Character_Class_Id)
            .IsRequired();
    }
}