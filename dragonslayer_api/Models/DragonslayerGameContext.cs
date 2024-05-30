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

    public virtual DbSet<GameText> GameText { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attack>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("attack_pkey");

            entity.ToTable("attack");

            entity.HasIndex(e => new { e.CharacterClassId, e.DisplayId }, "attack_character_class_id_display_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AttackText).HasColumnName("attack_text");
            entity.Property(e => e.CharacterClassId).HasColumnName("character_class_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DisplayId).HasColumnName("display_id");
            entity.Property(e => e.ManaCost).HasColumnName("mana_cost");
            entity.Property(e => e.Name)
                .HasMaxLength(250)
                .HasColumnName("name");
            entity.Property(e => e.Power).HasColumnName("power");

            entity.HasOne(d => d.CharacterClass).WithMany(p => p.Attacks)
                .HasForeignKey(d => d.CharacterClassId)
                .HasConstraintName("attack_character_class_id_fkey");
        });

        modelBuilder.Entity<CharacterClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("character_class_pkey");

            entity.ToTable("character_class");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DenialText).HasColumnName("denial_text");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(250)
                .HasColumnName("name");
        });

        modelBuilder.Entity<ExtraEffect>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("extra_effect_pkey");

            entity.ToTable("extra_effect");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AttackId).HasColumnName("attack_id");
            entity.Property(e => e.AttackToBeReplacedBy).HasColumnName("attack_to_be_replaced_by");
            entity.Property(e => e.EffectMultiplier).HasColumnName("effect_multiplier");
            entity.Property(e => e.SpecialText).HasColumnName("special_text");
            entity.Property(e => e.TargetCharacter)
                .HasMaxLength(250)
                .HasColumnName("target_character");
            entity.Property(e => e.TargetStat)
                .HasMaxLength(250)
                .HasColumnName("target_stat");
            entity.Property(e => e.TurnsLost).HasColumnName("turns_lost");

            entity.HasOne(d => d.Attack).WithMany(p => p.ExtraEffects)
                .HasForeignKey(d => d.AttackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("extra_effect_attack_id_fkey");
        });

        modelBuilder.Entity<Stat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("stat_pkey");

            entity.ToTable("stat");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Attack).HasColumnName("attack");
            entity.Property(e => e.CharacterClassId).HasColumnName("character_class_id");
            entity.Property(e => e.Defense).HasColumnName("defense");
            entity.Property(e => e.Hp).HasColumnName("hp");
            entity.Property(e => e.Mana).HasColumnName("mana");

            entity.HasOne(d => d.CharacterClass).WithMany(p => p.Stats)
                .HasForeignKey(d => d.CharacterClassId)
                .HasConstraintName("stat_character_class_id_fkey");
        });

        modelBuilder.Entity<GameText>(entity => 
        {
            entity.HasKey(e => e.Id).HasName("game_text_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsStartText).HasColumnName("is_start_text");
            entity.Property(e => e.IsFlavorText).HasColumnName("is_flavor_text");
            entity.Property(e => e.IsNarrativeText).HasColumnName("is_narrative_text");
            entity.Property(e => e.IsGoodEndText).HasColumnName("is_good_end_text");
            entity.Property(e => e.IsBadEndText).HasColumnName("is_bad_end_text");
            entity.Property(e => e.TextContent).HasColumnName("text_content");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
