using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebSocketProject.Models;
using WebSocketProject.Services;
using Microsoft.EntityFrameworkCore;

namespace WebSocketProject.DataAccess
{
    public class AreaDataAccess : IAreaService
    {
        private readonly WebSocketDbContext _context;
        public AreaDataAccess(WebSocketDbContext context)
        {
            _context = context;
        }

        public async Task<List<Area>> GetAreasAsync()
        {
            return await _context.Area.ToListAsync();
        }

        public async Task<List<Area>> GetAreasWithSwitches()
        {
            return await _context.Area.Include(a => a.Switch).ToListAsync();
        }
    }
}
