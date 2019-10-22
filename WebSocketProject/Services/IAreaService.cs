using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebSocketProject.Models;

namespace WebSocketProject.Services
{
    public interface IAreaService
    {
        Task<List<Area>> GetAreasAsync();
        Task<Area> GetAreaWithSwitchesAsync(int area_id);
    }
}
