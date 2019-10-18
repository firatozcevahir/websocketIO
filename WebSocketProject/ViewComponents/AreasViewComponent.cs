using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebSocketProject.DataAccess;
using WebSocketProject.Models;
using WebSocketProject.Services;

namespace WebSocketProject.ViewComponents
{
    public class AreasViewComponent : ViewComponent
    {
        private readonly AreaDataAccess areaDataAccess;

        public AreasViewComponent(WebSocketDbContext db)
        {
            areaDataAccess = new AreaDataAccess(db);
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View(await areaDataAccess.GetAreasAsync());
        }
    }
}
