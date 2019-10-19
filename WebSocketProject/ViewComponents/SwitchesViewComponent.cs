using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebSocketProject.DataAccess;
using WebSocketProject.Models;

namespace WebSocketProject.ViewComponents
{
    public class SwitchesViewComponent : ViewComponent
    {
        private readonly AreaDataAccess areaDataAccess;

        public SwitchesViewComponent(WebSocketDbContext db)
        {
            areaDataAccess = new AreaDataAccess(db);
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View(await areaDataAccess.GetAreasWithSwitchesAsync());
        }
    }
}
