﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace dragonslayer_api.Migrations
{
    [DbContext(typeof(DragonslayerDb))]
    [Migration("20240507141102_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Attack", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Attack_Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Character_Class_Id")
                        .HasColumnType("integer");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Mana_Cost")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Power")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("Character_Class_Id");

                    b.ToTable("Attack");
                });

            modelBuilder.Entity("Character_Class", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Denial_Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Character_Class");
                });

            modelBuilder.Entity("Extra_Effect", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("Attack_Id")
                        .HasColumnType("integer");

                    b.Property<int>("Effect_Multiplier")
                        .HasColumnType("integer");

                    b.Property<string>("Other_Outcome")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Target_Character")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Target_Stat")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Attack_Id")
                        .IsUnique();

                    b.ToTable("Extra_Effect");
                });

            modelBuilder.Entity("Stat", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("Attack")
                        .HasColumnType("integer");

                    b.Property<int>("Character_Class_Id")
                        .HasColumnType("integer");

                    b.Property<int>("Defense")
                        .HasColumnType("integer");

                    b.Property<int>("HP")
                        .HasColumnType("integer");

                    b.Property<int>("Mana")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("Character_Class_Id")
                        .IsUnique();

                    b.ToTable("Stat");
                });

            modelBuilder.Entity("Attack", b =>
                {
                    b.HasOne("Character_Class", "Character_Class")
                        .WithMany("Attacks")
                        .HasForeignKey("Character_Class_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Character_Class");
                });

            modelBuilder.Entity("Extra_Effect", b =>
                {
                    b.HasOne("Attack", "Attack")
                        .WithOne("Extra_Effect")
                        .HasForeignKey("Extra_Effect", "Attack_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Attack");
                });

            modelBuilder.Entity("Stat", b =>
                {
                    b.HasOne("Character_Class", "Character_Class")
                        .WithOne("Stat")
                        .HasForeignKey("Stat", "Character_Class_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Character_Class");
                });

            modelBuilder.Entity("Attack", b =>
                {
                    b.Navigation("Extra_Effect");
                });

            modelBuilder.Entity("Character_Class", b =>
                {
                    b.Navigation("Attacks");

                    b.Navigation("Stat");
                });
#pragma warning restore 612, 618
        }
    }
}
