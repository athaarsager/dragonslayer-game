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
    // protected override void OnModelCreating(ModelBuilder builder)
    // {
    //     builder.Entity<Extra_Effect>()
    //         .HasOne(x => x.Attack)
    //         .WithMany()
    //         .HasForeignKey(x => x.Attack_Id);
    // }
}