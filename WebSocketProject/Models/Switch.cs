using System;
using System.Collections.Generic;

namespace WebSocketProject.Models
{
    public partial class Switch
    {
        public int Id { get; set; }
        public int AreaId { get; set; }
        public string ModuleName { get; set; }
        public string Iomode { get; set; }
        public string Ionumber { get; set; }
        public string Description { get; set; }

        public virtual Area Area { get; set; }
    }
}
