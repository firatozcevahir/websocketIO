using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace WebSocketProject.Models
{
    public partial class WebSocketDbContext : DbContext
    {
        public WebSocketDbContext()
        {
        }

        public WebSocketDbContext(DbContextOptions<WebSocketDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Area> Area { get; set; }
        public virtual DbSet<Switch> Switch { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlServer("Server=.;Database=WebSocketDb;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Area>(entity =>
            {
                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(10)
                    .IsFixedLength();

                entity.Property(e => e.SocketIp)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<Switch>(entity =>
            {
                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Iomode)
                    .IsRequired()
                    .HasColumnName("IOMode")
                    .HasMaxLength(10)
                    .IsFixedLength();

                entity.Property(e => e.Ionumber)
                    .IsRequired()
                    .HasColumnName("IONumber")
                    .HasMaxLength(10)
                    .IsFixedLength();

                entity.Property(e => e.ModuleName)
                    .IsRequired()
                    .HasMaxLength(10)
                    .IsFixedLength();

                entity.HasOne(d => d.Area)
                    .WithMany(p => p.Switch)
                    .HasForeignKey(d => d.AreaId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Switch_Area");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
