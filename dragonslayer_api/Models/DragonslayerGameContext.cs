using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace dragonslayer_api.Models;

public partial class DragonslayerGameContext : DbContext
{
    public DragonslayerGameContext()
    {
    }

    public DragonslayerGameContext(DbContextOptions<DragonslayerGameContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Attack> Attacks { get; set; }

    public virtual DbSet<CharacterClass> CharacterClasses { get; set; }

    public virtual DbSet<ExtraEffect> ExtraEffects { get; set; }

    public virtual DbSet<Stat> Stats { get; set; }

    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //     => optionsBuilder.UseNpgsql(connectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attack>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("attack_pkey");

            entity.ToTable("Attack");

            entity.Property(e => e.Id).HasDefaultValueSql("nextval('attack_id_seq'::regclass)");
            entity.Property(e => e.AttackText).HasColumnName("Attack_Text");
            entity.Property(e => e.CharacterClassId).HasColumnName("Character_Class_Id");
            entity.Property(e => e.ManaCost).HasColumnName("Mana_Cost");
            entity.Property(e => e.Name).HasMaxLength(250);

            entity.HasOne(d => d.CharacterClass).WithMany(p => p.Attacks)
                .HasForeignKey(d => d.CharacterClassId)
                .HasConstraintName("attack_class_id_fkey");
        });

        modelBuilder.Entity<CharacterClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("class_pkey");

            entity.ToTable("Character_Class");

            entity.Property(e => e.Id).HasDefaultValueSql("nextval('class_id_seq'::regclass)");
            entity.Property(e => e.DenialText).HasColumnName("Denial_Text");
            entity.Property(e => e.Name).HasMaxLength(250);
        });

        modelBuilder.Entity<ExtraEffect>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("extra_effect_pkey");

            entity.ToTable("Extra_Effect");

            entity.Property(e => e.Id).HasDefaultValueSql("nextval('extra_effect_id_seq'::regclass)");
            entity.Property(e => e.AttackId).HasColumnName("Attack_Id");
            entity.Property(e => e.EffectMultiplier).HasColumnName("Effect_Multiplier");
            entity.Property(e => e.OtherOutcome).HasColumnName("Other_Outcome");
            entity.Property(e => e.TargetCharacter)
                .HasMaxLength(250)
                .HasColumnName("Target_Character");
            entity.Property(e => e.TargetStat)
                .HasMaxLength(250)
                .HasColumnName("Target_Stat");

            entity.HasOne(d => d.Attack).WithMany(p => p.ExtraEffects)
                .HasForeignKey(d => d.AttackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("extra_effect_attack_id_fkey");
        });

        modelBuilder.Entity<Stat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("stat_pkey");

            entity.ToTable("Stat");

            entity.Property(e => e.Id).HasDefaultValueSql("nextval('stat_id_seq'::regclass)");
            entity.Property(e => e.CharacterClassId).HasColumnName("Character_Class_Id");

            entity.HasOne(d => d.CharacterClass).WithMany(p => p.Stats)
                .HasForeignKey(d => d.CharacterClassId)
                .HasConstraintName("stat_class_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
